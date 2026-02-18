import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";

export async function GET() {
  try {
    const companyId = await getCompanyId();
    const drivers = await prisma.driver.findMany({
      where: { companyId },
      orderBy: { cognome: "asc" },
      include: {
        trips: {
          where: { stato: { in: ["in_corso", "approvato"] } },
          select: { id: true, stato: true },
        },
      },
    });
    return NextResponse.json(drivers);
  } catch (error) {
    console.error("Drivers GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento degli autisti" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    const body = await request.json();

    const driver = await prisma.driver.create({
      data: {
        ...body,
        companyId,
        patenteScadenza: new Date(body.patenteScadenza),
        tachigrafoScadenza: new Date(body.tachigrafoScadenza),
        cqcScadenza: body.cqcScadenza ? new Date(body.cqcScadenza) : null,
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error("Drivers POST error:", error);
    return NextResponse.json(
      { error: "Errore nella creazione dell'autista" },
      { status: 500 }
    );
  }
}
