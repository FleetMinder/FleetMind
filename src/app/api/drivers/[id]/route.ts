import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    if (body.patenteScadenza) body.patenteScadenza = new Date(body.patenteScadenza);
    if (body.tachigrafoScadenza) body.tachigrafoScadenza = new Date(body.tachigrafoScadenza);
    if (body.cqcScadenza) body.cqcScadenza = new Date(body.cqcScadenza);
    if (body.adrScadenza) body.adrScadenza = new Date(body.adrScadenza);

    const driver = await prisma.driver.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(driver);
  } catch (error) {
    console.error("Driver PATCH error:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento dell'autista" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.driver.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Driver DELETE error:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione dell'autista" },
      { status: 500 }
    );
  }
}
