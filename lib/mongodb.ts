import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & { mongoClient?: MongoClient };

export function getDatabase() {
	const uri = process.env.MONGODB_URI;
	if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) throw new Error("MONGODB_URI is not configured with a valid MongoDB connection string.");
	const mongoClient = globalForMongo.mongoClient ?? new MongoClient(uri);
	if (process.env.NODE_ENV !== "production") globalForMongo.mongoClient = mongoClient;
	return mongoClient.db(process.env.MONGODB_DB || "floodwatch");
}
