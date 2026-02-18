"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "sonner";
import {
  Brain,
  Sparkles,
  Truck,
  User,
  Package,
  MapPin,
  Clock,
  Fuel,
  Route,
  AlertTriangle,
  Loader2,
  ThumbsUp,
  XCircle,
  Snowflake,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Order {
  id: string;
  codiceOrdine: string;
  mittenteNome: string;
  mittenteCitta: string;
  destinatarioNome: string;
  destinatarioCitta: string;
  tipoMerce: string;
  merceRefrigerata: boolean;
  mercePericolosa: boolean;
  pesoKg: number;
  volumeM3: number;
  urgenza: string;
  finestraConsegnaDa: string;
  finestraConsegnaA: string;
}

interface Driver {
  id: string;
  nome: string;
  cognome: string;
  patenteTipo: string;
  oreGuidaSettimana: number;
}

interface Vehicle {
  id: string;
  targa: string;
  tipo: string;
  capacitaPesoKg: number;
  capacitaVolumeM3: number;
}

interface PlanTrip {
  driver_id: string;
  vehicle_id: string;
  order_ids: string[];
  rationale_it: string;
  km_stimati: number;
  ore_stimate: number;
  driver?: Driver;
  vehicle?: Vehicle;
  orders?: Order[];
  costoCarburanteStimato?: number | null;
}

interface Unassigned {
  order_id: string;
  motivo: string;
}

interface DispatchPlan {
  trips: PlanTrip[];
  unassigned: Unassigned[];
  stats: {
    ordiniPianificati: number;
    trattePianificate: number;
    kmTotaliStimati: number;
  };
}

const vehicleTypeLabels: Record<string, string> = {
  furgone: "Furgone",
  camion: "Camion",
  furgone_frigo: "Furgone Frigo",
  cisterna: "Cisterna",
  pianale: "Pianale",
};

export default function DispatchPage() {
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [plan, setPlan] = useState<DispatchPlan | null>(null);
  const [expandedTrips, setExpandedTrips] = useState<Set<number>>(new Set());

  const toggleTrip = (index: number) => {
    setExpandedTrips((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const res = await fetch("/api/dispatch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Errore nella pianificazione");
        return;
      }
      setPlan(data);
      setExpandedTrips(new Set(data.trips.map((_: PlanTrip, i: number) => i)));
      toast.success(`Piano generato: ${data.stats.trattePianificate} tratte per ${data.stats.ordiniPianificati} ordini`);
    } catch {
      toast.error("Errore di connessione al servizio AI");
    } finally {
      setLoading(false);
    }
  };

  const approvePlan = async () => {
    if (!plan) return;
    setApproving(true);
    try {
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trips: plan.trips }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Errore nell'approvazione");
        return;
      }
      toast.success("Piano approvato! Le tratte sono state create e gli ordini assegnati.");
      setPlan(null);
    } catch {
      toast.error("Errore nell'approvazione del piano");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Dispatch"
        description="Pianificazione intelligente delle consegne con Claude AI"
      >
        <Button
          onClick={generatePlan}
          disabled={loading}
          size="lg"
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Brain className="h-5 w-5" />
          )}
          {loading ? "Pianificazione in corso..." : "Pianifica con AI"}
        </Button>
      </PageHeader>

      {/* How it works */}
      {!plan && !loading && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Motore di Pianificazione AI
              </h2>
              <p className="text-muted-foreground mb-6">
                FleetMind analizza tutti gli ordini in attesa e li assegna
                automaticamente agli autisti e mezzi disponibili, ottimizzando
                rotte, tempi e costi.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
                  <Package className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium">Compatibilita merce</p>
                  <p className="text-xs text-muted-foreground">
                    Frigo, cisterna, pianale
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium">Normativa EU</p>
                  <p className="text-xs text-muted-foreground">
                    Max 9h/giorno, 56h/settimana
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
                  <Route className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium">Ottimizzazione rotte</p>
                  <p className="text-xs text-muted-foreground">
                    Raggruppamento geografico
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center py-12">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Claude sta analizzando i dati...
                </h3>
                <p className="text-sm text-muted-foreground max-w-md text-center">
                  Sto valutando ordini, disponibilita autisti, capacita mezzi e
                  finestre temporali per creare il piano ottimale.
                </p>
              </div>
            </CardContent>
          </Card>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Plan results */}
      {plan && !loading && (
        <div className="space-y-4">
          {/* Stats bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {plan.stats.trattePianificate}
                    </p>
                    <p className="text-xs text-muted-foreground">Tratte</p>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {plan.stats.ordiniPianificati}
                    </p>
                    <p className="text-xs text-muted-foreground">Ordini</p>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {Math.round(plan.stats.kmTotaliStimati).toLocaleString("it-IT")}
                    </p>
                    <p className="text-xs text-muted-foreground">Km totali</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPlan(null)}
                    disabled={approving}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Scarta
                  </Button>
                  <Button onClick={approvePlan} disabled={approving}>
                    {approving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-4 w-4 mr-2" />
                    )}
                    {approving ? "Approvazione..." : "Approva Piano"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip cards */}
          {plan.trips.map((trip, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => toggleTrip(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {trip.driver
                          ? `${trip.driver.nome} ${trip.driver.cognome}`
                          : trip.driver_id}
                        <span className="text-muted-foreground mx-1">|</span>
                        <Truck className="h-4 w-4" />
                        {trip.vehicle
                          ? `${trip.vehicle.targa} (${vehicleTypeLabels[trip.vehicle.tipo] || trip.vehicle.tipo})`
                          : trip.vehicle_id}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Route className="h-3 w-3" />
                          {trip.km_stimati} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {trip.ore_stimate}h
                        </span>
                        {trip.costoCarburanteStimato && (
                          <span className="flex items-center gap-1">
                            <Fuel className="h-3 w-3" />
                            {trip.costoCarburanteStimato.toLocaleString("it-IT", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </span>
                        )}
                        <Badge variant="secondary">
                          {trip.order_ids.length} ordini
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {expandedTrips.has(index) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {expandedTrips.has(index) && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />

                  {/* AI Rationale */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-primary mb-1">
                          Motivazione AI
                        </p>
                        <p className="text-sm text-foreground">
                          {trip.rationale_it}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Orders in this trip */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Ordini assegnati:
                    </p>
                    {(trip.orders || []).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge
                            variant={
                              order.urgenza === "urgente"
                                ? "destructive"
                                : "secondary"
                            }
                            className="flex-shrink-0"
                          >
                            {order.urgenza}
                          </Badge>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {order.codiceOrdine} - {order.tipoMerce}
                              {order.merceRefrigerata && (
                                <Snowflake className="h-3 w-3 text-cyan-400 inline ml-1" />
                              )}
                              {order.mercePericolosa && (
                                <AlertTriangle className="h-3 w-3 text-orange-400 inline ml-1" />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 inline" />{" "}
                              {order.mittenteCitta} → {order.destinatarioCitta}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground flex-shrink-0 ml-4">
                          <p>{order.pesoKg} kg</p>
                          <p>{order.volumeM3} m³</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Unassigned orders */}
          {plan.unassigned && plan.unassigned.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Ordini non assegnabili ({plan.unassigned.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plan.unassigned.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5"
                    >
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{item.order_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.motivo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
