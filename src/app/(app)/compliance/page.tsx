"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { toast } from "sonner";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  User,
  Truck,
  Clock,
  FileText,
  Calculator,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

interface ComplianceAlert {
  tipo: string;
  severity: "critico" | "avviso" | "info";
  entitaTipo: "driver" | "vehicle" | "order";
  entitaId: string;
  entitaNome: string;
  messaggio: string;
  dataScadenza?: string;
}

interface ComplianceStats {
  totale: number;
  critici: number;
  avvisi: number;
  info: number;
  perTipo: {
    autisti: number;
    veicoli: number;
  };
}

interface CostiMinimiTabella {
  classe: string;
  descrizione: string;
  costoPerKm: { min: number; max: number; medio: number };
  costoOrario: { min: number; max: number };
}

interface CalcoloResult {
  calcolo: {
    classe: string;
    costoMinimoKm: number;
    costoMedioKm: number;
    costoMassimoKm: number;
    riferimento: CostiMinimiTabella;
  };
  verifica?: {
    sottoCosto: boolean;
    percentualeSottoCosto: number;
    costoMinimoRiferimento: number;
    messaggio: string;
  };
}

const severityConfig = {
  critico: {
    icon: AlertCircle,
    className: "bg-red-500/10 border-red-500/30 text-red-400",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Critico",
  },
  avviso: {
    icon: AlertTriangle,
    className: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    label: "Avviso",
  },
  info: {
    icon: Info,
    className: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    label: "Info",
  },
};

