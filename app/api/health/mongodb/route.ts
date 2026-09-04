import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { ok: false, error: "MONGODB_URI is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    return NextResponse.json({ ok: true, database: db.databaseName });
  } catch (error) {
    console.error("MongoDB health check failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "MongoDB is configured but unreachable. Check Atlas network access and credentials."
      },
      { status: 503 }
    );
  }
}
