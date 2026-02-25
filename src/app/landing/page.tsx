"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Brain,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Zap,
  FileText,
  AlertTriangle,
  Truck,
  Route,
  Euro,
  Timer,
  Gauge,
  MapPin,
  Shield,
  Sparkles,
  Play,
} from "lucide-react";

/* ─── Animated counter hook ─── */
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
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const dirMap = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };
  return (
    <motion.div
      initial={{ opacity: 0, ...dirMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
/*                 MAIN PAGE                   */
/* ═══════════════════════════════════════════ */
export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 blur-sm opacity-60" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Truck className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight">FleetMind</span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Funzioni</a>
            <a href="#roi" className="hover:text-white transition-colors">ROI</a>
            <a href="#pricing" className="hover:text-white transition-colors">Prezzi</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                Accedi
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 text-white shadow-lg shadow-blue-500/20">
                Prova Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden"
      >
        {/* Mesh gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 w-[500px] h-[300px] rounded-full bg-violet-600/10 blur-[100px]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          {/* Badge */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-sm mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by AI &middot; Made for Italian Logistics
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
              Il futuro della
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                logistica italiana
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              AI dispatch, compliance automatica e difesa economica.{" "}
              <span className="text-zinc-200">Una piattaforma, zero pensieri.</span>
            </p>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 text-white shadow-xl shadow-blue-500/25 gap-2">
                  Inizia Gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 text-zinc-200 gap-2">
                  <Play className="h-4 w-4" />
                  Guarda la Demo
                </Button>
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="mt-5 text-sm text-zinc-500">
              Nessuna carta di credito &middot; Setup in 2 minuti &middot; 14 giorni gratis
            </p>
          </FadeIn>

          {/* Stats bar */}
          <FadeIn delay={0.5}>
            <div className="mt-16 sm:mt-20 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
              <StatItem end={89} suffix="%" label="Tempo risparmiato" />
              <div className="hidden sm:block w-px h-10 bg-zinc-800" />
              <StatItem end={15} suffix="min" label="Setup iniziale" />
              <div className="hidden sm:block w-px h-10 bg-zinc-800" />
              <StatItem end={100} suffix="%" label="Compliance normativa" />
            </div>
          </FadeIn>
        </div>
      </motion.section>

      {/* ─── LOGOS / TRUST ─── */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-zinc-600 mb-8">
            Costruito per le normative italiane ed europee
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-zinc-600">
            {[
              { icon: Shield, label: "Reg. CE 561/2006" },
              { icon: FileText, label: "e-CMR" },
              { icon: Gauge, label: "Tachigrafo G2V2" },
              { icon: AlertTriangle, label: "ADR" },
              { icon: Euro, label: "Costi Minimi MIT" },
              { icon: MapPin, label: "Zone LEZ" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-red-400 uppercase tracking-wider">Il problema</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
                Ogni giorno, nel tuo ufficio
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                color: "red",
                title: "Rischi multe e fermi",
                desc: "Tachigrafo, CQC, ADR, revisioni... gestire le scadenze a mano significa rischiare sanzioni fino a 6.000 euro.",
                stat: "6.000",
                statLabel: "EUR di sanzione media",
              },
              {
                icon: Clock,
                color: "amber",
                title: "Perdi 2+ ore al giorno",
                desc: "Pianificare viaggi su Excel, controllare compatibilità mezzi-autisti, verificare ore di guida.",
                stat: "40+",
                statLabel: "ore/mese sprecate",
              },
              {
                icon: TrendingUp,
                color: "orange",
                title: "Tariffe sotto-costo",
                desc: "La GDO impone tariffe fino al 40% sotto i costi minimi MIT. Senza strumenti non puoi difenderti.",
                stat: "-40%",
                statLabel: "sotto costi minimi",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className={`group relative rounded-2xl border border-${item.color}-500/10 bg-${item.color}-500/[0.03] p-6 sm:p-8 hover:border-${item.color}-500/20 transition-all duration-300`}>
                  <item.icon className={`h-6 w-6 text-${item.color}-400 mb-4`} />
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">{item.desc}</p>
                  <div className="pt-4 border-t border-white/5">
                    <span className={`text-2xl font-bold text-${item.color}-400`}>{item.stat}</span>
                    <span className="text-xs text-zinc-500 ml-2">{item.statLabel}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENTO FEATURES ─── */}
      <section id="features" className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">La soluzione</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
                Tre moduli, un unico sistema
              </h2>
              <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
                Ogni modulo risolve un problema critico. Insieme, trasformano il tuo ufficio logistico.
              </p>
            </div>
          </FadeIn>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* AI Dispatch - large card */}
            <FadeIn className="md:col-span-4">
              <div className="relative group h-full rounded-2xl border border-blue-500/10 bg-gradient-to-br from-blue-500/[0.07] to-transparent p-8 sm:p-10 hover:border-blue-500/20 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                      <Brain className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">AI Dispatch</h3>
                    <p className="text-zinc-400 max-w-md leading-relaxed">
                      Pianifica viaggi ottimali in secondi. L&apos;AI considera mezzi, autisti, ore guida, ADR, zone LEZ e finestre orarie.
                    </p>
                  </div>
                  <Zap className="h-5 w-5 text-blue-500/30 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                  {["Multi-ordine", "Google Maps", "Costi carburante", "Reg. CE 561", "Zone LEZ", "ADR check"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-zinc-300 bg-white/[0.03] rounded-lg px-3 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Stats card */}
            <FadeIn delay={0.1} className="md:col-span-2">
              <div className="h-full rounded-2xl border border-white/5 bg-white/[0.02] p-8 flex flex-col justify-between">
                <div>
                  <Gauge className="h-6 w-6 text-cyan-400 mb-4" />
                  <h4 className="text-lg font-semibold mb-1">Risultati reali</h4>
                  <p className="text-sm text-zinc-500">Impatto medio sulle aziende</p>
                </div>
                <div className="space-y-4 mt-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Tempo pianificazione</span>
                      <span className="text-cyan-400 font-semibold">-89%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: "89%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Errori compliance</span>
                      <span className="text-emerald-400 font-semibold">-97%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: "97%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Costi km ottimizzati</span>
                      <span className="text-violet-400 font-semibold">-12%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: "12%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.9 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Compliance - medium card */}
            <FadeIn delay={0.15} className="md:col-span-3">
              <div className="relative group h-full rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.05] to-transparent p-8 hover:border-emerald-500/20 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Compliance Automatica</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Alert intelligenti prima che sia troppo tardi. Patenti, CQC, tachigrafo, ADR, revisioni, assicurazioni, ore guida.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Patente/CQC", "Tachigrafo", "ADR", "Revisioni", "Ore guida", "Assicurazione"].map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Difesa Economica - medium card */}
            <FadeIn delay={0.2} className="md:col-span-3">
              <div className="relative group h-full rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-500/[0.05] to-transparent p-8 hover:border-violet-500/20 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                  <Euro className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Difesa Economica</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Calcola costi minimi MIT per ogni tratta. Sai subito se una tariffa è sotto-costo. Report per negoziazioni.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Costi MIT", "Alert tariffe", "Report PDF", "4 classi peso", "Aggiornamento trimestrale"].map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/10">
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
      <section id="demo" className="py-24 sm:py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Come funziona</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
                Da zero a operativo in 3 step
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: Truck,
                title: "Inserisci flotta",
                desc: "Aggiungi mezzi e autisti con le loro qualifiche. L'AI capisce le compatibilità.",
              },
              {
                step: "02",
                icon: Route,
                title: "Carica ordini",
                desc: "Inserisci gli ordini di trasporto con origini, destinazioni e vincoli temporali.",
              },
              {
                step: "03",
                icon: Brain,
                title: "L'AI pianifica",
                desc: "In pochi secondi ricevi il piano ottimale. Approva, modifica o rigenera.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="relative text-center">
                  <div className="text-6xl font-black text-white/[0.03] absolute -top-4 left-1/2 -translate-x-1/2">
                    {item.step}
                  </div>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/5 flex items-center justify-center mx-auto mb-5">
                      <item.icon className="h-7 w-7 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NORMATIVE 2026 ─── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-red-600/5 blur-[150px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-red-400 uppercase tracking-wider">Scadenze critiche</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
                Normative 2026: sei pronto?
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                FleetMind ti tiene in regola automaticamente.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { data: "LUG 2026", titolo: "Tachigrafo G2V2", desc: "Obbligatorio per veicoli >2,5t internazionali", icon: Timer, urgent: true },
              { data: "OTT 2026", titolo: "Ban Euro 5 Diesel", desc: "Nord Italia, comuni >100.000 abitanti", icon: AlertTriangle, urgent: true },
              { data: "2026", titolo: "ADR Rivisitato", desc: "3 livelli di rischio, fermo immediato", icon: Shield, urgent: false },
              { data: "In vigore", titolo: "90 min max C/S", desc: "Tempi carico/scarico con indennizzo", icon: Clock, urgent: false },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className={`group rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] ${
                  item.urgent
                    ? "border-red-500/20 bg-red-500/[0.03] hover:border-red-500/30"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <item.icon className={`h-5 w-5 ${item.urgent ? "text-red-400" : "text-zinc-500"}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.urgent
                        ? "bg-red-500/10 text-red-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {item.data}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1">{item.titolo}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROI CALCULATOR ─── */}
      <section id="roi" className="py-24 sm:py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">ROI Calculator</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
                Calcola il tuo risparmio
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Inserisci i dati della tua flotta e scopri quanto puoi risparmiare.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <ROICalculator />
          </FadeIn>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 sm:py-32 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full bg-blue-600/5 blur-[150px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Pricing</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
                Prezzi semplici, risultati concreti
              </h2>
              <p className="mt-4 text-lg text-zinc-400">Canone fisso mensile. Nessun costo per veicolo.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FadeIn delay={0}>
              <PricingCard
                nome="Starter"
                prezzo={49}
                descrizione="Per flotte fino a 10 mezzi"
                features={["Fino a 10 veicoli", "AI Dispatch", "Compliance base", "Supporto email"]}
              />
            </FadeIn>
            <FadeIn delay={0.1}>
              <PricingCard
                nome="Professional"
                prezzo={149}
                descrizione="Per flotte fino a 30 mezzi"
                features={["Fino a 30 veicoli", "AI Dispatch avanzato", "Compliance + costi minimi MIT", "Google Maps routing", "Supporto prioritario"]}
                evidenziato
              />
            </FadeIn>
            <FadeIn delay={0.2}>
              <PricingCard
                nome="Business"
                prezzo={299}
                descrizione="Per flotte fino a 100 mezzi"
                features={["Fino a 100 veicoli", "Tutto Professional +", "e-CMR digitale", "API integrazioni", "Account manager dedicato"]}
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/10 blur-[150px]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Pronto a trasformare
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                il tuo ufficio logistico?
              </span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 text-lg text-zinc-400">
              Unisciti alle aziende che hanno scelto FleetMind.
              Inizia gratis, senza impegno.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-10 text-base bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 text-white shadow-2xl shadow-blue-500/30 gap-2">
                  Inizia Gratis per 14 Giorni
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Truck className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">FleetMind</span>
              <span className="text-xs text-zinc-600">AI Dispatch Planner</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-zinc-600">
              <span>&copy; 2026 FleetMind</span>
              <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Termini</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Contatti</a>
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
      <div className="text-3xl sm:text-4xl font-bold">
        <span ref={ref}>{count}</span>
        <span className="text-blue-400">{suffix}</span>
      </div>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
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
    <div
      className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${
        evidenziato
          ? "border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-transparent shadow-xl shadow-blue-500/10"
          : "border border-white/5 bg-white/[0.02]"
      }`}
    >
      {evidenziato && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-xs font-bold text-white">
          Consigliato
        </div>
      )}
      <h3 className="text-lg font-semibold">{nome}</h3>
      <p className="text-xs text-zinc-500 mt-1">{descrizione}</p>
      <div className="mt-6 mb-8">
        <span className="text-5xl font-bold">&euro;{prezzo}</span>
        <span className="text-zinc-500 ml-1">/mese</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-300">
            <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/login" className="block">
        <Button
          className={`w-full h-11 ${
            evidenziato
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 text-white shadow-lg shadow-blue-500/20"
              : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
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
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-10">
        {/* Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {[
            { id: "mezzi", label: "Numero mezzi", value: mezzi, set: setMezzi },
            { id: "viaggi", label: "Viaggi / giorno", value: viaggiGiorno, set: setViaggiGiorno },
            { id: "km", label: "Km medio / viaggio", value: kmMedioViaggio, set: setKmMedioViaggio },
            { id: "ore", label: "Ore pianif. / giorno", value: orePianificazione, set: setOrePianificazione },
          ].map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id} className="text-xs text-zinc-500">
                {field.label}
              </Label>
              <Input
                id={field.id}
                type="number"
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
              />
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 p-5 text-center">
            <p className="text-xs text-zinc-500 mb-1">Risparmio tempo</p>
            <p className="text-2xl font-bold text-emerald-400">
              {risparmioPianificazione.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-zinc-600">/mese</p>
          </div>
          <div className="rounded-xl bg-blue-500/[0.05] border border-blue-500/10 p-5 text-center">
            <p className="text-xs text-zinc-500 mb-1">Risparmio carburante</p>
            <p className="text-2xl font-bold text-blue-400">
              {risparmioKm.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-zinc-600">/mese</p>
          </div>
          <div className="rounded-xl bg-violet-500/[0.05] border border-violet-500/10 p-5 text-center">
            <p className="text-xs text-zinc-500 mb-1">Risparmio compliance</p>
            <p className="text-2xl font-bold text-violet-400">
              {risparmioMulte.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-zinc-600">/mese</p>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 border border-blue-500/10 p-8 text-center">
          <p className="text-sm text-zinc-400 mb-2">Risparmio mensile stimato</p>
          <p className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            {risparmioTotale.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <span className="text-zinc-500">
              Costo: &euro;{costoFleetMind}/mese
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
              ROI: {roi.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
