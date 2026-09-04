import { getDatabase } from "@/lib/mongodb";
import { SAFE_CENTRES } from "@/lib/safe-centres";
import type { SafeCentre } from "@/lib/types";

const CENTRES_COLLECTION = "safe_centres";

export async function getSafeCentres(): Promise<SafeCentre[]> {
  const db = await getDatabase();
  const collection = db.collection<SafeCentre>(CENTRES_COLLECTION);

  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.bulkWrite(
    SAFE_CENTRES.map((centre) => ({
      updateOne: {
        filter: { id: centre.id },
        update: { $setOnInsert: centre },
        upsert: true
      }
    }))
  );

  return collection.find({}, { projection: { _id: 0 } }).sort({ district: 1, name: 1 }).toArray();
}
