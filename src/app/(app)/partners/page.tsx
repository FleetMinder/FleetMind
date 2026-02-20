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

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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
    const form = new FormData(e.currentTarget);
    const body = {
      nome: form.get("nome"),
      piva: form.get("piva") || null,
      indirizzo: form.get("indirizzo") || null,
      citta: form.get("citta") || null,
      telefono: form.get("telefono") || null,
      email: form.get("email") || null,
      zoneOperative: (form.get("zoneOperative") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
      tipiVeicoli: (form.get("tipiVeicoli") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
      costoPerKm: form.get("costoPerKm")
        ? parseFloat(form.get("costoPerKm") as string)
        : null,
      noteCollaborazione: form.get("noteCollaborazione") || null,
    };

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
              <div>
                <Label htmlFor="nome">Ragione Sociale</Label>
                <Input id="nome" name="nome" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="piva">P.IVA</Label>
                  <Input id="piva" name="piva" />
                </div>
                <div>
                  <Label htmlFor="citta">Citta</Label>
                  <Input id="citta" name="citta" />
                </div>
              </div>
              <div>
                <Label htmlFor="indirizzo">Indirizzo</Label>
                <Input id="indirizzo" name="indirizzo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input id="telefono" name="telefono" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
              </div>
              <div>
                <Label htmlFor="zoneOperative">Zone Operative (separate da virgola)</Label>
                <Input id="zoneOperative" name="zoneOperative" placeholder="Lombardia, Veneto, Emilia-Romagna" />
              </div>
              <div>
                <Label htmlFor="tipiVeicoli">Tipi Veicoli (separate da virgola)</Label>
                <Input id="tipiVeicoli" name="tipiVeicoli" placeholder="camion, furgone, cisterna" />
              </div>
              <div>
                <Label htmlFor="costoPerKm">Costo per km (EUR)</Label>
                <Input id="costoPerKm" name="costoPerKm" type="number" step="0.01" />
              </div>
              <div>
                <Label htmlFor="noteCollaborazione">Note</Label>
                <Textarea id="noteCollaborazione" name="noteCollaborazione" rows={3} />
              </div>
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
          <Card key={partner.id} className="overflow-hidden">
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
                <Badge
                  variant={partner.attivo ? "default" : "secondary"}
                  className="text-xs"
                >
                  {partner.attivo ? "Attivo" : "Inattivo"}
                </Badge>
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
    </div>
  );
}
