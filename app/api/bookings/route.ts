import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const database = getDatabase();
    const booking = await request.json();
    const places = Number(booking.places);
    if (!booking.centreName || !Number.isInteger(places) || places < 1) return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
    const centres = database.collection("safeCentres");
    const result = await centres.findOneAndUpdate(
      { name: booking.centreName, $expr: { $lte: [{ $add: ["$occupancy", places] }, "$capacity"] } },
      { $inc: { occupancy: places } },
      { returnDocument: "after" },
    );
    if (!result) return NextResponse.json({ error: "The centre does not have enough available places." }, { status: 409 });
    await database.collection("bookings").insertOne({ ...booking, places, createdAt: new Date().toISOString() });
    const { _id, ...centre } = result;
    void _id;
    return NextResponse.json({ centre }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the booking to MongoDB." }, { status: 503 });
  }
}
