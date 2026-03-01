import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProtectedCompanyId } from "@/lib/company";
import { runRegulatoryAgent } from "@/lib/compliance/regulatory-agent";

export const maxDuration = 300;

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg: string) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ message: msg })}\n\n`)
          );
        } catch {
          // Controller potrebbe essere già chiuso
        }
      };

      try {
        const companyId = await getProtectedCompanyId();

        // Recupera API key Anthropic
        let anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
          const setting = await prisma.setting.findUnique({
            where: { companyId_chiave: { companyId, chiave: "anthropic_api_key" } },
          });
          anthropicKey = setting?.valore;
        }

        if (!anthropicKey) {
          send("ERRORE: API key Anthropic non configurata.");
          controller.close();
          return;
        }

        const result = await runRegulatoryAgent(anthropicKey, send);

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "done", ...result })}\n\n`
          )
        );
      } catch (e) {
        send(`ERRORE: ${e instanceof Error ? e.message : "Errore aggiornamento normativo"}`);
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

// GET: restituisce le scadenze normative dal DB + ultima esecuzione agente
export async function GET() {
  try {
    await getProtectedCompanyId();

    const [deadlines, lastUpdate] = await Promise.all([
      prisma.regulatoryDeadline.findMany({
        where: { attivo: true },
        orderBy: [{ categoria: "asc" }, { urgenza: "asc" }],
      }),
      prisma.regulatoryUpdateLog.findFirst({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      deadlines: deadlines.map((d) => ({
        id: d.id,
        titolo: d.titolo,
        data: d.data,
        descrizione: d.descrizione,
        sanzione: d.sanzione,
        urgenza: d.urgenza,
        categoria: d.categoria,
        fonti: d.fonti as string[],
        riferimentoLegale: d.riferimentoLegale,
        aggiornatoIl: d.aggiornatoIl.toISOString(),
      })),
      ultimoAggiornamento: lastUpdate
        ? {
            data: lastUpdate.createdAt.toISOString(),
            aggiunte: lastUpdate.scadenzeAggiunte,
            aggiornate: lastUpdate.scadenzeAggiornate,
            rimosse: lastUpdate.scadenzeRimosse,
            fontiUsate: lastUpdate.fontiUsate as string[],
            riepilogo: lastUpdate.riepilogoAgente,
            durataMs: lastUpdate.durataMs,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "TRIAL_EXPIRED") {
      return NextResponse.json({ error: "Trial scaduto" }, { status: 403 });
    }
    console.error("Regulatory GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento scadenzario" },
      { status: 500 }
    );
  }
}
