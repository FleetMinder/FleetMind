import { NextRequest, NextResponse } from "next/server";
import { getCompanyId } from "@/lib/company";
import {
  calcolaCostoMinimo,
  verificaTariffa,
  COSTI_RIFERIMENTO,
} from "@/lib/costi-minimi-mit";

// GET: restituisce le tabelle costi minimi MIT
export async function GET() {
  try {
    await getCompanyId(); // verifica auth
    return NextResponse.json({
      aggiornamento: "Giugno 2025",
      decretoRiferimento: "D.D. n.279 del 5 agosto 2025",
      tabelle: COSTI_RIFERIMENTO,
    });
  } catch (error) {
    console.error("Costi minimi GET error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento costi minimi" },
      { status: 500 }
    );
  }
}

// POST: calcola costo minimo per una tratta specifica
export async function POST(request: NextRequest) {
  try {
    await getCompanyId(); // verifica auth
    const body = await request.json();

    const { pesoVeicoloKg, distanzaKm, tariffaProposta, durataOre } = body;

    if (!pesoVeicoloKg || !distanzaKm) {
      return NextResponse.json(
        { error: "Parametri mancanti: pesoVeicoloKg e distanzaKm sono obbligatori" },
        { status: 400 }
      );
    }

    const costoMinimo = calcolaCostoMinimo({
      pesoVeicoloKg,
      distanzaKm,
      durataOre,
    });

    let verifica = null;
    if (tariffaProposta !== undefined) {
      verifica = verificaTariffa({
        pesoVeicoloKg,
        distanzaKm,
        tariffaProposta,
      });
    }

    return NextResponse.json({
      calcolo: costoMinimo,
      verifica,
    });
  } catch (error) {
    console.error("Costi minimi POST error:", error);
    return NextResponse.json(
      { error: "Errore nel calcolo costi minimi" },
      { status: 500 }
    );
  }
}
