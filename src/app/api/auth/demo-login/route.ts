import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";

const DEMO_EMAIL = "demo@fleetmind.co";

export async function GET(request: NextRequest) {
  try {
    // Carica l'utente demo dal DB (già seedato)
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      include: {
        company: { select: { onboardingCompleted: true } },
      },
    });

    if (!user) {
      console.error("Demo user not found — run npx prisma db seed");
      return NextResponse.redirect(
        new URL("/login?error=demo-not-found", request.url)
      );
    }

    // Crea JWT nello stesso formato che NextAuth si aspetta
    // (stesso payload che il callback jwt() imposta al primo login)
    const tokenPayload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: [user.nome, user.cognome].filter(Boolean).join(" ") || "Demo",
      companyId: user.companyId,
      ruolo: user.ruolo,
      isDemoUser: true,
      onboardingCompleted: user.company?.onboardingCompleted ?? true,
      nome: user.nome,
      cognome: user.cognome,
    };

    const jwt = await encode({
      token: tokenPayload,
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 30 * 24 * 60 * 60, // 30 giorni (sessione lunga, il trial cookie scade in 24h)
    });

    // NextAuth usa __Secure- prefix su HTTPS
    const isSecure = request.url.startsWith("https://");
    const cookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const response = NextResponse.redirect(new URL("/", request.url));

    // Setta cookie sessione NextAuth
    response.cookies.set(cookieName, jwt, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    // Cookie demo_trial: scade dopo 24h — usato dal layout per mostrare il paywall
    response.cookies.set("demo_trial", "1", {
      httpOnly: false,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.redirect(
      new URL("/login?error=demo-error", request.url)
    );
  }
}
