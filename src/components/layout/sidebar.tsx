"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Brain,
  Users,
  Truck,
  Handshake,
  Settings,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Route,
  Zap,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Ordini", href: "/orders", icon: Package },
  { name: "AI Dispatch", href: "/dispatch", icon: Brain },
  { name: "Viaggi", href: "/trips", icon: Route },
  { name: "Compliance", href: "/compliance", icon: ShieldCheck },
  { name: "Autisti", href: "/drivers", icon: Users },
  { name: "Mezzi", href: "/vehicles", icon: Truck },
  { name: "Partner", href: "/partners", icon: Handshake },
  { name: "Impostazioni", href: "/settings", icon: Settings },
];

interface Props {
  isDemoUser?: boolean;
  trialDaysLeft?: number | null;
}

export function Sidebar({ isDemoUser = false, trialDaysLeft = null }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const userName =
    session?.user?.nome && session?.user?.cognome
      ? `${session.user.nome} ${session.user.cognome}`
      : session?.user?.email || "Utente";

  const initials =
    session?.user?.nome && session?.user?.cognome
      ? `${session.user.nome[0]}${session.user.cognome[0]}`.toUpperCase()
      : session?.user?.email?.[0]?.toUpperCase() || "U";

  // Trial countdown styling
  const trialUrgency =
    trialDaysLeft !== null
      ? trialDaysLeft <= 3
        ? "red"
        : trialDaysLeft <= 7
        ? "amber"
        : "emerald"
      : null;

  const urgencyClasses = {
    red: {
      bg: "bg-red-500/10 border-red-500/20",
      text: "text-red-500",
      bar: "bg-red-500",
      label: "Trial in scadenza!",
    },
    amber: {
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-500",
      bar: "bg-amber-500",
      label: "Trial in scadenza",
    },
    emerald: {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-500",
      bar: "bg-emerald-500",
      label: "Trial gratuito",
    },
  };

  const uc = trialUrgency ? urgencyClasses[trialUrgency] : null;
  const trialPercent =
    trialDaysLeft !== null ? Math.max(5, (trialDaysLeft / 14) * 100) : 0;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
          <Brain className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">FleetMind</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Il cervello della tua flotta
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
              {item.name === "AI Dispatch" && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-semibold">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Trial / Demo widget ── */}
      <div className="px-3 pb-2">
        {/* Demo badge */}
        {isDemoUser && (
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 mb-2">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-blue-400">
                Accesso Demo
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
              Stai esplorando la demo. Registrati per iniziare con la tua flotta.
            </p>
            <Link href="/login">
              <Button
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                Inizia Gratis
                <ArrowRight className="h-3 w-3 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Trial countdown */}
        {!isDemoUser && trialDaysLeft !== null && uc && (
          <div className={`rounded-lg border p-3 mb-2 ${uc.bg}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Clock className={`h-3.5 w-3.5 flex-shrink-0 ${uc.text}`} />
                <span className={`text-xs font-semibold ${uc.text}`}>
                  {uc.label}
                </span>
              </div>
              <span className={`text-xs font-bold tabular-nums ${uc.text}`}>
                {trialDaysLeft} {trialDaysLeft === 1 ? "giorno" : "giorni"}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-background/60 rounded-full h-1.5 mb-2.5 mt-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${uc.bar}`}
                style={{ width: `${trialPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
              {trialDaysLeft <= 3
                ? "Scade presto. Scegli un piano per non interrompere l'accesso."
                : "Esplora tutte le funzionalità durante il trial."}
            </p>

            <Link href="/settings" onClick={() => setMobileOpen(false)}>
              <Button
                size="sm"
                variant="outline"
                className={`w-full h-7 text-xs ${uc.text} border-current/30 hover:bg-current/5`}
              >
                Scegli un piano
                <ArrowRight className="h-3 w-3 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Theme toggle + User info + Logout */}
      <div className="px-4 py-4 border-t border-border space-y-3">
        {mounted && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {theme === "dark" ? "Tema Chiaro" : "Tema Scuro"}
          </Button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-red-400"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Esci
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
