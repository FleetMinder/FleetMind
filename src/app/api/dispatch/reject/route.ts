import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";

export async function POST(request: NextRequest) {
  try {
    const companyId = await getProtectedCompanyId();
    const { assignmentId } = await request.json();

    if (!assignmentId) {
      return NextResponse.json({ error: "assignmentId richiesto" }, { status: 400 });
    }

    await prisma.assignment.updateMany({
      where: { id: assignmentId, companyId },
      data: { status: "rejected" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assignment reject error:", error);
    return NextResponse.json({ error: "Errore nel rigetto" }, { status: 500 });
  }
}
