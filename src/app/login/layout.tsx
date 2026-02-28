import { Brain, CheckCircle2, Truck, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  "AI Dispatch agentico — assegna autisti e mezzi in secondi",
  "Compliance automatica — scadenze patenti, LEZ, MIT tariffe",
  "Google Maps routing con stime reali di distanza e tempo",
  "Gestione ordini, autisti e mezzi in un'unica piattaforma",
];

const stats = [
  { value: "14", label: "giorni gratis" },
  { value: "0", label: "carta di credito" },
  { value: "2 min", label: "per il setup" },
];

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ─── Left panel — value proposition (desktop only) ─── */}
      <div className="hidden lg:flex w-[480px] xl:w-[540px] flex-shrink-0 flex-col bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">FleetMind</span>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest">
                AI Dispatch Platform
              </p>
            </div>
          </div>

          {/* Main value prop */}
          <div className="py-10">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-medium text-blue-100 mb-5">
              <Zap className="h-3 w-3" />
              14 giorni gratuiti — nessuna carta di credito
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
              Il cervello della{" "}
              <span className="text-blue-200">tua flotta</span>
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
              FleetMind usa l&apos;AI per pianificare assegnazioni, monitorare
              scadenze normative e ottimizzare i costi di trasporto.
              Automaticamente.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3 mb-10">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-blue-100">
                <CheckCircle2 className="h-4 w-4 text-blue-300 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[11px] text-blue-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-6 text-[11px] text-blue-300/70 text-center">
            Dopo il trial puoi scegliere un piano o annullare — senza vincoli.
          </p>
        </div>
      </div>

      {/* ─── Right panel — form ─── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        {/* Top bar mobile */}
        <div className="flex items-center justify-between px-6 py-4 lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-md bg-blue-700 flex items-center justify-center">
              <Truck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">FleetMind</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        {/* Trial reminder mobile */}
        <div className="lg:hidden px-6 pb-6 text-center">
          <p className="text-xs text-muted-foreground">
            14 giorni gratuiti · nessuna carta di credito · setup in 2 minuti
          </p>
        </div>
      </div>
    </div>
  );
}
