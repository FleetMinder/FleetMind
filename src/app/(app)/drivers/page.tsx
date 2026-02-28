"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Pencil,
  Link2,
  Flame,
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
  adrPatentino: string | null;
  adrScadenza: string | null;
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const handleStatoChange = async (driverId: string, nuovoStato: string) => {
    setUpdatingId(driverId);
    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stato: nuovoStato }),
      });
      if (!res.ok) throw new Error();
      setDrivers((prev) => prev.map((d) => d.id === driverId ? { ...d, stato: nuovoStato } : d));
      toast.success("Stato aggiornato");
    } catch {
      toast.error("Errore nell'aggiornamento dello stato");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDriver) return;
    setEditSaving(true);
    const form = new FormData(e.currentTarget);
    const body = {
      nome: form.get("nome"),
      cognome: form.get("cognome"),
      patenteTipo: form.get("patenteTipo"),
      patenteScadenza: form.get("patenteScadenza"),
      tachigrafoScadenza: form.get("tachigrafoScadenza"),
      cartaCQC: form.get("cartaCQC") || null,
      cqcScadenza: form.get("cqcScadenza") || null,
      adrPatentino: form.get("adrPatentino") || null,
      adrScadenza: form.get("adrScadenza") || null,
      telefono: form.get("telefono") || null,
    };
    try {
      const res = await fetch(`/api/drivers/${editingDriver.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === editingDriver.id
            ? {
                ...d,
                nome: body.nome as string,
                cognome: body.cognome as string,
                patenteTipo: body.patenteTipo as string,
                patenteScadenza: body.patenteScadenza as string,
                tachigrafoScadenza: body.tachigrafoScadenza as string,
                cartaCQC: body.cartaCQC as string | null,
                cqcScadenza: body.cqcScadenza as string | null,
                adrPatentino: body.adrPatentino as string | null,
                adrScadenza: body.adrScadenza as string | null,
                telefono: body.telefono as string | null,
              }
            : d
        )
      );
      toast.success("Autista aggiornato");
      setEditingDriver(null);
    } catch {
      toast.error("Errore nell'aggiornamento dell'autista");
    } finally {
      setEditSaving(false);
    }
  };

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
    if (tachAlert.type) alerts.push({ driver: `${d.nome} ${d.cognome}`, tipo: "Carta Conducente", days: tachAlert.days, type: tachAlert.type });
    if (d.cqcScadenza) {
      const cqcAlert = getExpiryAlert(d.cqcScadenza);
      if (cqcAlert.type) alerts.push({ driver: `${d.nome} ${d.cognome}`, tipo: "CQC", days: cqcAlert.days, type: cqcAlert.type });
    }
    if (d.adrPatentino && d.adrScadenza) {
      const adrAlert = getExpiryAlert(d.adrScadenza);
      if (adrAlert.type) alerts.push({ driver: `${d.nome} ${d.cognome}`, tipo: "Patentino ADR", days: adrAlert.days, type: adrAlert.type });
    }
    return alerts;
  }).sort((a, b) => {
    if (a.type === "danger" && b.type !== "danger") return -1;
    if (a.type !== "danger" && b.type === "danger") return 1;
    return a.days - b.days;
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
                  <select name="patenteTipo" id="patenteTipo" className="w-full h-10 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" required>
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
                  <Label htmlFor="tachigrafoScadenza">Scadenza Carta Conducente</Label>
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
                <span className="font-medium">{alert.driver}</span> —{" "}
                {alert.tipo}:{" "}
                {alert.days <= 0
                  ? "scadenza superata"
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://fleetmind.co/track/${driver.id}`);
                        toast.success("Link tracking copiato!");
                      }}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Copia link tracking"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingDriver(driver)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Modifica autista"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={updatingId === driver.id}
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-75 disabled:opacity-50 cursor-pointer ${badge.className}`}
                      >
                        {badge.label}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel className="text-xs">Cambia stato</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Object.entries(statoBadge).map(([key, val]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handleStatoChange(driver.id, key)}
                          className="text-sm cursor-pointer"
                        >
                          {val.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
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
                    Carta cond.:{" "}
                    {format(new Date(driver.tachigrafoScadenza), "dd/MM/yyyy")}
                  </p>
                  {driver.cqcScadenza && (
                    <p className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      CQC:{" "}
                      {format(new Date(driver.cqcScadenza), "dd/MM/yyyy")}
                    </p>
                  )}
                  {driver.adrPatentino && driver.adrScadenza && (
                    <p className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      ADR:{" "}
                      {format(new Date(driver.adrScadenza), "dd/MM/yyyy")}
                    </p>
                  )}
                  {driver.trips.length > 0 && (
                    <p className="flex items-center gap-1 text-primary">
                      <MapPin className="h-3 w-3" />
                      {driver.trips.length === 1 ? "1 tratta attiva" : `${driver.trips.length} tratte attive`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Edit driver dialog */}
      <Dialog open={!!editingDriver} onOpenChange={(open) => !open && setEditingDriver(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Autista</DialogTitle>
          </DialogHeader>
          {editingDriver && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-nome">Nome</Label>
                  <Input id="edit-nome" name="nome" required defaultValue={editingDriver.nome} />
                </div>
                <div>
                  <Label htmlFor="edit-cognome">Cognome</Label>
                  <Input id="edit-cognome" name="cognome" required defaultValue={editingDriver.cognome} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-patenteTipo">Tipo Patente</Label>
                  <select name="patenteTipo" id="edit-patenteTipo" defaultValue={editingDriver.patenteTipo} className="w-full h-10 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" required>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-patenteScadenza">Scadenza Patente</Label>
                  <Input id="edit-patenteScadenza" name="patenteScadenza" type="date" required
                    defaultValue={editingDriver.patenteScadenza?.split("T")[0]} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-tachigrafoScadenza">Scadenza Carta Conducente</Label>
                  <Input id="edit-tachigrafoScadenza" name="tachigrafoScadenza" type="date" required
                    defaultValue={editingDriver.tachigrafoScadenza?.split("T")[0]} />
                </div>
                <div>
                  <Label htmlFor="edit-telefono">Telefono</Label>
                  <Input id="edit-telefono" name="telefono" defaultValue={editingDriver.telefono || ""} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-cartaCQC">Carta CQC</Label>
                  <Input id="edit-cartaCQC" name="cartaCQC" defaultValue={editingDriver.cartaCQC || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-cqcScadenza">Scadenza CQC</Label>
                  <Input id="edit-cqcScadenza" name="cqcScadenza" type="date"
                    defaultValue={editingDriver.cqcScadenza?.split("T")[0] || ""} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-adrPatentino">Patentino ADR</Label>
                  <Input id="edit-adrPatentino" name="adrPatentino" defaultValue={editingDriver.adrPatentino || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-adrScadenza">Scadenza ADR</Label>
                  <Input id="edit-adrScadenza" name="adrScadenza" type="date"
                    defaultValue={editingDriver.adrScadenza?.split("T")[0] || ""} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={editSaving}>
                {editSaving ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
