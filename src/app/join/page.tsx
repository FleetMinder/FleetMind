"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

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
        setMessage(data.error || "Errore");
        setStatus("error");
      }
    } catch {
      setMessage("Errore di connessione");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">FM</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Unisciti al team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sei stato invitato a usare FleetMind
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center space-y-3">
            <p className="text-emerald-500 font-semibold">Benvenuto in {companyName}!</p>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Link
              href="/login"
              className="inline-block mt-3 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Accedi ora
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Codice invito
              </label>
              <input
                type="text"
                value={code}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm border border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                La tua email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@azienda.it"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-500">{message}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={!email || status === "loading"}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {status === "loading" ? "Verifica in corso..." : "Unisciti al team"}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              Dopo la verifica, potrai accedere con magic link o Google
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Caricamento...</div>}>
      <JoinForm />
    </Suspense>
  );
}
