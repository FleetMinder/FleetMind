"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "sonner";
import AssignmentCard, { type AssignmentRow } from "@/components/dispatch/AssignmentCard";
import {
  Brain,
  Sparkles,
  Package,
  Clock,
  Route,
  AlertTriangle,
  Loader2,
  ThumbsUp,
  XCircle,
  Wrench,
} from "lucide-react";
import type { DispatchEvent } from "@/lib/dispatch/types";

interface ProgressItem {
  type: string;
  label: string;
  ts: number;
}

export default function DispatchPage() {
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [unassignables, setUnassignables] = useState<
    { orderId: string; codiceOrdine: string; motivo: string }[]
  >([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const reset = () => {
    setAssignments([]);
    setUnassignables([]);
    setProgress([]);
    setDone(false);
  };

  const generatePlan = async () => {
    reset();
    setLoading(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        toast.error("Errore avvio dispatch: " + text);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let event: DispatchEvent;
          try {
            event = JSON.parse(raw);
          } catch {
            continue;
          }

          handleEvent(event);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Errore di connessione al servizio AI");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEvent = (event: DispatchEvent) => {
    switch (event.type) {
      case "pre_filter":
        setProgress((p) => [
          ...p,
          {
            type: "pre_filter",
            label: `Pre-filtro: ${event.validCount} combinazioni valide, ${event.unassignableCount} ordini non assegnabili`,
            ts: Date.now(),
          },
        ]);
        break;

      case "tool_call":
        setProgress((p) => [
          ...p,
          {
            type: "tool_call",
            label: `Tool: ${event.toolName}${event.detail ? ` — ${event.detail}` : ""}`,
            ts: Date.now(),
          },
        ]);
        break;

      case "assignment":
        // Fetcha i dati completi dell'assignment dal DB
        fetchAssignment(event.orderId);
        setProgress((p) => [
          ...p,
          {
            type: "assignment",
            label: `✅ ${event.codiceOrdine} → score ${event.score}/${event.maxScore}${event.blocked ? " ⛔ BLOCCATO" : ""}`,
            ts: Date.now(),
          },
        ]);
        break;

      case "unassignable":
        setUnassignables((u) => [
          ...u,
          {
            orderId: event.orderId,
            codiceOrdine: event.codiceOrdine,
            motivo: event.motivo,
          },
        ]);
        setProgress((p) => [
          ...p,
          {
            type: "unassignable",
            label: `❌ ${event.codiceOrdine} non assegnabile`,
            ts: Date.now(),
          },
        ]);
        break;

      case "done":
        setDone(true);
        toast.success(
          `Dispatch completato: ${event.assignmentCount} assegnazioni, ${event.unassignableCount} non assegnabili`
        );
        break;

      case "error":
        toast.error(event.message);
        break;
    }
  };

  const fetchAssignment = async (orderId: string) => {
    try {
      const res = await fetch(`/api/dispatch/assignment?orderId=${orderId}`);
      if (!res.ok) return;
      const data: AssignmentRow = await res.json();
      setAssignments((prev) => {
        // Evita duplicati
        if (prev.some((a) => a.orderId === orderId)) return prev;
        return [...prev, data];
      });
    } catch {
      // silenzioso
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentIds: [id] }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Errore nell'approvazione");
        return;
      }
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a))
      );
      toast.success("Assegnazione approvata");
    } catch {
      toast.error("Errore di connessione");
    }
  };

  const handleReject = async (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a))
    );
    // Aggiorna status nel DB
    await fetch("/api/dispatch/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId: id }),
    }).catch(() => {});
    toast.info("Assegnazione rigettata");
  };

  const approveAll = async () => {
    const pendingIds = assignments
      .filter((a) => a.status === "pending" && !a.blocked)
      .map((a) => a.id);

    if (pendingIds.length === 0) {
      toast.info("Nessuna assegnazione da approvare");
      return;
    }

    setApproving(true);
    try {
      const res = await fetch("/api/dispatch/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentIds: pendingIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Errore nell'approvazione");
        return;
      }
      setAssignments((prev) =>
        prev.map((a) =>
          pendingIds.includes(a.id) ? { ...a, status: "approved" } : a
        )
      );
      toast.success(`${data.tripsCreated} tratte create e approvate`);
    } catch {
      toast.error("Errore di connessione");
    } finally {
      setApproving(false);
    }
  };

  const pendingCount = assignments.filter(
    (a) => a.status === "pending" && !a.blocked
  ).length;

  return (
    <div>
      <PageHeader
        title="AI Dispatch"
        description="Pianificazione agentica multi-turn con Claude Opus"
      >
        <div className="flex gap-2">
          {done && pendingCount > 0 && (
            <Button onClick={approveAll} disabled={approving} size="lg" className="gap-2">
              {approving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ThumbsUp className="h-5 w-5" />
              )}
              Approva tutti ({pendingCount})
            </Button>
          )}
          {(loading || done) && (
            <Button
              variant="outline"
              size="lg"
              onClick={reset}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Azzera
            </Button>
          )}
          <Button
            onClick={generatePlan}
            disabled={loading}
            size="lg"
            className="gap-2"
            variant={done ? "outline" : "default"}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Brain className="h-5 w-5" />
            )}
            {loading ? "Pianificazione..." : done ? "Rigenera" : "Pianifica con AI"}
          </Button>
        </div>
      </PageHeader>

      {/* Idle state */}
      {!loading && !done && assignments.length === 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Dispatch Agentico con Tool Use
              </h2>
              <p className="text-muted-foreground mb-6">
                Claude Opus analizza ogni ordine in modo autonomo — chiama tool,
                verifica vincoli normativi e scrive le assegnazioni su DB in
                tempo reale, con scorecard 7/7.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
                  <Package className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium">Pre-filtro deterministico</p>
                  <p className="text-xs text-muted-foreground">
                    Compatibilità patente, peso, ADR, frigo
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium">Normativa EU / MIT</p>
                  <p className="text-xs text-muted-foreground">
                    CE 561 · DL 73/2025 · LEZ · Tariffe MIT
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-secondary/50">
                  <Route className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm font-medium">Scorecard 7 check</p>
                  <p className="text-xs text-muted-foreground">
                    Peso · Volume · Ore · ADR · Patente · LEZ · MIT
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live progress */}
      {(loading || done) && progress.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              <Wrench className="h-4 w-4 text-primary" />
              Log in tempo reale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {progress.map((p, i) => (
                <p
                  key={i}
                  className={`text-xs font-mono ${
                    p.type === "assignment"
                      ? "text-emerald-700"
                      : p.type === "unassignable"
                      ? "text-red-600"
                      : p.type === "pre_filter"
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {p.label}
                </p>
              ))}
              {loading && (
                <p className="text-xs text-gray-400 animate-pulse">
                  Claude sta lavorando...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary bar */}
      {done && (assignments.length > 0 || unassignables.length > 0) && (
        <Card className="mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{assignments.filter((a) => !a.blocked).length}</p>
                <p className="text-xs text-muted-foreground">Assegnabili</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{assignments.filter((a) => a.blocked).length}</p>
                <p className="text-xs text-muted-foreground">Bloccate</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-500">{unassignables.length}</p>
                <p className="text-xs text-muted-foreground">Non assegnabili</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment cards */}
      {assignments.length > 0 && (
        <div className="space-y-3 mb-4">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Unassignable */}
      {unassignables.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Ordini non assegnabili ({unassignables.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unassignables.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5"
                >
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.codiceOrdine}</p>
                    <p className="text-sm text-muted-foreground">{item.motivo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
