import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Azienda non configurata" }, { status: 400 });
    }

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ error: "API Key mancante" }, { status: 400 });
    }

    // Upsert setting
    await prisma.setting.upsert({
      where: {
        companyId_chiave: {
          companyId: session.user.companyId,
          chiave: "anthropic_api_key",
        },
      },
      update: { valore: apiKey.trim() },
      create: {
        companyId: session.user.companyId,
        chiave: "anthropic_api_key",
        valore: apiKey.trim(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore onboarding apikey:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio della API Key" },
      { status: 500 }
    );
  }
}
