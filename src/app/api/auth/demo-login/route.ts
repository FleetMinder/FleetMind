import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const DEMO_EMAIL = "demo@fleetmind.co";
const DEMO_PIVA = "IT02847390165";

async function ensureDemoUserExists() {
  // Upsert company demo
  const company = await prisma.company.upsert({
    where: { piva: DEMO_PIVA },
    update: {},
    create: {
      nome: "Trasporti Rossi S.r.l.",
      indirizzo: "Via Industriale 42",
      citta: "Bergamo",
      cap: "24126",
      piva: DEMO_PIVA,
      telefono: "+39 035 4284920",
      email: "info@trasportirossi.it",
      onboardingCompleted: true,
    },
  });

  // Upsert utente demo
  const existingUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        emailVerified: new Date(),
        nome: "Demo",
        cognome: "FleetMind",
        companyId: company.id,
        ruolo: "admin",
      },
    });
  } else if (!existingUser.companyId) {
    await prisma.user.update({
      where: { email: DEMO_EMAIL },
      data: { companyId: company.id, emailVerified: new Date() },
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Auto-crea utente+azienda demo se non esistono (idempotente)
    await ensureDemoUserExists();

    // Elimina eventuali token precedenti per questa email (pulizia)
    await prisma.verificationToken.deleteMany({
      where: { identifier: DEMO_EMAIL },
    });

    // Crea un token di verifica valido per 5 minuti
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: DEMO_EMAIL,
        token,
        expires,
      },
    });

    // Redirect al callback NextAuth email — crea la sessione direttamente
    const origin = new URL(request.url).origin;
    const callbackUrl = `${origin}/api/auth/callback/email?token=${token}&email=${encodeURIComponent(DEMO_EMAIL)}&callbackUrl=${encodeURIComponent("/")}`;

    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.redirect(
      new URL("/login?error=demo-error", request.url)
    );
  }
}
