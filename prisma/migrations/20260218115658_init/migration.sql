-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('disponibile', 'in_viaggio', 'riposo', 'non_disponibile');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('furgone', 'camion', 'furgone_frigo', 'cisterna', 'pianale');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('disponibile', 'in_uso', 'manutenzione');

-- CreateEnum
CREATE TYPE "Urgenza" AS ENUM ('normale', 'urgente', 'programmato');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'assegnato', 'in_corso', 'completato', 'annullato');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('pianificato', 'approvato', 'in_corso', 'completato', 'annullato');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "indirizzo" TEXT NOT NULL,
    "citta" TEXT NOT NULL,
    "cap" TEXT NOT NULL,
    "piva" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "codiceFiscale" TEXT NOT NULL,
    "patenteTipo" TEXT NOT NULL,
    "patenteNumero" TEXT NOT NULL,
    "patenteScadenza" TIMESTAMP(3) NOT NULL,
    "cartaCQC" TEXT,
    "cqcScadenza" TIMESTAMP(3),
    "tachigrafoScadenza" TIMESTAMP(3) NOT NULL,
    "oreGuidaSettimana" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "oreRiposoRimanenti" DOUBLE PRECISION NOT NULL DEFAULT 11,
    "stato" "DriverStatus" NOT NULL DEFAULT 'disponibile',
    "telefono" TEXT,
    "latitudine" DOUBLE PRECISION,
    "longitudine" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "targa" TEXT NOT NULL,
    "tipo" "VehicleType" NOT NULL,
    "marca" TEXT NOT NULL,
    "modello" TEXT NOT NULL,
    "anno" INTEGER NOT NULL,
    "capacitaPesoKg" DOUBLE PRECISION NOT NULL,
    "capacitaVolumeM3" DOUBLE PRECISION NOT NULL,
    "consumoKmL" DOUBLE PRECISION,
    "stato" "VehicleStatus" NOT NULL DEFAULT 'disponibile',
    "kmAttuali" INTEGER NOT NULL DEFAULT 0,
    "prossimaRevisione" TIMESTAMP(3),
    "prossimaManutenzione" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "codiceOrdine" TEXT NOT NULL,
    "mittenteNome" TEXT NOT NULL,
    "mittenteIndirizzo" TEXT NOT NULL,
    "mittenteCitta" TEXT NOT NULL,
    "mittenteCAP" TEXT NOT NULL,
    "mittenteLat" DOUBLE PRECISION,
    "mittenteLng" DOUBLE PRECISION,
    "destinatarioNome" TEXT NOT NULL,
    "destinatarioIndirizzo" TEXT NOT NULL,
    "destinatarioCitta" TEXT NOT NULL,
    "destinatarioCAP" TEXT NOT NULL,
    "destinatarioLat" DOUBLE PRECISION,
    "destinatarioLng" DOUBLE PRECISION,
    "tipoMerce" TEXT NOT NULL,
    "merceRefrigerata" BOOLEAN NOT NULL DEFAULT false,
    "mercePericolosa" BOOLEAN NOT NULL DEFAULT false,
    "pesoKg" DOUBLE PRECISION NOT NULL,
    "volumeM3" DOUBLE PRECISION NOT NULL,
    "urgenza" "Urgenza" NOT NULL DEFAULT 'normale',
    "finestraCaricoDa" TIMESTAMP(3) NOT NULL,
    "finestraCaricoA" TIMESTAMP(3) NOT NULL,
    "finestraConsegnaDa" TIMESTAMP(3) NOT NULL,
    "finestraConsegnaA" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "stato" "OrderStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tripId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "routeDataJson" JSONB,
    "kmTotali" DOUBLE PRECISION,
    "tempoStimatoMinuti" INTEGER,
    "costoCarburanteStimato" DOUBLE PRECISION,
    "rationale" TEXT,
    "stato" "TripStatus" NOT NULL DEFAULT 'pianificato',
    "dataPartenza" TIMESTAMP(3),
    "dataArrivo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "piva" TEXT,
    "indirizzo" TEXT,
    "citta" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "zoneOperative" TEXT[],
    "tipiVeicoli" TEXT[],
    "costoPerKm" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "noteCollaborazione" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "costo" DOUBLE PRECISION,
    "data" TIMESTAMP(3) NOT NULL,
    "kmAlMomento" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "chiave" TEXT NOT NULL,
    "valore" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "messaggio" TEXT NOT NULL,
    "dettagli" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_piva_key" ON "Company"("piva");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_codiceFiscale_key" ON "Driver"("codiceFiscale");

-- CreateIndex
CREATE INDEX "Driver_companyId_idx" ON "Driver"("companyId");

-- CreateIndex
CREATE INDEX "Driver_stato_idx" ON "Driver"("stato");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_targa_key" ON "Vehicle"("targa");

-- CreateIndex
CREATE INDEX "Vehicle_companyId_idx" ON "Vehicle"("companyId");

-- CreateIndex
CREATE INDEX "Vehicle_stato_idx" ON "Vehicle"("stato");

-- CreateIndex
CREATE UNIQUE INDEX "Order_codiceOrdine_key" ON "Order"("codiceOrdine");

-- CreateIndex
CREATE INDEX "Order_companyId_idx" ON "Order"("companyId");

-- CreateIndex
CREATE INDEX "Order_stato_idx" ON "Order"("stato");

-- CreateIndex
CREATE INDEX "Order_urgenza_idx" ON "Order"("urgenza");

-- CreateIndex
CREATE INDEX "Trip_companyId_idx" ON "Trip"("companyId");

-- CreateIndex
CREATE INDEX "Trip_stato_idx" ON "Trip"("stato");

-- CreateIndex
CREATE INDEX "Partner_companyId_idx" ON "Partner"("companyId");

-- CreateIndex
CREATE INDEX "Maintenance_vehicleId_idx" ON "Maintenance"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_companyId_chiave_key" ON "Setting"("companyId", "chiave");

-- CreateIndex
CREATE INDEX "ActivityLog_companyId_idx" ON "ActivityLog"("companyId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
