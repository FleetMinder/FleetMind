import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight endpoint to keep Neon DB compute awake.
// Call every 4 minutes via cron-job.org or similar.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
