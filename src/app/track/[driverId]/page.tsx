"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";

interface DriverInfo {
  nome: string;
  cognome: string;
  stato: string;
}

type Status = "idle" | "requesting" | "tracking" | "error" | "no_gps" | "not_found";

export default function TrackPage() {
  const params = useParams();
  const driverId = params.driverId as string;

  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetch(`/api/track/${driverId}`)
      .then((r) => {
        if (!r.ok) { setStatus("not_found"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setDriver(data); })
      .catch(() => setStatus("not_found"));
  }, [driverId]);

  const sendPosition = useCallback(
    async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy: acc } = position.coords;
      setAccuracy(Math.round(acc));
      try {
        await fetch(`/api/track/${driverId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        });
        setLastUpdate(new Date());
        setCount((c) => c + 1);
        setStatus("tracking");
      } catch {
        // mantieni lo stato tracking, riproverà al prossimo fix GPS
      }
    },
    [driverId]
  );

  const startTracking = () => {
    if (!navigator.geolocation) {
      setStatus("no_gps");
      return;
    }
    setStatus("requesting");
    watchIdRef.current = navigator.geolocation.watchPosition(
      sendPosition,
      () => setStatus("error"),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus("idle");
  };

  useEffect(() => () => {
    if (watchIdRef.current !== null)
      navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  const statusColor =
    status === "tracking" ? "#22c55e" :
    status === "requesting" ? "#f59e0b" :
    status === "error" || status === "no_gps" || status === "not_found" ? "#ef4444" :
    "#6b7280";

  const statusLabel =
    status === "idle" ? "In attesa" :
    status === "requesting" ? "Ricerca segnale GPS..." :
    status === "tracking" ? "Tracking attivo" :
    status === "error" ? "Errore GPS — riprova" :
    status === "no_gps" ? "GPS non disponibile su questo dispositivo" :
    "Autista non trovato";

  if (status === "not_found") {
    return (
      <div style={styles.page}>
        <p style={{ color: "#ef4444", fontSize: 16 }}>Link non valido o autista non trovato.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Logo */}
      <div style={styles.logo}>⚡ FleetMind</div>

      {/* Driver card */}
      <div style={styles.card}>
        <div style={styles.avatar}>
          {driver ? `${driver.nome[0]}${driver.cognome[0]}` : "—"}
        </div>
        <p style={styles.name}>
          {driver ? `${driver.nome} ${driver.cognome}` : "Caricamento..."}
        </p>
        <p style={styles.role}>Autista · FleetMind</p>
      </div>

      {/* Status indicator */}
      <div style={styles.statusRow}>
        <span style={{ ...styles.dot, background: statusColor, boxShadow: status === "tracking" ? `0 0 8px ${statusColor}` : "none" }} />
        <span style={{ ...styles.statusText, color: statusColor }}>{statusLabel}</span>
      </div>

      {/* Stats */}
      {status === "tracking" && (
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{count}</span>
            <span style={styles.statLabel}>Aggiornamenti</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{accuracy ?? "—"}m</span>
            <span style={styles.statLabel}>Precisione GPS</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>
              {lastUpdate ? lastUpdate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
            </span>
            <span style={styles.statLabel}>Ultimo invio</span>
          </div>
        </div>
      )}

      {/* CTA */}
      {status === "idle" || status === "error" ? (
        <button style={styles.btnPrimary} onClick={startTracking}>
          {status === "error" ? "Riprova" : "Inizia Tracking"}
        </button>
      ) : status === "requesting" ? (
        <button style={{ ...styles.btnPrimary, opacity: 0.6 }} disabled>
          Attendi...
        </button>
      ) : (
        <button style={styles.btnSecondary} onClick={stopTracking}>
          Ferma Tracking
        </button>
      )}

      <p style={styles.note}>
        La tua posizione viene condivisa con il dispatcher FleetMind.{"\n"}
        Chiudi questa pagina per interrompere.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 20px",
    gap: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: -0.5,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "#1e3a5f",
    border: "2px solid #3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    color: "#60a5fa",
    letterSpacing: -1,
  },
  name: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: "#fff",
  },
  role: {
    margin: 0,
    fontSize: 13,
    color: "#6b7280",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
    transition: "background 0.3s",
  },
  statusText: {
    fontSize: 14,
    fontWeight: 500,
  },
  stats: {
    display: "flex",
    gap: 24,
    background: "#111",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "16px 24px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
  },
  statLabel: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  btnPrimary: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "16px 48px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    maxWidth: 320,
  },
  btnSecondary: {
    background: "transparent",
    color: "#ef4444",
    border: "1px solid #ef4444",
    borderRadius: 12,
    padding: "14px 48px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    maxWidth: 320,
  },
  note: {
    fontSize: 12,
    color: "#4b5563",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 1.5,
    whiteSpace: "pre-line",
  },
};
