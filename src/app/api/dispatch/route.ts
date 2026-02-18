import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Sei un esperto pianificatore logistico italiano. Ricevi una lista di ordini da consegnare e una lista di autisti/mezzi disponibili. Devi assegnare ogni ordine all'autista e mezzo più adatto, rispettando:

1. Compatibilità tipo merce/mezzo (merce refrigerata = mezzo furgone_frigo, prodotti chimici liquidi = cisterna, materiali pesanti/ingombranti = pianale o camion)
2. Capacità peso e volume del mezzo (non superare mai i limiti)
3. Ore di guida residue autista (max 9h/giorno, 56h/settimana secondo normativa EU. Un autista con troppe ore non può fare tratte lunghe)
4. Finestre orarie di carico e consegna (rispetta gli orari richiesti)
5. Minimizza i km totali raggruppando consegne geograficamente vicine nello stesso trip
6. Tipo patente autista compatibile con il mezzo (CE per camion pesanti e cisterne, C per camion, B per furgoni)

IMPORTANTE: Se un ordine non può essere assegnato (nessun mezzo/autista compatibile), includilo in "unassigned" con la motivazione.

Rispondi SOLO con JSON valido (nessun testo prima o dopo) con questo schema esatto:
{
  "trips": [
    {
      "driver_id": "id_autista",
      "vehicle_id": "id_mezzo",
      "order_ids": ["id_ordine1", "id_ordine2"],
      "rationale_it": "Spiegazione in italiano del perché questa assegnazione è ottimale",
      "km_stimati": 150,
      "ore_stimate": 2.5
    }
  ],
  "unassigned": [
    {
      "order_id": "id_ordine",
      "motivo": "Spiegazione in italiano"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    const body = await request.json();

    // Get API key from settings or env
    let apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const setting = await prisma.setting.findUnique({
        where: { companyId_chiave: { companyId, chiave: "anthropic_api_key" } },
      });
      apiKey = setting?.valore;
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key Anthropic non configurata. Vai su Impostazioni per inserirla." },
        { status: 400 }
      );
    }

    // Get pending orders (or specific ones if provided)
    const orderIds = body.orderIds as string[] | undefined;
    const orders = await prisma.order.findMany({
      where: {
        companyId,
        stato: "pending",
        ...(orderIds ? { id: { in: orderIds } } : {}),
      },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "Nessun ordine in stato 'pending' da pianificare." },
        { status: 400 }
      );
    }

    // Get available drivers
    const drivers = await prisma.driver.findMany({
      where: { companyId, stato: "disponibile" },
    });

    // Get available vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: { companyId, stato: "disponibile" },
    });

    if (drivers.length === 0) {
      return NextResponse.json(
        { error: "Nessun autista disponibile per la pianificazione." },
        { status: 400 }
      );
    }

    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: "Nessun mezzo disponibile per la pianificazione." },
        { status: 400 }
      );
    }

    // Build the user prompt with all data
    const userPrompt = `ORDINI DA PIANIFICARE (${orders.length}):
${JSON.stringify(
  orders.map((o) => ({
    id: o.id,
    codice: o.codiceOrdine,
    mittente: `${o.mittenteIndirizzo}, ${o.mittenteCitta}`,
    mittente_lat: o.mittenteLat,
    mittente_lng: o.mittenteLng,
    destinatario: `${o.destinatarioIndirizzo}, ${o.destinatarioCitta}`,
    destinatario_lat: o.destinatarioLat,
    destinatario_lng: o.destinatarioLng,
    tipo_merce: o.tipoMerce,
    refrigerata: o.merceRefrigerata,
    pericolosa: o.mercePericolosa,
    peso_kg: o.pesoKg,
    volume_m3: o.volumeM3,
    urgenza: o.urgenza,
    finestra_carico: `${o.finestraCaricoDa.toISOString()} - ${o.finestraCaricoA.toISOString()}`,
    finestra_consegna: `${o.finestraConsegnaDa.toISOString()} - ${o.finestraConsegnaA.toISOString()}`,
  })),
  null,
  2
)}

AUTISTI DISPONIBILI (${drivers.length}):
${JSON.stringify(
  drivers.map((d) => ({
    id: d.id,
    nome: `${d.nome} ${d.cognome}`,
    patente: d.patenteTipo,
    ore_guida_settimana: d.oreGuidaSettimana,
    ore_disponibili_oggi: Math.min(9, 56 - d.oreGuidaSettimana),
    posizione_lat: d.latitudine,
    posizione_lng: d.longitudine,
  })),
  null,
  2
)}

MEZZI DISPONIBILI (${vehicles.length}):
${JSON.stringify(
  vehicles.map((v) => ({
    id: v.id,
    targa: v.targa,
    tipo: v.tipo,
    capacita_peso_kg: v.capacitaPesoKg,
    capacita_volume_m3: v.capacitaVolumeM3,
    consumo_km_l: v.consumoKmL,
  })),
  null,
  2
)}

Crea il piano di dispatch ottimale.`;

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let plan;
    try {
      plan = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: "Risposta AI non valida. Riprova.", raw: responseText },
          { status: 500 }
        );
      }
    }

    // Enrich plan with full data
    const enrichedTrips = await Promise.all(
      (plan.trips || []).map(async (trip: {
        driver_id: string;
        vehicle_id: string;
        order_ids: string[];
        rationale_it: string;
        km_stimati: number;
        ore_stimate: number;
      }) => {
        const driver = drivers.find((d) => d.id === trip.driver_id);
        const vehicle = vehicles.find((v) => v.id === trip.vehicle_id);
        const tripOrders = orders.filter((o) => trip.order_ids.includes(o.id));

        const costoCarburante =
          vehicle?.consumoKmL && trip.km_stimati
            ? (trip.km_stimati / vehicle.consumoKmL) * 1.85
            : null;

        return {
          ...trip,
          driver,
          vehicle,
          orders: tripOrders,
          costoCarburanteStimato: costoCarburante
            ? Math.round(costoCarburante * 100) / 100
            : null,
        };
      })
    );

    await prisma.activityLog.create({
      data: {
        companyId,
        tipo: "ai_dispatch",
        messaggio: `Piano AI generato: ${enrichedTrips.length} tratte per ${orders.length} ordini`,
      },
    });

    return NextResponse.json({
      trips: enrichedTrips,
      unassigned: plan.unassigned || [],
      stats: {
        ordiniPianificati: orders.length - (plan.unassigned?.length || 0),
        trattePianificate: enrichedTrips.length,
        kmTotaliStimati: enrichedTrips.reduce(
          (sum: number, t: { km_stimati?: number }) => sum + (t.km_stimati || 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error("Dispatch API error:", error);
    const message =
      error instanceof Error ? error.message : "Errore nella pianificazione AI";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
