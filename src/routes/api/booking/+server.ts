import { json } from "@sveltejs/kit";
import { MongoClient } from "mongodb";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
    const payload = await request.json();
    const { userName, userPhone, courtId, courtName, date, dateLabel, slots, duration, timeLabel } = payload;

    if (!userName || !userPhone || !courtId || !date || !slots || !duration || !courtName || !dateLabel || !timeLabel) {
        console.error("newBookingPOST Error: Missing required fields: ", payload);
        return json({ error: "reservation_failed" }, { status: 400 });
    }

    const client = new MongoClient(env.MONGODB_URI);
    const token = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;

    const message = `
🏐 *Нова Резервация*
----------------------------
👤 *Име:* ${userName}
📞 *Телефон:* ${userPhone}
🏟️ *Място:* ${courtName}
📅 *Дата:* ${dateLabel}
⏰ *Начало:* ${timeLabel}
⏳ *Продължителност:* ${duration} час(а)
----------------------------
    `;

    try {
        await client.connect();
        const db = client.db("prod");

        const existingBooking = await db.collection("Bookings").findOne({
            courtId,
            date,
            slots: { $in: slots },
        });

        if (existingBooking) {
            console.error("newBookingPOST Error: Time slot already booked: ", { courtId, date, slots });
            return json({ error: "slot_booked" }, { status: 409 });
        }

        const newBooking = await db.collection("Bookings").insertOne({
            userName,
            userPhone,
            courtId,
            date,
            slots,
            duration,
            createdAt: new Date(),
        });

        const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "❌ Откажи",
                                url: `${env.WEBSITE_URL}/api/cancel?id=${newBooking.insertedId}`,
                            },
                        ],
                    ],
                },
            }),
        });

        if (!telegramRes.ok) {
            console.error("newBookingPOST Error: Error Sending Telegram message: ", await telegramRes.text());
        }

        return json({ error: null }, { status: 200 });
    } catch (error: any) {
        console.error("newBookingPOST Error: ", error);
        return json({ error: "reservation_failed" }, { status: 500 });
    } finally {
        await client.close();
    }
};
