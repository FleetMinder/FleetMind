import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId, getCompany } from "@/lib/company";

export async function GET() {
  try {
    const companyId = await getCompanyId();
    const company = await getCompany();
    const settings = await prisma.setting.findMany({
      where: { companyId },
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
      await prisma.company.update({
        where: { id: companyId },
        data: body.company,
      });
    }

    if (body.settings) {
      for (const [chiave, valore] of Object.entries(body.settings)) {
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
