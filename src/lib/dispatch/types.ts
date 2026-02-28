import type { Driver, Vehicle, Order } from "@prisma/client";

// ── Check names ───────────────────────────────────────────────────────────────
export type CheckName = "peso" | "volume" | "ore" | "adr" | "patente" | "lez" | "mit";

export interface Check {
  nome: CheckName;
  passed: boolean;
  valoreReale: string; // es. "12.000 kg"
  limite: string;      // es. "24.000 kg"
  note: string | null;
}

export interface VerifyResult {
  score: number;
  maxScore: number; // always 7
  checks: Check[];
  blocked: boolean; // true se almeno un check critico (peso, adr, patente) fallisce
}

// ── Pre-filter ────────────────────────────────────────────────────────────────
export interface ValidCombination {
  orderId: string;
  driverId: string;
  vehicleId: string;
  estimatedHours: number; // stima euclidea / 50 km/h
}

export interface UnassignableOrder {
  orderId: string;
  codiceOrdine: string;
  motivi: string[];
}

export interface PreFilterResult {
  valid: ValidCombination[];
  unassignable: UnassignableOrder[];
}

// ── Dispatch agent context ────────────────────────────────────────────────────
export interface AgentContext {
  companyId: string;
  orders: Order[];
  drivers: Driver[];
  vehicles: Vehicle[];
  preFilterResult: PreFilterResult;
  googleMapsKey: string | undefined;
  costoCarburanteEuroL: number;
  sendEvent: (event: DispatchEvent) => void;
}

// ── SSE events streamati al frontend ─────────────────────────────────────────
export type DispatchEvent =
  | { type: "pre_filter"; validCount: number; unassignableCount: number }
  | { type: "tool_call"; toolName: string; detail?: string }
  | { type: "assignment"; orderId: string; codiceOrdine: string; score: number; maxScore: number; blocked: boolean }
  | { type: "unassignable"; orderId: string; codiceOrdine: string; motivo: string }
  | { type: "done"; assignmentCount: number; unassignableCount: number }
  | { type: "error"; message: string };

// ── Tool input schemas (per type-safety nell'esecuzione) ──────────────────────
export interface ToolGetValidCombinations {
  orderId: string;
}

export interface ToolGetRouteInfo {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

export interface ToolGetMitTariff {
  pesoVeicoloKg: number;
  distanzaKm: number;
}

export interface ToolCheckLez {
  classeEuro: string;
}

export interface ToolAssignOrder {
  orderId: string;
  driverId: string;
  vehicleId: string;
  kmStimati: number;
  oreStimate: number;
  motivazione: string;
}

export interface ToolFlagUnassignable {
  orderId: string;
  motivo: string;
}

export type ToolInput =
  | ToolGetValidCombinations
  | ToolGetRouteInfo
  | ToolGetMitTariff
  | ToolCheckLez
  | ToolAssignOrder
  | ToolFlagUnassignable;
