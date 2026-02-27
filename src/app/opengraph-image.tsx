import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FleetMind - AI Dispatch Planner per la logistica italiana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🚛
          </div>
          <span
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            FleetMind
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            letterSpacing: "-2px",
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Dispatch intelligente
          <br />
          <span style={{ color: "#60a5fa" }}>per la logistica italiana</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "#71717a",
            marginTop: 24,
            textAlign: "center",
          }}
        >
          Pianifica viaggi · Gestisci compliance · Proteggi i margini
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "#3f3f46",
          }}
        >
          fleetmind.co
        </div>
      </div>
    ),
    { ...size }
  );
}
