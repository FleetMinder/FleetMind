"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { FleetMap } from "@/components/map/fleet-map";
import { PageHeader } from "@/components/layout/page-header";
import {
  Package,
  Users,
  Route,
  Fuel,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Truck,
  Brain,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface DashboardData {
  kpi: {
    ordiniOggi: number;
    ordiniPending: number;
    autistiDisponibili: number;
    autistiTotali: number;
    mezziDisponibili: number;
    mezziTotali: number;
    tripsAttivi: number;
    kmPianificati: number;
    costoCarburante: number;
  };
  complianceCritici: number;
  recentLogs: Array<{
    id: string;
    tipo: string;
    messaggio: string;
    createdAt: string;
  }>;
  drivers: Array<{
    id: string;
    nome: string;
    cognome: string;
    stato: string;
    latitudine: number | null;
    longitudine: number | null;
  }>;
  trips: Array<{
    id: string;
    driver: { id: string; nome: string; cognome: string };
    orders: Array<{
      mittenteLat: number | null;
      mittenteLng: number | null;
      destinatarioLat: number | null;
      destinatarioLng: number | null;
      mittenteCitta: string;
      destinatarioCitta: string;
    }>;
  }>;
}

const logIcons: Record<string, React.ReactNode> = {
  order_created: <Package className="h-4 w-4 text-blue-400" />,
  trip_completed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  driver_status: <Users className="h-4 w-4 text-yellow-400" />,
  vehicle_maintenance: <AlertCircle className="h-4 w-4 text-red-400" />,
  ai_dispatch: <Brain className="h-4 w-4 text-purple-400" />,
  dispatch_approved: <TrendingUp className="h-4 w-4 text-emerald-400" />,
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Panoramica operativa della flotta"
        />
        <CardGridSkeleton count={4} />
      </div>
    );
  }

  const { kpi } = data;
  const isEmpty = kpi.autistiTotali === 0 && kpi.mezziTotali === 0 && kpi.ordiniPending === 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Panoramica operativa della flotta"
      />


      {/* Demo user banner */}
      {session?.user?.isDemoUser && (
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-blue-300">
            🎯 <strong>Account demo</strong> — Stai esplorando FleetMind con dati di esempio.
          </p>
          <Link
            href="/login"
            className="flex-shrink-0 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-md transition-colors"
          >
            Crea il tuo account gratuito →
          </Link>
        </div>
      )}

      {/* Compliance alert banner */}
      {data.complianceCritici > 0 && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">
              <strong>{data.complianceCritici} alert{data.complianceCritici > 1 ? " critici" : " critico"}</strong>
              {" "}— documenti scaduti rilevati su autisti o mezzi.
            </p>
          </div>
          <Link
            href="/compliance"
            className="flex-shrink-0 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 px-4 py-1.5 rounded-md transition-colors"
          >
            Verifica →
          </Link>
        </div>
      )}

      {/* Welcome banner for empty state */}
      {isEmpty && (
        <div className="mb-6 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-blue-600/5 to-purple-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-blue-400" />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">Benvenuto in FleetMind!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  La tua piattaforma è pronta. Inizia configurando la tua flotta per sfruttare la pianificazione AI.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/drivers">
                  <span className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium">
                    <Users className="h-4 w-4" />
                    Aggiungi Autisti
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
                <Link href="/vehicles">
                  <span className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium">
                    <Truck className="h-4 w-4" />
                    Aggiungi Mezzi
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
                <Link href="/orders">
                  <span className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium">
                    <Package className="h-4 w-4" />
                    Crea Ordini
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ordini Pending
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.ordiniPending}</div>
            <p className="text-xs text-muted-foreground">
              {kpi.ordiniOggi} negli ultimi 7gg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Autisti Disponibili
            </CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpi.autistiDisponibili}
              <span className="text-sm font-normal text-muted-foreground">
                /{kpi.autistiTotali}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {kpi.tripsAttivi} tratte attive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Km Pianificati
            </CardTitle>
            <Route className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(kpi.kmPianificati).toLocaleString("it-IT")}
            </div>
            <p className="text-xs text-muted-foreground">
              Mezzi: {kpi.mezziDisponibili}/{kpi.mezziTotali} disponibili
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Costo Carburante
            </CardTitle>
            <Fuel className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpi.costoCarburante.toLocaleString("it-IT", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Tratte in corso e pianificate</p>
          </CardContent>
        </Card>
      </div>

      {/* Map and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Mappa Flotta
            </CardTitle>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Aggiorna
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <FleetMap drivers={data.drivers} trips={data.trips} />
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full border-2 border-blue-400 bg-black/60 flex items-center justify-center text-blue-400 font-bold" style={{ fontSize: 8 }}>P</span>
                Partenza
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-blue-400 flex items-center justify-center text-white font-bold" style={{ fontSize: 8 }}>A</span>
                Arrivo
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-400 border-2 border-white" />
                Autista in transito
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-500 opacity-70" />
                Autista in standby
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attività Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[440px]">
              <div className="space-y-4">
                {data.recentLogs.map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="mt-0.5">
                      {logIcons[log.tipo] || (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-tight">
                        {log.messaggio}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
