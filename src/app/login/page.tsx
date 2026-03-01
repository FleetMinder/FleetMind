"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, Loader2, ArrowRight, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [justSubscribed] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("subscriptionSuccess") === "true";
    }
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn("email", {
        email: email.trim(),
        redirect: false,
        callbackUrl: "/",
      });
      if (result?.error) {
        setError("Errore nell'invio del link. Riprova.");
        setLoading(false);
      } else {
        window.location.href =
          "/login/verify?email=" + encodeURIComponent(email.trim());
      }
    } catch {
      setError("Errore di connessione. Riprova.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    // Pulisci eventuale sessione attiva (es. utente demo) per evitare
    // conflitto OAuthAccountNotLinked con l'account Google reale
    await signOut({ redirect: false });
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="space-y-6">
      {/* Subscription success */}
      {justSubscribed && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex gap-3 items-start">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
              Piano attivato! <Sparkles className="h-3.5 w-3.5" />
            </p>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-300/80 mt-0.5">
              14 giorni di prova gratuita iniziati. Accedi per usare FleetMind.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {justSubscribed ? "Accedi per iniziare" : "Accedi o registrati"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {justSubscribed
            ? "Usa la stessa email con cui ti sei iscritto."
            : "Nessuna password — usiamo Google o un link magico sicuro."}
        </p>
      </div>

      {/* Trial info badge — shown only when not just subscribed */}
      {!justSubscribed && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-4 py-3">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Nuovo su FleetMind?
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            Inserisci la tua email per accedere o creare un account. Avrai{" "}
            <strong>14 giorni gratuiti</strong> per esplorare tutte le funzionalità —
            nessuna carta di credito richiesta.
          </p>
        </div>
      )}

      {/* Card form */}
      <Card className="border-border">
        <CardHeader className="pb-3 pt-5">
          <p className="text-sm font-medium text-center text-muted-foreground">
            Scegli come accedere
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <GoogleIcon className="h-4 w-4 mr-2" />
            )}
            Continua con Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">oppure via email</span>
            </div>
          </div>

          {/* Magic Link */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">
                Email aziendale
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@azienda.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                <>
                  Invia Magic Link
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer links */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Torna alla home
        </Link>
        <p className="text-xs text-muted-foreground">
          Nessuna password richiesta
        </p>
      </div>
    </div>
  );
}
