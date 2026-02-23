import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyId } from "@/lib/company";
import { calcolaRotta, calcolaRottaMultiStop, geocodifica } from "@/lib/routing";

async function getGoogleMapsKey(companyId: string): Promise<string | null> {
  // Prima controlla env var globale
  if (process.env.GOOGLE_MAPS_API_KEY) {
    return process.env.GOOGLE_MAPS_API_KEY;
  }
  // Poi controlla settings azienda
  const setting = await prisma.setting.findUnique({
    where: { companyId_chiave: { companyId, chiave: "google_maps_api_key" } },
  });
  return setting?.valore || null;
}

// POST: calcola rotta tra punti
export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    const apiKey = await getGoogleMapsKey(companyId);

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key non configurata. Vai su Impostazioni per inserirla." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "route": {
        const { origineLat, origineLng, destinazioneLat, destinazioneLng } = body;
        const result = await calcolaRotta({
          origineLat,
          origineLng,
          destinazioneLat,
          destinazioneLng,
          apiKey,
        });
        return NextResponse.json(result);
      }

      case "multiStop": {
        const { punti, ottimizzaOrdine } = body;
        const result = await calcolaRottaMultiStop({
          punti,
          apiKey,
          ottimizzaOrdine,
        });
        return NextResponse.json(result);
      }

      case "geocode": {
        const { indirizzo } = body;
        const result = await geocodifica({ indirizzo, apiKey });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: "Azione non supportata. Usa: route, multiStop, geocode" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Routing API error:", error);
    const message = error instanceof Error ? error.message : "Errore routing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
