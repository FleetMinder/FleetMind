"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import {
  Plus,
  Package,
  Eye,
  RefreshCw,
  Snowflake,
  AlertTriangle,
  User,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Urgenza = "normale" | "urgente" | "programmato";
type OrderStatus = "pending" | "assegnato" | "in_corso" | "completato" | "annullato";

interface Order {
  id: string;
  codiceOrdine: string;
  mittenteNome: string;
  mittenteIndirizzo: string;
  mittenteCitta: string;
  mittenteCAP: string;
  destinatarioNome: string;
  destinatarioIndirizzo: string;
  destinatarioCitta: string;
  destinatarioCAP: string;
  tipoMerce: string;
  merceRefrigerata: boolean;
  mercePericolosa: boolean;
  pesoKg: number;
  volumeM3: number;
  urgenza: Urgenza;
  finestraCaricoDa: string;
  finestraCaricoA: string;
  finestraConsegnaDa: string;
  finestraConsegnaA: string;
  note: string | null;
  stato: OrderStatus;
  createdAt: string;
  trip?: { id: string; stato: string; driver: { nome: string; cognome: string } | null } | null;
}

interface NewOrderForm {
  mittenteNome: string;
  mittenteIndirizzo: string;
  mittenteCitta: string;
  mittenteCAP: string;
  destinatarioNome: string;
  destinatarioIndirizzo: string;
  destinatarioCitta: string;
  destinatarioCAP: string;
  tipoMerce: string;
  merceRefrigerata: boolean;
  mercePericolosa: boolean;
  pesoKg: string;
  volumeM3: string;
  urgenza: Urgenza;
  finestraCaricoDa: string;
  finestraCaricoA: string;
  finestraConsegnaDa: string;
  finestraConsegnaA: string;
  note: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INITIAL_FORM: NewOrderForm = {
  mittenteNome: "",
  mittenteIndirizzo: "",
  mittenteCitta: "",
  mittenteCAP: "",
  destinatarioNome: "",
  destinatarioIndirizzo: "",
  destinatarioCitta: "",
  destinatarioCAP: "",
  tipoMerce: "",
  merceRefrigerata: false,
  mercePericolosa: false,
  pesoKg: "",
  volumeM3: "",
  urgenza: "normale",
  finestraCaricoDa: "",
  finestraCaricoA: "",
  finestraConsegnaDa: "",
  finestraConsegnaA: "",
  note: "",
};

const URGENZA_LABELS: Record<Urgenza, string> = {
  urgente: "Urgente",
  normale: "Normale",
  programmato: "Programmato",
};

const STATO_LABELS: Record<OrderStatus, string> = {
  pending: "In attesa",
  assegnato: "Assegnato",
  in_corso: "In corso",
  completato: "Completato",
  annullato: "Annullato",
};

function urgenzaBadge(urgenza: Urgenza) {
  const styles: Record<Urgenza, string> = {
    urgente: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    normale: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    programmato: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700",
  };
  return (
    <Badge variant="outline" className={styles[urgenza]}>
      {URGENZA_LABELS[urgenza]}
    </Badge>
  );
}

function statoBadge(stato: OrderStatus) {
  const styles: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    assegnato: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    in_corso: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    completato: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    annullato: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };
  return (
    <Badge variant="outline" className={styles[stato]}>
      {STATO_LABELS[stato]}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState("tutti");
  const [filtroUrgenza, setFiltroUrgenza] = useState("tutti");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<NewOrderForm>(INITIAL_FORM);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // ---- Fetch orders --------------------------------------------------------

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroStato !== "tutti") params.set("stato", filtroStato);
      if (filtroUrgenza !== "tutti") params.set("urgenza", filtroUrgenza);

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Errore nel caricamento");
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error("Impossibile caricare gli ordini");
    } finally {
      setLoading(false);
    }
  }, [filtroStato, filtroUrgenza]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ---- Form helpers --------------------------------------------------------

  function updateField<K extends keyof NewOrderForm>(key: K, value: NewOrderForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    // Basic validation
    if (
      !form.mittenteNome.trim() ||
      !form.mittenteIndirizzo.trim() ||
      !form.mittenteCitta.trim() ||
      !form.mittenteCAP.trim() ||
      !form.destinatarioNome.trim() ||
      !form.destinatarioIndirizzo.trim() ||
      !form.destinatarioCitta.trim() ||
      !form.destinatarioCAP.trim() ||
      !form.tipoMerce.trim() ||
      !form.pesoKg ||
      !form.volumeM3 ||
      !form.finestraCaricoDa ||
      !form.finestraCaricoA ||
      !form.finestraConsegnaDa ||
      !form.finestraConsegnaA
    ) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        mittenteNome: form.mittenteNome.trim(),
        mittenteIndirizzo: form.mittenteIndirizzo.trim(),
        mittenteCitta: form.mittenteCitta.trim(),
        mittenteCAP: form.mittenteCAP.trim(),
        destinatarioNome: form.destinatarioNome.trim(),
        destinatarioIndirizzo: form.destinatarioIndirizzo.trim(),
        destinatarioCitta: form.destinatarioCitta.trim(),
        destinatarioCAP: form.destinatarioCAP.trim(),
        tipoMerce: form.tipoMerce.trim(),
        merceRefrigerata: form.merceRefrigerata,
        mercePericolosa: form.mercePericolosa,
        pesoKg: parseFloat(form.pesoKg),
        volumeM3: parseFloat(form.volumeM3),
        urgenza: form.urgenza,
        finestraCaricoDa: form.finestraCaricoDa,
        finestraCaricoA: form.finestraCaricoA,
        finestraConsegnaDa: form.finestraConsegnaDa,
        finestraConsegnaA: form.finestraConsegnaA,
        note: form.note.trim() || null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Errore nella creazione");
      }

      toast.success("Ordine creato con successo");
      setForm(INITIAL_FORM);
      setDialogOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Errore nella creazione dell'ordine"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Render --------------------------------------------------------------

  return (
    <div>
      <PageHeader title="Gestione Ordini" description="Visualizza e gestisci tutti gli ordini di trasporto">
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Aggiorna
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Ordine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crea Nuovo Ordine</DialogTitle>
              <DialogDescription>
                Inserisci i dettagli del nuovo ordine di trasporto.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* ---------- Mittente ---------- */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">Mittente</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="mittenteNome">Nome / Ragione sociale *</Label>
                    <Input
                      id="mittenteNome"
                      value={form.mittenteNome}
                      onChange={(e) => updateField("mittenteNome", e.target.value)}
                      placeholder="Es. Magazzino Nord SpA"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mittenteIndirizzo">Indirizzo *</Label>
                    <Input
                      id="mittenteIndirizzo"
                      value={form.mittenteIndirizzo}
                      onChange={(e) => updateField("mittenteIndirizzo", e.target.value)}
                      placeholder="Es. Via Roma 15"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mittenteCitta">Città *</Label>
                    <Input
                      id="mittenteCitta"
                      value={form.mittenteCitta}
                      onChange={(e) => updateField("mittenteCitta", e.target.value)}
                      placeholder="Es. Milano"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mittenteCAP">CAP *</Label>
                    <Input
                      id="mittenteCAP"
                      value={form.mittenteCAP}
                      onChange={(e) => updateField("mittenteCAP", e.target.value)}
                      placeholder="Es. 20100"
                      maxLength={5}
                    />
                  </div>
                </div>
              </fieldset>

              {/* ---------- Destinatario ---------- */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">Destinatario</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="destinatarioNome">Nome / Ragione sociale *</Label>
                    <Input
                      id="destinatarioNome"
                      value={form.destinatarioNome}
                      onChange={(e) => updateField("destinatarioNome", e.target.value)}
                      placeholder="Es. Logistica Sud Srl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="destinatarioIndirizzo">Indirizzo *</Label>
                    <Input
                      id="destinatarioIndirizzo"
                      value={form.destinatarioIndirizzo}
                      onChange={(e) => updateField("destinatarioIndirizzo", e.target.value)}
                      placeholder="Es. Viale Europa 42"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="destinatarioCitta">Città *</Label>
                    <Input
                      id="destinatarioCitta"
                      value={form.destinatarioCitta}
                      onChange={(e) => updateField("destinatarioCitta", e.target.value)}
                      placeholder="Es. Napoli"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="destinatarioCAP">CAP *</Label>
                    <Input
                      id="destinatarioCAP"
                      value={form.destinatarioCAP}
                      onChange={(e) => updateField("destinatarioCAP", e.target.value)}
                      placeholder="Es. 80100"
                      maxLength={5}
                    />
                  </div>
                </div>
              </fieldset>

              {/* ---------- Merce ---------- */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">Merce</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="tipoMerce">Tipo merce *</Label>
                    <Input
                      id="tipoMerce"
                      value={form.tipoMerce}
                      onChange={(e) => updateField("tipoMerce", e.target.value)}
                      placeholder="Es. Elettronica, Alimentari, Macchinari..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pesoKg">Peso (kg) *</Label>
                    <Input
                      id="pesoKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.pesoKg}
                      onChange={(e) => updateField("pesoKg", e.target.value)}
                      placeholder="Es. 1500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="volumeM3">Volume (m3) *</Label>
                    <Input
                      id="volumeM3"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.volumeM3}
                      onChange={(e) => updateField("volumeM3", e.target.value)}
                      placeholder="Es. 8.5"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="merceRefrigerata"
                      checked={form.merceRefrigerata}
                      onCheckedChange={(checked) => updateField("merceRefrigerata", checked)}
                    />
                    <Label htmlFor="merceRefrigerata" className="flex items-center gap-1.5 cursor-pointer">
                      <Snowflake className="h-4 w-4 text-blue-500" />
                      Merce refrigerata
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="mercePericolosa"
                      checked={form.mercePericolosa}
                      onCheckedChange={(checked) => updateField("mercePericolosa", checked)}
                    />
                    <Label htmlFor="mercePericolosa" className="flex items-center gap-1.5 cursor-pointer">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Merce pericolosa
                    </Label>
                  </div>
                </div>
              </fieldset>

              {/* ---------- Urgenza ---------- */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">Urgenza</legend>
                <div className="w-full sm:w-1/2">
                  <Select
                    value={form.urgenza}
                    onValueChange={(val) => updateField("urgenza", val as Urgenza)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="programmato">Programmato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </fieldset>

              {/* ---------- Finestre temporali ---------- */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">Finestre temporali</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="finestraCaricoDa">Carico da *</Label>
                    <Input
                      id="finestraCaricoDa"
                      type="datetime-local"
                      value={form.finestraCaricoDa}
                      onChange={(e) => updateField("finestraCaricoDa", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="finestraCaricoA">Carico a *</Label>
                    <Input
                      id="finestraCaricoA"
                      type="datetime-local"
                      value={form.finestraCaricoA}
                      onChange={(e) => updateField("finestraCaricoA", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="finestraConsegnaDa">Consegna da *</Label>
                    <Input
                      id="finestraConsegnaDa"
                      type="datetime-local"
                      value={form.finestraConsegnaDa}
                      onChange={(e) => updateField("finestraConsegnaDa", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="finestraConsegnaA">Consegna a *</Label>
                    <Input
                      id="finestraConsegnaA"
                      type="datetime-local"
                      value={form.finestraConsegnaA}
                      onChange={(e) => updateField("finestraConsegnaA", e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              {/* ---------- Note ---------- */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">Note aggiuntive</legend>
                <Textarea
                  id="note"
                  value={form.note}
                  onChange={(e) => updateField("note", e.target.value)}
                  placeholder="Istruzioni speciali, riferimenti cliente, vincoli particolari..."
                  rows={3}
                />
              </fieldset>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Annulla
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Creazione in corso..." : "Crea Ordine"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Filters                                                            */}
      {/* ------------------------------------------------------------------ */}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-xs space-y-1.5">
              <Label className="text-xs text-muted-foreground">Stato</Label>
              <Select value={filtroStato} onValueChange={setFiltroStato}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti gli stati</SelectItem>
                  <SelectItem value="pending">In attesa</SelectItem>
                  <SelectItem value="assegnato">Assegnato</SelectItem>
                  <SelectItem value="in_corso">In corso</SelectItem>
                  <SelectItem value="completato">Completato</SelectItem>
                  <SelectItem value="annullato">Annullato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 max-w-xs space-y-1.5">
              <Label className="text-xs text-muted-foreground">Urgenza</Label>
              <Select value={filtroUrgenza} onValueChange={setFiltroUrgenza}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutte le urgenze</SelectItem>
                  <SelectItem value="normale">Normale</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="programmato">Programmato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Orders table                                                       */}
      {/* ------------------------------------------------------------------ */}

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton rows={6} cols={8} />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nessun ordine"
              description={
                filtroStato !== "tutti" || filtroUrgenza !== "tutti"
                  ? "Prova a modificare i filtri per vedere altri risultati."
                  : "Crea il tuo primo ordine di trasporto. Dopo aver creato almeno un ordine, potrai usare AI Dispatch per pianificare i viaggi."
              }
              actionLabel={filtroStato === "tutti" && filtroUrgenza === "tutti" ? "Nuovo Ordine" : undefined}
              onAction={filtroStato === "tutti" && filtroUrgenza === "tutti" ? () => setDialogOpen(true) : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codice</TableHead>
                  <TableHead>Mittente</TableHead>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Merce</TableHead>
                  <TableHead className="text-right">Peso</TableHead>
                  <TableHead>Urgenza</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Autista</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {order.codiceOrdine}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{order.mittenteNome}</div>
                      <div className="text-xs text-muted-foreground">{order.mittenteCitta}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{order.destinatarioNome}</div>
                      <div className="text-xs text-muted-foreground">{order.destinatarioCitta}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{order.tipoMerce}</span>
                        {order.merceRefrigerata && (
                          <Snowflake className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        {order.mercePericolosa && (
                          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {order.pesoKg.toLocaleString("it-IT")} kg
                    </TableCell>
                    <TableCell>{urgenzaBadge(order.urgenza)}</TableCell>
                    <TableCell>{statoBadge(order.stato)}</TableCell>
                    <TableCell>
                      {order.trip?.driver ? (
                        <span className="flex items-center gap-1.5 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {order.trip.driver.nome} {order.trip.driver.cognome}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Dettagli</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Order detail dialog                                                */}
      {/* ------------------------------------------------------------------ */}

      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-lg">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Ordine {detailOrder.codiceOrdine}
                </DialogTitle>
                <DialogDescription>
                  Creato il{" "}
                  {format(new Date(detailOrder.createdAt), "dd MMMM yyyy 'alle' HH:mm", {
                    locale: it,
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4 text-sm">
                <div className="flex gap-2">
                  {urgenzaBadge(detailOrder.urgenza)}
                  {statoBadge(detailOrder.stato)}
                  {detailOrder.merceRefrigerata && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                      <Snowflake className="h-3 w-3 mr-1" />
                      Refrigerata
                    </Badge>
                  )}
                  {detailOrder.mercePericolosa && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Pericolosa
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Mittente</p>
                    <p className="font-medium">{detailOrder.mittenteNome}</p>
                    <p className="text-muted-foreground">
                      {detailOrder.mittenteIndirizzo}
                      <br />
                      {detailOrder.mittenteCAP} {detailOrder.mittenteCitta}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Destinatario</p>
                    <p className="font-medium">{detailOrder.destinatarioNome}</p>
                    <p className="text-muted-foreground">
                      {detailOrder.destinatarioIndirizzo}
                      <br />
                      {detailOrder.destinatarioCAP} {detailOrder.destinatarioCitta}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Merce</p>
                    <p>{detailOrder.tipoMerce}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Peso</p>
                    <p>{detailOrder.pesoKg.toLocaleString("it-IT")} kg</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Volume</p>
                    <p>{detailOrder.volumeM3.toLocaleString("it-IT")} m&sup3;</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Finestra carico</p>
                    <p>
                      {format(new Date(detailOrder.finestraCaricoDa), "dd/MM/yy HH:mm", { locale: it })}
                      {" - "}
                      {format(new Date(detailOrder.finestraCaricoA), "dd/MM/yy HH:mm", { locale: it })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Finestra consegna</p>
                    <p>
                      {format(new Date(detailOrder.finestraConsegnaDa), "dd/MM/yy HH:mm", { locale: it })}
                      {" - "}
                      {format(new Date(detailOrder.finestraConsegnaA), "dd/MM/yy HH:mm", { locale: it })}
                    </p>
                  </div>
                </div>

                {detailOrder.trip && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Tratta associata</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="capitalize">
                        {detailOrder.trip.stato.replace("_", " ")}
                      </Badge>
                      {detailOrder.trip.driver && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {detailOrder.trip.driver.nome} {detailOrder.trip.driver.cognome}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {detailOrder.note && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Note</p>
                    <p className="text-muted-foreground">{detailOrder.note}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailOrder(null)}>
                  Chiudi
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
