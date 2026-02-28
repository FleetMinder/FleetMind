import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompany, getCompanyId } from "@/lib/company";

export async function GET() {
  try {
    const company = await getCompany();
    const settings = await prisma.setting.findMany({
      where: { companyId: company.id },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.chiave] = s.valore;
    });

    return NextResponse.json({ company, settings: settingsMap });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle impostazioni" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    const body = await request.json();

    if (body.company) {
      const { nome, indirizzo, citta, cap, telefono, email } = body.company;
      if (!nome?.trim()) {
        return NextResponse.json({ error: "La ragione sociale è obbligatoria" }, { status: 400 });
      }
      await prisma.company.update({
        where: { id: companyId },
        data: {
          nome,
          indirizzo,
          citta,
          cap,
          telefono: telefono || null,
          email: email || null,
        },
      });
    }

    if (body.settings) {
      const ALLOWED_KEYS = new Set(["costo_carburante_litro", "anthropic_api_key"]);
      for (const [chiave, valore] of Object.entries(body.settings)) {
        if (!ALLOWED_KEYS.has(chiave)) continue;
        await prisma.setting.upsert({
          where: { companyId_chiave: { companyId, chiave } },
          create: { companyId, chiave, valore: String(valore) },
          update: { valore: String(valore) },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio delle impostazioni" },
      { status: 500 }
    );
  }
}
