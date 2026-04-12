import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const companyId = await getProtectedCompanyId();
    const session = await getSession();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId richiesto" }, { status: 400 });
    }

    // Can't remove yourself
    if (userId === session?.user?.id) {
      return NextResponse.json({ error: "Non puoi rimuovere te stesso" }, { status: 400 });
    }

    // Verify the user belongs to the same company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true, ruolo: true, email: true },
    });

    if (!user || user.companyId !== companyId) {
      return NextResponse.json({ error: "Utente non trovato nel team" }, { status: 404 });
    }

    // Can't remove admins
    if (user.ruolo === "admin") {
      return NextResponse.json({ error: "Non puoi rimuovere un admin" }, { status: 400 });
    }

    // Unlink user from company
    await prisma.user.update({
      where: { id: userId },
      data: { companyId: null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
