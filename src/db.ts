import { MongoClient } from "mongodb";
import { env } from "./config";

const mongo = new MongoClient(env.DB_URL);

export const connectToDB = async () => {
	await mongo.connect();
	console.log("Connected to DB");
};

export const db = mongo.db("offerly");
