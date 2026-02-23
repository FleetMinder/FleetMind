import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";
import Anthropic from "@anthropic-ai/sdk";
import { calcolaRotta, stimaCostoCarburante } from "@/lib/routing";
import { calcolaCostoMinimo, verificaAccessoLEZ } from "@/lib/costi-minimi-mit";

const SYSTEM_PROMPT = `Sei un esperto pianificatore logistico italiano. Ricevi una lista di ordini da consegnare e una lista di autisti/mezzi disponibili. Devi assegnare ogni ordine all'autista e mezzo più adatto, rispettando RIGOROSAMENTE:

1. COMPATIBILITÀ MERCE/MEZZO:
   - Merce refrigerata → SOLO furgone_frigo
   - Prodotti chimici/liquidi → SOLO cisterna
   - Materiali pesanti/ingombranti → pianale o camion
   - Merce pericolosa (ADR) → solo autisti con patentino ADR valido e mezzi abilitati ADR

2. CAPACITÀ: Non superare MAI peso o volume massimo del mezzo

3. ORE DI GUIDA (Reg. CE 561/2006):
   - Max 9h/giorno (estensibile a 10h max 2 volte a settimana)
   - Max 56h/settimana
   - Max 90h bisettimanali
   - Pausa obbligatoria 45min dopo 4,5h di guida
   - Riposo giornaliero min 11h consecutive (riducibile a 9h max 3 volte tra riposi settimanali)

4. PATENTE: CE per camion pesanti/cisterne, C per camion, B per furgoni

5. FINESTRE ORARIE: Rispetta orari di carico e consegna

6. OTTIMIZZAZIONE PERCORSO:
   - Raggruppa consegne geograficamente vicine
   - Minimizza km totali
   - Usa le distanze reali fornite (se disponibili) invece di stime

7. TEMPI CARICO/SCARICO: Max 90 minuti per operazione (DL 73/2025)

8. ZONE LEZ: Se indicato, evita di assegnare veicoli Euro 5 o inferiori a tratte nel nord Italia

9. COSTI MINIMI MIT: Se forniti i riferimenti, indica nella rationale se il costo della tratta è in linea con i minimi ministeriali

IMPORTANTE: Se un ordine non può essere assegnato (nessun mezzo/autista compatibile, limiti ore, incompatibilità ADR), includilo in "unassigned" con la motivazione SPECIFICA.

Rispondi SOLO con JSON valido (nessun testo prima o dopo) con questo schema esatto:
{
  "trips": [
    {
      "driver_id": "id_autista",
      "vehicle_id": "id_mezzo",
      "order_ids": ["id_ordine1", "id_ordine2"],
      "rationale_it": "Spiegazione dettagliata in italiano con riferimenti normativi",
      "km_stimati": 150,
      "ore_stimate": 2.5
    }
  ],
  "unassigned": [
    {
      "order_id": "id_ordine",
      "motivo": "Spiegazione specifica in italiano"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    const body = await request.json();

    // Get API keys
    let anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      const setting = await prisma.setting.findUnique({
        where: { companyId_chiave: { companyId, chiave: "anthropic_api_key" } },
      });
      anthropicKey = setting?.valore;
    }

    if (!anthropicKey) {
      return NextResponse.json(
        { error: "API key Anthropic non configurata. Vai su Impostazioni per inserirla." },
        { status: 400 }
      );
    }

    // Check for Google Maps key for real routing
    let googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsKey) {
      const setting = await prisma.setting.findUnique({
        where: { companyId_chiave: { companyId, chiave: "google_maps_api_key" } },
      });
      googleMapsKey = setting?.valore || undefined;
    }

    // Get costo carburante
    const costoCarburanteSetting = await prisma.setting.findUnique({
      where: { companyId_chiave: { companyId, chiave: "costo_carburante_litro" } },
    });
    const costoCarburanteEuroL = costoCarburanteSetting
      ? parseFloat(costoCarburanteSetting.valore)
      : 1.85;

    // Get pending orders
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

    // Get available drivers with compliance data
    const drivers = await prisma.driver.findMany({
      where: { companyId, stato: "disponibile" },
    });

    // Get available vehicles with compliance data
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

    // Pre-calculate real distances if Google Maps key is available
    const distanzeReali: Record<string, { km: number; minuti: number }> = {};
    if (googleMapsKey) {
      try {
        const routePromises = orders
          .filter(o => o.mittenteLat && o.mittenteLng && o.destinatarioLat && o.destinatarioLng)
          .map(async (o) => {
            try {
              const result = await calcolaRotta({
                origineLat: o.mittenteLat!,
                origineLng: o.mittenteLng!,
                destinazioneLat: o.destinatarioLat!,
                destinazioneLng: o.destinatarioLng!,
                apiKey: googleMapsKey!,
              });
              return { orderId: o.id, km: result.distanzaKm, minuti: result.durataMinuti };
            } catch {
              return null;
            }
          });

        const results = await Promise.all(routePromises);
        for (const r of results) {
          if (r) {
            distanzeReali[r.orderId] = { km: r.km, minuti: r.minuti };
          }
        }
      } catch (e) {
        console.warn("Google Maps routing fallback:", e);
      }
    }

    // Check LEZ restrictions for vehicles
    const vehicleLEZ = vehicles.map(v => ({
      id: v.id,
      targa: v.targa,
      ...verificaAccessoLEZ(v.classeEuro),
    }));

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
    ...(distanzeReali[o.id] ? {
      distanza_reale_km: distanzeReali[o.id].km,
      durata_reale_minuti: distanzeReali[o.id].minuti,
    } : {}),
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
    ore_guida_oggi: d.oreGuidaGiorno,
    ore_disponibili_oggi: Math.max(0, Math.min(9, 56 - d.oreGuidaSettimana) - d.oreGuidaGiorno),
    posizione_lat: d.latitudine,
    posizione_lng: d.longitudine,
    patentino_adr: d.adrPatentino || null,
    adr_valido: d.adrScadenza ? new Date(d.adrScadenza) > new Date() : false,
  })),
  null,
  2
)}

MEZZI DISPONIBILI (${vehicles.length}):
${JSON.stringify(
  vehicles.map((v) => {
    const lez = vehicleLEZ.find(l => l.id === v.id);
    const costiMinimi = v.pesoComplessivoKg
      ? calcolaCostoMinimo({ pesoVeicoloKg: v.pesoComplessivoKg, distanzaKm: 100 })
      : null;
    return {
      id: v.id,
      targa: v.targa,
      tipo: v.tipo,
      capacita_peso_kg: v.capacitaPesoKg,
      capacita_volume_m3: v.capacitaVolumeM3,
      consumo_km_l: v.consumoKmL,
      classe_euro: v.classeEuro,
      peso_ptt_kg: v.pesoComplessivoKg,
      adr_abilitato: v.adrAbilitato,
      accesso_lez: lez?.accesso ?? true,
      avviso_lez: lez?.avviso || null,
      costo_minimo_per_100km: costiMinimi ? Math.round(costiMinimi.costoMinimoKm * 100) / 100 : null,
    };
  }),
  null,
  2
)}

${Object.keys(distanzeReali).length > 0 ? "NOTA: Le distanze reali sono state calcolate con Google Maps. Usale per stime precise di km e ore." : "NOTA: Distanze reali non disponibili. Stima basata su coordinate GPS."}

Crea il piano di dispatch ottimale, rispettando tutti i vincoli normativi.`;

    const client = new Anthropic({ apiKey: anthropicKey });
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

    // Enrich plan with full data and real costs
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

        // Use real distance if available
        let kmReali = trip.km_stimati;
        let durataRealeMin = trip.ore_stimate * 60;

        if (tripOrders.length === 1 && distanzeReali[tripOrders[0].id]) {
          kmReali = distanzeReali[tripOrders[0].id].km;
          durataRealeMin = distanzeReali[tripOrders[0].id].minuti;
        }

        // Calculate real fuel cost
        const costoCarburante = vehicle?.consumoKmL
          ? stimaCostoCarburante({
              distanzaKm: kmReali,
              consumoKmL: vehicle.consumoKmL,
              costoCarburanteEuroL,
            })
          : null;

        // Calculate MIT minimum cost reference
        let costoMinimoMIT = null;
        if (vehicle?.pesoComplessivoKg) {
          const mit = calcolaCostoMinimo({
            pesoVeicoloKg: vehicle.pesoComplessivoKg,
            distanzaKm: kmReali,
          });
          costoMinimoMIT = {
            classe: mit.classe,
            minimo: Math.round(mit.costoMinimoKm * 100) / 100,
            medio: Math.round(mit.costoMedioKm * 100) / 100,
          };
        }

        return {
          ...trip,
          driver,
          vehicle,
          orders: tripOrders,
          km_stimati: Math.round(kmReali * 10) / 10,
          ore_stimate: Math.round((durataRealeMin / 60) * 10) / 10,
          costoCarburanteStimato: costoCarburante,
          costoMinimoMIT,
          routingReale: !!googleMapsKey && Object.keys(distanzeReali).length > 0,
        };
      })
    );

    await prisma.activityLog.create({
      data: {
        companyId,
        tipo: "ai_dispatch",
        messaggio: `Piano AI generato: ${enrichedTrips.length} tratte per ${orders.length} ordini${googleMapsKey ? " (routing reale)" : ""}`,
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
        routingReale: !!googleMapsKey,
      },
    });
  } catch (error) {
    console.error("Dispatch API error:", error);
    const errMessage =
      error instanceof Error ? error.message : "Errore nella pianificazione AI";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
