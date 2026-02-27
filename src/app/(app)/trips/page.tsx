"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import {
  Route,
  User,
  Truck,
  Package,
  Fuel,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface TripOrder {
  id: string;
  codiceOrdine: string;
  mittenteCitta: string;
  mittenteIndirizzo: string;
  destinatarioCitta: string;
  destinatarioIndirizzo: string;
  pesoKg: number | null;
  tipoMerce: string | null;
  urgenza: string;
}

interface Trip {
  id: string;
  stato: string;
  kmTotali: number | null;
  tempoStimatoMinuti: number | null;
  costoCarburanteStimato: number | null;
  rationale: string | null;
  createdAt: string;
  driver: { id: string; nome: string; cognome: string };
  vehicle: { id: string; targa: string; tipo: string };
  orders: TripOrder[];
}

const statoConfig: Record<string, { label: string; className: string }> = {
  pianificato: {
    label: "Pianificato",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  approvato: {
    label: "Approvato",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  in_corso: {
    label: "In Corso",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  completato: {
    label: "Completato",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  annullato: {
    label: "Annullato",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
};

const ACTIVE_STATI = ["pianificato", "approvato", "in_corso"];
const DONE_STATI = ["completato", "annullato"];

function TripCard({
  trip,
  onStatoChange,
  updating,
}: {
  trip: Trip;
  onStatoChange: (id: string, stato: string) => void;
  updating: boolean;
}) {
  const cfg = statoConfig[trip.stato] || statoConfig.pianificato;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold text-sm">
                {trip.driver.nome} {trip.driver.cognome}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {trip.vehicle.targa} — {trip.vehicle.tipo}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={updating}
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-75 disabled:opacity-50 cursor-pointer flex-shrink-0 ${cfg.className}`}
              >
                {cfg.label}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">
                Cambia stato
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(statoConfig).map(([key, val]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onStatoChange(trip.id, key)}
                  className="text-sm cursor-pointer"
                >
                  {val.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Orders */}
        <div className="space-y-1.5">
          {trip.orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-2 text-xs bg-secondary/50 rounded-md px-2.5 py-1.5"
            >
              <Package className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <MapPin className="h-3 w-3 text-green-500 flex-shrink-0" />
                <span className="truncate">{order.mittenteCitta}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                <span className="truncate">{order.destinatarioCitta}</span>
              </div>
              {order.urgenza === "urgente" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold flex-shrink-0">
                  URGENTE
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          {trip.kmTotali != null && (
            <span className="flex items-center gap-1">
              <Route className="h-3 w-3" />
              {Math.round(trip.kmTotali)} km
            </span>
          )}
          {trip.tempoStimatoMinuti != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.round(trip.tempoStimatoMinuti / 60 * 10) / 10}h
            </span>
          )}
          {trip.costoCarburanteStimato != null && (
            <span className="flex items-center gap-1">
              <Fuel className="h-3 w-3" />
              {trip.costoCarburanteStimato.toLocaleString("it-IT", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          )}
        </div>

        {/* Rationale snippet */}
        {trip.rationale && (
          <p className="text-[11px] text-muted-foreground italic line-clamp-2 border-l-2 border-primary/30 pl-2">
            {trip.rationale}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      const res = await fetch("/api/trips");
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Errore nel caricamento dei viaggi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleStatoChange = async (tripId: string, nuovoStato: string) => {
    setUpdatingId(tripId);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stato: nuovoStato }),
      });
      if (!res.ok) throw new Error();
      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, stato: nuovoStato } : t))
      );
      toast.success("Stato viaggio aggiornato");
    } catch {
      toast.error("Errore nell'aggiornamento del viaggio");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Viaggi"
          description="Gestione e monitoraggio delle tratte pianificate"
        />
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  const active = trips.filter((t) => ACTIVE_STATI.includes(t.stato));
  const done = trips.filter((t) => DONE_STATI.includes(t.stato));

  return (
    <div>
      <PageHeader
        title="Viaggi"
        description="Gestione e monitoraggio delle tratte pianificate"
      />

      {trips.length === 0 && (
        <EmptyState
          icon={Route}
          title="Nessun viaggio pianificato"
          description="Usa AI Dispatch per generare automaticamente le tratte ottimali dai tuoi ordini pending."
          actionLabel="Vai ad AI Dispatch"
          onAction={() => (window.location.href = "/dispatch")}
        />
      )}

      {/* Active trips */}
      {active.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-foreground">
              Tratte Attive ({active.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onStatoChange={handleStatoChange}
                updating={updatingId === trip.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed/cancelled trips */}
      {done.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground">
              Storico ({done.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-70">
            {done.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onStatoChange={handleStatoChange}
                updating={updatingId === trip.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
