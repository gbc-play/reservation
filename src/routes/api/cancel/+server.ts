import { json, redirect } from "@sveltejs/kit";
import clientDBPromise from "$lib/server/db";
import { ObjectId } from "mongodb";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
    const bookingId = url.searchParams.get("id");

    if (!bookingId) {
        return json({ error: "Missing booking ID" }, { status: 400 });
    }

    try {
        const client = await clientDBPromise;
        const db = client.db("prod");

        await db.collection("Bookings").deleteOne({ _id: new ObjectId(bookingId) });
    } catch (error: any) {
        return json({ error: error?.message || "Error" }, { status: 500 });
    }

    return redirect(308, `${env.WEBSITE_URL}/booking`);
};
