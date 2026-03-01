import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";

export async function GET() {
  try {
    const companyId = await getProtectedCompanyId();
    const partners = await prisma.partner.findMany({
      where: { companyId },
      orderBy: { rating: "desc" },
    });
    return NextResponse.json(partners);
  } catch (error) {
    if (error instanceof Error && error.message === "TRIAL_EXPIRED") {
      return NextResponse.json({ error: "Trial scaduto" }, { status: 403 });
    }
    console.error("Partners GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei partner" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getProtectedCompanyId();
    const body = await request.json();

    const partner = await prisma.partner.create({
      data: { ...body, companyId },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "TRIAL_EXPIRED") {
      return NextResponse.json({ error: "Trial scaduto" }, { status: 403 });
    }
    console.error("Partners POST error:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del partner" },
      { status: 500 }
    );
  }
}
