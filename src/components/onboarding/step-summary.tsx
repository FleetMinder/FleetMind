"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Rocket, Loader2, Building2, Users, Truck, Brain } from "lucide-react";
interface OnboardingData {
  companyCreated: boolean;
  companyName: string;
  driverCreated: boolean;
  driverName: string;
  vehicleCreated: boolean;
  vehiclePlate: string;
  apiKeySet: boolean;
}

interface Props {
  data: OnboardingData;
  onComplete: () => void;
}

export function StepSummary({ data, onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  const items = [
    {
      icon: Building2,
      label: "Azienda",
      done: data.companyCreated,
      detail: data.companyName,
    },
    {
      icon: Users,
      label: "Primo Autista",
      done: data.driverCreated,
      detail: data.driverName || "Non configurato",
    },
    {
      icon: Truck,
      label: "Primo Mezzo",
      done: data.vehicleCreated,
      detail: data.vehiclePlate || "Non configurato",
    },
    {
      icon: Brain,
      label: "API Key Anthropic",
      done: data.apiKeySet,
      detail: data.apiKeySet ? "Configurata" : "Non configurata",
    },
  ];

  const handleClick = async () => {
    setLoading(true);
    await onComplete();
  };

  return (
    <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Rocket className="h-6 w-6 text-blue-400" />
          Tutto pronto!
        </CardTitle>
        <CardDescription>
          Ecco un riepilogo della tua configurazione. Potrai sempre modificare tutto dalle Impostazioni.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Checklist */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                item.done
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-slate-700/50 bg-slate-800/20"
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-slate-500 flex-shrink-0" />
              )}
              <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        {(!data.driverCreated || !data.vehicleCreated || !data.apiKeySet) && (
          <div className="bg-slate-800/30 rounded-lg p-3 text-xs text-muted-foreground">
            Gli elementi non configurati potranno essere aggiunti in qualsiasi momento
            dalle rispettive sezioni dell&apos;applicazione.
          </div>
        )}

        <Button
          onClick={handleClick}
          className="w-full text-base py-6"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Preparazione...
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5 mr-2" />
              Vai alla Dashboard
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
