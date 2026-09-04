import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const database = getDatabase();
    const reports = await database.collection("waterReports").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(reports.map((report) => { const { _id, ...copy } = report; void _id; return copy; }));
  } catch {
    return NextResponse.json({ error: "Could not load water reports from MongoDB." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const database = getDatabase();
    const report = await request.json();
    const document = { ...report, createdAt: report.createdAt || new Date().toISOString() };
    await database.collection("waterReports").insertOne(document);
    return NextResponse.json(document, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the water report to MongoDB." }, { status: 503 });
  }
}
