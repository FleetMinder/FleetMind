import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const order = await prisma.order.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento dell'ordine" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order DELETE error:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione dell'ordine" },
      { status: 500 }
    );
  }
}
