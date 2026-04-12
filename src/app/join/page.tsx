"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Truck, CheckCircle } from "lucide-react";

function JoinForm() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleJoin = async () => {
    if (!code || !email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/invite", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompanyName(data.companyName || "");
        setMessage(data.message);
        setStatus("success");
      } else {
        setMessage(data.error || "Codice non valido. Chiedi al tuo responsabile un nuovo link.");
        setStatus("error");
      }
    } catch {
      setMessage("Problemi di connessione. Riprova tra poco.");
      setStatus("error");
    }
  };

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 max-w-sm">
          <Truck className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Link non valido</h1>
          <p className="text-lg text-muted-foreground">
            Chiedi al tuo responsabile di mandarti il link di invito corretto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
            <Truck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Entra nel team</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Il tuo responsabile ti ha invitato su FleetMind
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 p-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-xl font-bold text-foreground">Benvenuto in {companyName}!</p>
            <p className="text-base text-muted-foreground">Ora puoi accedere alla piattaforma</p>
            <Link
              href="/login"
              className="block mt-4 px-6 py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold text-center hover:bg-primary/90 transition-colors"
            >
              Accedi ora
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-foreground mb-2">
                La tua email aziendale
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario.rossi@azienda.it"
                autoComplete="email"
                className="w-full px-5 py-4 rounded-2xl bg-secondary text-foreground text-lg border-2 border-border placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {status === "error" && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4">
                <p className="text-base text-red-500">{message}</p>
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={!email || status === "loading"}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors active:scale-[0.98]"
            >
              {status === "loading" ? "Un momento..." : "Entra nel team"}
            </button>

            <p className="text-sm text-center text-muted-foreground">
              Dopo, riceverai un&apos;email per accedere. Niente password da ricordare.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Truck className="w-10 h-10 text-primary animate-pulse" />
      </div>
    }>
      <JoinForm />
    </Suspense>
  );
}
