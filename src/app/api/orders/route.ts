import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    const searchParams = request.nextUrl.searchParams;
    const stato = searchParams.get("stato");
    const urgenza = searchParams.get("urgenza");

    const where: Record<string, unknown> = { companyId };
    if (stato && stato !== "tutti") where.stato = stato;
    if (urgenza && urgenza !== "tutti") where.urgenza = urgenza;

    const orders = await prisma.order.findMany({
      where,
      orderBy: [{ urgenza: "asc" }, { createdAt: "desc" }],
      include: {
        trip: {
          select: { id: true, stato: true },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento degli ordini" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    const body = await request.json();

    const count = await prisma.order.count({ where: { companyId } });
    const codiceOrdine = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const order = await prisma.order.create({
      data: {
        ...body,
        codiceOrdine,
        companyId,
        finestraCaricoDa: new Date(body.finestraCaricoDa),
        finestraCaricoA: new Date(body.finestraCaricoA),
        finestraConsegnaDa: new Date(body.finestraConsegnaDa),
        finestraConsegnaA: new Date(body.finestraConsegnaA),
      },
    });

    await prisma.activityLog.create({
      data: {
        companyId,
        tipo: "order_created",
        messaggio: `Nuovo ordine ${codiceOrdine} creato per ${body.destinatarioNome}`,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { error: "Errore nella creazione dell'ordine" },
      { status: 500 }
    );
  }
}
