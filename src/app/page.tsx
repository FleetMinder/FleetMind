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
} from "lucide-react";
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

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Panoramica operativa in tempo reale"
      />

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
              {kpi.ordiniOggi} creati oggi
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
