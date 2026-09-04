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

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((error) => {
      global._mongoClientPromise = undefined;
      throw error;
    });
  }

  const connectedClient = await global._mongoClientPromise;
  return connectedClient.db(process.env.MONGODB_DB || "flood_warning");
}
