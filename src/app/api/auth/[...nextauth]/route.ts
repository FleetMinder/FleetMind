import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { rateLimit, LOGIN_RATE_LIMIT, LOGIN_IP_RATE_LIMIT } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

// Wrapper per POST con rate limiting sul signin
async function rateLimitedPost(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  const url = new URL(req.url);
  const isSignIn = url.pathname.includes("/api/auth/signin") ||
    (ctx.params.nextauth?.includes("signin"));

  // Applica rate limiting solo alle richieste di signin
  if (isSignIn) {
    // Rate limit per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") || "unknown";
    const ipCheck = rateLimit(`login_ip:${ip}`, LOGIN_IP_RATE_LIMIT);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: "Troppi tentativi. Riprova tra qualche minuto." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }

    // Rate limit per email (dal body)
    try {
      const body = await req.clone().formData();
      const email = body.get("email");
      if (email && typeof email === "string") {
        const emailCheck = rateLimit(`login_email:${email.toLowerCase()}`, LOGIN_RATE_LIMIT);
        if (!emailCheck.allowed) {
          return NextResponse.json(
            { error: "Troppi tentativi per questa email. Riprova tra qualche minuto." },
            { status: 429, headers: { "Retry-After": String(Math.ceil(emailCheck.retryAfterMs / 1000)) } }
          );
        }
      }
    } catch {
      // Se non riesce a leggere il body, continua senza rate limit per email
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handler as any)(req, ctx);
}

export { handler as GET, rateLimitedPost as POST };
