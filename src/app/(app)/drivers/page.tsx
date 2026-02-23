"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { toast } from "sonner";
import {
  User,
  Phone,
  CreditCard,
  Clock,
  AlertTriangle,
  Plus,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { format, differenceInDays } from "date-fns";

interface Driver {
  id: string;
  nome: string;
  cognome: string;
  codiceFiscale: string;
  patenteTipo: string;
  patenteNumero: string;
  patenteScadenza: string;
  cartaCQC: string | null;
  cqcScadenza: string | null;
  tachigrafoScadenza: string;
  oreGuidaSettimana: number;
  oreRiposoRimanenti: number;
  stato: string;
  telefono: string | null;
  latitudine: number | null;
  longitudine: number | null;
  trips: Array<{ id: string; stato: string }>;
}

const statoBadge: Record<string, { label: string; className: string }> = {
  disponibile: { label: "Disponibile", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  in_viaggio: { label: "In Viaggio", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  riposo: { label: "Riposo", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  non_disponibile: { label: "Non Disponibile", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

function getHoursColor(hours: number): string {
  if (hours >= 45) return "bg-red-500";
  if (hours >= 36) return "bg-yellow-500";
  return "bg-green-500";
}

function getHoursPercent(hours: number): number {
  return Math.min((hours / 56) * 100, 100);
}

function getExpiryAlert(dateStr: string): { type: "danger" | "warning" | null; days: number } {
  const days = differenceInDays(new Date(dateStr), new Date());
  if (days <= 0) return { type: "danger", days };
  if (days <= 30) return { type: "warning", days };
  return { type: null, days };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch("/api/drivers");
      const data = await res.json();
      setDrivers(data);
    } catch {
      toast.error("Errore nel caricamento degli autisti");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const body = {
      nome: form.get("nome"),
      cognome: form.get("cognome"),
      codiceFiscale: form.get("codiceFiscale"),
      patenteTipo: form.get("patenteTipo"),
      patenteNumero: form.get("patenteNumero"),
      patenteScadenza: form.get("patenteScadenza"),
      tachigrafoScadenza: form.get("tachigrafoScadenza"),
      telefono: form.get("telefono") || null,
      cartaCQC: form.get("cartaCQC") || null,
      cqcScadenza: form.get("cqcScadenza") || null,
      adrPatentino: form.get("adrPatentino") || null,
      adrScadenza: form.get("adrScadenza") || null,
    };

    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Autista creato con successo");
      setDialogOpen(false);
      fetchDrivers();
    } catch {
      toast.error("Errore nella creazione dell'autista");
    } finally {
      setSaving(false);
    }
  };

  // Expiry alerts
  const expiryAlerts = drivers.flatMap((d) => {
    const alerts: Array<{ driver: string; tipo: string; days: number; type: "danger" | "warning" }> = [];
    const patAlert = getExpiryAlert(d.patenteScadenza);
    if (patAlert.type) alerts.push({ driver: `${d.nome} ${d.cognome}`, tipo: "Patente", days: patAlert.days, type: patAlert.type });
    const tachAlert = getExpiryAlert(d.tachigrafoScadenza);
    if (tachAlert.type) alerts.push({ driver: `${d.nome} ${d.cognome}`, tipo: "Tachigrafo", days: tachAlert.days, type: tachAlert.type });
    if (d.cqcScadenza) {
      const cqcAlert = getExpiryAlert(d.cqcScadenza);
      if (cqcAlert.type) alerts.push({ driver: `${d.nome} ${d.cognome}`, tipo: "CQC", days: cqcAlert.days, type: cqcAlert.type });
    }
    return alerts;
  });

  if (loading) {
    return (
      <div>
        <PageHeader title="Autisti" description="Gestione autisti e monitoraggio ore di guida" />
        <CardGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Autisti" description="Gestione autisti e monitoraggio ore di guida">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Autista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Aggiungi Autista</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" required />
                </div>
                <div>
                  <Label htmlFor="cognome">Cognome</Label>
                  <Input id="cognome" name="cognome" required />
                </div>
              </div>
              <div>
                <Label htmlFor="codiceFiscale">Codice Fiscale</Label>
                <Input id="codiceFiscale" name="codiceFiscale" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="patenteTipo">Tipo Patente</Label>
                  <select name="patenteTipo" id="patenteTipo" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" required>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="patenteNumero">Numero Patente</Label>
                  <Input id="patenteNumero" name="patenteNumero" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="patenteScadenza">Scadenza Patente</Label>
                  <Input id="patenteScadenza" name="patenteScadenza" type="date" required />
                </div>
                <div>
                  <Label htmlFor="tachigrafoScadenza">Scadenza Tachigrafo</Label>
                  <Input id="tachigrafoScadenza" name="tachigrafoScadenza" type="date" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cartaCQC">Carta CQC</Label>
                  <Input id="cartaCQC" name="cartaCQC" />
                </div>
                <div>
                  <Label htmlFor="cqcScadenza">Scadenza CQC</Label>
                  <Input id="cqcScadenza" name="cqcScadenza" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="adrPatentino">Patentino ADR</Label>
                  <Input id="adrPatentino" name="adrPatentino" placeholder="Opzionale" />
                </div>
                <div>
                  <Label htmlFor="adrScadenza">Scadenza ADR</Label>
                  <Input id="adrScadenza" name="adrScadenza" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" name="telefono" />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvataggio..." : "Crea Autista"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Expiry alerts */}
      {expiryAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {expiryAlerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.type === "danger"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-yellow-500/10 border-yellow-500/30"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 flex-shrink-0 ${
                  alert.type === "danger" ? "text-red-400" : "text-yellow-400"
                }`}
              />
              <p className="text-sm">
                <span className="font-medium">{alert.driver}</span> -{" "}
                {alert.tipo}{" "}
                {alert.days <= 0
                  ? "SCADUTO"
                  : `scade tra ${alert.days} giorni`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {drivers.length === 0 && (
        <EmptyState
          icon={Users}
          title="Nessun autista registrato"
          description="Aggiungi il tuo primo autista per iniziare a pianificare i viaggi con AI Dispatch."
          actionLabel="Aggiungi Autista"
          onAction={() => setDialogOpen(true)}
        />
      )}

      {/* Driver cards grid */}
      {drivers.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {drivers.map((driver) => {
          const badge = statoBadge[driver.stato] || statoBadge.non_disponibile;
          const hoursPercent = getHoursPercent(driver.oreGuidaSettimana);
          const hoursColor = getHoursColor(driver.oreGuidaSettimana);

          return (
            <Card key={driver.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {driver.nome} {driver.cognome}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Patente {driver.patenteTipo}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={badge.className}>
                    {badge.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Hours bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Ore guida settimana
                    </span>
                    <span className="text-xs font-medium">
                      {driver.oreGuidaSettimana}h / 56h
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${hoursColor}`}
                      style={{ width: `${hoursPercent}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="text-xs text-muted-foreground space-y-1">
                  {driver.telefono && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {driver.telefono}
                    </p>
                  )}
                  <p className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Patente scade:{" "}
                    {format(new Date(driver.patenteScadenza), "dd/MM/yyyy")}
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Tachigrafo:{" "}
                    {format(new Date(driver.tachigrafoScadenza), "dd/MM/yyyy")}
                  </p>
                  {driver.trips.length > 0 && (
                    <p className="flex items-center gap-1 text-primary">
                      <MapPin className="h-3 w-3" />
                      {driver.trips.length} tratta/e attiva/e
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
