"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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
    const body = {
      nome: form.get("nome"),
      indirizzo: form.get("indirizzo"),
      citta: form.get("citta"),
      cap: form.get("cap"),
      piva: form.get("piva"),
      telefono: form.get("telefono") || null,
      email: form.get("emailAzienda") || null,
      userNome: form.get("userNome"),
      userCognome: form.get("userCognome"),
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

      // Aggiorna sessione con companyId e nome
      await update({
        companyId: data.companyId,
        nome: body.userNome,
        cognome: body.userCognome,
      });

      toast.success("Azienda configurata con successo");
      onComplete(body.nome as string);
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
          Dati Azienda
        </CardTitle>
        <CardDescription>
          Inserisci i dati della tua azienda di trasporti. Questi dati saranno usati per documenti e comunicazioni.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome e Cognome utente */}
          <div className="bg-slate-800/30 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Il tuo profilo</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="userNome">Nome</Label>
                <Input id="userNome" name="userNome" required placeholder="Mario" />
              </div>
              <div>
                <Label htmlFor="userCognome">Cognome</Label>
                <Input id="userCognome" name="userCognome" required placeholder="Rossi" />
              </div>
            </div>
          </div>

          {/* Dati azienda */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nome">Ragione Sociale *</Label>
                <Input id="nome" name="nome" required placeholder="Trasporti Rossi Srl" />
              </div>
              <div>
                <Label htmlFor="piva">Partita IVA *</Label>
                <Input id="piva" name="piva" required placeholder="IT12345678901" />
              </div>
            </div>

            <div>
              <Label htmlFor="indirizzo">Indirizzo *</Label>
              <Input id="indirizzo" name="indirizzo" required placeholder="Via Roma 1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="citta">Citta *</Label>
                <Input id="citta" name="citta" required placeholder="Milano" />
              </div>
              <div>
                <Label htmlFor="cap">CAP *</Label>
                <Input id="cap" name="cap" required placeholder="20100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" name="telefono" placeholder="+39 02 1234567" />
              </div>
              <div>
                <Label htmlFor="emailAzienda">Email Aziendale</Label>
                <Input id="emailAzienda" name="emailAzienda" type="email" placeholder="info@azienda.it" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {onSkip && (
              <Button type="button" variant="ghost" onClick={onSkip} disabled={saving} className="flex-1">
                Salta
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
                  Continua
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
