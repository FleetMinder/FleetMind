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
  driver: { nome: string; cognome: string };
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

const driverIcon = (stato: string) => {
  const color =
    stato === "disponibile"
      ? "#22c55e"
      : stato === "in_viaggio"
      ? "#3b82f6"
      : stato === "riposo"
      ? "#eab308"
      : "#6b7280";

  return L.divIcon({
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const lezIcon = () =>
  L.divIcon({
    html: `<div style="font-size:16px;line-height:1">⚠️</div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

function assignmentPolylineColor(assignment: AssignmentMapPoint): string {
  if (assignment.blocked) return "#ef4444";       // rosso
  if (assignment.score === assignment.maxScore) return "#22c55e"; // verde
  if (assignment.score >= 5) return "#f59e0b";    // giallo
  return "#ef4444";                               // rosso per score basso
}

const ITALY_CENTER: [number, number] = [45.4642, 9.19];

export default function MapContent({ drivers, trips, assignments }: MapContentProps) {
  const routeColors = ["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#8b5cf6", "#ec4899"];

  return (
    <MapContainer
      center={ITALY_CENTER}
      zoom={8}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Driver markers */}
      {drivers
        .filter((d) => d.latitudine && d.longitudine)
        .map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.latitudine!, driver.longitudine!]}
            icon={driverIcon(driver.stato)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">
                  {driver.nome} {driver.cognome}
                </p>
                <p className="capitalize">{driver.stato.replace("_", " ")}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Assignment polylines (nuova modalità agentica) */}
      {assignments && assignments.map((a) => {
        if (!a.mittenteLat || !a.mittenteLng || !a.destinatarioLat || !a.destinatarioLng) {
          return null;
        }
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
                  <span
                    style={{ color }}
                    className="font-bold"
                  >
                    {a.score}/{a.maxScore}
                  </span>
                  {a.blocked && " ⛔ BLOCCATO"}
                </p>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* LEZ warning markers su destinazioni con warning */}
      {assignments &&
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

      {/* Trip routes (modalità classica — usata dalla dashboard) */}
      {(!assignments || assignments.length === 0) &&
        trips.map((trip, index) => {
          const points: [number, number][] = [];
          trip.orders.forEach((order) => {
            if (order.mittenteLat && order.mittenteLng) {
              points.push([order.mittenteLat, order.mittenteLng]);
            }
            if (order.destinatarioLat && order.destinatarioLng) {
              points.push([order.destinatarioLat, order.destinatarioLng]);
            }
          });

          if (points.length < 2) return null;

          return (
            <Polyline
              key={trip.id}
              positions={points}
              color={routeColors[index % routeColors.length]}
              weight={3}
              opacity={0.7}
              dashArray="8 4"
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">
                    {trip.driver.nome} {trip.driver.cognome}
                  </p>
                  <p>{trip.orders.map((o) => o.destinatarioCitta).join(" → ")}</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}
    </MapContainer>
  );
}
