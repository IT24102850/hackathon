import { NextResponse } from "next/server";
import { getSafeCentres } from "@/lib/safe-centres-db";

export async function GET() {
  try {
    const centres = await getSafeCentres();
    return NextResponse.json({ centres });
  } catch (error) {
    console.error("Failed to load safe centres", error);
    return NextResponse.json(
      { error: "Unable to load safe centres right now." },
      { status: 503 }
    );
  }
}
