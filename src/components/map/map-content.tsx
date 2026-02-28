"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Driver {
  id: string;
  nome: string;
  cognome: string;
  stato: string;
  latitudine: number | null;
  longitudine: number | null;
}

interface TripOrder {
  mittenteLat: number | null;
  mittenteLng: number | null;
  destinatarioLat: number | null;
  destinatarioLng: number | null;
  mittenteCitta: string;
  destinatarioCitta: string;
}

interface Trip {
  id: string;
  driver: { id: string; nome: string; cognome: string };
  orders: TripOrder[];
}

export interface AssignmentMapPoint {
  id: string;
  codiceOrdine: string;
  autistaNome: string;
  mezzoTarga: string;
  mittenteCitta: string;
  destinatarioCitta: string;
  mittenteLat: number | null;
  mittenteLng: number | null;
  destinatarioLat: number | null;
  destinatarioLng: number | null;
  score: number;
  maxScore: number;
  blocked: boolean;
  lezWarning?: boolean;
}

interface MapContentProps {
  drivers: Driver[];
  trips: Trip[];
  assignments?: AssignmentMapPoint[];
}

const TRIP_COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const driverActiveIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color}99,0 1px 3px rgba(0,0,0,0.4)"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const driverStandbyIcon = () =>
  L.divIcon({
    html: `<div style="background:#6b7280;width:8px;height:8px;border-radius:50%;border:1px solid rgba(255,255,255,0.35);opacity:0.7"></div>`,
    className: "",
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });

const partenzaIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background:rgba(0,0,0,0.65);border:2px solid ${color};color:${color};width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.5);font-family:system-ui,sans-serif;line-height:1">P</div>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const arrivoIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background:${color};border:2px solid white;color:white;width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.5);font-family:system-ui,sans-serif;line-height:1">A</div>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const lezIcon = () =>
  L.divIcon({
    html: `<div style="font-size:16px;line-height:1">⚠️</div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

function assignmentPolylineColor(assignment: AssignmentMapPoint): string {
  if (assignment.blocked) return "#ef4444";
  if (assignment.score === assignment.maxScore) return "#22c55e";
  if (assignment.score >= 5) return "#f59e0b";
  return "#ef4444";
}

const ITALY_CENTER: [number, number] = [43.0, 12.0];

export default function MapContent({ drivers, trips, assignments }: MapContentProps) {
  const isClassicMode = !assignments || assignments.length === 0;

  // Map driverId → trip color for classic mode
  const driverColorMap = new Map<string, string>();
  trips.forEach((trip, i) => {
    if (trip.driver?.id) {
      driverColorMap.set(trip.driver.id, TRIP_COLORS[i % TRIP_COLORS.length]);
    }
  });

  const activeDriverIds = new Set(trips.map((t) => t.driver?.id).filter(Boolean) as string[]);

  return (
    <MapContainer
      center={ITALY_CENTER}
      zoom={6}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* ── CLASSIC MODE (dashboard) ── */}

      {/* Trip polylines */}
      {isClassicMode && trips.map((trip, index) => {
        const color = TRIP_COLORS[index % TRIP_COLORS.length];
        const points: [number, number][] = [];
        trip.orders.forEach((order) => {
          if (order.mittenteLat && order.mittenteLng)
            points.push([order.mittenteLat, order.mittenteLng]);
          if (order.destinatarioLat && order.destinatarioLng)
            points.push([order.destinatarioLat, order.destinatarioLng]);
        });
        if (points.length < 2) return null;
        const cities = trip.orders.map((o) => o.destinatarioCitta).filter(Boolean).join(" → ");
        return (
          <Polyline
            key={trip.id}
            positions={points}
            color={color}
            weight={3}
            opacity={0.85}
          >
            <Popup>
              <div className="text-sm space-y-0.5">
                <p className="font-semibold" style={{ color }}>
                  {trip.driver.nome} {trip.driver.cognome}
                </p>
                <p className="text-zinc-400">{cities}</p>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* Partenza (P) markers */}
      {isClassicMode && trips.map((trip, index) => {
        const color = TRIP_COLORS[index % TRIP_COLORS.length];
        const first = trip.orders.find((o) => o.mittenteLat && o.mittenteLng);
        if (!first?.mittenteLat || !first?.mittenteLng) return null;
        return (
          <Marker
            key={`p-${trip.id}`}
            position={[first.mittenteLat, first.mittenteLng]}
            icon={partenzaIcon(color)}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">Partenza</p>
                <p style={{ color }}>{trip.driver.nome} {trip.driver.cognome}</p>
                <p className="text-zinc-400">{first.mittenteCitta}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Arrivo (A) markers */}
      {isClassicMode && trips.map((trip, index) => {
        const color = TRIP_COLORS[index % TRIP_COLORS.length];
        const last = [...trip.orders].reverse().find((o) => o.destinatarioLat && o.destinatarioLng);
        if (!last?.destinatarioLat || !last?.destinatarioLng) return null;
        return (
          <Marker
            key={`a-${trip.id}`}
            position={[last.destinatarioLat, last.destinatarioLng]}
            icon={arrivoIcon(color)}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">Destinazione</p>
                <p style={{ color }}>{trip.driver.nome} {trip.driver.cognome}</p>
                <p className="text-zinc-400">{last.destinatarioCitta}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Driver markers — colored by trip if active, small gray dot if standby */}
      {isClassicMode && drivers
        .filter((d) => d.latitudine && d.longitudine)
        .map((driver) => {
          const tripColor = driverColorMap.get(driver.id);
          if (activeDriverIds.has(driver.id) && tripColor) {
            return (
              <Marker
                key={driver.id}
                position={[driver.latitudine!, driver.longitudine!]}
                icon={driverActiveIcon(tripColor)}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold" style={{ color: tripColor }}>
                      {driver.nome} {driver.cognome}
                    </p>
                    <p className="text-zinc-400 capitalize">{driver.stato.replace("_", " ")}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return (
            <Marker
              key={driver.id}
              position={[driver.latitudine!, driver.longitudine!]}
              icon={driverStandbyIcon()}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{driver.nome} {driver.cognome}</p>
                  <p className="text-zinc-400 capitalize">{driver.stato.replace("_", " ")}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* ── AGENTIC MODE (dispatch) ── */}

      {/* Assignment polylines */}
      {!isClassicMode && assignments && assignments.map((a) => {
        if (!a.mittenteLat || !a.mittenteLng || !a.destinatarioLat || !a.destinatarioLng)
          return null;
        const points: [number, number][] = [
          [a.mittenteLat, a.mittenteLng],
          [a.destinatarioLat, a.destinatarioLng],
        ];
        const color = assignmentPolylineColor(a);
        return (
          <Polyline
            key={a.id}
            positions={points}
            color={color}
            weight={3}
            opacity={0.8}
            dashArray={a.blocked ? "4 4" : undefined}
          >
            <Popup>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{a.codiceOrdine}</p>
                <p>{a.autistaNome} · {a.mezzoTarga}</p>
                <p>{a.mittenteCitta} → {a.destinatarioCitta}</p>
                <p>
                  Score:{" "}
                  <span style={{ color }} className="font-bold">
                    {a.score}/{a.maxScore}
                  </span>
                  {a.blocked && " ⛔ BLOCCATO"}
                </p>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* LEZ warning markers */}
      {!isClassicMode && assignments &&
        assignments
          .filter((a) => a.lezWarning && a.destinatarioLat && a.destinatarioLng)
          .map((a) => (
            <Marker
              key={`lez-${a.id}`}
              position={[a.destinatarioLat!, a.destinatarioLng!]}
              icon={lezIcon()}
            >
              <Popup>
                <p className="text-xs">⚠️ Zona LEZ — verifica accesso per {a.mezzoTarga}</p>
              </Popup>
            </Marker>
          ))}

      {/* Driver markers in agentic mode */}
      {!isClassicMode && drivers
        .filter((d) => d.latitudine && d.longitudine)
        .map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.latitudine!, driver.longitudine!]}
            icon={driverActiveIcon(
              driver.stato === "disponibile" ? "#22c55e" :
              driver.stato === "in_viaggio" ? "#3b82f6" :
              driver.stato === "riposo" ? "#eab308" : "#6b7280"
            )}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{driver.nome} {driver.cognome}</p>
                <p className="text-zinc-400 capitalize">{driver.stato.replace("_", " ")}</p>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
