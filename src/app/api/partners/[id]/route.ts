import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = await getProtectedCompanyId();
    const body = await request.json();

    const partner = await prisma.partner.update({
      where: { id: params.id, companyId },
      data: body,
    });
    return NextResponse.json(partner);
  } catch (error) {
    console.error("Partner PATCH error:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento del partner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = await getProtectedCompanyId();
    await prisma.partner.delete({
      where: { id: params.id, companyId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Partner DELETE error:", error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione del partner" },
      { status: 500 }
    );
  }
}
