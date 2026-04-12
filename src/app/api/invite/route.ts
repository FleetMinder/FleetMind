import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";
import crypto from "crypto";

// GET — get invite code + team members
export async function GET() {
  try {
    const companyId = await getProtectedCompanyId();

    let setting = await prisma.setting.findUnique({
      where: { companyId_chiave: { companyId, chiave: "invite_code" } },
    });

    if (!setting) {
      const code = crypto.randomBytes(6).toString("hex");
      setting = await prisma.setting.create({
        data: { companyId, chiave: "invite_code", valore: code },
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { nome: true },
    });

    const members = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, nome: true, cognome: true, email: true, ruolo: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      inviteCode: setting.valore,
      companyName: company?.nome || "",
      members,
    });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
}

// POST — regenerate invite code
export async function POST() {
  try {
    const companyId = await getProtectedCompanyId();
    const code = crypto.randomBytes(6).toString("hex");

    await prisma.setting.upsert({
      where: { companyId_chiave: { companyId, chiave: "invite_code" } },
      update: { valore: code },
      create: { companyId, chiave: "invite_code", valore: code },
    });

    return NextResponse.json({ inviteCode: code });
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
}

// PUT — join: validate invite + pre-create or link user
export async function PUT(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code || !email) {
      return NextResponse.json({ error: "Codice e email richiesti" }, { status: 400 });
    }

    // Find company with this invite code
    const setting = await prisma.setting.findFirst({
      where: { chiave: "invite_code", valore: code },
    });

    if (!setting) {
      return NextResponse.json({ error: "Codice invito non valido. Chiedi al tuo responsabile un nuovo link." }, { status: 404 });
    }

    const company = await prisma.company.findUnique({
      where: { id: setting.companyId },
      select: { id: true, nome: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Azienda non trovata" }, { status: 404 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.companyId === company.id) {
        return NextResponse.json({ message: "Fai gia parte del team!", companyName: company.nome });
      }
      // Link existing user to company
      await prisma.user.update({
        where: { email },
        data: { companyId: company.id, ruolo: "operator" },
      });
    } else {
      // Pre-create user stub — when they login via Google/email, NextAuth
      // finds this record and links the OAuth account to it
      await prisma.user.create({
        data: {
          email,
          companyId: company.id,
          ruolo: "operator",
        },
      });
    }

    return NextResponse.json({
      message: "Benvenuto nel team!",
      companyId: company.id,
      companyName: company.nome,
    });
  } catch (e) {
    console.error("Join error:", e);
    return NextResponse.json({ error: "Errore. Riprova." }, { status: 500 });
  }
}
