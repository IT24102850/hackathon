import { MongoClient } from "mongodb";

const options = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  const mongoClientPromise =
    global._mongoClientPromise || new MongoClient(uri, options).connect();

  if (process.env.NODE_ENV !== "production") {
    global._mongoClientPromise = mongoClientPromise;
  }

  const connectedClient = await mongoClientPromise;
  return connectedClient.db(process.env.MONGODB_DB || "flood_warning");
}
