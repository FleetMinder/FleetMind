import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources";
import { prisma } from "@/lib/prisma";

// ── Fonti autorevoli per la ricerca ──────────────────────────────────────────

const AUTHORITATIVE_SOURCES = [
  {
    url: "https://www.mit.gov.it/temi/trasporti/autotrasporto-merci",
    nome: "Ministero Infrastrutture e Trasporti — Autotrasporto",
  },
  {
    url: "https://www.alboautotrasporto.it",
    nome: "Albo Nazionale Autotrasportatori",
  },
  {
    url: "https://www.gazzettaufficiale.it",
    nome: "Gazzetta Ufficiale della Repubblica Italiana",
  },
  {
    url: "https://eur-lex.europa.eu/search.html?scope=EURLEX&text=road+transport&lang=it",
    nome: "EUR-Lex — Normativa UE Trasporti",
  },
  {
    url: "https://www.confartigianato.it/rappresentanza/trasporti/",
    nome: "Confartigianato Trasporti",
  },
  {
    url: "https://unrae.it/dati-statistici/veicoli-commerciali",
    nome: "UNRAE — Dati e normative veicoli commerciali",
  },
];

// ── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: "fetch_web_page",
    description:
      "Recupera e legge il contenuto testuale di una pagina web. Usala per consultare fonti normative ufficiali (MIT, Gazzetta Ufficiale, EUR-Lex, Albo Autotrasportatori). Restituisce il testo estratto dalla pagina.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "URL completo della pagina da consultare",
        },
        motivo: {
          type: "string",
          description: "Perché stai consultando questa fonte (per l'audit trail)",
        },
      },
      required: ["url", "motivo"],
    },
  },
  {
    name: "search_regulations",
    description:
      "Cerca normative italiane ed europee sul trasporto merci su strada. Restituisce risultati di ricerca con titoli, snippet e URL. Usa query specifiche con riferimenti normativi (es. 'Reg. UE 561/2006 aggiornamento 2026').",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Query di ricerca in italiano, specifica e tecnica",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_current_deadlines",
    description:
      "Restituisce tutte le scadenze normative attualmente salvate nel database di FleetMind. Usala per confrontare con le novità trovate ed evitare duplicati.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "save_deadline",
    description:
      "Salva una nuova scadenza normativa nel database. Ogni scadenza DEVE includere almeno un riferimento normativo nelle fonti (numero legge, decreto, regolamento UE).",
    input_schema: {
      type: "object" as const,
      properties: {
        titolo: { type: "string", description: "Titolo conciso della scadenza" },
        data: { type: "string", description: "Data della scadenza (es. '1 Luglio 2026', 'In vigore', 'Trimestrale')" },
        descrizione: { type: "string", description: "Descrizione tecnica completa con riferimenti normativi" },
        sanzione: { type: "string", description: "Sanzione prevista, o null se non applicabile" },
        urgenza: { type: "string", enum: ["alta", "media", "bassa"], description: "alta=entro 6 mesi o impatto critico, media=entro 12 mesi, bassa=informativo" },
        categoria: { type: "string", enum: ["scadenza", "in_vigore"], description: "scadenza=futura, in_vigore=già attiva" },
        fonti: {
          type: "array",
          items: { type: "string" },
          description: "Array di riferimenti: URL ufficiali O riferimenti normativi (es. 'Reg. UE 1054/2020', 'DL 73/2025 art. 5')",
        },
        riferimentoLegale: {
          type: "string",
          description: "Riferimento legale principale (es. 'Reg. UE 1054/2020')",
        },
      },
      required: ["titolo", "data", "descrizione", "urgenza", "categoria", "fonti"],
    },
  },
  {
    name: "update_deadline",
    description:
      "Aggiorna una scadenza esistente nel database. Usa l'ID della scadenza ottenuto da get_current_deadlines.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "ID della scadenza da aggiornare" },
        titolo: { type: "string" },
        data: { type: "string" },
        descrizione: { type: "string" },
        sanzione: { type: "string" },
        urgenza: { type: "string", enum: ["alta", "media", "bassa"] },
        fonti: { type: "array", items: { type: "string" } },
        riferimentoLegale: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "remove_deadline",
    description:
      "Disattiva una scadenza obsoleta o errata (non la elimina, la marca come non attiva). Usa solo se una norma è stata abrogata o la data è passata da oltre 6 mesi.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "ID della scadenza da disattivare" },
        motivo: { type: "string", description: "Perché la scadenza non è più valida" },
      },
      required: ["id", "motivo"],
    },
  },
];

