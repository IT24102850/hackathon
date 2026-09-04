import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & { mongoClient?: MongoClient };

function getConnectionUri(uri: string) {
	if (!uri.startsWith("mongodb+srv://")) return uri;

	const parsed = new URL(uri);
	if (parsed.hostname !== "minihackthon.kutc0b6.mongodb.net") return uri;

	parsed.searchParams.set("authSource", "admin");
	parsed.searchParams.set("replicaSet", "atlas-qs265f-shard-0");
	parsed.searchParams.set("tls", "true");
	const credentials = parsed.username
		? `${parsed.username}:${parsed.password}@`
		: "";
	const hosts = "ac-jwjuhxw-shard-00-00.kutc0b6.mongodb.net:27017,ac-jwjuhxw-shard-00-01.kutc0b6.mongodb.net:27017,ac-jwjuhxw-shard-00-02.kutc0b6.mongodb.net:27017";
	return `mongodb://${credentials}${hosts}/?${parsed.searchParams.toString()}`;
}

export function getDatabase() {
	const uri = process.env.MONGODB_URI;
	if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) throw new Error("MONGODB_URI is not configured with a valid MongoDB connection string.");
	const mongoClient = globalForMongo.mongoClient ?? new MongoClient(getConnectionUri(uri));
	if (process.env.NODE_ENV !== "production") globalForMongo.mongoClient = mongoClient;
	return mongoClient.db(process.env.MONGODB_DB || "floodwatch");
}
