"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2, ArrowRight, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onComplete: (driverName: string) => void;
  onSkip: () => void;
}

export function StepDriver({ onComplete, onSkip }: Props) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      nome: form.get("nome"),
      cognome: form.get("cognome"),
      codiceFiscale: form.get("codiceFiscale"),
      patenteTipo: form.get("patenteTipo"),
      patenteNumero: form.get("patenteNumero"),
      patenteScadenza: form.get("patenteScadenza"),
      cartaCQC: form.get("cartaCQC") || null,
      cqcScadenza: form.get("cqcScadenza") || null,
      tachigrafoScadenza: form.get("tachigrafoScadenza"),
      telefono: form.get("telefono") || null,
    };

    try {
      const res = await fetch("/api/onboarding/driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      toast.success("Autista aggiunto con successo");
      onComplete(`${body.nome} ${body.cognome}`);
    } catch {
      toast.error("Errore nell'aggiunta dell'autista");
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="h-6 w-6 text-blue-400" />
          Primo Autista
        </CardTitle>
        <CardDescription>
          Registra il tuo primo autista. Potrai aggiungerne altri in seguito dalla sezione Autisti.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" name="nome" required placeholder="Marco" />
            </div>
            <div>
              <Label htmlFor="cognome">Cognome *</Label>
              <Input id="cognome" name="cognome" required placeholder="Verdi" />
            </div>
          </div>

          <div>
            <Label htmlFor="codiceFiscale">Codice Fiscale *</Label>
            <Input id="codiceFiscale" name="codiceFiscale" required placeholder="VRDMRC80A01H501Z" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="patenteTipo">Tipo Patente *</Label>
              <select
                name="patenteTipo"
                id="patenteTipo"
                className="w-full h-10 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              >
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="CE" selected>CE</option>
                <option value="C1">C1</option>
                <option value="C1E">C1E</option>
              </select>
            </div>
            <div>
              <Label htmlFor="patenteNumero">N. Patente *</Label>
              <Input id="patenteNumero" name="patenteNumero" required placeholder="AB1234567" />
            </div>
            <div>
              <Label htmlFor="patenteScadenza">Scadenza Patente *</Label>
              <Input id="patenteScadenza" name="patenteScadenza" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cartaCQC">Carta CQC</Label>
              <Input id="cartaCQC" name="cartaCQC" placeholder="CQC1234567" />
            </div>
            <div>
              <Label htmlFor="cqcScadenza">Scadenza CQC</Label>
              <Input id="cqcScadenza" name="cqcScadenza" type="date" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tachigrafoScadenza">Scadenza Carta Conducente *</Label>
              <Input id="tachigrafoScadenza" name="tachigrafoScadenza" type="date" required />
            </div>
            <div>
              <Label htmlFor="telefono">Telefono</Label>
              <Input id="telefono" name="telefono" placeholder="+39 333 1234567" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onSkip}>
              <SkipForward className="h-4 w-4 mr-2" />
              Salta
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  Aggiungi Autista
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