const SYSTEM_PROMPT = `Sei un esperto di normativa italiana ed europea sul trasporto merci su strada. Il tuo compito è aggiornare lo scadenzario normativo di FleetMind, una piattaforma di fleet management per autotrasportatori italiani.

## Come operare

1. **Prima**: chiama get_current_deadlines() per vedere lo stato attuale del database
2. **Poi**: consulta le fonti autorevoli per verificare le scadenze esistenti e cercare novità:
   - MIT (Ministero Infrastrutture e Trasporti)
   - Gazzetta Ufficiale
   - EUR-Lex per normativa UE
   - Albo Autotrasportatori
   - Confartigianato Trasporti
3. **Cerca** novità normative recenti con search_regulations()
4. **Verifica** ogni informazione consultando la fonte primaria con fetch_web_page()
5. **Aggiorna** il database: aggiungi nuove scadenze, aggiorna quelle cambiate, rimuovi quelle obsolete

## Fonti autorevoli conosciute
${AUTHORITATIVE_SOURCES.map((s) => `- ${s.nome}: ${s.url}`).join("\n")}

## Regole di qualità

- **OGNI scadenza deve avere almeno un riferimento normativo** (numero di legge, decreto, regolamento UE)
- Non inventare scadenze. Se non trovi conferma da almeno una fonte autorevole, non salvare
- Includi sempre il riferimento legale specifico (es. "Reg. UE 1054/2020", "DL 73/2025 art. 5")
- Usa urgenza "alta" solo per scadenze entro 6 mesi o con impatto critico (fermo veicolo, divieto)
- Le date devono essere precise (giorno/mese/anno) quando disponibili
- Per norme già in vigore, usa categoria "in_vigore"
- Per scadenze future, usa categoria "scadenza"

## Aree normative da monitorare

1. **Tempi di guida e riposo** — Reg. CE 561/2006, Reg. UE 2020/1054
2. **Tachigrafi** — Reg. UE 165/2014, obblighi G2V2
3. **ADR** — Trasporto merci pericolose, classificazione violazioni
4. **Patenti e CQC** — DL 286/2005, formazione continua
5. **Costi minimi MIT** — DL 73/2025, aggiornamenti trimestrali
6. **LEZ/ZTL** — Divieti Euro 4/5, accordi Bacino Padano
7. **Sicurezza veicoli** — GSR (AEB, ISA, EDR), ADAS
8. **Documenti digitali** — e-CMR, permessi EKMT
9. **Emissioni** — Euro 7, incentivi veicoli green

Processa tutto in maniera autonoma. Alla fine, scrivi un riepilogo delle azioni effettuate.`;

// ── Tool executors ───────────────────────────────────────────────────────────

interface ToolFetchWebPage { url: string; motivo: string }
interface ToolSearchRegulations { query: string }
interface ToolSaveDeadline {
  titolo: string;
  data: string;
  descrizione: string;
  sanzione?: string;
  urgenza: string;
  categoria: string;
  fonti: string[];
  riferimentoLegale?: string;
}
interface ToolUpdateDeadline {
  id: string;
  titolo?: string;
  data?: string;
  descrizione?: string;
  sanzione?: string;
  urgenza?: string;
  fonti?: string[];
  riferimentoLegale?: string;
}
interface ToolRemoveDeadline { id: string; motivo: string }

