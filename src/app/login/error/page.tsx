"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "Errore di configurazione del server. Contatta il supporto.",
  AccessDenied: "Accesso negato. Non hai i permessi per accedere.",
  Verification: "Il link di verifica non è valido o è scaduto. Richiedi un nuovo link.",
  Default: "Si è verificato un errore durante l'autenticazione.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="space-y-8">
      {/* Icon */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
      </div>

      {/* Card */}
      <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Errore di accesso</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          <Link href="/login">
            <Button className="mt-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="text-center text-muted-foreground">Caricamento...</div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
