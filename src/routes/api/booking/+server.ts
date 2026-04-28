import { json } from "@sveltejs/kit";
import { MongoClient } from "mongodb";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
    const payload = await request.json();
    const { userName, userPhone, courtId, courtName, date, dateLabel, slots, duration, timeLabel } = payload;

    if (!userName || !userPhone || !courtId || !date || !slots || !duration || !courtName || !dateLabel || !timeLabel) {
        return json({ error: "Missing required fields" }, { status: 400 });
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

        if (telegramRes.ok) {
            return json({ error: null }, { status: 200 });
        } else {
            console.error("newBookingPOST Error: Error Sending Telegram message: ", await telegramRes.text());
            return json({ error: "Error sending Telegram message" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("newBookingPOST Error: ", error);
        return json({ error: error?.message || "Error" }, { status: 500 });
    } finally {
        await client.close();
    }
};
