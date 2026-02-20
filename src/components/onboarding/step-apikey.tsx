"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2, ArrowRight, SkipForward, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export function StepApiKey({ onComplete, onSkip }: Props) {
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);

    try {
      const res = await fetch("/api/onboarding/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (!res.ok) throw new Error();
      toast.success("API Key configurata con successo");
      onComplete();
    } catch {
      toast.error("Errore nel salvataggio della API Key");
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Brain className="h-6 w-6 text-blue-400" />
          Configura AI Dispatch
        </CardTitle>
        <CardDescription>
          FleetMind usa Claude di Anthropic per pianificare automaticamente i viaggi.
          Per usare questa funzione, hai bisogno di una API Key.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info box */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-3 text-sm">
            <p className="font-medium text-blue-400">Come funziona AI Dispatch?</p>
            <ul className="space-y-1.5 text-muted-foreground text-xs">
              <li>1. Crei ordini di trasporto con mittente, destinatario e merce</li>
              <li>2. Clicchi &quot;Pianifica con AI&quot; nella sezione Dispatch</li>
              <li>3. L&apos;AI analizza ordini, autisti e mezzi disponibili</li>
              <li>4. Propone viaggi ottimizzati considerando normative EU, capacita e percorsi</li>
              <li>5. Tu approvi o modifichi il piano</li>
            </ul>
          </div>

          <div>
            <Label htmlFor="apiKey" className="flex items-center gap-2">
              Anthropic API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="mt-1"
            />
            <div className="mt-2 flex items-center gap-1">
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                Ottieni una chiave su console.anthropic.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onSkip}>
              <SkipForward className="h-4 w-4 mr-2" />
              Configuro dopo
            </Button>
            <Button type="submit" className="flex-1" disabled={saving || !apiKey.trim()}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  Salva API Key
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