export default function CompliancePage() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [tabelle, setTabelle] = useState<CostiMinimiTabella[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calcolo costi minimi
  const [pesoVeicolo, setPesoVeicolo] = useState("");
  const [distanzaKm, setDistanzaKm] = useState("");
  const [tariffaProposta, setTariffaProposta] = useState("");
  const [calcoloResult, setCalcoloResult] = useState<CalcoloResult | null>(null);
  const [calcolando, setCalcolando] = useState(false);

  const fetchCompliance = useCallback(async () => {
    try {
      const [compRes, costiRes] = await Promise.all([
        fetch("/api/compliance"),
        fetch("/api/compliance/costi-minimi"),
      ]);
      const compData = await compRes.json();
      const costiData = await costiRes.json();
      setAlerts(compData.alerts || []);
      setStats(compData.stats || null);
      setTabelle(costiData.tabelle || []);
    } catch {
      toast.error("Errore nel caricamento compliance");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCompliance();
  };

  const handleCalcola = async () => {
    if (!pesoVeicolo || !distanzaKm) {
      toast.error("Inserisci peso veicolo e distanza");
      return;
    }
    setCalcolando(true);
    try {
      const res = await fetch("/api/compliance/costi-minimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesoVeicoloKg: parseFloat(pesoVeicolo),
          distanzaKm: parseFloat(distanzaKm),
          tariffaProposta: tariffaProposta ? parseFloat(tariffaProposta) : undefined,
        }),
      });
      const data = await res.json();
      setCalcoloResult(data);
    } catch {
      toast.error("Errore nel calcolo");
    } finally {
      setCalcolando(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Compliance" description="Monitoraggio normativo e costi minimi MIT" />
        <CardGridSkeleton count={4} />
      </div>
    );
  }

  const critici = alerts.filter(a => a.severity === "critico");
  const avvisi = alerts.filter(a => a.severity === "avviso");
  const infoAlerts = alerts.filter(a => a.severity === "info");

  return (
    <div>
      <PageHeader title="Compliance" description="Monitoraggio normativo e costi minimi MIT">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Aggiorna
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Alert Critici</p>
                  <p className="text-2xl font-bold text-red-400">{stats.critici}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avvisi</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.avvisi}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Alert Autisti</p>
                  <p className="text-2xl font-bold">{stats.perTipo.autisti}</p>
                </div>
                <User className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Alert Veicoli</p>
                  <p className="text-2xl font-bold">{stats.perTipo.veicoli}</p>
                </div>
                <Truck className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Alert Scadenze
            {stats && stats.totale > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{stats.totale}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="costi" className="gap-2">
            <Calculator className="h-4 w-4" />
            Costi Minimi MIT
          </TabsTrigger>
          <TabsTrigger value="normativa" className="gap-2">
            <FileText className="h-4 w-4" />
            Scadenzario
          </TabsTrigger>
        </TabsList>

        {/* Tab: Alert Scadenze */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShieldCheck className="h-12 w-12 text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold">Tutto in regola</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Nessuna scadenza critica o avviso. La tua flotta è conforme a tutte le normative.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Critici */}
              {critici.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Critici ({critici.length})
                  </h3>
                  {critici.map((alert, i) => (
                    <AlertCard key={`critico-${i}`} alert={alert} />
                  ))}
                </div>
              )}

              {/* Avvisi */}
              {avvisi.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Avvisi ({avvisi.length})
                  </h3>
                  {avvisi.map((alert, i) => (
                    <AlertCard key={`avviso-${i}`} alert={alert} />
                  ))}
                </div>
              )}

              {/* Info */}
              {infoAlerts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Informazioni ({infoAlerts.length})
                  </h3>
                  {infoAlerts.map((alert, i) => (
                    <AlertCard key={`info-${i}`} alert={alert} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Tab: Costi Minimi MIT */}
        <TabsContent value="costi" className="space-y-6">
          {/* Calcolatore */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-5 w-5" />
                Calcolo Costi Minimi per Tratta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pesoVeicolo">Peso veicolo (kg PTT)</Label>
                  <Input
                    id="pesoVeicolo"
                    type="number"
                    placeholder="es. 26000"
                    value={pesoVeicolo}
                    onChange={(e) => setPesoVeicolo(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="distanzaKm">Distanza (km)</Label>
                  <Input
                    id="distanzaKm"
                    type="number"
                    placeholder="es. 350"
                    value={distanzaKm}
                    onChange={(e) => setDistanzaKm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tariffaProposta">Tariffa proposta (opz.)</Label>
                  <Input
                    id="tariffaProposta"
                    type="number"
                    step="0.01"
                    placeholder="es. 450.00"
                    value={tariffaProposta}
                    onChange={(e) => setTariffaProposta(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCalcola} disabled={calcolando}>
                {calcolando ? "Calcolo..." : "Calcola Costi Minimi"}
              </Button>

              {/* Risultato calcolo */}
              {calcoloResult && (
                <div className="mt-4 space-y-4">
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-green-500/30">
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Costo Minimo (Classe {calcoloResult.calcolo.classe})</p>
                        <p className="text-xl font-bold text-green-400">
                          {calcoloResult.calcolo.costoMinimoKm.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {calcoloResult.calcolo.riferimento.costoPerKm.min} €/km
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Costo Medio</p>
                        <p className="text-xl font-bold">
                          {calcoloResult.calcolo.costoMedioKm.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {calcoloResult.calcolo.riferimento.costoPerKm.medio} €/km
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-500/30">
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Costo Massimo</p>
                        <p className="text-xl font-bold text-blue-400">
                          {calcoloResult.calcolo.costoMassimoKm.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {calcoloResult.calcolo.riferimento.costoPerKm.max} €/km
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Verifica tariffa */}
                  {calcoloResult.verifica && (
                    <div
                      className={`p-4 rounded-lg border flex items-start gap-3 ${
                        calcoloResult.verifica.sottoCosto
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-green-500/10 border-green-500/30"
                      }`}
                    >
                      {calcoloResult.verifica.sottoCosto ? (
                        <TrendingDown className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${
                          calcoloResult.verifica.sottoCosto ? "text-red-400" : "text-green-400"
                        }`}>
                          {calcoloResult.verifica.sottoCosto ? "SOTTO I COSTI MINIMI" : "Tariffa conforme"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {calcoloResult.verifica.messaggio}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabelle di riferimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                Tabelle Costi Minimi MIT — Aggiornamento Giugno 2025
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                D.D. n.279 del 5 agosto 2025 — Ministero Infrastrutture e Trasporti · Aggiornamento trimestrale
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tabelle.map((t) => (
                  <Card key={t.classe} className="border-muted">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs font-bold">
                          Classe {t.classe}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{t.descrizione}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Costo per km</span>
                          <span className="font-medium">
                            {t.costoPerKm.min} - {t.costoPerKm.max} €/km
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Costo orario</span>
                          <span className="font-medium">
                            {t.costoOrario.min} - {t.costoOrario.max} €/h
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Scadenzario Normativo */}
        <TabsContent value="normativa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5" />
                Scadenzario Normativo 2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Scadenze in arrivo */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Scadenze in arrivo
                </p>
                {SCADENZE_2026.map((s, i) => (
                  <ScadenzaRow key={`2026-${i}`} s={s} />
                ))}

                <Separator className="my-2" />

                {/* Norme già in vigore */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Norme in vigore
                </p>
                {NORME_IN_VIGORE.map((s, i) => (
                  <ScadenzaRow key={`vigore-${i}`} s={s} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ScadenzaNormativa {
  titolo: string;
  data: string;
  descrizione: string;
  sanzione: string | null;
  urgenza: "alta" | "media" | "bassa";
}

function ScadenzaRow({ s }: { s: ScadenzaNormativa }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
        s.urgenza === "alta" ? "bg-red-400" :
        s.urgenza === "media" ? "bg-yellow-400" : "bg-blue-400"
      }`} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{s.titolo}</h4>
          <Badge variant="outline" className="text-xs">{s.data}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{s.descrizione}</p>
        {s.sanzione && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {s.sanzione}
          </p>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: ComplianceAlert }) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;
  const href = alert.entitaTipo === "driver" ? "/drivers" : "/vehicles";

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.className}`}>
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium">{alert.entitaNome}</span>
          <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
            {config.label}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {alert.entitaTipo === "driver" ? "Autista" : "Veicolo"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{alert.messaggio}</p>
        {alert.dataScadenza && (
          <p className="text-xs text-muted-foreground mt-1">
            Scadenza: {format(new Date(alert.dataScadenza), "dd/MM/yyyy")}
          </p>
        )}
      </div>
      <Link href={href}>
        <Button variant="ghost" size="sm" className="flex-shrink-0 h-7 px-2 text-xs gap-1">
          Vai
          <ArrowRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

const SCADENZE_2026: ScadenzaNormativa[] = [
  {
    titolo: "Tachigrafo Intelligente G2V2",
    data: "1 Luglio 2026",
    descrizione: "Obbligo per veicoli >2,5t in trasporto internazionale di installare il tachigrafo intelligente di seconda generazione (Reg. UE 1054/2020).",
    sanzione: "Fermo del veicolo",
    urgenza: "alta",
  },
  {
    titolo: "AEB (Frenata Automatica d'Emergenza)",
    data: "7 Luglio 2026",
    descrizione: "Obbligo di sistemi AEB per camion di nuova produzione (GSR Regulation). Si affianca all'obbligo di Event Data Recorder (scatola nera).",
    sanzione: "Divieto di immatricolazione",
    urgenza: "media",
  },
  {
    titolo: "ADR — Nuova Classificazione Violazioni",
    data: "2026",
    descrizione: "Classificazione delle violazioni ADR in tre livelli di rischio. Fermo immediato del veicolo nei casi gravi. Responsabilità estesa a tutta la catena logistica.",
    sanzione: "Fermo immediato del veicolo (casi gravi)",
    urgenza: "alta",
  },
  {
    titolo: "Divieto Euro 5 Diesel — Nord Italia",
    data: "1 Ottobre 2026",
    descrizione: "Divieto di circolazione per veicoli Euro 5 diesel nei comuni >100.000 abitanti di Lombardia, Piemonte, Emilia-Romagna e Veneto. Posticipato da ottobre 2025.",
    sanzione: "Multa + possibile fermo",
    urgenza: "alta",
  },
];

const NORME_IN_VIGORE: ScadenzaNormativa[] = [
  {
    titolo: "Permessi EKMT Digitali",
    data: "In vigore dal 1/1/2026",
    descrizione: "I permessi e carnet EKMT sono rilasciati esclusivamente in formato elettronico per il traffico extra-UE/EFTA. I permessi cartacei non sono più validi.",
    sanzione: "Impossibilità di trasporto extra-UE",
    urgenza: "media",
  },
  {
    titolo: "Tempi Carico/Scarico — Max 90 minuti",
    data: "In vigore",
    descrizione: "Limite massimo di 90 minuti per le operazioni di carico e scarico (DL 73/2025). Superato il limite: indennizzo minimo €100/ora (o frazione) dovuto al vettore. Prova dell'orario di arrivo tramite geolocalizzazione certificata o tachigrafo.",
    sanzione: "Indennizzo min €100/h al vettore",
    urgenza: "media",
  },
  {
    titolo: "Scarico Dati Tachigrafo",
    data: "Obbligo continuo",
    descrizione: "Scarico carta conducente ogni 28 giorni. Scarico memoria di massa del tachigrafo ogni 90 giorni. Conservazione dati per almeno 12 mesi.",
    sanzione: "Fino a €6.000 + fermo veicolo",
    urgenza: "media",
  },
  {
    titolo: "Costi Minimi MIT — Aggiornamento Trimestrale",
    data: "Trimestrale",
    descrizione: "I valori di riferimento dei costi di esercizio vengono aggiornati trimestralmente dal MIT. Le tariffe non devono scendere sotto questi valori.",
    sanzione: "Rischio legale e sanzioni AGCM",
    urgenza: "media",
  },
  {
    titolo: "e-CMR — Lettera di Vettura Elettronica",
    data: "Ratificata ago. 2024",
    descrizione: "L'Italia ha ratificato il protocollo e-CMR ad agosto 2024. Facoltativa ma destinata a diventare standard. Validità legale equivalente alla versione cartacea.",
    sanzione: null,
    urgenza: "bassa",
  },
];
