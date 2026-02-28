import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const DEMO_EMAIL = "demo@fleetmind.co";

export async function GET(request: NextRequest) {
  try {
    // Verifica che l'account demo esista
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
    });

    if (!user) {
      // Account demo non configurato — redirect a login con messaggio
      return NextResponse.redirect(
        new URL("/login?error=demo-unavailable", request.url)
      );
    }

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
