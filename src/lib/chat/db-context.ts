import { prisma } from "@/lib/prisma";

export async function getDispatchContext(companyId: string): Promise<string> {
  const [drivers, vehicles, orders, recentTrips] = await Promise.all([
    prisma.driver.findMany({
      where: { companyId },
      select: {
        id: true, nome: true, cognome: true, patenteTipo: true,
        oreGuidaGiorno: true, oreGuidaSettimana: true, stato: true,
        adrPatentino: true, patenteScadenza: true,
      },
    }),
    prisma.vehicle.findMany({
      where: { companyId },
      select: {
        id: true, targa: true, tipo: true, capacitaPesoKg: true,
        capacitaVolumeM3: true, classeEuro: true, stato: true, adrAbilitato: true,
      },
    }),
    prisma.order.findMany({
      where: { companyId, stato: "pending" },
      select: {
        id: true, codiceOrdine: true, mittenteCitta: true, destinatarioCitta: true,
        pesoKg: true, volumeM3: true, merceRefrigerata: true, mercePericolosa: true,
        urgenza: true,
      },
      take: 20,
    }),
    prisma.trip.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: { id: true, stato: true, kmTotali: true, createdAt: true },
      take: 5,
    }),
  ]);

  const available = drivers.filter(d => d.stato === "disponibile");
  const availableVehicles = vehicles.filter(v => v.stato === "disponibile");

  return `
## DATI AZIENDALI IN TEMPO REALE

### Autisti (${drivers.length} totali, ${available.length} disponibili)
${drivers.map(d => `- ${d.nome} ${d.cognome} | Patente ${d.patenteTipo} | Stato: ${d.stato} | Ore oggi: ${d.oreGuidaGiorno}h, settimana: ${d.oreGuidaSettimana}h${d.adrPatentino ? " | ADR ✓" : ""}`).join("\n")}

### Mezzi (${vehicles.length} totali, ${availableVehicles.length} disponibili)
${vehicles.map(v => `- ${v.targa} | ${v.tipo} | ${v.capacitaPesoKg}kg | Euro ${v.classeEuro || "N/A"} | ${v.stato}${v.adrAbilitato ? " | ADR ✓" : ""}`).join("\n")}

### Ordini in attesa (${orders.length})
${orders.length > 0 ? orders.map(o => `- ${o.codiceOrdine} | ${o.mittenteCitta} → ${o.destinatarioCitta} | ${o.pesoKg}kg ${o.merceRefrigerata ? "❄️" : ""} ${o.mercePericolosa ? "⚠️ADR" : ""} | ${o.urgenza}`).join("\n") : "Nessun ordine in attesa"}

### Ultimi viaggi
${recentTrips.map(t => `- ${t.stato} | ${t.kmTotali || "N/A"} km | ${t.createdAt.toLocaleDateString("it-IT")}`).join("\n")}`;
}

