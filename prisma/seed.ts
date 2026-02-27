import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("FleetMind - Caricamento dati demo...");

  // ─── Company ───
  const company = await prisma.company.upsert({
    where: { piva: "IT02847390165" },
    update: {},
    create: {
      nome: "Trasporti Rossi S.r.l.",
      indirizzo: "Via Industriale 42",
      citta: "Bergamo",
      cap: "24126",
      piva: "IT02847390165",
      telefono: "+39 035 4284920",
      email: "info@trasportirossi.it",
      onboardingCompleted: true,
    },
  });

  console.log(`  Azienda: ${company.nome} (${company.id})`);

  // ─── Utente demo ───
  const demoEmail = "demo@fleetmind.co";
  const existingDemoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemoUser) {
    await prisma.user.create({
      data: {
        email: demoEmail,
        emailVerified: new Date(),
        nome: "Demo",
        cognome: "FleetMind",
        companyId: company.id,
        ruolo: "admin",
      },
    });
    console.log(`  Utente demo creato: ${demoEmail}`);
  } else if (!existingDemoUser.companyId) {
    await prisma.user.update({
      where: { email: demoEmail },
      data: { companyId: company.id, emailVerified: new Date() },
    });
    console.log(`  Utente demo collegato all'azienda: ${demoEmail}`);
  } else {
    console.log(`  Utente demo già esistente: ${demoEmail}`);
  }

  // ─── Settings ───
  const settings = [
    { chiave: "piano_abbonamento", valore: "professional" },
    { chiave: "costo_carburante_litro", valore: "1.78" },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { companyId_chiave: { companyId: company.id, chiave: s.chiave } },
      update: { valore: s.valore },
      create: { companyId: company.id, chiave: s.chiave, valore: s.valore },
    });
  }

  // ─── Drivers ───
  const now = new Date();
  const months = (n: number) => new Date(now.getFullYear(), now.getMonth() + n, now.getDate());
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

  const driversData = [
    {
      nome: "Marco",
      cognome: "Bianchi",
      codiceFiscale: "BNCMRC85M15F205Z",
      patenteTipo: "CE",
      patenteNumero: "BG5284920A",
      patenteScadenza: months(18),
      cartaCQC: "CQC-284920",
      cqcScadenza: months(24),
      cartaCQCTipo: "merci",
      adrPatentino: "ADR-BG-1842",
      adrScadenza: months(12),
      tachigrafoScadenza: months(8),
      oreGuidaSettimana: 28,
      oreGuidaGiorno: 6,
      oreRiposoRimanenti: 11,
      stato: "in_viaggio" as const,
      telefono: "+39 333 1842590",
      latitudine: 45.695,
      longitudine: 9.67,
    },
    {
      nome: "Luca",
      cognome: "Verdi",
      codiceFiscale: "VRDLCU90A22L219P",
      patenteTipo: "CE",
      patenteNumero: "MI9284751B",
      patenteScadenza: months(10),
      cartaCQC: "CQC-184752",
      cqcScadenza: months(14),
      cartaCQCTipo: "merci",
      adrPatentino: null,
      adrScadenza: null,
      tachigrafoScadenza: months(3),
      oreGuidaSettimana: 42,
      oreGuidaGiorno: 8.5,
      oreRiposoRimanenti: 9,
      stato: "in_viaggio" as const,
      telefono: "+39 340 5928471",
      latitudine: 42.85,
      longitudine: 12.57,
    },
    {
      nome: "Giuseppe",
      cognome: "Russo",
      codiceFiscale: "RSSGPP78T05A944Q",
      patenteTipo: "CE",
      patenteNumero: "BG3847291C",
      patenteScadenza: months(30),
      cartaCQC: "CQC-384729",
      cqcScadenza: months(20),
      cartaCQCTipo: "merci",
      adrPatentino: "ADR-BG-9284",
      adrScadenza: months(6),
      tachigrafoScadenza: months(14),
      oreGuidaSettimana: 15,
      oreGuidaGiorno: 3,
      oreRiposoRimanenti: 11,
      stato: "disponibile" as const,
      telefono: "+39 347 2948571",
      latitudine: 45.464,
      longitudine: 9.19,
    },
    {
      nome: "Alessandro",
      cognome: "Ferrari",
      codiceFiscale: "FRRLSN82E18D969K",
      patenteTipo: "C",
      patenteNumero: "TO7482910D",
      patenteScadenza: months(6),
      cartaCQC: "CQC-748291",
      cqcScadenza: months(8),
      cartaCQCTipo: "merci",
      adrPatentino: null,
      adrScadenza: null,
      tachigrafoScadenza: months(2),
      oreGuidaSettimana: 52,
      oreGuidaGiorno: 9,
      oreRiposoRimanenti: 5,
      stato: "riposo" as const,
      telefono: "+39 328 4829174",
      latitudine: 45.07,
      longitudine: 7.69,
    },
    {
      nome: "Paolo",
      cognome: "Esposito",
      codiceFiscale: "SPSPAL88S25H501R",
      patenteTipo: "CE",
      patenteNumero: "NA2847591E",
      patenteScadenza: months(12),
      cartaCQC: "CQC-284759",
      cqcScadenza: daysAgo(30), // SCADUTA
      cartaCQCTipo: "merci",
      adrPatentino: null,
      adrScadenza: null,
      tachigrafoScadenza: months(10),
      oreGuidaSettimana: 0,
      oreGuidaGiorno: 0,
      oreRiposoRimanenti: 11,
      stato: "non_disponibile" as const,
      telefono: "+39 366 7482951",
      latitudine: 45.695,
      longitudine: 9.67,
    },
  ];

  const drivers = [];
  for (const d of driversData) {
    const driver = await prisma.driver.upsert({
      where: { codiceFiscale: d.codiceFiscale },
      update: { ...d, companyId: company.id },
      create: { ...d, companyId: company.id },
    });
    drivers.push(driver);
  }
  console.log(`  Autisti: ${drivers.length}`);

  // ─── Vehicles ───
  const vehiclesData = [
    {
      targa: "FN284BG",
      tipo: "camion" as const,
      marca: "Iveco",
      modello: "S-Way 490",
      anno: 2022,
      capacitaPesoKg: 24000,
      capacitaVolumeM3: 90,
      consumoKmL: 3.2,
      stato: "disponibile" as const,
      kmAttuali: 187420,
      classeEuro: "Euro 6",
      pesoComplessivoKg: 44000,
      assicurazioneScadenza: months(7),
      bolloScadenza: months(4),
      prossimaRevisione: months(5),
      prossimaManutenzione: months(2),
      adrAbilitato: false,
      adrScadenza: null,
    },
    {
      targa: "GH491MI",
      tipo: "camion" as const,
      marca: "DAF",
      modello: "XF 480",
      anno: 2021,
      capacitaPesoKg: 24000,
      capacitaVolumeM3: 90,
      consumoKmL: 3.0,
      stato: "in_uso" as const,
      kmAttuali: 245810,
      classeEuro: "Euro 6",
      pesoComplessivoKg: 44000,
      assicurazioneScadenza: months(10),
      bolloScadenza: months(8),
      prossimaRevisione: months(3),
      prossimaManutenzione: months(1),
      adrAbilitato: false,
      adrScadenza: null,
    },
    {
      targa: "DP582TO",
      tipo: "furgone" as const,
      marca: "Iveco",
      modello: "Daily 35-160",
      anno: 2023,
      capacitaPesoKg: 1500,
      capacitaVolumeM3: 16,
      consumoKmL: 8.5,
      stato: "disponibile" as const,
      kmAttuali: 42150,
      classeEuro: "Euro 6",
      pesoComplessivoKg: 3500,
      assicurazioneScadenza: months(11),
      bolloScadenza: months(6),
      prossimaRevisione: months(10),
      prossimaManutenzione: months(4),
      adrAbilitato: false,
      adrScadenza: null,
    },
    {
      targa: "EK739BS",
      tipo: "furgone" as const,
      marca: "Mercedes",
      modello: "Sprinter 316 CDI",
      anno: 2023,
      capacitaPesoKg: 1200,
      capacitaVolumeM3: 14,
      consumoKmL: 9.0,
      stato: "disponibile" as const,
      kmAttuali: 38900,
      classeEuro: "Euro 6",
      pesoComplessivoKg: 3500,
      assicurazioneScadenza: months(9),
      bolloScadenza: months(5),
      prossimaRevisione: months(11),
      prossimaManutenzione: months(3),
      adrAbilitato: false,
      adrScadenza: null,
    },
    {
      targa: "CA918BG",
      tipo: "pianale" as const,
      marca: "Scania",
      modello: "R 450",
      anno: 2018,
      capacitaPesoKg: 18000,
      capacitaVolumeM3: 75,
      consumoKmL: 3.5,
      stato: "disponibile" as const,
      kmAttuali: 412300,
      classeEuro: "Euro 5", // Alert ban 2026!
      pesoComplessivoKg: 26000,
      assicurazioneScadenza: months(2),
      bolloScadenza: months(3),
      prossimaRevisione: months(1),
      prossimaManutenzione: daysAgo(15),
      adrAbilitato: false,
      adrScadenza: null,
    },
    {
      targa: "FL204CR",
      tipo: "furgone_frigo" as const,
      marca: "Volvo",
      modello: "FH 460 Frigo",
      anno: 2021,
      capacitaPesoKg: 18000,
      capacitaVolumeM3: 65,
      consumoKmL: 2.8,
      stato: "in_uso" as const,
      kmAttuali: 198750,
      classeEuro: "Euro 6",
      pesoComplessivoKg: 26000,
      assicurazioneScadenza: months(8),
      bolloScadenza: months(6),
      prossimaRevisione: months(7),
      prossimaManutenzione: months(2),
      adrAbilitato: false,
      adrScadenza: null,
    },
    {
      targa: "BN471PV",
      tipo: "cisterna" as const,
      marca: "MAN",
      modello: "TGX 26.510",
      anno: 2020,
      capacitaPesoKg: 24000,
      capacitaVolumeM3: 32,
      consumoKmL: 2.9,
      stato: "disponibile" as const,
      kmAttuali: 278400,
      classeEuro: "Euro 6",
      pesoComplessivoKg: 44000,
      assicurazioneScadenza: months(5),
      bolloScadenza: months(9),
      prossimaRevisione: months(4),
      prossimaManutenzione: months(1),
      adrAbilitato: true,
      adrScadenza: months(10),
    },
    {
      targa: "AL592RM",
      tipo: "camion" as const,
      marca: "Renault",
      modello: "T 480",
      anno: 2019,
      capacitaPesoKg: 18000,
      capacitaVolumeM3: 75,
      consumoKmL: 3.3,
      stato: "manutenzione" as const,
      kmAttuali: 352100,
      classeEuro: "Euro 6",
      pesoComplessivoKg: 26000,
      assicurazioneScadenza: months(3),
      bolloScadenza: months(7),
      prossimaRevisione: daysAgo(10), // Scaduta!
      prossimaManutenzione: null,
      adrAbilitato: false,
      adrScadenza: null,
    },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.upsert({
      where: { targa: v.targa },
      update: { ...v, companyId: company.id },
      create: { ...v, companyId: company.id },
    });
    vehicles.push(vehicle);
  }
  console.log(`  Veicoli: ${vehicles.length}`);

  // ─── Maintenance records ───
  const maintenances = [
    { vehicleId: vehicles[0].id, tipo: "ordinaria", descrizione: "Cambio olio e filtri", costo: 450, data: daysAgo(45), kmAlMomento: 185000 },
    { vehicleId: vehicles[0].id, tipo: "straordinaria", descrizione: "Sostituzione freni anteriori", costo: 1200, data: daysAgo(120), kmAlMomento: 178000 },
    { vehicleId: vehicles[1].id, tipo: "ordinaria", descrizione: "Tagliando 240.000 km", costo: 680, data: daysAgo(30), kmAlMomento: 243000 },
    { vehicleId: vehicles[4].id, tipo: "ordinaria", descrizione: "Cambio olio e filtri", costo: 520, data: daysAgo(60), kmAlMomento: 408000 },
    { vehicleId: vehicles[7].id, tipo: "revisione", descrizione: "Revisione periodica - IN CORSO", costo: null, data: daysAgo(3), kmAlMomento: 352100 },
    { vehicleId: vehicles[7].id, tipo: "straordinaria", descrizione: "Riparazione sospensioni pneumatiche", costo: 2800, data: daysAgo(5), kmAlMomento: 352100 },
    { vehicleId: vehicles[5].id, tipo: "ordinaria", descrizione: "Ricarica gas impianto frigo + tagliando", costo: 950, data: daysAgo(90), kmAlMomento: 192000 },
  ];

  // Clear old maintenances for these vehicles
  await prisma.maintenance.deleteMany({ where: { vehicleId: { in: vehicles.map((v) => v.id) } } });
  for (const m of maintenances) {
    await prisma.maintenance.create({ data: m });
  }
  console.log(`  Manutenzioni: ${maintenances.length}`);

  // ─── Orders ───
  const ordersData = [
    // 4 pending
    {
      codiceOrdine: "ORD-2026-001",
      mittenteNome: "Acciaierie Lombarde SpA",
      mittenteIndirizzo: "Via dell'Acciaio 15",
      mittenteCitta: "Brescia",
      mittenteCAP: "25121",
      mittenteLat: 45.539,
      mittenteLng: 10.22,
      destinatarioNome: "Cantiere Navale Fincantieri",
      destinatarioIndirizzo: "Via Trieste 50",
      destinatarioCitta: "Trieste",
      destinatarioCAP: "34121",
      destinatarioLat: 45.649,
      destinatarioLng: 13.776,
      tipoMerce: "Profilati in acciaio",
      pesoKg: 18000,
      volumeM3: 35,
      urgenza: "urgente" as const,
      finestraCaricoDa: daysAgo(-1),
      finestraCaricoA: daysAgo(-1),
      finestraConsegnaDa: daysAgo(-2),
      finestraConsegnaA: daysAgo(-2),
      stato: "pending" as const,
    },
    {
      codiceOrdine: "ORD-2026-002",
      mittenteNome: "Barilla G.e R. Fratelli SpA",
      mittenteIndirizzo: "Via Mantova 166",
      mittenteCitta: "Parma",
      mittenteCAP: "43122",
      mittenteLat: 44.801,
      mittenteLng: 10.328,
      destinatarioNome: "Esselunga Centro Distribuzione",
      destinatarioIndirizzo: "Via Giambologna 1",
      destinatarioCitta: "Firenze",
      destinatarioCAP: "50132",
      destinatarioLat: 43.77,
      destinatarioLng: 11.252,
      tipoMerce: "Prodotti alimentari secchi",
      pesoKg: 12000,
      volumeM3: 60,
      urgenza: "normale" as const,
      finestraCaricoDa: daysAgo(-1),
      finestraCaricoA: daysAgo(-1),
      finestraConsegnaDa: daysAgo(-2),
      finestraConsegnaA: daysAgo(-3),
      stato: "pending" as const,
    },
    {
      codiceOrdine: "ORD-2026-003",
      mittenteNome: "Luxottica Group",
      mittenteIndirizzo: "Via C. Cantù 2",
      mittenteCitta: "Milano",
      mittenteCAP: "20123",
      mittenteLat: 45.464,
      mittenteLng: 9.188,
      destinatarioNome: "Centro Logistico GLS",
      destinatarioIndirizzo: "Via Roma 180",
      destinatarioCitta: "Roma",
      destinatarioCAP: "00185",
      destinatarioLat: 41.898,
      destinatarioLng: 12.513,
      tipoMerce: "Occhiali e accessori",
      pesoKg: 800,
      volumeM3: 12,
      urgenza: "programmato" as const,
      finestraCaricoDa: daysAgo(-2),
      finestraCaricoA: daysAgo(-2),
      finestraConsegnaDa: daysAgo(-4),
      finestraConsegnaA: daysAgo(-4),
      stato: "pending" as const,
    },
    {
      codiceOrdine: "ORD-2026-004",
      mittenteNome: "BASF Italia",
      mittenteIndirizzo: "Via Marconato 8",
      mittenteCitta: "Cesano Maderno",
      mittenteCAP: "20811",
      mittenteLat: 45.63,
      mittenteLng: 9.15,
      destinatarioNome: "Petrolchimico di Porto Marghera",
      destinatarioIndirizzo: "Via della Chimica 5",
      destinatarioCitta: "Venezia",
      destinatarioCAP: "30175",
      destinatarioLat: 45.445,
      destinatarioLng: 12.234,
      tipoMerce: "Solventi industriali",
      mercePericolosa: true,
      pesoKg: 22000,
      volumeM3: 28,
      urgenza: "urgente" as const,
      finestraCaricoDa: daysAgo(-1),
      finestraCaricoA: daysAgo(-1),
      finestraConsegnaDa: daysAgo(-2),
      finestraConsegnaA: daysAgo(-2),
      stato: "pending" as const,
    },
    // 3 assegnati
    {
      codiceOrdine: "ORD-2026-005",
      mittenteNome: "Pirelli Tyre SpA",
      mittenteIndirizzo: "Viale Piero e Alberto Pirelli 25",
      mittenteCitta: "Milano",
      mittenteCAP: "20126",
      mittenteLat: 45.515,
      mittenteLng: 9.225,
      destinatarioNome: "Centro Distribuzione Pneumatici Sud",
      destinatarioIndirizzo: "Via Argine 310",
      destinatarioCitta: "Napoli",
      destinatarioCAP: "80147",
      destinatarioLat: 40.853,
      destinatarioLng: 14.304,
      tipoMerce: "Pneumatici",
      pesoKg: 14000,
      volumeM3: 72,
      urgenza: "normale" as const,
      finestraCaricoDa: daysAgo(0),
      finestraCaricoA: daysAgo(0),
      finestraConsegnaDa: daysAgo(-1),
      finestraConsegnaA: daysAgo(-2),
      stato: "assegnato" as const,
    },
    {
      codiceOrdine: "ORD-2026-006",
      mittenteNome: "Ferrero SpA",
      mittenteIndirizzo: "Piazzale Pietro Ferrero 1",
      mittenteCitta: "Alba",
      mittenteCAP: "12051",
      mittenteLat: 44.691,
      mittenteLng: 8.035,
      destinatarioNome: "Conad Centro Distribuzione",
      destinatarioIndirizzo: "Via Emilia Ovest 900",
      destinatarioCitta: "Bologna",
      destinatarioCAP: "40132",
      destinatarioLat: 44.494,
      destinatarioLng: 11.342,
      tipoMerce: "Prodotti dolciari",
      merceRefrigerata: true,
      pesoKg: 16000,
      volumeM3: 55,
      urgenza: "urgente" as const,
      finestraCaricoDa: daysAgo(0),
      finestraCaricoA: daysAgo(0),
      finestraConsegnaDa: daysAgo(-1),
      finestraConsegnaA: daysAgo(-1),
      stato: "assegnato" as const,
    },
    {
      codiceOrdine: "ORD-2026-007",
      mittenteNome: "Calzaturificio Moreschi",
      mittenteIndirizzo: "Via Vigevano 35",
      mittenteCitta: "Vigevano",
      mittenteCAP: "27029",
      mittenteLat: 45.317,
      mittenteLng: 8.858,
      destinatarioNome: "Rinascente Milano",
      destinatarioIndirizzo: "Piazza del Duomo",
      destinatarioCitta: "Milano",
      destinatarioCAP: "20121",
      destinatarioLat: 45.464,
      destinatarioLng: 9.19,
      tipoMerce: "Calzature di lusso",
      pesoKg: 600,
      volumeM3: 8,
      urgenza: "normale" as const,
      finestraCaricoDa: daysAgo(0),
      finestraCaricoA: daysAgo(0),
      finestraConsegnaDa: daysAgo(-1),
      finestraConsegnaA: daysAgo(-1),
      stato: "assegnato" as const,
    },
    // 3 in_corso
    {
      codiceOrdine: "ORD-2026-008",
      mittenteNome: "Brembo SpA",
      mittenteIndirizzo: "Via Brembo 25",
      mittenteCitta: "Curno",
      mittenteCAP: "24035",
      mittenteLat: 45.686,
      mittenteLng: 9.614,
      destinatarioNome: "Ferrari Maranello",
      destinatarioIndirizzo: "Via Abetone Inferiore 4",
      destinatarioCitta: "Maranello",
      destinatarioCAP: "41053",
      destinatarioLat: 44.532,
      destinatarioLng: 10.864,
      tipoMerce: "Impianti frenanti",
      pesoKg: 8000,
      volumeM3: 20,
      urgenza: "urgente" as const,
      finestraCaricoDa: daysAgo(1),
      finestraCaricoA: daysAgo(1),
      finestraConsegnaDa: daysAgo(0),
      finestraConsegnaA: daysAgo(0),
      stato: "in_corso" as const,
    },
    {
      codiceOrdine: "ORD-2026-009",
      mittenteNome: "Mutti SpA",
      mittenteIndirizzo: "Strada Traversetolo 5/A",
      mittenteCitta: "Montechiarugolo",
      mittenteCAP: "43022",
      mittenteLat: 44.695,
      mittenteLng: 10.423,
      destinatarioNome: "COOP Centro Distribuzione",
      destinatarioIndirizzo: "Via Laurentina 449",
      destinatarioCitta: "Roma",
      destinatarioCAP: "00142",
      destinatarioLat: 41.831,
      destinatarioLng: 12.486,
      tipoMerce: "Conserve alimentari",
      pesoKg: 20000,
      volumeM3: 70,
      urgenza: "normale" as const,
      finestraCaricoDa: daysAgo(1),
      finestraCaricoA: daysAgo(1),
      finestraConsegnaDa: daysAgo(0),
      finestraConsegnaA: daysAgo(-1),
      stato: "in_corso" as const,
    },
    {
      codiceOrdine: "ORD-2026-010",
      mittenteNome: "Granarolo SpA",
      mittenteIndirizzo: "Via Cadriano 27/2",
      mittenteCitta: "Bologna",
      mittenteCAP: "40127",
      mittenteLat: 44.528,
      mittenteLng: 11.395,
      destinatarioNome: "Carrefour Hub Sud",
      destinatarioIndirizzo: "Via Appia Km 45",
      destinatarioCitta: "Caserta",
      destinatarioCAP: "81100",
      destinatarioLat: 41.073,
      destinatarioLng: 14.333,
      tipoMerce: "Latticini freschi",
      merceRefrigerata: true,
      pesoKg: 15000,
      volumeM3: 50,
      urgenza: "urgente" as const,
      finestraCaricoDa: daysAgo(1),
      finestraCaricoA: daysAgo(1),
      finestraConsegnaDa: daysAgo(0),
      finestraConsegnaA: daysAgo(0),
      stato: "in_corso" as const,
    },
    // 2 completati
    {
      codiceOrdine: "ORD-2026-011",
      mittenteNome: "Same Deutz-Fahr",
      mittenteIndirizzo: "Viale F. Cassani 15",
      mittenteCitta: "Treviglio",
      mittenteCAP: "24047",
      mittenteLat: 45.519,
      mittenteLng: 9.593,
      destinatarioNome: "Concessionaria Agri-Sud",
      destinatarioIndirizzo: "SS 106 Jonica Km 340",
      destinatarioCitta: "Bari",
      destinatarioCAP: "70126",
      destinatarioLat: 41.118,
      destinatarioLng: 16.872,
      tipoMerce: "Ricambi macchine agricole",
      pesoKg: 5000,
      volumeM3: 30,
      urgenza: "programmato" as const,
      finestraCaricoDa: daysAgo(5),
      finestraCaricoA: daysAgo(5),
      finestraConsegnaDa: daysAgo(3),
      finestraConsegnaA: daysAgo(3),
      stato: "completato" as const,
    },
    {
      codiceOrdine: "ORD-2026-012",
      mittenteNome: "Mapei SpA",
      mittenteIndirizzo: "Via Cafiero 22",
      mittenteCitta: "Milano",
      mittenteCAP: "20158",
      mittenteLat: 45.498,
      mittenteLng: 9.157,
      destinatarioNome: "Edilizia Moderna Srl",
      destinatarioIndirizzo: "Via Pistoiese 400",
      destinatarioCitta: "Prato",
      destinatarioCAP: "59100",
      destinatarioLat: 43.878,
      destinatarioLng: 11.096,
      tipoMerce: "Adesivi e sigillanti edili",
      pesoKg: 22000,
      volumeM3: 40,
      urgenza: "normale" as const,
      finestraCaricoDa: daysAgo(7),
      finestraCaricoA: daysAgo(7),
      finestraConsegnaDa: daysAgo(6),
      finestraConsegnaA: daysAgo(5),
      stato: "completato" as const,
    },
  ];

  // Clear old orders and trips for this company
  await prisma.order.deleteMany({ where: { companyId: company.id } });
  await prisma.trip.deleteMany({ where: { companyId: company.id } });

  const orders = [];
  for (const o of ordersData) {
    const order = await prisma.order.create({
      data: { ...o, companyId: company.id },
    });
    orders.push(order);
  }
  console.log(`  Ordini: ${orders.length}`);

  // ─── Trips ───
  // Trip 1: Luca Verdi in viaggio con DAF XF — Brembo → Maranello + Mutti → Roma
  const trip1 = await prisma.trip.create({
    data: {
      companyId: company.id,
      driverId: drivers[1].id, // Luca Verdi
      vehicleId: vehicles[1].id, // DAF XF
      kmTotali: 580,
      tempoStimatoMinuti: 420,
      costoCarburanteStimato: 344,
      rationale: "Percorso combinato Bergamo-Maranello-Roma. Due consegne ottimizzate sulla direttrice A1.",
      stato: "in_corso",
      dataPartenza: daysAgo(1),
    },
  });

  // Link in_corso orders to trip1
  await prisma.order.update({ where: { id: orders[7].id }, data: { tripId: trip1.id } }); // Brembo→Maranello
  await prisma.order.update({ where: { id: orders[8].id }, data: { tripId: trip1.id } }); // Mutti→Roma

  // Trip 2: Granarolo → Caserta (frigo, Volvo FH)
  const trip2 = await prisma.trip.create({
    data: {
      companyId: company.id,
      driverId: drivers[0].id, // Marco Bianchi — NOTE: in realtà è "in_viaggio" ma il seed lo marca disponibile, va bene per demo
      vehicleId: vehicles[5].id, // Volvo FH Frigo
      kmTotali: 750,
      tempoStimatoMinuti: 510,
      costoCarburanteStimato: 477,
      rationale: "Trasporto refrigerato Bologna-Caserta via A1. Veicolo frigo assegnato per latticini freschi.",
      stato: "in_corso",
      dataPartenza: daysAgo(1),
    },
  });

  await prisma.order.update({ where: { id: orders[9].id }, data: { tripId: trip2.id } }); // Granarolo→Caserta

  // Trip 3: Completato — Same Deutz → Bari
  await prisma.trip.create({
    data: {
      companyId: company.id,
      driverId: drivers[2].id, // Giuseppe Russo
      vehicleId: vehicles[0].id, // Iveco S-Way
      kmTotali: 920,
      tempoStimatoMinuti: 600,
      costoCarburanteStimato: 512,
      rationale: "Consegna ricambi Treviglio-Bari via A14. Percorso più lungo ma evita pedaggi Roma.",
      stato: "completato",
      dataPartenza: daysAgo(5),
      dataArrivo: daysAgo(3),
    },
  });

  console.log(`  Trip: 3`);

  // ─── Partners ───
  const partnersData = [
    {
      nome: "Logistica Lombarda S.r.l.",
      piva: "IT03847291058",
      indirizzo: "Via Galvani 20",
      citta: "Monza",
      telefono: "+39 039 2847591",
      email: "operativo@logisticalombarda.it",
      zoneOperative: ["Lombardia", "Piemonte", "Veneto", "Emilia-Romagna"],
      tipiVeicoli: ["camion", "furgone", "pianale"],
      costoPerKm: 1.45,
      rating: 4.5,
      noteCollaborazione: "Partner affidabile, tempi di risposta rapidi. Disponibilita weekend.",
    },
    {
      nome: "Trans Meridionale Srl",
      piva: "IT07482910842",
      indirizzo: "Via Nuova Marina 33",
      citta: "Napoli",
      telefono: "+39 081 7482951",
      email: "trasporti@transmeridionale.it",
      zoneOperative: ["Campania", "Puglia", "Calabria", "Sicilia"],
      tipiVeicoli: ["camion", "furgone"],
      costoPerKm: 1.55,
      rating: 4.2,
      noteCollaborazione: "Ottima copertura Sud Italia. Tempi consegna nella media.",
    },
    {
      nome: "Express Adriatica",
      piva: "IT05928471063",
      indirizzo: "Via Flaminia 285",
      citta: "Rimini",
      telefono: "+39 0541 592847",
      email: "info@expressadriatica.it",
      zoneOperative: ["Emilia-Romagna", "Marche", "Abruzzo", "Molise"],
      tipiVeicoli: ["camion", "furgone", "pianale"],
      costoPerKm: 1.50,
      rating: 3.8,
      noteCollaborazione: "Buona copertura direttrice adriatica. Qualche ritardo sporadico.",
    },
    {
      nome: "Frigotrasporti Alpi Srl",
      piva: "IT04829174038",
      indirizzo: "Via Brennero 120",
      citta: "Bolzano",
      telefono: "+39 0471 482917",
      email: "dispatch@frigoalpi.it",
      zoneOperative: ["Trentino-Alto Adige", "Veneto", "Lombardia", "Austria", "Germania"],
      tipiVeicoli: ["furgone_frigo", "camion"],
      costoPerKm: 1.85,
      rating: 4.7,
      noteCollaborazione: "Specializzati frigo e internazionale. Premium ma eccellente servizio.",
    },
  ];

  await prisma.partner.deleteMany({ where: { companyId: company.id } });
  for (const p of partnersData) {
    await prisma.partner.create({ data: { ...p, companyId: company.id } });
  }
  console.log(`  Partner: ${partnersData.length}`);

  // ─── Compliance Alerts ───
  const alertsData = [
    {
      tipo: "scadenza_cqc",
      severity: "critico",
      entitaTipo: "driver",
      entitaId: drivers[4].id,
      entitaNome: "Paolo Esposito",
      messaggio: "CQC merci scaduta da 30 giorni. Autista non abilitato alla guida professionale.",
      dataScadenza: daysAgo(30),
    },
    {
      tipo: "ore_guida_limite",
      severity: "avviso",
      entitaTipo: "driver",
      entitaId: drivers[3].id,
      entitaNome: "Alessandro Ferrari",
      messaggio: "Ore guida settimanali a 52h su 56h massime. Riposo obbligatorio raccomandato.",
      dataScadenza: null,
    },
    {
      tipo: "scadenza_tachigrafo",
      severity: "avviso",
      entitaTipo: "driver",
      entitaId: drivers[3].id,
      entitaNome: "Alessandro Ferrari",
      messaggio: "Tachigrafo in scadenza tra 2 mesi. Programmare sostituzione/taratura.",
      dataScadenza: months(2),
    },
    {
      tipo: "scadenza_tachigrafo",
      severity: "info",
      entitaTipo: "driver",
      entitaId: drivers[1].id,
      entitaNome: "Luca Verdi",
      messaggio: "Tachigrafo in scadenza tra 3 mesi. Monitorare.",
      dataScadenza: months(3),
    },
    {
      tipo: "scadenza_revisione",
      severity: "critico",
      entitaTipo: "vehicle",
      entitaId: vehicles[7].id,
      entitaNome: "AL592RM - Renault T 480",
      messaggio: "Revisione scaduta. Veicolo non circolabile fino a completamento revisione.",
      dataScadenza: daysAgo(10),
    },
    {
      tipo: "euro5_ban",
      severity: "avviso",
      entitaTipo: "vehicle",
      entitaId: vehicles[4].id,
      entitaNome: "CA918BG - Scania R 450",
      messaggio: "Veicolo Euro 5: divieto di circolazione in comuni >100.000 abitanti dal Ottobre 2026.",
      dataScadenza: new Date(2026, 9, 1),
    },
    {
      tipo: "scadenza_assicurazione",
      severity: "avviso",
      entitaTipo: "vehicle",
      entitaId: vehicles[4].id,
      entitaNome: "CA918BG - Scania R 450",
      messaggio: "Assicurazione in scadenza tra 2 mesi. Rinnovare tempestivamente.",
      dataScadenza: months(2),
    },
    {
      tipo: "scadenza_revisione",
      severity: "info",
      entitaTipo: "vehicle",
      entitaId: vehicles[4].id,
      entitaNome: "CA918BG - Scania R 450",
      messaggio: "Prossima revisione tra 1 mese. Prenotare presso officina autorizzata.",
      dataScadenza: months(1),
    },
    {
      tipo: "scadenza_adr",
      severity: "info",
      entitaTipo: "driver",
      entitaId: drivers[2].id,
      entitaNome: "Giuseppe Russo",
      messaggio: "Patentino ADR in scadenza tra 6 mesi. Rinnovare per mantenere abilitazione cisterne.",
      dataScadenza: months(6),
    },
    {
      tipo: "scadenza_patente",
      severity: "info",
      entitaTipo: "driver",
      entitaId: drivers[3].id,
      entitaNome: "Alessandro Ferrari",
      messaggio: "Patente C in scadenza tra 6 mesi. Programmare visita medica per rinnovo.",
      dataScadenza: months(6),
    },
  ];

  await prisma.complianceAlert.deleteMany({ where: { companyId: company.id } });
  for (const a of alertsData) {
    await prisma.complianceAlert.create({ data: { ...a, companyId: company.id } });
  }
  console.log(`  Alert compliance: ${alertsData.length}`);

  // ─── Activity Log ───
  const logsData = [
    { tipo: "order_created", messaggio: "Nuovo ordine ORD-2026-001: Brescia → Trieste (18t acciaio)", createdAt: daysAgo(0) },
    { tipo: "order_created", messaggio: "Nuovo ordine ORD-2026-002: Parma → Firenze (12t alimentari)", createdAt: daysAgo(0) },
    { tipo: "order_created", messaggio: "Nuovo ordine ORD-2026-003: Milano → Roma (800kg occhiali)", createdAt: daysAgo(0) },
    { tipo: "order_created", messaggio: "Nuovo ordine ORD-2026-004: Cesano M. → Venezia (22t ADR solventi)", createdAt: daysAgo(0) },
    { tipo: "trip_planned", messaggio: "Viaggio pianificato: Luca Verdi con DAF XF — Curno → Maranello → Roma (580 km)", createdAt: daysAgo(1) },
    { tipo: "trip_planned", messaggio: "Viaggio pianificato: Marco Bianchi con Volvo FH Frigo — Bologna → Caserta (750 km)", createdAt: daysAgo(1) },
    { tipo: "driver_status", messaggio: "Alessandro Ferrari in riposo: 52h guida settimanali, riposo obbligatorio", createdAt: daysAgo(1) },
    { tipo: "compliance_alert", messaggio: "CRITICO: CQC di Paolo Esposito scaduta. Non abilitato alla guida.", createdAt: daysAgo(2) },
    { tipo: "trip_completed", messaggio: "Viaggio completato: Giuseppe Russo — Treviglio → Bari (920 km, 10h)", createdAt: daysAgo(3) },
    { tipo: "order_completed", messaggio: "Ordine ORD-2026-011 completato: consegna a Bari confermata", createdAt: daysAgo(3) },
    { tipo: "maintenance", messaggio: "Renault T (AL592RM) fermo per revisione e riparazione sospensioni", createdAt: daysAgo(3) },
    { tipo: "compliance_alert", messaggio: "AVVISO: Scania R 450 (CA918BG) Euro 5 — ban in vigore da Ott 2026", createdAt: daysAgo(5) },
    { tipo: "order_completed", messaggio: "Ordine ORD-2026-012 completato: consegna a Prato confermata", createdAt: daysAgo(5) },
    { tipo: "trip_completed", messaggio: "Viaggio completato: Milano → Prato (310 km, 4h)", createdAt: daysAgo(5) },
    { tipo: "driver_status", messaggio: "Paolo Esposito impostato come non disponibile: CQC scaduta", createdAt: daysAgo(7) },
  ];

  await prisma.activityLog.deleteMany({ where: { companyId: company.id } });
  for (const l of logsData) {
    await prisma.activityLog.create({ data: { ...l, companyId: company.id } });
  }
  console.log(`  Activity log: ${logsData.length}`);

  console.log("\nSeed completato con successo!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
