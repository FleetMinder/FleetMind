"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Handshake,
  Plus,
  Star,
  MapPin,
  Truck,
  Phone,
  Mail,
  Euro,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface Partner {
  id: string;
  nome: string;
  piva: string | null;
  indirizzo: string | null;
  citta: string | null;
  telefono: string | null;
  email: string | null;
  zoneOperative: string[];
  tipiVeicoli: string[];
  costoPerKm: number | null;
  rating: number;
  noteCollaborazione: string | null;
  attivo: boolean;
}

const vehicleTypeLabels: Record<string, string> = {
  furgone: "Furgone",
  camion: "Camion",
  furgone_frigo: "Frigo",
  cisterna: "Cisterna",
  pianale: "Pianale",
};

function StarRating({ rating }: { rating: number }) {
  if (rating === 0) {
    return <span className="text-xs text-muted-foreground">Non valutato</span>;
  }
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function PartnerFormFields({ partner }: { partner?: Partner }) {
  return (
  <>
    <div>
      <Label htmlFor="p-nome">Ragione Sociale</Label>
      <Input id="p-nome" name="nome" required defaultValue={partner?.nome} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label htmlFor="p-piva">P.IVA</Label>
        <Input id="p-piva" name="piva" defaultValue={partner?.piva ?? ""} />
      </div>
      <div>
        <Label htmlFor="p-citta">Città</Label>
        <Input id="p-citta" name="citta" defaultValue={partner?.citta ?? ""} />
      </div>
    </div>
    <div>
      <Label htmlFor="p-indirizzo">Indirizzo</Label>
      <Input id="p-indirizzo" name="indirizzo" defaultValue={partner?.indirizzo ?? ""} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label htmlFor="p-telefono">Telefono</Label>
        <Input id="p-telefono" name="telefono" defaultValue={partner?.telefono ?? ""} />
      </div>
      <div>
        <Label htmlFor="p-email">Email</Label>
        <Input id="p-email" name="email" type="email" defaultValue={partner?.email ?? ""} />
      </div>
    </div>
    <div>
      <Label htmlFor="p-zoneOperative">Zone Operative (separate da virgola)</Label>
      <Input
        id="p-zoneOperative"
        name="zoneOperative"
        placeholder="Lombardia, Veneto, Emilia-Romagna"
        defaultValue={partner?.zoneOperative.join(", ") ?? ""}
      />
    </div>
    <div>
      <Label htmlFor="p-tipiVeicoli">Tipi Veicoli (separati da virgola)</Label>
      <Input
        id="p-tipiVeicoli"
        name="tipiVeicoli"
        placeholder="camion, furgone, cisterna"
        defaultValue={partner?.tipiVeicoli.join(", ") ?? ""}
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label htmlFor="p-costoPerKm">Costo per km (EUR)</Label>
        <Input
          id="p-costoPerKm"
          name="costoPerKm"
          type="number"
          step="0.01"
          defaultValue={partner?.costoPerKm ?? ""}
        />
      </div>
      <div>
        <Label htmlFor="p-rating">Rating (0–5)</Label>
        <Input
          id="p-rating"
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.5"
          defaultValue={partner?.rating ?? 0}
        />
      </div>
    </div>
    <div>
      <Label htmlFor="p-noteCollaborazione">Note</Label>
      <Textarea
        id="p-noteCollaborazione"
        name="noteCollaborazione"
        rows={3}
        defaultValue={partner?.noteCollaborazione ?? ""}
      />
    </div>
  </>
  );
}

function parsePartnerForm(form: FormData) {
  return {
    nome: form.get("nome") as string,
    piva: (form.get("piva") as string) || null,
    indirizzo: (form.get("indirizzo") as string) || null,
    citta: (form.get("citta") as string) || null,
    telefono: (form.get("telefono") as string) || null,
    email: (form.get("email") as string) || null,
    zoneOperative:
      (form.get("zoneOperative") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
    tipiVeicoli:
      (form.get("tipiVeicoli") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
    costoPerKm: form.get("costoPerKm")
      ? parseFloat(form.get("costoPerKm") as string)
      : null,
    rating: form.get("rating") ? parseFloat(form.get("rating") as string) : 0,
    noteCollaborazione: (form.get("noteCollaborazione") as string) || null,
  };
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch("/api/partners");
      const data = await res.json();
      setPartners(data);
    } catch {
      toast.error("Errore nel caricamento dei partner");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = parsePartnerForm(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Partner creato con successo");
      setDialogOpen(false);
      fetchPartners();
    } catch {
      toast.error("Errore nella creazione del partner");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPartner) return;
    setEditSaving(true);
    const body = parsePartnerForm(new FormData(e.currentTarget));
    try {
      const res = await fetch(`/api/partners/${editingPartner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setPartners((prev) => {
        const updated = prev.map((p) =>
          p.id === editingPartner.id ? { ...p, ...body } : p
        );
        return [...updated].sort((a, b) => b.rating - a.rating);
      });
      toast.success("Partner aggiornato");
      setEditingPartner(null);
    } catch {
      toast.error("Errore nell'aggiornamento del partner");
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleAttivo = async (partner: Partner) => {
    try {
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attivo: !partner.attivo }),
      });
      if (!res.ok) throw new Error();
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, attivo: !partner.attivo } : p))
      );
      toast.success(partner.attivo ? "Partner disattivato" : "Partner attivato");
    } catch {
      toast.error("Errore nell'aggiornamento dello stato");
    }
  };

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`Eliminare il partner "${partner.nome}"? L'operazione è irreversibile.`)) return;
    try {
      const res = await fetch(`/api/partners/${partner.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPartners((prev) => prev.filter((p) => p.id !== partner.id));
      toast.success("Partner eliminato");
    } catch {
      toast.error("Errore nell'eliminazione del partner");
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Partner" description="Vettori partner e collaborazioni" />
        <CardGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Partner" description="Vettori partner e collaborazioni">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Aggiungi Partner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <PartnerFormFields />
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvataggio..." : "Crea Partner"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Empty state */}
      {partners.length === 0 && (
        <EmptyState
          icon={Handshake}
          title="Nessun partner"
          description="Aggiungi i tuoi vettori partner per gestire le collaborazioni e le spedizioni esterne."
          actionLabel="Aggiungi Partner"
          onAction={() => setDialogOpen(true)}
        />
      )}

      {/* Partners grid */}
      {partners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <Card key={partner.id} className={`overflow-hidden ${!partner.attivo ? "opacity-60" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Handshake className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{partner.nome}</CardTitle>
                      {partner.citta && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {partner.citta}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingPartner(partner)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Modifica partner"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-secondary transition-colors"
                      title="Elimina partner"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleAttivo(partner)}
                      className="cursor-pointer"
                      title={partner.attivo ? "Disattiva partner" : "Attiva partner"}
                    >
                      <Badge
                        variant={partner.attivo ? "default" : "secondary"}
                        className="text-xs hover:opacity-75 transition-opacity"
                      >
                        {partner.attivo ? "Attivo" : "Inattivo"}
                      </Badge>
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <StarRating rating={partner.rating} />

                {/* Zone operative */}
                {partner.zoneOperative.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Zone operative:</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.zoneOperative.map((zona) => (
                        <Badge key={zona} variant="outline" className="text-xs">
                          {zona}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tipi veicoli */}
                {partner.tipiVeicoli.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Veicoli:</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.tipiVeicoli.map((tipo) => (
                        <Badge key={tipo} variant="secondary" className="text-xs">
                          <Truck className="h-3 w-3 mr-1" />
                          {vehicleTypeLabels[tipo] || tipo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact and cost */}
                {(partner.costoPerKm || partner.telefono || partner.email) && (
                  <div className="text-xs text-muted-foreground space-y-1 pt-1">
                    {partner.costoPerKm && (
                      <p className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        {partner.costoPerKm.toFixed(2)} EUR/km
                      </p>
                    )}
                    {partner.telefono && (
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {partner.telefono}
                      </p>
                    )}
                    {partner.email && (
                      <p className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {partner.email}
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                {partner.noteCollaborazione && (
                  <div className="p-2 rounded bg-secondary/50 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3 inline mr-1" />
                    {partner.noteCollaborazione}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit partner dialog */}
      <Dialog open={!!editingPartner} onOpenChange={(open) => !open && setEditingPartner(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Partner — {editingPartner?.nome}</DialogTitle>
          </DialogHeader>
          {editingPartner && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <PartnerFormFields partner={editingPartner} />
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
