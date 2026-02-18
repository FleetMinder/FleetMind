"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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

interface FleetMapProps {
  drivers: Driver[];
  trips: Trip[];
}

const MapContent = dynamic(() => import("./map-content"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-card rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Caricamento mappa...</p>
    </div>
  ),
});

export function FleetMap({ drivers, trips }: FleetMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-card rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Caricamento mappa...</p>
      </div>
    );
  }

  return <MapContent drivers={drivers} trips={trips} />;
}