async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
): Promise<unknown> {
  switch (toolName) {
    case "fetch_web_page": {
      const { url, motivo } = toolInput as unknown as ToolFetchWebPage;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "FleetMind-RegulatoryAgent/1.0",
            Accept: "text/html,application/xhtml+xml,text/plain",
          },
        });
        clearTimeout(timeout);

        if (!res.ok) {
          return { error: `HTTP ${res.status}`, url, motivo };
        }

        const html = await res.text();
        // Estrai testo grezzo dal HTML (rimuovi tag)
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 8000); // Limita per il context window

        return { url, motivo, contenuto: text, lunghezza: text.length };
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : "Errore fetch",
          url,
          motivo,
        };
      }
    }

    case "search_regulations": {
      const { query } = toolInput as unknown as ToolSearchRegulations;
      try {
        // Usa Google Custom Search API se configurato, altrimenti DuckDuckGo lite
        const googleKey = process.env.GOOGLE_SEARCH_API_KEY;
        const googleCx = process.env.GOOGLE_SEARCH_CX;

        if (googleKey && googleCx) {
          const params = new URLSearchParams({
            key: googleKey,
            cx: googleCx,
            q: `${query} site:mit.gov.it OR site:gazzettaufficiale.it OR site:eur-lex.europa.eu OR site:alboautotrasporto.it`,
            num: "5",
            lr: "lang_it",
          });
          const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
          const data = await res.json();
          return {
            query,
            risultati: (data.items || []).map((item: { title: string; link: string; snippet: string }) => ({
              titolo: item.title,
              url: item.link,
              snippet: item.snippet,
            })),
          };
        }

        // Fallback: restituisci le fonti note come suggerimento
        return {
          query,
          nota: "API di ricerca non configurata. Consulta direttamente le fonti autorevoli con fetch_web_page.",
          fontiSuggerite: AUTHORITATIVE_SOURCES,
        };
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : "Errore ricerca",
          query,
        };
      }
    }

    case "get_current_deadlines": {
      const deadlines = await prisma.regulatoryDeadline.findMany({
        where: { attivo: true },
        orderBy: [{ categoria: "asc" }, { urgenza: "asc" }],
      });
      return {
        totale: deadlines.length,
        scadenze: deadlines.map((d) => ({
          id: d.id,
          titolo: d.titolo,
          data: d.data,
          descrizione: d.descrizione,
          sanzione: d.sanzione,
          urgenza: d.urgenza,
          categoria: d.categoria,
          fonti: d.fonti,
          riferimentoLegale: d.riferimentoLegale,
          aggiornatoIl: d.aggiornatoIl.toISOString(),
        })),
      };
    }

    case "save_deadline": {
      const input = toolInput as unknown as ToolSaveDeadline;

      // Verifica che non esista già una scadenza con titolo simile
      const existing = await prisma.regulatoryDeadline.findFirst({
        where: { titolo: input.titolo, attivo: true },
      });
      if (existing) {
        return { error: "Scadenza con questo titolo già presente", existingId: existing.id };
      }

      const deadline = await prisma.regulatoryDeadline.create({
        data: {
          titolo: input.titolo,
          data: input.data,
          descrizione: input.descrizione,
          sanzione: input.sanzione || null,
          urgenza: input.urgenza,
          categoria: input.categoria,
          fonti: input.fonti,
          riferimentoLegale: input.riferimentoLegale || null,
        },
      });

      return { success: true, id: deadline.id, titolo: deadline.titolo };
    }

    case "update_deadline": {
      const { id, ...updates } = toolInput as unknown as ToolUpdateDeadline;
      const data: Record<string, unknown> = { aggiornatoIl: new Date(), verificatoIl: new Date() };
      if (updates.titolo) data.titolo = updates.titolo;
      if (updates.data) data.data = updates.data;
      if (updates.descrizione) data.descrizione = updates.descrizione;
      if (updates.sanzione !== undefined) data.sanzione = updates.sanzione;
      if (updates.urgenza) data.urgenza = updates.urgenza;
      if (updates.fonti) data.fonti = updates.fonti;
      if (updates.riferimentoLegale) data.riferimentoLegale = updates.riferimentoLegale;

      const deadline = await prisma.regulatoryDeadline.update({
        where: { id },
        data,
      });

      return { success: true, id: deadline.id, titolo: deadline.titolo };
    }

    case "remove_deadline": {
      const { id, motivo } = toolInput as unknown as ToolRemoveDeadline;
      const deadline = await prisma.regulatoryDeadline.update({
        where: { id },
        data: { attivo: false },
      });
      return { success: true, id: deadline.id, titolo: deadline.titolo, motivo };
    }

    default:
      return { error: `Tool sconosciuto: ${toolName}` };
  }
}

