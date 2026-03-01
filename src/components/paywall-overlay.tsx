"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ExternalLink, Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    id: "starter",
    nome: "Starter",
    prezzo: "49",
    features: [
      "Fino a 10 veicoli",
      "AI Dispatch",
      "Compliance & scadenze",
      "Gestione ordini e partner",
      "Supporto via email",
    ],
  },
  {
    id: "professional",
    nome: "Professional",
    prezzo: "149",
    highlight: true,
    features: [
      "Fino a 30 veicoli",
      "AI Dispatch agentico",
      "Compliance + LEZ monitoring",
      "Google Maps routing",
      "MIT tariffe 2024",
      "Supporto prioritario",
    ],
  },
  {
    id: "business",
    nome: "Business",
    prezzo: "299",
    features: [
      "Fino a 100 veicoli",
      "Tutto Professional +",
      "Report & analytics avanzati",
      "Onboarding assistito",
      "SLA garantito",
      "Account manager dedicato",
    ],
  },
];

interface Props {
  isDemoUser?: boolean;
}

export function PaywallOverlay({ isDemoUser = false }: Props) {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [verifying] = useState(paymentSuccess);

  useEffect(() => {
    if (paymentSuccess) {
      // Attendi 3s e ricarica: se il webhook ha già aggiornato il DB il paywall sparisce
      const t = setTimeout(() => {
        window.location.href = "/";
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [paymentSuccess]);

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const d = await res.json();
      if (d.url) {
        window.location.href = d.url;
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Errore nel reindirizzamento al checkout");
      setCheckoutLoading(null);
    }
  };

  const handleStartFree = async () => {
    setSignOutLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-4xl mx-auto px-4">
        {verifying ? (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Verifica pagamento in corso...
            </h2>
            <p className="text-muted-foreground text-sm">
              Attendi qualche secondo, stai per accedere a FleetMind.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Zap className="h-4 w-4" />
                {isDemoUser ? "Accesso demo scaduto" : "Trial gratuito terminato"}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-3">
                Scegli il tuo piano FleetMind
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                {isDemoUser
                  ? "Hai esplorato FleetMind con la demo. Abbonati per accedere alla tua flotta, oppure inizia con 14 giorni gratuiti senza carta di credito."
                  : "Il tuo periodo di prova gratuita è scaduto. Scegli un piano per continuare a gestire la tua flotta con l'AI."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-6 flex flex-col ${
                    plan.highlight
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Più popolare
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg">{plan.nome}</h3>
                    <p className="text-3xl font-bold mt-1">
                      €{plan.prezzo}
                      <span className="text-sm font-normal text-muted-foreground">
                        /mese
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full gap-2"
                    variant={plan.highlight ? "default" : "outline"}
                    disabled={checkoutLoading !== null || signOutLoading}
                    onClick={() => handleCheckout(plan.id)}
                  >
                    {checkoutLoading === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    {checkoutLoading === plan.id
                      ? "Reindirizzamento..."
                      : "Abbonati ora"}
                  </Button>
                </div>
              ))}
            </div>

            {/* CTA secondaria per utenti demo */}
            {isDemoUser && (
              <div className="mt-8 text-center border-t border-border pt-6">
                <p className="text-sm text-muted-foreground mb-3">
                  Preferisci iniziare con la tua prova gratuita di 14 giorni? Nessuna carta di credito richiesta.
                </p>
                <Button
                  variant="ghost"
                  className="gap-2 font-medium"
                  disabled={checkoutLoading !== null || signOutLoading}
                  onClick={handleStartFree}
                >
                  {signOutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {signOutLoading ? "Reindirizzamento..." : "Inizia Gratis — 14 giorni"}
                </Button>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground mt-6">
              Nessun addebito nascosto · Cancellazione in qualsiasi momento ·
              Supporto incluso
            </p>
          </>
        )}
      </div>
    </div>
  );
}
