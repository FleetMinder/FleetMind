"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Brain,
  ShieldCheck,
  TrendingUp,
  Clock,
  Calculator,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Zap,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FleetMind</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Accedi</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Prova Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-6">
            <Zap className="h-3.5 w-3.5" />
            Pianificazione AI per l&apos;autotrasporto italiano
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Il co-pilota digitale
            <br />
            <span className="text-primary">del tuo ufficio logistico</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            FleetMind combina AI, compliance normativa e difesa economica in un&apos;unica piattaforma.
            Pianifica i viaggi in secondi, resta in regola senza sforzo, proteggi i tuoi margini.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Inizia Gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#roi">
              <Button variant="outline" size="lg" className="gap-2">
                <Calculator className="h-4 w-4" />
                Calcola il tuo ROI
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Nessuna carta di credito richiesta. Prova gratuita 14 giorni.
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Ogni giorno nel tuo ufficio...</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="pt-6">
                <AlertTriangle className="h-8 w-8 text-red-400 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Rischi multe e fermi</h3>
                <p className="text-sm text-muted-foreground">
                  Tachigrafo, CQC, ADR, revisioni... gestire le scadenze a mano significa rischiare
                  sanzioni fino a 6.000 euro e il fermo del mezzo.
                </p>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-yellow-400 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Perdi 2+ ore al giorno</h3>
                <p className="text-sm text-muted-foreground">
                  Pianificare i viaggi su Excel, controllare compatibilità mezzi-autisti,
                  verificare ore di guida... tempo che potresti dedicare a far crescere l&apos;azienda.
                </p>
              </CardContent>
            </Card>
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 text-orange-400 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Accetti tariffe sotto-costo</h3>
                <p className="text-sm text-muted-foreground">
                  Secondo Assotir, la GDO impone tariffe fino al 40% sotto i costi minimi MIT.
                  Senza strumenti, non puoi difendere i tuoi margini.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 border-t border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">FleetMind risolve tutto questo</h2>
            <p className="text-muted-foreground mt-2">Tre moduli integrati in un&apos;unica piattaforma</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Dispatch</h3>
              <p className="text-sm text-muted-foreground">
                L&apos;intelligenza artificiale pianifica i viaggi ottimali in secondi,
                rispettando compatibilità mezzi, ore di guida, finestre orarie e normativa ADR.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Pianificazione automatica multi-ordine
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Routing reale con Google Maps
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Stima costi carburante e pedaggi
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Compliance Automatica</h3>
              <p className="text-sm text-muted-foreground">
                Monitora tutte le scadenze normative in tempo reale.
                Alert automatici prima che sia troppo tardi.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Scadenze patente, CQC, tachigrafo, ADR
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Revisioni, assicurazioni, bollo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Ore guida Reg. CE 561/2006
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Difesa Economica</h3>
              <p className="text-sm text-muted-foreground">
                Calcola automaticamente i costi minimi MIT per ogni tratta.
                Sai subito se una tariffa è sotto-costo.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Tabelle MIT aggiornate trimestralmente
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Alert tariffa sotto costi minimi
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Report per negoziazioni e contestazioni
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi" className="py-16 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Calcola quanto puoi risparmiare</h2>
            <p className="text-muted-foreground mt-2">
              Inserisci i dati della tua flotta per una stima personalizzata
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* Normative 2026 */}
      <section className="py-16 border-t border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Normative 2026: sei pronto?</h2>
            <p className="text-muted-foreground mt-2">
              Nuovi obblighi in arrivo. FleetMind ti tiene in regola automaticamente.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { data: "1 Luglio 2026", titolo: "Tachigrafo G2V2 obbligatorio", desc: "Per veicoli >2,5t in trasporto internazionale" },
              { data: "Ottobre 2026", titolo: "Divieto Euro 5 Diesel", desc: "Nord Italia, comuni >100.000 abitanti" },
              { data: "2026", titolo: "ADR: nuova classificazione", desc: "Tre livelli di rischio, fermo immediato nei casi gravi" },
              { data: "In vigore", titolo: "Tempi carico/scarico: 90 min max", desc: "Indennizzo min. 100 EUR al vettore" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-background">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.titolo}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.data}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Prezzi semplici, senza sorprese</h2>
            <p className="text-muted-foreground mt-2">Canone fisso mensile. Nessun costo per veicolo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <PricingCard
              nome="Starter"
              prezzo={49}
              descrizione="Per flotte fino a 10 mezzi"
              features={[
                "Fino a 10 veicoli",
                "AI Dispatch",
                "Compliance base",
                "Supporto email",
              ]}
            />
            <PricingCard
              nome="Professional"
              prezzo={149}
              descrizione="Per flotte fino a 30 mezzi"
              features={[
                "Fino a 30 veicoli",
                "AI Dispatch avanzato",
                "Compliance completa + costi minimi",
                "Google Maps routing",
                "Supporto prioritario",
              ]}
              evidenziato
            />
            <PricingCard
              nome="Business"
              prezzo={299}
              descrizione="Per flotte fino a 100 mezzi"
              features={[
                "Fino a 100 veicoli",
                "Tutto Professional +",
                "e-CMR digitale",
                "API integrazioni",
                "Account manager dedicato",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Inizia a risparmiare tempo e denaro oggi
          </h2>
          <p className="text-muted-foreground mt-3">
            Prova FleetMind gratis per 14 giorni. Nessun impegno, nessuna carta di credito.
          </p>
          <Link href="/login">
            <Button size="lg" className="mt-6 gap-2">
              Prova Gratis per 14 Giorni
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">FleetMind</span>
              <span className="text-xs text-muted-foreground">AI Dispatch Planner</span>
            </div>
            <p className="text-xs text-muted-foreground">
              2026 FleetMind. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  nome,
  prezzo,
  descrizione,
  features,
  evidenziato,
}: {
  nome: string;
  prezzo: number;
  descrizione: string;
  features: string[];
  evidenziato?: boolean;
}) {
  return (
    <Card className={`relative ${evidenziato ? "border-primary shadow-lg shadow-primary/10" : ""}`}>
      {evidenziato && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          Consigliato
        </div>
      )}
      <CardContent className="pt-8 pb-6">
        <h3 className="text-lg font-semibold">{nome}</h3>
        <p className="text-xs text-muted-foreground">{descrizione}</p>
        <div className="mt-4 mb-6">
          <span className="text-4xl font-bold">{prezzo}</span>
          <span className="text-muted-foreground">/mese</span>
        </div>
        <ul className="space-y-2 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link href="/login">
          <Button className="w-full" variant={evidenziato ? "default" : "outline"}>
            Inizia Gratis
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function ROICalculator() {
  const [mezzi, setMezzi] = useState("10");
  const [viaggiGiorno, setViaggiGiorno] = useState("5");
  const [kmMedioViaggio, setKmMedioViaggio] = useState("200");
  const [orePianificazione, setOrePianificazione] = useState("2");

  const numMezzi = parseInt(mezzi) || 10;
  const numViaggi = parseInt(viaggiGiorno) || 5;
  const kmMedio = parseInt(kmMedioViaggio) || 200;
  const oreGiorno = parseFloat(orePianificazione) || 2;

  // Calcoli ROI
  const risparmioPianificazione = oreGiorno * 0.8 * 22 * 25; // 80% tempo risparmiato, 22 gg/mese, 25 EUR/h
  const risparmioKm = numViaggi * kmMedio * 0.12 * 22 * 1.85 / (numMezzi > 0 ? 3.5 : 1); // 12% km risparmiati
  const risparmioMulte = numMezzi * 15; // stima risparmio medio per compliance automatica
  const risparmioTotale = risparmioPianificazione + risparmioKm + risparmioMulte;

  // Costo FleetMind stimato
  const costoFleetMind = numMezzi <= 10 ? 49 : numMezzi <= 30 ? 149 : 299;
  const roi = ((risparmioTotale - costoFleetMind) / costoFleetMind) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div>
              <Label htmlFor="mezzi" className="text-xs">Numero mezzi</Label>
              <Input
                id="mezzi"
                type="number"
                value={mezzi}
                onChange={(e) => setMezzi(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="viaggi" className="text-xs">Viaggi / giorno</Label>
              <Input
                id="viaggi"
                type="number"
                value={viaggiGiorno}
                onChange={(e) => setViaggiGiorno(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="km" className="text-xs">Km medio / viaggio</Label>
              <Input
                id="km"
                type="number"
                value={kmMedioViaggio}
                onChange={(e) => setKmMedioViaggio(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ore" className="text-xs">Ore pianificazione / giorno</Label>
              <Input
                id="ore"
                type="number"
                step="0.5"
                value={orePianificazione}
                onChange={(e) => setOrePianificazione(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
              <p className="text-xs text-muted-foreground">Risparmio tempo</p>
              <p className="text-2xl font-bold text-green-400">
                {risparmioPianificazione.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">/mese</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-center">
              <p className="text-xs text-muted-foreground">Risparmio carburante</p>
              <p className="text-2xl font-bold text-blue-400">
                {risparmioKm.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">/mese</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 text-center">
              <p className="text-xs text-muted-foreground">Risparmio compliance</p>
              <p className="text-2xl font-bold text-purple-400">
                {risparmioMulte.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">/mese</p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground">Risparmio mensile stimato</p>
            <p className="text-4xl font-bold text-primary mt-1">
              {risparmioTotale.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Costo FleetMind: {costoFleetMind}/mese — <span className="font-semibold text-green-400">ROI: {roi.toFixed(0)}%</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
