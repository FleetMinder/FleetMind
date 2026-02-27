"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Truck,
  Snowflake,
  Droplets,
  Package,
  LayoutGrid,
  Plus,
  Wrench,
  Gauge,
  Calendar,
  Fuel,
} from "lucide-react";
import { format } from "date-fns";

interface Maintenance {
  id: string;
  tipo: string;
  descrizione: string;
  costo: number | null;
  data: string;
  kmAlMomento: number | null;
}

interface Vehicle {
  id: string;
  targa: string;
  tipo: string;
  marca: string;
  modello: string;
  anno: number;
  capacitaPesoKg: number;
  capacitaVolumeM3: number;
  consumoKmL: number | null;
  stato: string;
  kmAttuali: number;
  prossimaRevisione: string | null;
  prossimaManutenzione: string | null;
  maintenances: Maintenance[];
  trips: Array<{ id: string; stato: string }>;
}

const vehicleIcons: Record<string, React.ReactNode> = {
  furgone: <Truck className="h-5 w-5" />,
  camion: <Truck className="h-6 w-6" />,
  furgone_frigo: <Snowflake className="h-5 w-5 text-cyan-400" />,
  cisterna: <Droplets className="h-5 w-5 text-blue-400" />,
  pianale: <LayoutGrid className="h-5 w-5 text-amber-400" />,
};

const vehicleTypeLabels: Record<string, string> = {
  furgone: "Furgone",
  camion: "Camion",
  furgone_frigo: "Furgone Frigo",
  cisterna: "Cisterna",
  pianale: "Pianale",
};

