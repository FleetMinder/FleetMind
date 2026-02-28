import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyId: string | null;
      ruolo: string;
      nome: string | null;
      cognome: string | null;
      onboardingCompleted: boolean;
      isDemoUser: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    companyId: string | null;
    ruolo: string;
    nome: string | null;
    cognome: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    companyId: string | null;
    ruolo: string;
    nome: string | null;
    cognome: string | null;
    onboardingCompleted: boolean;
    isDemoUser: boolean;
  }
}