export async function getComplianceContext(companyId: string): Promise<string> {
  const [alerts, deadlines, drivers, vehicles] = await Promise.all([
    prisma.complianceAlert.findMany({
      where: { companyId, risolto: false },
      orderBy: { severity: "asc" },
      take: 15,
    }),
    prisma.regulatoryDeadline.findMany({
      where: { attivo: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.driver.findMany({
      where: { companyId },
      select: {
        nome: true, cognome: true, patenteScadenza: true, cqcScadenza: true,
        adrScadenza: true, tachigrafoScadenza: true, oreGuidaGiorno: true, oreGuidaSettimana: true,
      },
    }),
    prisma.vehicle.findMany({
      where: { companyId },
      select: {
        targa: true, classeEuro: true, assicurazioneScadenza: true,
        bolloScadenza: true, prossimaRevisione: true, adrAbilitato: true, adrScadenza: true,
      },
    }),
  ]);

  return `
## DATI COMPLIANCE IN TEMPO REALE

### Alert attivi (${alerts.length})
${alerts.length > 0 ? alerts.map(a => `- [${a.severity.toUpperCase()}] ${a.tipo}: ${a.entitaNome} — ${a.messaggio}${a.dataScadenza ? ` (scade: ${a.dataScadenza.toLocaleDateString("it-IT")})` : ""}`).join("\n") : "Nessun alert attivo"}

### Scadenze documenti autisti
${drivers.map(d => {
  const now = new Date();
  const items: string[] = [];
  if (d.patenteScadenza) {
    const days = Math.ceil((d.patenteScadenza.getTime() - now.getTime()) / 86400000);
    if (days < 90) items.push(`Patente: ${days} giorni`);
  }
  if (d.cqcScadenza) {
    const days = Math.ceil((d.cqcScadenza.getTime() - now.getTime()) / 86400000);
    if (days < 90) items.push(`CQC: ${days} giorni`);
  }
  if (d.adrScadenza) {
    const days = Math.ceil((d.adrScadenza.getTime() - now.getTime()) / 86400000);
    if (days < 90) items.push(`ADR: ${days} giorni`);
  }
  if (items.length === 0) return null;
  return `- ${d.nome} ${d.cognome}: ${items.join(", ")}`;
}).filter(Boolean).join("\n") || "Nessuna scadenza imminente"}

### Scadenze mezzi
${vehicles.map(v => {
  const now = new Date();
  const items: string[] = [];
  if (v.assicurazioneScadenza) {
    const days = Math.ceil((v.assicurazioneScadenza.getTime() - now.getTime()) / 86400000);
    if (days < 60) items.push(`Assicurazione: ${days}gg`);
  }
  if (v.prossimaRevisione) {
    const days = Math.ceil((v.prossimaRevisione.getTime() - now.getTime()) / 86400000);
    if (days < 60) items.push(`Revisione: ${days}gg`);
  }
  if (items.length === 0) return null;
  return `- ${v.targa}: ${items.join(", ")}`;
}).filter(Boolean).join("\n") || "Nessuna scadenza imminente"}

### Ore guida autisti
${drivers.map(d => `- ${d.nome} ${d.cognome}: ${d.oreGuidaGiorno}h oggi, ${d.oreGuidaSettimana}h settimana (max 9h/giorno, 56h/settimana)`).join("\n")}

### Calendario normativo
${deadlines.length > 0 ? deadlines.map(dl => `- ${dl.data}: ${dl.titolo} — ${dl.descrizione.substring(0, 100)}`).join("\n") : "Nessuna scadenza normativa registrata"}`;
}

export async function getSupportContext(companyId: string): Promise<string> {
  const [company, settings, driverCount, vehicleCount, orderCount] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        nome: true, citta: true, subscriptionStatus: true, trialEndsAt: true,
        onboardingCompleted: true,
      },
    }),
    prisma.setting.findMany({ where: { companyId } }),
    prisma.driver.count({ where: { companyId } }),
    prisma.vehicle.count({ where: { companyId } }),
    prisma.order.count({ where: { companyId } }),
  ]);

  const hasAnthropicKey = settings.some(s => s.chiave === "anthropic_api_key" && s.valore);
  const hasGoogleMapsKey = settings.some(s => s.chiave === "google_maps_api_key" && s.valore);
  const plan = settings.find(s => s.chiave === "piano_abbonamento")?.valore || "nessuno";

  return `
## DATI ACCOUNT IN TEMPO REALE

### Azienda
- Nome: ${company?.nome || "N/A"}
- Città: ${company?.citta || "N/A"}
- Onboarding: ${company?.onboardingCompleted ? "completato" : "non completato"}
- Piano: ${plan}
- Stato abbonamento: ${company?.subscriptionStatus || "nessuno"}
- Trial scade: ${company?.trialEndsAt ? company.trialEndsAt.toLocaleDateString("it-IT") : "N/A"}

### Configurazione
- API key Anthropic: ${hasAnthropicKey ? "configurata ✓" : "NON configurata ✗"}
- API key Google Maps: ${hasGoogleMapsKey ? "configurata ✓" : "NON configurata ✗"}
- Autisti registrati: ${driverCount}
- Mezzi registrati: ${vehicleCount}
- Ordini totali: ${orderCount}`;
}
