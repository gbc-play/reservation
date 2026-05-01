import clientDBPromise from "$lib/server/db.js";
import { error } from "@sveltejs/kit";

export const load = async ({ depends }) => {
    depends("booking:data");

    try {
        const client = await clientDBPromise;
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
        console.error("Load Booking Data Error: ", err);
        // SvelteKit way of handling expected errors
        throw error(500, err.message || "Could not fetch bookings");
    }
};
