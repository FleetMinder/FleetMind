import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Route pubbliche: non richiedono autenticazione
  const publicPaths = ["/login", "/api/auth", "/landing", "/track", "/api/track", "/privacy", "/termini"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Verifica token JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Non autenticato → mostra landing page (non login)
  if (!token) {
    // Se è già sulla root, mostra la landing page
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/landing", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Autenticato ma onboarding non completato → redirect a onboarding
  // (tranne se è già su /onboarding, sulle API, o è un utente demo)
  if (
    !token.onboardingCompleted &&
    !(token.isDemoUser as boolean | undefined) &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api/")
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Onboarding completato (o utente demo) ma tenta di accedere a /onboarding → redirect a dashboard
  if (
    (token.onboardingCompleted || (token.isDemoUser as boolean | undefined)) &&
    pathname.startsWith("/onboarding")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
