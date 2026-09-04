import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { SAFE_CENTRES } from "@/lib/safe-centres";

export async function GET() {
  try {
    const database = getDatabase();
    const collection = database.collection("safeCentres");
    if (await collection.countDocuments() === 0) await collection.insertMany(SAFE_CENTRES);
    const centres = await collection.find({}).sort({ name: 1 }).toArray();
    return NextResponse.json(centres.map((centre) => { const { _id, ...copy } = centre; void _id; return copy; }));
  } catch {
    return NextResponse.json({ error: "Could not load safe centres from MongoDB." }, { status: 503 });
  }
}
