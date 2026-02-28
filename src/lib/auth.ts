import { getServerSession, type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { Resend } from "resend";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 giorni
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
  providers: [
    // Google OAuth (abilitato se le credenziali sono configurate)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // Magic Link via Email
    EmailProvider({
      server: {}, // Non usato, usiamo sendVerificationRequest custom
      from: "FleetMind <noreply@fleetmind.co>",
      maxAge: 15 * 60, // Magic link scade dopo 15 minuti
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1e293b; font-size: 24px; margin: 0;">FleetMind</h1>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">AI Dispatch Planner</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center;">
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 8px;">Il tuo link di accesso</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0 0 24px;">
                Clicca il bottone qui sotto per accedere a FleetMind.
              </p>
              <a href="${url}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Accedi a FleetMind
              </a>
              <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0;">
                Il link scade tra 15 minuti. Se non hai richiesto questo accesso, ignora questa email.
              </p>
            </div>
          </div>
        `;

        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "FleetMind <noreply@fleetmind.co>",
            to: email,
            subject: "Accedi a FleetMind",
            html: emailHtml,
          });
        } else {
          // Dev mode: stampa il link in console
          console.log("\n╔══════════════════════════════════════════╗");
          console.log("║        MAGIC LINK (solo sviluppo)        ║");
          console.log("╠══════════════════════════════════════════╣");
          console.log(`║ Email: ${email}`);
          console.log(`║ Link:  ${url}`);
          console.log("╚══════════════════════════════════════════╝\n");
        }
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      // Log accesso riuscito
      try {
        await prisma.loginLog.create({
          data: {
            userId: user.id,
            email: user.email || "",
            success: true,
            motivo: account?.provider || "unknown",
          },
        });
      } catch (e) {
        console.error("Errore log accesso:", e);
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id;
        token.companyId = user.companyId;
        token.ruolo = user.ruolo;
        token.isDemoUser = user.email === "demo@fleetmind.co";

        // Per Google OAuth, popola nome/cognome dall'account Google
        if (account?.provider === "google") {
          token.nome = user.name?.split(" ")[0] || user.nome || null;
          token.cognome = user.name?.split(" ").slice(1).join(" ") || user.cognome || null;
        } else {
          token.nome = user.nome;
          token.cognome = user.cognome;
        }

        // Check onboarding status
        if (user.companyId) {
          const company = await prisma.company.findUnique({
            where: { id: user.companyId },
            select: { onboardingCompleted: true },
          });
          token.onboardingCompleted = company?.onboardingCompleted ?? false;
        } else {
          // Demo users skip onboarding
          token.onboardingCompleted = token.isDemoUser ? true : false;
        }
      }

      // Permetti aggiornamento sessione dal client
      if (trigger === "update" && session) {
        if (session.companyId) token.companyId = session.companyId;
        if (session.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
        if (session.nome) token.nome = session.nome;
        if (session.cognome) token.cognome = session.cognome;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.companyId = token.companyId;
        session.user.ruolo = token.ruolo;
        session.user.nome = token.nome;
        session.user.cognome = token.cognome;
        session.user.onboardingCompleted = token.onboardingCompleted;
        session.user.isDemoUser = token.isDemoUser ?? false;
      }
      return session;
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCompanyId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.companyId) {
    throw new Error("Utente non autenticato o senza azienda");
  }
  return session.user.companyId;
}

export async function getCompany() {
  const companyId = await getCompanyId();
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });
  if (!company) throw new Error("Azienda non trovata");
  return company;
}
