"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
    driver: { nome: string; cognome: string };
    orders: Array<{
      mittenteLat: number | null;
      mittenteLng: number | null;
      destinatarioLat: number | null;
      destinatarioLng: number | null;
      mittenteCitta: string;
      destinatarioCitta: string;
    }>;
  }>;
  charts?: {
    ordini: Array<{ stato: string; count: number }>;
    trips: Array<{ stato: string; count: number; km: number }>;
  };
}

const ORDER_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  assegnato: "#3b82f6",
  in_corso: "#8b5cf6",
  completato: "#22c55e",
  annullato: "#6b7280",
};

const ORDER_LABELS: Record<string, string> = {
  pending: "Pending",
  assegnato: "Assegnato",
  in_corso: "In Corso",
  completato: "Completato",
  annullato: "Annullato",
};

const TRIP_COLORS: Record<string, string> = {
  pianificato: "#3b82f6",
  approvato: "#8b5cf6",
  in_corso: "#f59e0b",
  completato: "#22c55e",
  annullato: "#6b7280",
};

const TRIP_LABELS: Record<string, string> = {
  pianificato: "Pian.",
  approvato: "Approv.",
  in_corso: "In Corso",
  completato: "Complet.",
  annullato: "Annull.",
};

const logIcons: Record<string, React.ReactNode> = {
  order_created: <Package className="h-4 w-4 text-blue-400" />,
  trip_completed: <CheckCircle2 className="h-4 w-4 text-green-400" />,
  driver_status: <Users className="h-4 w-4 text-yellow-400" />,
  vehicle_maintenance: <AlertCircle className="h-4 w-4 text-red-400" />,
  ai_dispatch: <Brain className="h-4 w-4 text-purple-400" />,
  dispatch_approved: <TrendingUp className="h-4 w-4 text-emerald-400" />,
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Panoramica operativa in tempo reale"
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
        description="Panoramica operativa in tempo reale"
      />

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
                  La tua piattaforma e pronta. Inizia configurando la tua flotta per sfruttare la pianificazione AI.
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
            <p className="text-xs text-muted-foreground">Stima giornaliera</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {data.charts && (data.charts.ordini.length > 0 || data.charts.trips.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Orders donut */}
          {data.charts.ordini.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Ordini per Stato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.charts.ordini}
                      dataKey="count"
                      nameKey="stato"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {data.charts.ordini.map((entry) => (
                        <Cell
                          key={entry.stato}
                          fill={ORDER_COLORS[entry.stato] || "#6b7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number | undefined, name: string | undefined) => [v ?? 0, (ORDER_LABELS[name ?? ""] || name) ?? ""]}
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Legend
                      formatter={(value) => ORDER_LABELS[value] || value}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Trips bar */}
          {data.charts.trips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Route className="h-4 w-4" />
                  Km per Stato Tratta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={data.charts.trips.map((t) => ({
                      ...t,
                      label: TRIP_LABELS[t.stato] || t.stato,
                    }))}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" km" width={60} />
                    <Tooltip
                      formatter={(v: number | undefined) => [`${v ?? 0} km`, "Km totali"]}
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Bar dataKey="km" radius={[4, 4, 0, 0]}>
                      {data.charts.trips.map((entry) => (
                        <Cell
                          key={entry.stato}
                          fill={TRIP_COLORS[entry.stato] || "#6b7280"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Map and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Mappa Flotta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <FleetMap drivers={data.drivers} trips={data.trips} />
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Disponibile
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                In viaggio
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Riposo
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                Non disponibile
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attivita Recenti
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
