"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <div className="space-y-8">
      {/* Icon */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30">
          <Mail className="h-8 w-8 text-green-400" />
        </div>
      </div>

      {/* Card */}
      <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              Controlla la tua email
            </h2>
            <p className="text-sm text-muted-foreground">
              Abbiamo inviato un link di accesso a
            </p>
            {email && (
              <p className="text-sm font-medium text-blue-400">{email}</p>
            )}
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
            <p>Clicca il link nell&apos;email per accedere a FleetMind.</p>
            <p>Il link scade tra 24 ore. Controlla anche la cartella spam.</p>
          </div>

          <Link href="/login">
            <Button variant="ghost" size="sm" className="mt-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="text-center text-muted-foreground">Caricamento...</div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
