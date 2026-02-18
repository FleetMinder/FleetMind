# FleetMind - AI Dispatch Planner

Piattaforma SaaS di pianificazione intelligente dei trasporti su gomma per aziende italiane.
Utilizza **Claude AI** per l'assegnazione automatica di ordini, autisti e mezzi ottimizzando rotte, costi e conformita normativa EU.

## Stack Tecnologico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL con Prisma ORM
- **AI Engine**: Anthropic Claude API (Claude Sonnet)
- **Mappe**: Leaflet.js + OpenStreetMap (CartoDB dark tiles)

## Prerequisiti

- Node.js 18+
- PostgreSQL 14+ (locale o Docker)
- API Key Anthropic (per il modulo AI Dispatch)

## Avvio Rapido

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Configura il database

Crea un database PostgreSQL chiamato `fleetmind`:

```bash
createdb fleetmind
```

Oppure con Docker:

```bash
docker run --name fleetmind-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fleetmind -p 5432:5432 -d postgres:16
```

### 3. Configura le variabili d'ambiente

Modifica il file `.env` con i tuoi valori:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fleetmind?schema=public"
ANTHROPIC_API_KEY="sk-ant-..."       # Opzionale: configurabile anche da UI in Impostazioni
ORS_API_KEY=""                        # Opzionale: openrouteservice.org
```

### 4. Esegui le migrazioni e il seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Avvia il server di sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Dati di Demo

Il seed popola il database con:

- **1 azienda**: Trasporti Bianchi Srl (Milano)
- **8 autisti** con nomi italiani, stati e ore di guida variati
- **12 mezzi** di tipi diversi (furgoni, camion, frigo, cisterne, pianali)
- **15 ordini** in vari stati con indirizzi reali del Nord Italia
- **4 partner** vettori con zone operative e rating
- **Manutenzioni** e **log attivita** di esempio

## Pagine

| Pagina | Percorso | Descrizione |
|--------|----------|-------------|
| Dashboard | `/` | KPI, mappa flotta interattiva, feed attivita |
| Ordini | `/orders` | Tabella ordini con filtri, creazione nuovo ordine |
| AI Dispatch | `/dispatch` | Pianificazione automatica con Claude AI |
| Autisti | `/drivers` | Griglia autisti, barre ore guida, alert scadenze |
| Mezzi | `/vehicles` | Griglia mezzi, stato, log manutenzioni |
| Partner | `/partners` | Vettori partner con rating e zone operative |
| Impostazioni | `/settings` | Profilo azienda, API keys, piano abbonamento |

## AI Dispatch - Cuore del Prodotto

Premendo "Pianifica con AI":

1. Raccoglie tutti gli ordini in stato `pending`
2. Recupera autisti e mezzi disponibili
3. Invia tutto a Claude con un prompt specializzato che rispetta:
   - Compatibilita tipo merce / mezzo (refrigerata -> frigo, liquidi -> cisterna)
   - Capacita peso e volume del mezzo
   - Ore di guida residue (normativa EU: max 9h/giorno, 56h/settimana)
   - Finestre orarie di carico e consegna
   - Ottimizzazione km raggruppando consegne geograficamente vicine
4. Mostra il piano con motivazione in italiano per ogni tratta
5. Permette revisione manuale prima dell'approvazione

## Script Disponibili

```bash
npm run dev          # Avvia in sviluppo
npm run build        # Build produzione
npm run db:migrate   # Esegui migrazioni Prisma
npm run db:seed      # Esegui seed database
npm run db:studio    # Apri Prisma Studio (GUI database)
npm run db:reset     # Reset completo database
```

## Struttura Progetto

```
src/
├── app/
│   ├── api/           # API Routes
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── drivers/
│   │   ├── vehicles/
│   │   ├── partners/
│   │   ├── settings/
│   │   └── dispatch/  # AI Dispatch + Approve
│   ├── dispatch/      # Pagina AI Dispatch
│   ├── drivers/       # Pagina Autisti
│   ├── orders/        # Pagina Ordini
│   ├── partners/      # Pagina Partner
│   ├── settings/      # Pagina Impostazioni
│   ├── vehicles/      # Pagina Mezzi
│   ├── layout.tsx     # Layout con sidebar
│   ├── page.tsx       # Dashboard
│   └── globals.css    # Tema scuro
├── components/
│   ├── layout/        # Sidebar, PageHeader
│   ├── map/           # Leaflet map (dynamic import, no SSR)
│   ├── shared/        # Loading skeletons
│   └── ui/            # shadcn/ui components
├── lib/
│   ├── prisma.ts      # Prisma client singleton
│   ├── company.ts     # Helper azienda corrente (mock auth)
│   └── utils.ts       # Utility (cn)
prisma/
├── schema.prisma      # Schema database completo
└── seed.ts            # Dati demo realistici
```
