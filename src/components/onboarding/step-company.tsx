"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PROVINCE_ITALIANE = [
  "AG","AL","AN","AO","AP","AQ","AR","AT","AV","BA","BG","BI","BL","BN","BO",
  "BR","BS","BT","BZ","CA","CB","CE","CH","CL","CN","CO","CR","CS","CT","CZ",
  "EN","FC","FE","FG","FI","FM","FR","GE","GO","GR","IM","IS","KR","LC","LE",
  "LI","LO","LT","LU","MB","MC","ME","MI","MN","MO","MS","MT","NA","NO","NU",
  "OR","PA","PC","PD","PE","PG","PI","PN","PO","PR","PT","PU","PV","PZ","RA",
  "RC","RE","RG","RI","RM","RN","RO","SA","SI","SO","SP","SR","SS","SU","SV",
  "TA","TE","TN","TO","TP","TR","TS","TV","UD","VA","VB","VC","VE","VI","VR",
  "VT","VV",
];

interface Props {
  onComplete: (companyName: string) => void;
  onSkip?: () => void;
}

export function StepCompany({ onComplete, onSkip }: Props) {
  const { update } = useSession();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const nome = form.get("nome") as string;
    const provincia = form.get("provincia") as string;
    const numerVeicoli = form.get("numerVeicoli") as string;

    const body = {
      nome,
      provincia,
      numerVeicoli,
    };

    try {
      const res = await fetch("/api/onboarding/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore");
      }

      const data = await res.json();

      await update({ companyId: data.companyId });

      toast.success("Azienda configurata con successo");
      onComplete(nome);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore nella configurazione");
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="h-6 w-6 text-blue-400" />
          La tua azienda
        </CardTitle>
        <CardDescription>
          Iniziamo con le informazioni base. Potrai completare i dettagli in seguito nelle impostazioni.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="nome">Nome azienda *</Label>
            <Input
              id="nome"
              name="nome"
              required
              placeholder="es. Trasporti Rossi Srl"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="numerVeicoli">Numero di veicoli in flotta</Label>
            <select
              name="numerVeicoli"
              id="numerVeicoli"
              className="mt-1 w-full h-10 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="1-5">1 – 5 veicoli</option>
              <option value="6-15">6 – 15 veicoli</option>
              <option value="16-30">16 – 30 veicoli</option>
              <option value="30+">Più di 30 veicoli</option>
            </select>
          </div>

          <div>
            <Label htmlFor="provincia">Provincia sede</Label>
            <select
              name="provincia"
              id="provincia"
              className="mt-1 w-full h-10 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Seleziona provincia…</option>
              {PROVINCE_ITALIANE.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            {onSkip && (
              <Button type="button" variant="ghost" onClick={onSkip} disabled={saving} className="flex-1">
                Salta per ora →
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  Continua →
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
