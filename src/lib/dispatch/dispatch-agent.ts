import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources";
import { prisma } from "@/lib/prisma";
import { calcolaRotta } from "@/lib/routing";
import { calcolaCostoMinimo, verificaAccessoLEZ } from "@/lib/costi-minimi-mit";
import { postVerifyAssignment } from "./post-verify";
import type {
  AgentContext,
  ToolGetValidCombinations,
  ToolGetRouteInfo,
  ToolGetMitTariff,
  ToolCheckLez,
  ToolAssignOrder,
  ToolFlagUnassignable,
} from "./types";

const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_valid_combinations",
    description:
      "Restituisce le combinazioni autista+mezzo valide per un ordine specifico, già filtrate deterministicamente. Usala per sapere quali autisti e mezzi puoi assegnare a un ordine.",
    input_schema: {
      type: "object" as const,
      properties: {
        orderId: { type: "string", description: "ID dell'ordine da analizzare" },
      },
      required: ["orderId"],
    },
  },
  {
    name: "get_route_info",
    description:
      "Calcola distanza reale in km e durata in minuti tra due coordinate geografiche. Usa Google Maps se disponibile, altrimenti stima euclidea × 1.4.",
    input_schema: {
      type: "object" as const,
      properties: {
        originLat: { type: "number" },
        originLng: { type: "number" },
        destLat: { type: "number" },
        destLng: { type: "number" },
      },
      required: ["originLat", "originLng", "destLat", "destLng"],
    },
  },
  {
    name: "get_mit_tariff",
    description:
      "Restituisce la tariffa minima MIT 2024 (€/km) per un veicolo, in base al suo peso PTT e alla distanza della tratta.",
    input_schema: {
      type: "object" as const,
      properties: {
        pesoVeicoloKg: { type: "number", description: "Peso PTT del veicolo in kg" },
        distanzaKm: { type: "number" },
      },
      required: ["pesoVeicoloKg", "distanzaKm"],
    },
  },
  {
    name: "check_lez",
    description:
      "Verifica se un veicolo con la classe Euro indicata ha accesso alle zone LEZ (Low Emission Zone) nel nord Italia.",
    input_schema: {
      type: "object" as const,
      properties: {
        classeEuro: { type: "string", description: "es. Euro 5, Euro 6" },
      },
      required: ["classeEuro"],
    },
  },
  {
    name: "assign_order",
    description:
      "Assegna definitivamente un ordine a un autista e mezzo. Scrive su DB, esegue la verifica post-assegnazione e restituisce la scorecard (score/maxScore + dettaglio check).",
    input_schema: {
      type: "object" as const,
      properties: {
        orderId: { type: "string" },
        driverId: { type: "string" },
        vehicleId: { type: "string" },
        kmStimati: { type: "number" },
        oreStimate: { type: "number" },
        motivazione: {
          type: "string",
          description:
            "Spiegazione dettagliata in italiano: perché questo autista e questo mezzo, riferimenti normativi se rilevanti.",
        },
      },
      required: ["orderId", "driverId", "vehicleId", "kmStimati", "oreStimate", "motivazione"],
    },
  },
  {
    name: "flag_unassignable",
    description:
      "Marca un ordine come non assegnabile con motivazione specifica. Usala quando nessuna combinazione valida esiste o tutte le opzioni sono state scartate.",
    input_schema: {
      type: "object" as const,
      properties: {
        orderId: { type: "string" },
        motivo: { type: "string", description: "Spiegazione dettagliata in italiano" },
      },
      required: ["orderId", "motivo"],
    },
  },
];

const SYSTEM_PROMPT = `Sei un esperto pianificatore logistico italiano. Il tuo compito è assegnare gli ordini di trasporto agli autisti e mezzi disponibili nel modo più efficiente e sicuro possibile.

Per ogni ordine:
1. Chiama get_valid_combinations(orderId) per vedere le opzioni disponibili
2. Se l'ordine ha coordinate GPS, chiama get_route_info() per la distanza reale
3. Valuta le opzioni considerando: vicinanza geografica, ore di guida rimanenti, tipo di merce
4. Chiama assign_order() per confermare la scelta migliore con motivazione chiara in italiano
5. Se nessuna combinazione è valida, chiama flag_unassignable() con motivazione dettagliata

Normative da rispettare (Reg. CE 561/2006):
- Max 9h/giorno di guida (eccezionalmente 10h max 2 volte/settimana)
- Max 56h/settimana, max 90h bisettimanali
- Pausa 45min dopo 4,5h continue
- Merce pericolosa (ADR): patentino autista valido + mezzo abilitato
- Merce refrigerata: solo furgone_frigo
- Tempi carico/scarico: max 90 min (DL 73/2025)
- Zone LEZ: evita mezzi Euro 5 o inferiori nelle città del nord Italia

Processa TUTTI gli ordini forniti. Fornisci motivazioni chiare e in italiano che l'operatore possa capire e verificare.`;

