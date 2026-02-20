import { getServerSession, type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
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
    EmailProvider({
      server: process.env.EMAIL_SERVER_HOST
        ? {
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT) || 465,
            auth: {
              user: process.env.EMAIL_SERVER_USER || "",
              pass: process.env.EMAIL_SERVER_PASSWORD || "",
            },
          }
        : undefined as unknown as string,
      from: process.env.EMAIL_FROM || "FleetMind <noreply@fleetmind.it>",
      ...(process.env.EMAIL_SERVER_HOST
        ? {}
        : {
            sendVerificationRequest: async ({ identifier: email, url }) => {
              // Dev mode: stampa il link in console
              console.log("\n╔══════════════════════════════════════════╗");
              console.log("║        MAGIC LINK (solo sviluppo)        ║");
              console.log("╠══════════════════════════════════════════╣");
              console.log(`║ Email: ${email}`);
              console.log(`║ Link:  ${url}`);
              console.log("╚══════════════════════════════════════════╝\n");
            },
          }),
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.companyId = user.companyId;
        token.ruolo = user.ruolo;
        token.nome = user.nome;
        token.cognome = user.cognome;

        // Check onboarding status
        if (user.companyId) {
          const company = await prisma.company.findUnique({
            where: { id: user.companyId },
            select: { onboardingCompleted: true },
          });
          token.onboardingCompleted = company?.onboardingCompleted ?? false;
        } else {
          token.onboardingCompleted = false;
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
