-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "adrPatentino" TEXT,
ADD COLUMN     "adrScadenza" TIMESTAMP(3),
ADD COLUMN     "cartaCQCTipo" TEXT,
ADD COLUMN     "oreGuidaGiorno" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "adrAbilitato" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adrScadenza" TIMESTAMP(3),
ADD COLUMN     "assicurazioneScadenza" TIMESTAMP(3),
ADD COLUMN     "bolloScadenza" TIMESTAMP(3),
ADD COLUMN     "classeEuro" TEXT,
ADD COLUMN     "pesoComplessivoKg" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ComplianceAlert" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "entitaTipo" TEXT NOT NULL,
    "entitaId" TEXT NOT NULL,
    "entitaNome" TEXT NOT NULL,
    "messaggio" TEXT NOT NULL,
    "dataScadenza" TIMESTAMP(3),
    "risolto" BOOLEAN NOT NULL DEFAULT false,
    "risoltoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplianceAlert_companyId_idx" ON "ComplianceAlert"("companyId");

-- CreateIndex
CREATE INDEX "ComplianceAlert_companyId_risolto_idx" ON "ComplianceAlert"("companyId", "risolto");

-- CreateIndex
CREATE INDEX "ComplianceAlert_severity_idx" ON "ComplianceAlert"("severity");
