"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Loader2, ArrowRight, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onComplete: (plate: string) => void;
  onSkip: () => void;
}

export function StepVehicle({ onComplete, onSkip }: Props) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      targa: form.get("targa"),
      tipo: form.get("tipo"),
      marca: form.get("marca"),
      modello: form.get("modello"),
      anno: parseInt(form.get("anno") as string),
      capacitaPesoKg: parseFloat(form.get("capacitaPesoKg") as string),
      capacitaVolumeM3: parseFloat(form.get("capacitaVolumeM3") as string),
      consumoKmL: form.get("consumoKmL") ? parseFloat(form.get("consumoKmL") as string) : null,
      prossimaRevisione: form.get("prossimaRevisione") || null,
    };

    try {
      const res = await fetch("/api/onboarding/vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      toast.success("Mezzo aggiunto con successo");
      onComplete(body.targa as string);
    } catch {
      toast.error("Errore nell'aggiunta del mezzo");
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Truck className="h-6 w-6 text-blue-400" />
          Primo Mezzo
        </CardTitle>
        <CardDescription>
          Registra il tuo primo veicolo. Potrai aggiungerne altri in seguito dalla sezione Mezzi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="targa">Targa *</Label>
              <Input id="targa" name="targa" required placeholder="AA000BB" />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo Veicolo *</Label>
              <select
                name="tipo"
                id="tipo"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="furgone">Furgone</option>
                <option value="camion">Camion</option>
                <option value="furgone_frigo">Furgone Frigo</option>
                <option value="cisterna">Cisterna</option>
                <option value="pianale">Pianale</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="marca">Marca *</Label>
              <Input id="marca" name="marca" required placeholder="Iveco" />
            </div>
            <div>
              <Label htmlFor="modello">Modello *</Label>
              <Input id="modello" name="modello" required placeholder="Daily 35" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="anno">Anno *</Label>
              <Input id="anno" name="anno" type="number" required defaultValue={2024} />
            </div>
            <div>
              <Label htmlFor="capacitaPesoKg">Peso max (kg) *</Label>
              <Input id="capacitaPesoKg" name="capacitaPesoKg" type="number" required placeholder="3500" />
            </div>
            <div>
              <Label htmlFor="capacitaVolumeM3">Volume max (m3) *</Label>
              <Input id="capacitaVolumeM3" name="capacitaVolumeM3" type="number" required placeholder="20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="consumoKmL">Consumo (km/L)</Label>
              <Input id="consumoKmL" name="consumoKmL" type="number" step="0.1" placeholder="8.5" />
            </div>
            <div>
              <Label htmlFor="prossimaRevisione">Prossima Revisione</Label>
              <Input id="prossimaRevisione" name="prossimaRevisione" type="date" />
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
                  Aggiungi Mezzo
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
