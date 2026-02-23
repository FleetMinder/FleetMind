/**
 * Google Maps Routing — FleetMind
 *
 * Integrazione con Google Maps Routes API per:
 * - Calcolo distanze reali (non in linea d'aria)
 * - Tempi di percorrenza con traffico
 * - Costi pedaggi autostradali
 * - Geocoding indirizzi → coordinate
 */

interface RouteResult {
  distanzaKm: number;
  durataMinuti: number;
  pedaggioEuro: number | null;
  polyline: string | null;
}

interface GeocodingResult {
  lat: number;
  lng: number;
  indirizzoFormattato: string;
}

/**
 * Calcola la rotta tra due punti usando Google Maps Directions API
 */
export async function calcolaRotta(params: {
  origineLat: number;
  origineLng: number;
  destinazioneLat: number;
  destinazioneLng: number;
  apiKey: string;
}): Promise<RouteResult> {
  const { origineLat, origineLng, destinazioneLat, destinazioneLng, apiKey } = params;

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${origineLat},${origineLng}`);
  url.searchParams.set("destination", `${destinazioneLat},${destinazioneLng}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("language", "it");
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK" || !data.routes?.[0]) {
    throw new Error(`Google Maps Directions error: ${data.status} - ${data.error_message || "Nessuna rotta trovata"}`);
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    distanzaKm: leg.distance.value / 1000,
    durataMinuti: Math.ceil(leg.duration.value / 60),
    pedaggioEuro: null, // Richiede Routes API avanzata
    polyline: route.overview_polyline?.points || null,
  };
}

/**
 * Calcola la rotta con waypoint intermedi (multi-stop)
 */
export async function calcolaRottaMultiStop(params: {
  punti: Array<{ lat: number; lng: number }>;
  apiKey: string;
  ottimizzaOrdine?: boolean;
}): Promise<{
  distanzaTotaleKm: number;
  durataTotaleMinuti: number;
  legs: Array<{
    distanzaKm: number;
    durataMinuti: number;
  }>;
  polyline: string | null;
  ordineOttimizzato: number[] | null;
}> {
  if (params.punti.length < 2) {
    throw new Error("Servono almeno 2 punti per calcolare una rotta");
  }

  const origin = params.punti[0];
  const destination = params.punti[params.punti.length - 1];
  const waypoints = params.punti.slice(1, -1);

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("language", "it");
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", params.apiKey);

  if (waypoints.length > 0) {
    const prefix = params.ottimizzaOrdine ? "optimize:true|" : "";
    const wpString = waypoints.map(w => `${w.lat},${w.lng}`).join("|");
    url.searchParams.set("waypoints", `${prefix}${wpString}`);
  }

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK" || !data.routes?.[0]) {
    throw new Error(`Google Maps Directions error: ${data.status}`);
  }

  const route = data.routes[0];
  const legs = route.legs.map((leg: { distance: { value: number }; duration: { value: number } }) => ({
    distanzaKm: leg.distance.value / 1000,
    durataMinuti: Math.ceil(leg.duration.value / 60),
  }));

  return {
    distanzaTotaleKm: legs.reduce((sum: number, l: { distanzaKm: number }) => sum + l.distanzaKm, 0),
    durataTotaleMinuti: legs.reduce((sum: number, l: { durataMinuti: number }) => sum + l.durataMinuti, 0),
    legs,
    polyline: route.overview_polyline?.points || null,
    ordineOttimizzato: route.waypoint_order || null,
  };
}

/**
 * Geocoding: indirizzo → coordinate
 */
export async function geocodifica(params: {
  indirizzo: string;
  apiKey: string;
}): Promise<GeocodingResult> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", params.indirizzo);
  url.searchParams.set("region", "it");
  url.searchParams.set("language", "it");
  url.searchParams.set("key", params.apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.[0]) {
    throw new Error(`Geocoding error: ${data.status} - Indirizzo non trovato: ${params.indirizzo}`);
  }

  const result = data.results[0];
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    indirizzoFormattato: result.formatted_address,
  };
}

/**
 * Matrice distanze tra più punti (per ottimizzazione dispatch)
 */
export async function matriceDistanze(params: {
  origini: Array<{ lat: number; lng: number; label: string }>;
  destinazioni: Array<{ lat: number; lng: number; label: string }>;
  apiKey: string;
}): Promise<{
  righe: Array<{
    origineLabel: string;
    elementi: Array<{
      destinazioneLabel: string;
      distanzaKm: number;
      durataMinuti: number;
    }>;
  }>;
}> {
  const origins = params.origini.map(o => `${o.lat},${o.lng}`).join("|");
  const destinations = params.destinazioni.map(d => `${d.lat},${d.lng}`).join("|");

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", origins);
  url.searchParams.set("destinations", destinations);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("language", "it");
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", params.apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(`Distance Matrix error: ${data.status}`);
  }

  return {
    righe: data.rows.map((row: { elements: Array<{ status: string; distance: { value: number }; duration: { value: number } }> }, i: number) => ({
      origineLabel: params.origini[i].label,
      elementi: row.elements.map((el: { status: string; distance: { value: number }; duration: { value: number } }, j: number) => ({
        destinazioneLabel: params.destinazioni[j].label,
        distanzaKm: el.status === "OK" ? el.distance.value / 1000 : -1,
        durataMinuti: el.status === "OK" ? Math.ceil(el.duration.value / 60) : -1,
      })),
    })),
  };
}

/**
 * Stima costo carburante per una tratta
 */
export function stimaCostoCarburante(params: {
  distanzaKm: number;
  consumoKmL: number;
  costoCarburanteEuroL?: number;
}): number {
  const costoLitro = params.costoCarburanteEuroL || 1.85;
  return Math.round(((params.distanzaKm / params.consumoKmL) * costoLitro) * 100) / 100;
}