const statoBadge: Record<string, { label: string; className: string }> = {
  disponibile: { label: "Disponibile", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  in_uso: { label: "In Uso", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  manutenzione: { label: "Manutenzione", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatoChange = async (vehicleId: string, nuovoStato: string) => {
    setUpdatingId(vehicleId);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stato: nuovoStato }),
      });
      if (!res.ok) throw new Error();
      setVehicles((prev) => prev.map((v) => v.id === vehicleId ? { ...v, stato: nuovoStato } : v));
      toast.success("Stato aggiornato");
    } catch {
      toast.error("Errore nell'aggiornamento dello stato");
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch {
      toast.error("Errore nel caricamento dei mezzi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const body = {
      targa: form.get("targa"),
      tipo: form.get("tipo"),
      marca: form.get("marca"),
      modello: form.get("modello"),
      anno: parseInt(form.get("anno") as string),
      capacitaPesoKg: parseFloat(form.get("capacitaPesoKg") as string),
      capacitaVolumeM3: parseFloat(form.get("capacitaVolumeM3") as string),
      consumoKmL: form.get("consumoKmL") ? parseFloat(form.get("consumoKmL") as string) : null,
      pesoComplessivoKg: form.get("pesoComplessivoKg") ? parseFloat(form.get("pesoComplessivoKg") as string) : null,
      classeEuro: form.get("classeEuro") || null,
      prossimaRevisione: form.get("prossimaRevisione") || null,
      assicurazioneScadenza: form.get("assicurazioneScadenza") || null,
      bolloScadenza: form.get("bolloScadenza") || null,
    };

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Mezzo creato con successo");
      setDialogOpen(false);
      fetchVehicles();
    } catch {
      toast.error("Errore nella creazione del mezzo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Mezzi" description="Gestione flotta veicoli" />
        <CardGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Mezzi" description="Gestione flotta veicoli">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Mezzo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Aggiungi Mezzo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="targa">Targa</Label>
                  <Input id="targa" name="targa" required placeholder="AA000BB" />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <select name="tipo" id="tipo" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" required>
                    <option value="furgone">Furgone</option>
                    <option value="camion">Camion</option>
                    <option value="furgone_frigo">Furgone Frigo</option>
                    <option value="cisterna">Cisterna</option>
                    <option value="pianale">Pianale</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" name="marca" required />
                </div>
                <div>
                  <Label htmlFor="modello">Modello</Label>
                  <Input id="modello" name="modello" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="anno">Anno</Label>
                  <Input id="anno" name="anno" type="number" required defaultValue={2024} />
                </div>
                <div>
                  <Label htmlFor="capacitaPesoKg">Peso max (kg)</Label>
                  <Input id="capacitaPesoKg" name="capacitaPesoKg" type="number" required />
                </div>
                <div>
                  <Label htmlFor="capacitaVolumeM3">Volume max (m³)</Label>
                  <Input id="capacitaVolumeM3" name="capacitaVolumeM3" type="number" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="consumoKmL">Consumo (km/L)</Label>
                  <Input id="consumoKmL" name="consumoKmL" type="number" step="0.1" />
                </div>
                <div>
                  <Label htmlFor="pesoComplessivoKg">Peso PTT (kg)</Label>
                  <Input id="pesoComplessivoKg" name="pesoComplessivoKg" type="number" placeholder="es. 26000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="classeEuro">Classe Euro</Label>
                  <select name="classeEuro" id="classeEuro" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Non specificata</option>
                    <option value="Euro 3">Euro 3</option>
                    <option value="Euro 4">Euro 4</option>
                    <option value="Euro 5">Euro 5</option>
                    <option value="Euro 6">Euro 6</option>
                    <option value="Euro 6E">Euro 6E</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="prossimaRevisione">Prossima Revisione</Label>
                  <Input id="prossimaRevisione" name="prossimaRevisione" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="assicurazioneScadenza">Scadenza Assicurazione</Label>
                  <Input id="assicurazioneScadenza" name="assicurazioneScadenza" type="date" />
                </div>
                <div>
                  <Label htmlFor="bolloScadenza">Scadenza Bollo</Label>
                  <Input id="bolloScadenza" name="bolloScadenza" type="date" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvataggio..." : "Crea Mezzo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Empty state */}
      {vehicles.length === 0 && (
        <EmptyState
          icon={Truck}
          title="Nessun mezzo registrato"
          description="Aggiungi il tuo primo veicolo per iniziare a gestire la flotta."
          actionLabel="Aggiungi Mezzo"
          onAction={() => setDialogOpen(true)}
        />
      )}

      {/* Vehicle grid */}
      {vehicles.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {vehicles.map((v) => {
          const badge = statoBadge[v.stato] || statoBadge.disponibile;
          return (
            <Card key={v.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      {vehicleIcons[v.tipo] || <Truck className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base">{v.targa}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {vehicleTypeLabels[v.tipo]} - {v.marca} {v.modello}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={updatingId === v.id}
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
                          onClick={() => handleStatoChange(v.id, key)}
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
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {v.capacitaPesoKg.toLocaleString("it-IT")} kg
                  </p>
                  <p className="flex items-center gap-1">
                    <LayoutGrid className="h-3 w-3" />
                    {v.capacitaVolumeM3} m³
                  </p>
                  <p className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    {v.kmAttuali.toLocaleString("it-IT")} km
                  </p>
                  {v.consumoKmL && (
                    <p className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      {v.consumoKmL} km/L
                    </p>
                  )}
                </div>
                {v.prossimaRevisione && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Revisione: {format(new Date(v.prossimaRevisione), "dd/MM/yyyy")}
                  </p>
                )}
                {v.maintenances.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setDetailVehicle(v)}
                  >
                    <Wrench className="h-3 w-3 mr-1" />
                    {v.maintenances.length} manutenzioni registrate
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {/* Maintenance detail dialog */}
      <Dialog open={!!detailVehicle} onOpenChange={() => setDetailVehicle(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Manutenzioni - {detailVehicle?.targa}
            </DialogTitle>
          </DialogHeader>
          {detailVehicle && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {detailVehicle.marca} {detailVehicle.modello} ({detailVehicle.anno}) -{" "}
                {vehicleTypeLabels[detailVehicle.tipo]}
              </div>
              <Separator />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailVehicle.maintenances.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs">
                        {format(new Date(m.data), "dd/MM/yy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {m.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{m.descrizione}</TableCell>
                      <TableCell className="text-right text-xs">
                        {m.costo
                          ? m.costo.toLocaleString("it-IT", {
                              style: "currency",
                              currency: "EUR",
                            })
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
