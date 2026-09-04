import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { SAFE_CENTRES } from "@/lib/safe-centres";

const BOOKINGS_COLLECTION = "centre_bookings";

type BookingRequest = {
  centreId: string;
  contactName: string;
  guests: number;
};

function getCentre(centreId: string) {
  return SAFE_CENTRES.find((centre) => String(centre.id) === centreId);
}

export async function GET() {
  try {
    const db = await getDatabase();
    const bookings = await db.collection(BOOKINGS_COLLECTION).aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: "$centreId", guests: { $sum: "$guests" } } }
    ]).toArray();

    return NextResponse.json({
      bookings: Object.fromEntries(
        bookings.map((booking) => [String(booking._id), booking.guests])
      )
    });
  } catch (error) {
    console.error("Failed to load centre bookings", error);
    return NextResponse.json(
      { error: "Unable to load bookings right now." },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  let payload: BookingRequest;

  try {
    payload = (await request.json()) as BookingRequest;
  } catch {
    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  }

  const centre = getCentre(String(payload.centreId));
  const contactName = payload.contactName?.trim();
  const guests = Math.floor(Number(payload.guests));

  if (!centre || !contactName || !Number.isFinite(guests) || guests < 1) {
    return NextResponse.json(
      { error: "Provide a valid centre, contact name, and guest count." },
      { status: 400 }
    );
  }

  try {
    const db = await getDatabase();
    const result = await db.collection(BOOKINGS_COLLECTION).aggregate([
      { $match: { centreId: String(centre.id), status: "confirmed" } },
      { $group: { _id: null, guests: { $sum: "$guests" } } }
    ]).toArray();
    const bookedGuests = result[0]?.guests || 0;
    const placesFree = Math.max(0, centre.capacity - centre.occupancy - bookedGuests);

    if (guests > placesFree) {
      return NextResponse.json(
        { error: `Only ${placesFree} spot${placesFree === 1 ? "" : "s"} remain at this centre.` },
        { status: 409 }
      );
    }

    await db.collection(BOOKINGS_COLLECTION).insertOne({
      centreId: String(centre.id),
      contactName,
      guests,
      status: "confirmed",
      createdAt: new Date()
    });

    return NextResponse.json({ confirmed: true, centreId: String(centre.id), guests });
  } catch (error) {
    console.error("Failed to create centre booking", error);
    return NextResponse.json(
      { error: "Unable to confirm the booking right now." },
      { status: 503 }
    );
  }
}
