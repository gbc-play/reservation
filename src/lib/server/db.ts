import { MongoClient } from "mongodb";
import { env } from "$env/dynamic/private";

if (!env.MONGODB_URI) {
    throw new Error("Please add MONGODB_URI to your .env file");
}

const client = new MongoClient(env.MONGODB_URI);
const clientDBPromise = client.connect();

export default clientDBPromise;
