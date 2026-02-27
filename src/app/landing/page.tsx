"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Brain,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Truck,
  Route,
  Euro,
  Gauge,
  MapPin,
  Shield,
  FileText,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

/* ─── Animated counter ─── */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return { count, ref };
}

/* ─── Fade in on scroll ─── */
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 overflow-x-hidden">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-700 flex items-center justify-center">
              <Truck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">FleetMind</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-[13px] text-zinc-500 dark:text-zinc-500">
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Funzioni</a>
            <a href="#roi" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">ROI</a>
            <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Prezzi</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="text-zinc-500 dark:text-zinc-400" />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs h-8">
                Accedi
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-blue-700 hover:bg-blue-600 text-white text-xs h-8 px-4">
                Prova Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs mb-8">
              <Sparkles className="h-3 w-3 text-blue-400" />
              AI-powered logistics for Italy
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold tracking-tight leading-[1.05]">
              Dispatch intelligente
              <br />
              <span className="text-blue-400">per la logistica italiana</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-5 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Pianifica viaggi, gestisci compliance e proteggi i tuoi margini.
              Una piattaforma AI per il trasporto su gomma.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login">
                <Button size="lg" className="h-11 px-6 bg-blue-700 hover:bg-blue-600 text-white gap-2">
                  Inizia Gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="h-11 px-6 border-zinc-300 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                  Scopri le funzioni
                </Button>
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-600">
              Nessuna carta di credito &middot; Setup in 2 minuti &middot; 14 giorni gratis
            </p>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.25}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-10 sm:gap-16">
              <StatItem end={89} suffix="%" label="Tempo risparmiato" />
              <div className="hidden sm:block w-px h-8 bg-zinc-200 dark:bg-zinc-800" />
              <StatItem end={15} suffix="min" label="Setup iniziale" />
              <div className="hidden sm:block w-px h-8 bg-zinc-200 dark:bg-zinc-800" />
              <StatItem end={100} suffix="%" label="Compliance normativa" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="py-8 border-y border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-zinc-400 dark:text-zinc-600">
            {[
              { icon: Shield, label: "Reg. CE 561/2006" },
              { icon: FileText, label: "e-CMR" },
              { icon: Gauge, label: "Tachigrafo G2V2" },
              { icon: AlertTriangle, label: "ADR" },
              { icon: Euro, label: "Costi Minimi MIT" },
              { icon: MapPin, label: "Zone LEZ" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-3">La piattaforma</p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Tre moduli, un unico sistema
              </h2>
              <p className="mt-3 text-sm text-zinc-500 max-w-lg mx-auto">
                Ogni modulo risolve un problema critico. Insieme, trasformano il tuo ufficio.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {/* AI Dispatch — large */}
            <FadeIn className="md:col-span-4">
              <div className="h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-7 sm:p-9">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-blue-700/10 flex items-center justify-center mb-3">
                      <Brain className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-1.5">AI Dispatch</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                      Pianifica viaggi ottimali in secondi. L&apos;AI considera mezzi, autisti, ore guida, ADR, zone LEZ e finestre orarie.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
                  {["Multi-ordine", "Google Maps", "Costi carburante", "Reg. CE 561", "Zone LEZ", "ADR check"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/50 rounded-md px-2.5 py-1.5">
                      <CheckCircle2 className="h-3 w-3 text-blue-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Stats card */}
            <FadeIn delay={0.05} className="md:col-span-2">
              <div className="h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-7 flex flex-col justify-between">
                <div>
                  <Gauge className="h-5 w-5 text-zinc-400 dark:text-zinc-500 mb-3" />
                  <h4 className="text-sm font-semibold mb-0.5">Risultati reali</h4>
                  <p className="text-xs text-zinc-400 dark:text-zinc-600">Impatto medio</p>
                </div>
                <div className="space-y-3 mt-5">
                  <ProgressBar label="Tempo pianificazione" value={89} color="bg-blue-500" />
                  <ProgressBar label="Errori compliance" value={97} color="bg-emerald-500" />
                  <ProgressBar label="Costi km ottimizzati" value={12} color="bg-amber-500" />
                </div>
              </div>
            </FadeIn>

            {/* Compliance */}
            <FadeIn delay={0.08} className="md:col-span-3">
              <div className="h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-7">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1.5">Compliance Automatica</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                  Alert intelligenti prima che sia troppo tardi. Patenti, CQC, tachigrafo, ADR, revisioni, ore guida.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Patente/CQC", "Tachigrafo", "ADR", "Revisioni", "Ore guida", "Assicurazione"].map((f) => (
                    <span key={f} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Difesa Economica */}
            <FadeIn delay={0.11} className="md:col-span-3">
              <div className="h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-7">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                  <Euro className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold mb-1.5">Difesa Economica</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                  Calcola costi minimi MIT per ogni tratta. Sai subito se una tariffa GDO è sotto-costo.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Costi MIT", "Alert tariffe", "Report PDF", "4 classi peso"].map((f) => (
                    <span key={f} className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 sm:py-28 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Come funziona</p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Operativo in 3 step
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", icon: Truck, title: "Inserisci flotta", desc: "Aggiungi mezzi e autisti con le loro qualifiche." },
              { step: "2", icon: Route, title: "Carica ordini", desc: "Inserisci ordini con origini, destinazioni e vincoli." },
              { step: "3", icon: Brain, title: "L'AI pianifica", desc: "Piano ottimale in secondi. Approva o rigenera." },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {item.step}
                  </div>
                  <item.icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROI CALCULATOR ─── */}
      <section id="roi" className="py-20 sm:py-28 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-3">ROI Calculator</p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Calcola il tuo risparmio
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <ROICalculator />
          </FadeIn>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 sm:py-28 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-5">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-3">Pricing</p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Prezzi semplici, risultati concreti
              </h2>
              <p className="mt-3 text-sm text-zinc-500">Canone mensile fisso. Nessun costo per veicolo.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <FadeIn>
              <PricingCard nome="Starter" prezzo={49} desc="Fino a 10 mezzi" features={["10 veicoli", "AI Dispatch", "Compliance base", "Supporto email"]} />
            </FadeIn>
            <FadeIn delay={0.05}>
              <PricingCard nome="Professional" prezzo={149} desc="Fino a 30 mezzi" features={["30 veicoli", "AI Dispatch avanzato", "Compliance + MIT", "Google Maps routing", "Supporto prioritario"]} evidenziato />
            </FadeIn>
            <FadeIn delay={0.1}>
              <PricingCard nome="Business" prezzo={299} desc="Fino a 100 mezzi" features={["100 veicoli", "Tutto Professional +", "e-CMR digitale", "API integrazioni", "Account manager"]} />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 sm:py-28 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Pronto a iniziare?
            </h2>
            <p className="mt-3 text-sm text-zinc-500">
              Unisciti alle aziende che usano FleetMind. Setup in 2 minuti, gratis per 14 giorni.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <Button size="lg" className="h-11 px-8 bg-blue-700 hover:bg-blue-600 text-white gap-2">
                  Inizia Gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center">
                <Truck className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">FleetMind</span>
            </div>
            <div className="flex items-center gap-5 text-[11px] text-zinc-400 dark:text-zinc-600">
              <span>&copy; 2026 FleetMind</span>
              <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Termini</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*              SUB-COMPONENTS                 */
/* ═══════════════════════════════════════════ */

function StatItem({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(end);
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold tracking-tight">
        <span ref={ref}>{count}</span>
        <span className="text-blue-400">{suffix}</span>
      </div>
      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">{label}</p>
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">-{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-zinc-200 dark:bg-zinc-800">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function PricingCard({
  nome,
  prezzo,
  desc,
  features,
  evidenziato,
}: {
  nome: string;
  prezzo: number;
  desc: string;
  features: string[];
  evidenziato?: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl p-6 ${
        evidenziato
          ? "border border-amber-400/40 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/[0.04]"
          : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50"
      }`}
    >
      {evidenziato && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-[10px] font-semibold text-zinc-900">
          Consigliato
        </div>
      )}
      <h3 className="text-sm font-semibold">{nome}</h3>
      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">{desc}</p>
      <div className="mt-4 mb-5">
        <span className="text-3xl font-bold">&euro;{prezzo}</span>
        <span className="text-zinc-400 dark:text-zinc-600 text-xs ml-1">/mese</span>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/login" className="block">
        <Button
          className={`w-full h-9 text-xs ${
            evidenziato
              ? "bg-blue-700 hover:bg-blue-600 text-white"
              : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
          }`}
        >
          Inizia Gratis
        </Button>
      </Link>
    </div>
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

  const risparmioPianificazione = oreGiorno * 0.8 * 22 * 25;
  const risparmioKm = (numViaggi * kmMedio * 0.12 * 22 * 1.85) / (numMezzi > 0 ? 3.5 : 1);
  const risparmioMulte = numMezzi * 15;
  const risparmioTotale = risparmioPianificazione + risparmioKm + risparmioMulte;
  const costoFleetMind = numMezzi <= 10 ? 49 : numMezzi <= 30 ? 149 : 299;
  const roi = ((risparmioTotale - costoFleetMind) / costoFleetMind) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-5 sm:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-8">
          {[
            { id: "mezzi", label: "Numero mezzi", value: mezzi, set: setMezzi },
            { id: "viaggi", label: "Viaggi/giorno", value: viaggiGiorno, set: setViaggiGiorno },
            { id: "km", label: "Km medio/viaggio", value: kmMedioViaggio, set: setKmMedioViaggio },
            { id: "ore", label: "Ore pianif./giorno", value: orePianificazione, set: setOrePianificazione },
          ].map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id} className="text-[11px] text-zinc-500">{field.label}</Label>
              <Input
                id={field.id}
                type="number"
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <p className="text-[10px] text-zinc-500 mb-0.5">Risparmio tempo</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {risparmioPianificazione.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <p className="text-[10px] text-zinc-500 mb-0.5">Risparmio carburante</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {risparmioKm.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <p className="text-[10px] text-zinc-500 mb-0.5">Risparmio compliance</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {risparmioMulte.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50 p-5 text-center">
          <p className="text-xs text-zinc-500 mb-1">Risparmio mensile stimato</p>
          <p className="text-3xl font-bold">
            {risparmioTotale.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
          </p>
          <div className="mt-2 flex items-center justify-center gap-3 text-xs">
            <span className="text-zinc-400 dark:text-zinc-600">Costo: &euro;{costoFleetMind}/mese</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
              ROI: {roi.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
