import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";
import { preFilterCombinations } from "@/lib/dispatch/pre-filter";
import { runDispatchAgent } from "@/lib/dispatch/dispatch-agent";
import type { DispatchEvent } from "@/lib/dispatch/types";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: DispatchEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Controller potrebbe essere già chiuso
        }
      };

      try {
        const companyId = await getCompanyId();
        const body = await request.json();

        // ── API keys ────────────────────────────────────────────────────────
        let anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
          const setting = await prisma.setting.findUnique({
            where: { companyId_chiave: { companyId, chiave: "anthropic_api_key" } },
          });
          anthropicKey = setting?.valore;
        }

        if (!anthropicKey) {
          send({
            type: "error",
            message: "API key Anthropic non configurata. Vai su Impostazioni per inserirla.",
          });
          controller.close();
          return;
        }

        let googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!googleMapsKey) {
          const setting = await prisma.setting.findUnique({
            where: { companyId_chiave: { companyId, chiave: "google_maps_api_key" } },
          });
          googleMapsKey = setting?.valore || undefined;
        }

        const costoSetting = await prisma.setting.findUnique({
          where: { companyId_chiave: { companyId, chiave: "costo_carburante_litro" } },
        });
        const costoCarburanteEuroL = costoSetting
          ? parseFloat(costoSetting.valore)
          : 1.85;

        // ── Dati ────────────────────────────────────────────────────────────
        const orderIds = body.orderIds as string[] | undefined;
        const orders = await prisma.order.findMany({
          where: {
            companyId,
            stato: "pending",
            ...(orderIds ? { id: { in: orderIds } } : {}),
          },
        });

        if (orders.length === 0) {
          send({ type: "error", message: "Nessun ordine in stato 'pending' da pianificare." });
          controller.close();
          return;
        }

        const drivers = await prisma.driver.findMany({
          where: { companyId, stato: "disponibile" },
        });

        const vehicles = await prisma.vehicle.findMany({
          where: { companyId, stato: "disponibile" },
        });

        if (drivers.length === 0) {
          send({ type: "error", message: "Nessun autista disponibile per la pianificazione." });
          controller.close();
          return;
        }

        if (vehicles.length === 0) {
          send({ type: "error", message: "Nessun mezzo disponibile per la pianificazione." });
          controller.close();
          return;
        }

        // ── Pre-filter deterministico ────────────────────────────────────────
        const preFilterResult = preFilterCombinations(orders, drivers, vehicles);

        send({
          type: "pre_filter",
          validCount: preFilterResult.valid.length,
          unassignableCount: preFilterResult.unassignable.length,
        });

        // ── Agent loop ───────────────────────────────────────────────────────
        let assignmentCount = 0;
        let unassignableCount = preFilterResult.unassignable.length;

        const wrappedSend = (event: DispatchEvent) => {
          if (event.type === "assignment") assignmentCount++;
          if (event.type === "unassignable") unassignableCount++;
          send(event);
        };

        await runDispatchAgent(anthropicKey, {
          companyId,
          orders,
          drivers,
          vehicles,
          preFilterResult,
          googleMapsKey,
          costoCarburanteEuroL,
          sendEvent: wrappedSend,
        });

        // Salva log attività
        await prisma.activityLog.create({
          data: {
            companyId,
            tipo: "ai_dispatch",
            messaggio: `Dispatch agentico completato: ${assignmentCount} assegnazioni, ${unassignableCount} non assegnabili`,
          },
        });

        send({
          type: "done",
          assignmentCount,
          unassignableCount,
        });
      } catch (e) {
        send({
          type: "error",
          message: e instanceof Error ? e.message : "Errore nella pianificazione AI",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
