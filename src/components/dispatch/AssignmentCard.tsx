"use client";

import { useState } from "react";
import type { Check } from "@/lib/dispatch/types";

export interface AssignmentRow {
  id: string;
  orderId: string;
  driverId: string;
  vehicleId: string;
  score: number;
  maxScore: number;
  checks: Check[];
  motivazione: string;
  status: "pending" | "approved" | "rejected";
  kmStimati: number | null;
  oreStimate: number | null;
  costoCarburante: number | null;
  blocked: boolean;
  // relazioni denormalizzate per la UI
  codiceOrdine: string;
  autistaNome: string;
  mezzoTarga: string;
  mittenteCitta: string;
  destinatarioCitta: string;
}

interface Props {
  assignment: AssignmentRow;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const CHECK_LABELS: Record<string, string> = {
  peso: "Peso",
  volume: "Volume",
  ore: "Ore di guida",
  adr: "ADR",
  patente: "Patente",
  lez: "Zona LEZ",
  mit: "Tariffa MIT",
};

export default function AssignmentCard({ assignment, onApprove, onReject }: Props) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    assignment.blocked
      ? "bg-red-100 text-red-700 border-red-200"
      : assignment.score === assignment.maxScore
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : assignment.score >= 5
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-orange-100 text-orange-700 border-orange-200";

  const cardBorder = assignment.blocked
    ? "border-red-300"
    : assignment.score === assignment.maxScore
    ? "border-emerald-200"
    : "border-amber-200";

  return (
    <div className={`bg-white rounded-xl border ${cardBorder} shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{assignment.codiceOrdine}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-600 text-sm truncate">{assignment.autistaNome}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-600 text-sm font-mono">{assignment.mezzoTarga}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {assignment.mittenteCitta} → {assignment.destinatarioCitta}
            {assignment.kmStimati && (
              <span className="ml-2 text-gray-400">
                {assignment.kmStimati.toFixed(0)} km · {assignment.oreStimate?.toFixed(1)}h
              </span>
            )}
          </p>
        </div>
        {/* Score badge */}
        <span
          className={`flex-shrink-0 px-2.5 py-1 rounded-full border text-xs font-bold ${scoreColor}`}
        >
          {assignment.score}/{assignment.maxScore}
        </span>
      </div>

      {/* Blocked banner */}
      {assignment.blocked && (
        <div className="mx-4 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <span className="text-red-500 text-sm">⛔</span>
          <span className="text-red-700 text-xs font-medium">
            Assegnazione bloccata — check critico fallito (peso, ADR o patente)
          </span>
        </div>
      )}

      {/* Checks collapsibili */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          {expanded ? "▲" : "▼"} {expanded ? "Nascondi" : "Mostra"} check ({assignment.checks.filter((c) => !c.passed).length} falliti)
        </button>

        {expanded && (
          <div className="mt-2 space-y-1.5">
            {assignment.checks.map((check) => (
              <div
                key={check.nome}
                className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                  check.passed ? "bg-gray-50" : "bg-red-50"
                }`}
              >
                <span className="flex-shrink-0">{check.passed ? "✅" : "❌"}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-700">
                    {CHECK_LABELS[check.nome] ?? check.nome}
                  </span>
                  <span className="text-gray-500 ml-1">
                    {check.valoreReale} / {check.limite}
                  </span>
                  {check.note && (
                    <p className="text-amber-700 mt-0.5">{check.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivazione AI */}
      <div className="px-4 pb-3">
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed">
          <span className="font-medium text-gray-700">Motivazione AI: </span>
          {assignment.motivazione}
        </div>
      </div>

      {/* Costo carburante */}
      {assignment.costoCarburante && (
        <div className="px-4 pb-3">
          <span className="text-xs text-gray-500">
            Costo carburante stimato:{" "}
            <strong className="text-gray-700">€{assignment.costoCarburante.toFixed(2)}</strong>
          </span>
        </div>
      )}

      {/* Actions */}
      {assignment.status === "pending" && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={() => onApprove(assignment.id)}
            disabled={assignment.blocked}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
              bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300"
          >
            Approva
          </button>
          <button
            onClick={() => onReject(assignment.id)}
            className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-300
              text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Rigetta
          </button>
        </div>
      )}

      {assignment.status === "approved" && (
        <div className="px-4 pb-4">
          <div className="w-full py-2 rounded-lg text-sm font-medium text-center bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Approvata
          </div>
        </div>
      )}

      {assignment.status === "rejected" && (
        <div className="px-4 pb-4">
          <div className="w-full py-2 rounded-lg text-sm font-medium text-center bg-gray-50 text-gray-500 border border-gray-200">
            Rigettata
          </div>
        </div>
      )}
    </div>
  );
}
