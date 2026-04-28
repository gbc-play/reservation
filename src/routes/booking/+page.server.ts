import { MongoClient } from "mongodb";
import { env } from "$env/dynamic/private";
import { error } from "@sveltejs/kit";

export const load = async () => {
    const client = new MongoClient(env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db("prod");

        const bookings = await db.collection("Bookings").find({}).toArray();
        const settings = await db.collection("Settings").findOne({ type: "config" });

        const bookedData: Record<string, Record<string, any[]>> = {
            court_a: {},
            court_b: {},
        };

        bookings.forEach((b) => {
            // Ensure courtId exists in our object to avoid runtime errors
            if (!bookedData[b.courtId]) bookedData[b.courtId] = {};

            if (!bookedData[b.courtId][b.date]) {
                bookedData[b.courtId][b.date] = [];
            }
            bookedData[b.courtId][b.date].push(...b.slots);
        });

        return {
            bookedDataFromServer: bookedData,
            offDaysFromServer: {
                weekdays: settings?.weekdays || [],
                specificDates: settings?.specificDates || [],
            },
        };
    } catch (err: any) {
        console.error("Database Error:", err);
        // SvelteKit way of handling expected errors
        throw error(500, err.message || "Could not fetch bookings");
    } finally {
        await client.close();
    }
};