// ── Main agent loop ──────────────────────────────────────────────────────────

export interface RegulatoryUpdateResult {
  aggiunte: number;
  aggiornate: number;
  rimosse: number;
  riepilogo: string;
  durataMs: number;
  fontiConsultate: string[];
}

export async function runRegulatoryAgent(
  anthropicKey: string,
  onProgress?: (message: string) => void,
): Promise<RegulatoryUpdateResult> {
  const client = new Anthropic({ apiKey: anthropicKey });
  const t0 = Date.now();

  const send = (msg: string) => {
    if (onProgress) onProgress(msg);
  };

  send("Avvio agente normativo...");

  const messages: MessageParam[] = [
    {
      role: "user",
      content: `Esegui un aggiornamento completo dello scadenzario normativo di FleetMind. La data di oggi è ${new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}.

1. Prima controlla le scadenze attualmente salvate nel database
2. Consulta le fonti autorevoli per verificare che siano corrette e aggiornate
3. Cerca novità normative recenti nel settore autotrasporto italiano
4. Aggiorna il database: aggiungi nuove scadenze, modifica quelle cambiate, rimuovi quelle obsolete
5. Alla fine, riassumi cosa hai fatto

Ricorda: ogni scadenza deve avere un riferimento normativo verificabile.`,
    },
  ];

  const MAX_TURNS = 25;
  const deadline = Date.now() + 180_000; // 3 minuti max
  let turn = 0;
  let aggiunte = 0;
  let aggiornate = 0;
  let rimosse = 0;
  let riepilogo = "";
  const fontiConsultate: string[] = [];

  while (turn < MAX_TURNS && Date.now() < deadline) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools: TOOLS,
      system: SYSTEM_PROMPT,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    // Estrai testo per il riepilogo finale
    for (const block of response.content) {
      if (block.type === "text") {
        riepilogo = block.text;
      }
    }

    if (response.stop_reason === "end_turn") break;

    if (response.stop_reason === "tool_use") {
      const toolResults: ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        send(`Tool: ${block.name}${block.name === "search_regulations" ? ` — "${(block.input as Record<string, string>).query}"` : ""}`);

        const input = block.input as Record<string, unknown>;

        // Track fonti
        if (block.name === "fetch_web_page" && input.url) {
          fontiConsultate.push(input.url as string);
        }
        if (block.name === "search_regulations" && input.query) {
          fontiConsultate.push(`[ricerca] ${input.query}`);
        }

        let result: unknown;
        try {
          result = await executeTool(block.name, input);
        } catch (err) {
          result = { error: err instanceof Error ? err.message : "Errore" };
        }

        // Track azioni
        if (block.name === "save_deadline" && (result as Record<string, unknown>)?.success) {
          aggiunte++;
          send(`Aggiunta: ${(input as unknown as ToolSaveDeadline).titolo}`);
        }
        if (block.name === "update_deadline" && (result as Record<string, unknown>)?.success) {
          aggiornate++;
        }
        if (block.name === "remove_deadline" && (result as Record<string, unknown>)?.success) {
          rimosse++;
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      messages.push({ role: "user", content: toolResults });
      turn++;
    } else {
      break;
    }
  }

  const durataMs = Date.now() - t0;

  // Log nel DB
  await prisma.regulatoryUpdateLog.create({
    data: {
      fontiUsate: fontiConsultate,
      scadenzeAggiunte: aggiunte,
      scadenzeAggiornate: aggiornate,
      scadenzeRimosse: rimosse,
      riepilogoAgente: riepilogo.slice(0, 2000),
      durataMs,
    },
  });

  send(`Completato: +${aggiunte} aggiunte, ~${aggiornate} aggiornate, -${rimosse} rimosse`);

  return { aggiunte, aggiornate, rimosse, riepilogo, durataMs, fontiConsultate };
}