// ── Tool executor ─────────────────────────────────────────────────────────────
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  ctx: AgentContext
): Promise<unknown> {
  switch (toolName) {
    case "get_valid_combinations": {
      const { orderId } = toolInput as unknown as ToolGetValidCombinations;
      const combinations = ctx.preFilterResult.valid.filter(
        (c) => c.orderId === orderId
      );
      const ordine = ctx.orders.find((o) => o.id === orderId);
      return {
        orderId,
        codiceOrdine: ordine?.codiceOrdine ?? orderId,
        combinazioniValide: combinations.map((c) => {
          const autista = ctx.drivers.find((d) => d.id === c.driverId);
          const mezzo = ctx.vehicles.find((v) => v.id === c.vehicleId);
          return {
            driverId: c.driverId,
            autistaNome: autista ? `${autista.nome} ${autista.cognome}` : c.driverId,
            patenteAutista: autista?.patenteTipo,
            oreDisponibili: autista
              ? Math.max(0, Math.min(9, 56 - autista.oreGuidaSettimana) - autista.oreGuidaGiorno)
              : 0,
            vehicleId: c.vehicleId,
            mezzoTarga: mezzo?.targa ?? c.vehicleId,
            mezzoTipo: mezzo?.tipo,
            capacitaPesoKg: mezzo?.capacitaPesoKg,
            oreStimateViaggio: c.estimatedHours,
          };
        }),
        totaleOpzioni: combinations.length,
      };
    }

    case "get_route_info": {
      const { originLat, originLng, destLat, destLng } = toolInput as unknown as ToolGetRouteInfo;
      if (ctx.googleMapsKey) {
        try {
          const result = await calcolaRotta({
            origineLat: originLat,
            origineLng: originLng,
            destinazioneLat: destLat,
            destinazioneLng: destLng,
            apiKey: ctx.googleMapsKey,
          });
          return {
            distanzaKm: result.distanzaKm,
            durataMinuti: result.durataMinuti,
            fonte: "Google Maps",
          };
        } catch {
          // fallback euclidea
        }
      }
      // Fallback euclideo × 1.4
      const R = 6371;
      const dLat = ((destLat - originLat) * Math.PI) / 180;
      const dLng = ((destLng - originLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((originLat * Math.PI) / 180) *
          Math.cos((destLat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const distanzaKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.4;
      return {
        distanzaKm: Math.round(distanzaKm * 10) / 10,
        durataMinuti: Math.round((distanzaKm / 50) * 60),
        fonte: "Stima euclidea × 1.4 (Google Maps non disponibile)",
      };
    }

    case "get_mit_tariff": {
      const { pesoVeicoloKg, distanzaKm } = toolInput as unknown as ToolGetMitTariff;
      const mit = calcolaCostoMinimo({ pesoVeicoloKg, distanzaKm });
      return {
        classe: mit.classe,
        costoMinimoKm: mit.costoMinimoKm,
        costoMedioKm: mit.costoMedioKm,
        costoTotaleMinimo: Math.round(mit.costoMinimoKm * distanzaKm * 100) / 100,
        costoTotaleMedio: Math.round(mit.costoMedioKm * distanzaKm * 100) / 100,
      };
    }

    case "check_lez": {
      const { classeEuro } = toolInput as unknown as ToolCheckLez;
      return verificaAccessoLEZ(classeEuro);
    }

    case "assign_order": {
      const input = toolInput as unknown as ToolAssignOrder;
      const ordine = ctx.orders.find((o) => o.id === input.orderId);
      const autista = ctx.drivers.find((d) => d.id === input.driverId);
      const mezzo = ctx.vehicles.find((v) => v.id === input.vehicleId);

      if (!ordine || !autista || !mezzo) {
        return { error: "Ordine, autista o mezzo non trovato" };
      }

      const verify = postVerifyAssignment(ordine, autista, mezzo, input.kmStimati);

      const costoCarburante =
        mezzo.consumoKmL && mezzo.consumoKmL > 0
          ? Math.round((input.kmStimati / mezzo.consumoKmL) * ctx.costoCarburanteEuroL * 100) / 100
          : null;

      await prisma.assignment.create({
        data: {
          companyId: ctx.companyId,
          orderId: input.orderId,
          driverId: input.driverId,
          vehicleId: input.vehicleId,
          score: verify.score,
          maxScore: verify.maxScore,
          checks: JSON.parse(JSON.stringify(verify.checks)),
          motivazione: input.motivazione,
          status: "pending",
          kmStimati: input.kmStimati,
          oreStimate: input.oreStimate,
          costoCarburante,
        },
      });

      ctx.sendEvent({
        type: "assignment",
        orderId: input.orderId,
        codiceOrdine: ordine.codiceOrdine,
        score: verify.score,
        maxScore: verify.maxScore,
        blocked: verify.blocked,
      });

      return {
        success: true,
        score: verify.score,
        maxScore: verify.maxScore,
        blocked: verify.blocked,
        checks: verify.checks.map((c) => ({
          nome: c.nome,
          passed: c.passed,
          valoreReale: c.valoreReale,
          limite: c.limite,
        })),
      };
    }

    case "flag_unassignable": {
      const { orderId, motivo } = toolInput as unknown as ToolFlagUnassignable;
      const ordine = ctx.orders.find((o) => o.id === orderId);

      await prisma.assignment.create({
        data: {
          companyId: ctx.companyId,
          orderId,
          driverId: ctx.drivers[0]?.id ?? "",
          vehicleId: ctx.vehicles[0]?.id ?? "",
          score: 0,
          maxScore: 7,
          checks: [],
          motivazione: motivo,
          status: "rejected",
          kmStimati: null,
          oreStimate: null,
          costoCarburante: null,
        },
      });

      ctx.sendEvent({
        type: "unassignable",
        orderId,
        codiceOrdine: ordine?.codiceOrdine ?? orderId,
        motivo,
      });

      return { success: true, orderId, motivo };
    }

    default:
      return { error: `Tool sconosciuto: ${toolName}` };
  }
}

// ── Log tool call ─────────────────────────────────────────────────────────────
async function logToolCall(
  toolName: string,
  input: Record<string, unknown>,
  output: unknown,
  durationMs: number,
  companyId: string
): Promise<void> {
  try {
    await prisma.agentLog.create({
      data: {
        companyId,
        agentName: "dispatch-agent",
        toolName,
        input: JSON.parse(JSON.stringify(input)),
        output: JSON.parse(JSON.stringify(output ?? {})),
        durationMs,
      },
    });
  } catch {
    // Non bloccare il flusso per errori di log
  }
}

// ── Main agent loop ───────────────────────────────────────────────────────────
export async function runDispatchAgent(
  anthropicKey: string,
  ctx: AgentContext
): Promise<void> {
  const client = new Anthropic({ apiKey: anthropicKey });

  const ordersList = ctx.orders
    .map(
      (o) =>
        `- ID: ${o.id} | Codice: ${o.codiceOrdine} | Da: ${o.mittenteCitta} → ${o.destinatarioCitta} | Peso: ${o.pesoKg} kg | ${o.mercePericolosa ? "⚠️ ADR" : ""} ${o.merceRefrigerata ? "❄️ Refrigerato" : ""}`
    )
    .join("\n");

  const initialMessage = `Devi pianificare il dispatch per ${ctx.orders.length} ordini.

ORDINI DA ASSEGNARE:
${ordersList}

AUTISTI DISPONIBILI (${ctx.drivers.length}): ${ctx.drivers.map((d) => `${d.nome} ${d.cognome} (patente ${d.patenteTipo})`).join(", ")}

MEZZI DISPONIBILI (${ctx.vehicles.length}): ${ctx.vehicles.map((v) => `${v.targa} (${v.tipo}, ${v.capacitaPesoKg} kg)`).join(", ")}

Pre-filtro completato: ${ctx.preFilterResult.valid.length} combinazioni valide trovate, ${ctx.preFilterResult.unassignable.length} ordini non assegnabili deterministicamente.

Processa ogni ordine in sequenza: prima chiama get_valid_combinations, poi decidi l'assegnazione ottimale e chiama assign_order o flag_unassignable.`;

  const messages: MessageParam[] = [
    { role: "user", content: initialMessage },
  ];

  const MAX_TURNS = 30;
  const deadline = Date.now() + 120_000;
  let turn = 0;

  while (turn < MAX_TURNS && Date.now() < deadline) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      tools: TOOLS,
      system: SYSTEM_PROMPT,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") break;

    if (response.stop_reason === "tool_use") {
      const toolResults: ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        ctx.sendEvent({ type: "tool_call", toolName: block.name });

        const t0 = Date.now();
        let result: unknown;
        try {
          result = await executeTool(
            block.name,
            block.input as Record<string, unknown>,
            ctx
          );
        } catch (err) {
          result = {
            error: err instanceof Error ? err.message : "Errore esecuzione tool",
          };
        }
        const duration = Date.now() - t0;

        await logToolCall(
          block.name,
          block.input as Record<string, unknown>,
          result,
          duration,
          ctx.companyId
        );

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      messages.push({ role: "user", content: toolResults });
      turn++;
    } else {
      // stop_reason non gestito → esci
      break;
    }
  }

  // Gestisci ordini pre-filtrati come non assegnabili
  for (const ua of ctx.preFilterResult.unassignable) {
    ctx.sendEvent({
      type: "unassignable",
      orderId: ua.orderId,
      codiceOrdine: ua.codiceOrdine,
      motivo: ua.motivi.join("; "),
    });
    // Salva nel DB
    try {
      const existing = await prisma.assignment.findFirst({
        where: { companyId: ctx.companyId, orderId: ua.orderId },
      });
      if (!existing) {
        await prisma.assignment.create({
          data: {
            companyId: ctx.companyId,
            orderId: ua.orderId,
            driverId: ctx.drivers[0]?.id ?? "",
            vehicleId: ctx.vehicles[0]?.id ?? "",
            score: 0,
            maxScore: 7,
            checks: [],
            motivazione: `Pre-filtro: ${ua.motivi.join("; ")}`,
            status: "rejected",
          },
        });
      }
    } catch {
      // Ignora errori di salvataggio per unassignable da pre-filter
    }
  }
}
