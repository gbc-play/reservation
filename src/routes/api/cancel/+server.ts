import { json, redirect } from "@sveltejs/kit";
import { MongoClient, ObjectId } from "mongodb";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
    const bookingId = url.searchParams.get("id");

    if (!bookingId) {
        return json({ error: "Missing booking ID" }, { status: 400 });
    }

    const client = new MongoClient(env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db("prod");

        await db.collection("Bookings").deleteOne({ _id: new ObjectId(bookingId) });
    } catch (error: any) {
        return json({ error: error?.message || "Error" }, { status: 500 });
    } finally {
        await client.close();
    }

    return redirect(308, `${env.WEBSITE_URL}/booking`);
};
