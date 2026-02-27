"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "sonner";
import {
  Building2,
  CreditCard,
  Save,
  Loader2,
  CheckCircle2,
  Fuel,
  RotateCcw,
} from "lucide-react";

interface Company {
  id: string;
  nome: string;
  indirizzo: string;
  citta: string;
  cap: string;
  piva: string;
  telefono: string | null;
  email: string | null;
}

interface SettingsData {
  company: Company;
  settings: Record<string, string>;
}

const plans = [
  {
    id: "starter",
    nome: "Starter",
    prezzo: "49",
    features: ["5 autisti", "10 mezzi", "100 ordini/mese", "AI Dispatch base"],
  },
  {
    id: "professional",
    nome: "Professional",
    prezzo: "149",
    features: [
      "20 autisti",
      "50 mezzi",
      "Ordini illimitati",
      "AI Dispatch avanzato",
      "API integrations",
      "Supporto prioritario",
    ],
  },
  {
    id: "enterprise",
    nome: "Enterprise",
    prezzo: "399",
    features: [
      "Autisti illimitati",
      "Mezzi illimitati",
      "Ordini illimitati",
      "AI Dispatch premium",
      "Custom integrations",
      "SLA dedicato",
      "Account manager",
    ],
  },
];

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({});
  const [costoCarburante, setCostoCarburante] = useState("1.85");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: SettingsData) => {
        setData(data);
        setCompanyForm(data.company);
        setCostoCarburante(data.settings.costo_carburante_litro || "1.85");
      })
      .catch(() => toast.error("Errore nel caricamento delle impostazioni"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            nome: companyForm.nome,
            indirizzo: companyForm.indirizzo,
            citta: companyForm.citta,
            cap: companyForm.cap,
            telefono: companyForm.telefono,
            email: companyForm.email,
          },
          settings: {
            costo_carburante_litro: costoCarburante,
          },
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Impostazioni salvate con successo");
    } catch {
      toast.error("Errore nel salvataggio delle impostazioni");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div>
        <PageHeader title="Impostazioni" description="Configurazione account e integrazioni" />
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentPlan = data.settings.piano_abbonamento || "professional";

  return (
    <div>
      <PageHeader title="Impostazioni" description="Configurazione account e integrazioni">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Salvataggio..." : "Salva Modifiche"}
        </Button>
      </PageHeader>

      <div className="space-y-6 max-w-4xl">
        {/* Company profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Profilo Azienda
            </CardTitle>
            <CardDescription>Dati identificativi della tua azienda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Ragione Sociale</Label>
                <Input
                  id="nome"
                  value={companyForm.nome || ""}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, nome: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="piva">Partita IVA</Label>
                <Input id="piva" value={companyForm.piva || ""} disabled />
              </div>
            </div>
            <div>
              <Label htmlFor="indirizzo">Indirizzo</Label>
              <Input
                id="indirizzo"
                value={companyForm.indirizzo || ""}
                onChange={(e) =>
                  setCompanyForm((prev) => ({ ...prev, indirizzo: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="citta">Citta</Label>
                <Input
                  id="citta"
                  value={companyForm.citta || ""}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, citta: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="cap">CAP</Label>
                <Input
                  id="cap"
                  value={companyForm.cap || ""}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, cap: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  value={companyForm.telefono || ""}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, telefono: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={companyForm.email || ""}
                  onChange={(e) =>
                    setCompanyForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferenze */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Preferenze Operative
            </CardTitle>
            <CardDescription>Parametri per i calcoli di costo</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="costoCarburante">Costo Carburante (EUR/litro)</Label>
              <Input
                id="costoCarburante"
                type="number"
                step="0.01"
                value={costoCarburante}
                onChange={(e) => setCostoCarburante(e.target.value)}
                className="mt-1 max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Usato per la stima dei costi carburante nelle tratte
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo reset */}
        <Card className="border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <RotateCcw className="h-5 w-5" />
              Reset Demo
            </CardTitle>
            <CardDescription>
              Ripristina lo stato iniziale dell&apos;account demo: elimina tutti i viaggi, riporta ordini a pending e autisti/mezzi a disponibili.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              disabled={resetting}
              onClick={async () => {
                setResetting(true);
                try {
                  const res = await fetch("/api/demo-reset", { method: "POST" });
                  if (!res.ok) throw new Error();
                  toast.success("Demo ripristinato! Ora puoi ricominciare dall'inizio.");
                } catch {
                  toast.error("Errore nel reset demo");
                } finally {
                  setResetting(false);
                }
              }}
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              {resetting ? "Ripristino in corso..." : "Ripristina Demo"}
            </Button>
          </CardContent>
        </Card>

        {/* Subscription plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Piano Abbonamento
            </CardTitle>
            <CardDescription>Gestisci il tuo piano FleetMind</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border p-4 transition-colors ${
                    currentPlan === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {currentPlan === plan.id && (
                    <Badge className="absolute -top-2 right-3 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Attivo
                    </Badge>
                  )}
                  <h3 className="font-semibold text-lg">{plan.nome}</h3>
                  <p className="text-2xl font-bold mt-1">
                    {plan.prezzo}
                    <span className="text-sm font-normal text-muted-foreground">
                      /mese
                    </span>
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="text-xs text-muted-foreground flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {currentPlan !== plan.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => toast.info("Funzionalita non disponibile nella demo")}
                    >
                      Seleziona
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
