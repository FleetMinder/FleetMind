import Link from "next/link";
import { Truck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | FleetMind",
  description: "Informativa sul trattamento dei dati personali ai sensi del Reg. UE 2016/679 (GDPR).",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-700 flex items-center justify-center">
              <Truck className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold">FleetMind</span>
          </Link>
          <Link
            href="/landing"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Torna al sito
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <div className="mb-10">
          <p className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-2">Legale</p>
          <h1 className="text-3xl font-bold tracking-tight">Informativa Privacy</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Ai sensi degli artt. 13–14 del Reg. UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018.
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">Ultimo aggiornamento: febbraio 2026</p>
        </div>

        <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none space-y-8">

          <Section title="1. Titolare del trattamento">
            <p>
              Il Titolare del trattamento è la società che gestisce il servizio FleetMind, raggiungibile
              all&apos;indirizzo email{" "}
              <a href="mailto:privacy@fleetmind.co" className="text-blue-500 hover:underline">
                privacy@fleetmind.co
              </a>{" "}
              per qualsiasi questione relativa alla privacy e alla protezione dei dati.
            </p>
          </Section>

          <Section title="2. Dati raccolti e finalità">
            <p>FleetMind raccoglie e tratta le seguenti categorie di dati personali:</p>

            <SubSection title="2.1 Dati dell'utente registrato">
              <ul>
                <li><strong>Dati identificativi:</strong> nome, cognome, indirizzo email, ragione sociale aziendale.</li>
                <li><strong>Dati di accesso:</strong> token di autenticazione (magic link, Google OAuth).</li>
                <li><strong>Dati di fatturazione:</strong> gestiti direttamente da Stripe, Inc. — FleetMind non archivia numeri di carta.</li>
              </ul>
              <p>
                <strong>Base giuridica:</strong> esecuzione del contratto di abbonamento (art. 6, par. 1, lett. b GDPR);
                legittimo interesse per la sicurezza del servizio (lett. f).
              </p>
            </SubSection>

            <SubSection title="2.2 Dati degli autisti">
              <p>
                Gli utenti aziendali inseriscono nella piattaforma dati relativi ai propri autisti dipendenti, tra cui:
                nome, cognome, <strong>codice fiscale</strong>, numero patente, categorie patente, scadenze CQC,
                abilitazione ADR, ore di guida settimanali.
              </p>
              <p>
                FleetMind tratta questi dati in qualità di <strong>Responsabile del trattamento</strong> (art. 28 GDPR)
                per conto dell&apos;azienda cliente, che rimane Titolare del trattamento nei confronti dei propri dipendenti.
              </p>
              <p>
                <strong>Base giuridica (per il Titolare aziendale):</strong> adempimento di obblighi legali in materia
                di sicurezza stradale e di trasporto (Reg. CE 561/2006, D.Lgs. 286/2005, normativa ADR);
                esecuzione del contratto di lavoro.
              </p>
            </SubSection>

            <SubSection title="2.3 Dati operativi">
              <ul>
                <li>Ordini di trasporto, viaggi, tratte, pesi, destinazioni.</li>
                <li>Dati di partner e clienti inseriti dall&apos;utente.</li>
                <li>Log di sistema e dati di utilizzo della piattaforma (anonimizzati ove possibile).</li>
              </ul>
            </SubSection>

            <SubSection title="2.4 Dati di navigazione e cookie">
              <p>
                Il sito utilizza cookie tecnici necessari al funzionamento (sessione di autenticazione).
                Non vengono utilizzati cookie di profilazione o di tracciamento pubblicitario di terze parti.
                Per maggiori dettagli, consulta la{" "}
                <Link href="/cookie" className="text-blue-500 hover:underline">Cookie Policy</Link>.
              </p>
            </SubSection>
          </Section>

          <Section title="3. Destinatari e responsabili del trattamento">
            <p>
              I dati sono trattati dai seguenti soggetti designati Responsabili del trattamento ai sensi dell&apos;art. 28 GDPR,
              con i quali sono stati stipulati o sono disponibili appositi accordi (DPA):
            </p>
            <table className="w-full text-xs border-collapse mt-3">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left py-2 pr-4 font-semibold text-zinc-600 dark:text-zinc-400">Fornitore</th>
                  <th className="text-left py-2 pr-4 font-semibold text-zinc-600 dark:text-zinc-400">Servizio</th>
                  <th className="text-left py-2 font-semibold text-zinc-600 dark:text-zinc-400">Sede</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {[
                  ["Neon, Inc.", "Database PostgreSQL (hosting dati)", "USA — clausole standard UE"],
                  ["Vercel, Inc.", "Hosting applicazione web", "USA — clausole standard UE"],
                  ["Stripe, Inc.", "Elaborazione pagamenti", "USA — clausole standard UE"],
                  ["Resend, Inc.", "Invio email transazionali (magic link)", "USA — clausole standard UE"],
                  ["Anthropic, PBC", "Elaborazione AI per dispatch logistico", "USA — clausole standard UE"],
                  ["Google LLC", "Routing e mappe (Maps API)", "USA — clausole standard UE"],
                ].map(([fornitore, servizio, sede]) => (
                  <tr key={fornitore}>
                    <td className="py-2 pr-4 font-medium">{fornitore}</td>
                    <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{servizio}</td>
                    <td className="py-2 text-zinc-500 dark:text-zinc-500">{sede}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-zinc-500">
              Il trasferimento verso Paesi terzi avviene sulla base di Clausole Contrattuali Standard (SCC)
              approvate dalla Commissione Europea (art. 46 GDPR).
            </p>
          </Section>

          <Section title="4. Periodo di conservazione">
            <ul>
              <li><strong>Dati account e aziendali:</strong> per tutta la durata del contratto + 10 anni (obblighi fiscali e civilistici).</li>
              <li><strong>Dati autisti:</strong> per la durata del rapporto contrattuale con l&apos;azienda cliente + 5 anni dalla cessazione (documentazione compliance trasporti).</li>
              <li><strong>Log di sistema:</strong> 90 giorni.</li>
              <li><strong>Cookie di sessione:</strong> fino alla scadenza della sessione o al logout.</li>
            </ul>
            <p>
              Al termine del contratto di abbonamento, i dati vengono resi disponibili per l&apos;esportazione
              per 30 giorni, dopodiché vengono eliminati o anonimizzati entro 90 giorni.
            </p>
          </Section>

          <Section title="5. Diritti degli interessati">
            <p>
              Gli interessati (utenti, autisti) hanno diritto di esercitare, in qualsiasi momento,
              i seguenti diritti ai sensi degli artt. 15–22 GDPR:
            </p>
            <ul>
              <li><strong>Accesso</strong> (art. 15): ottenere conferma del trattamento e copia dei dati.</li>
              <li><strong>Rettifica</strong> (art. 16): correggere dati inesatti o incompleti.</li>
              <li><strong>Cancellazione</strong> (art. 17): richiedere la cancellazione (&ldquo;diritto all&apos;oblio&rdquo;).</li>
              <li><strong>Limitazione</strong> (art. 18): ottenere la limitazione del trattamento.</li>
              <li><strong>Portabilità</strong> (art. 20): ricevere i dati in formato strutturato e leggibile da macchina.</li>
              <li><strong>Opposizione</strong> (art. 21): opporsi al trattamento basato su legittimo interesse.</li>
            </ul>
            <p>
              Le richieste vanno inviate a{" "}
              <a href="mailto:privacy@fleetmind.co" className="text-blue-500 hover:underline">
                privacy@fleetmind.co
              </a>
              . Il riscontro è fornito entro 30 giorni (prorogabili di ulteriori 60 in casi complessi).
            </p>
            <p>
              È inoltre possibile proporre reclamo all&apos;autorità di controllo nazionale:
              <strong> Garante per la protezione dei dati personali</strong> (
              <a href="https://www.gpdp.it" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                www.gpdp.it
              </a>
              ).
            </p>
          </Section>

          <Section title="6. Sicurezza">
            <p>
              FleetMind adotta misure tecniche e organizzative appropriate per proteggere i dati da accesso
              non autorizzato, perdita, distruzione o divulgazione, tra cui: crittografia TLS in transito,
              crittografia a riposo, controllo degli accessi basato su ruoli, autenticazione senza password.
            </p>
            <p>
              In caso di violazione dei dati (data breach) con rischio per i diritti degli interessati,
              il Garante sarà notificato entro 72 ore ai sensi dell&apos;art. 33 GDPR.
            </p>
          </Section>

          <Section title="7. Modifiche alla presente informativa">
            <p>
              FleetMind si riserva il diritto di aggiornare la presente informativa. Le modifiche
              sostanziali vengono comunicate via email agli utenti registrati con almeno 15 giorni di preavviso.
              L&apos;uso continuato del servizio dopo tale data costituisce accettazione delle modifiche.
            </p>
          </Section>

          <Section title="8. Contatti">
            <p>
              Per qualsiasi domanda relativa al trattamento dei tuoi dati personali, contattaci a:{" "}
              <a href="mailto:privacy@fleetmind.co" className="text-blue-500 hover:underline">
                privacy@fleetmind.co
              </a>
            </p>
          </Section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 py-6">
        <div className="max-w-3xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 dark:text-zinc-600">
          <span>&copy; 2026 FleetMind</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors font-medium text-zinc-500 dark:text-zinc-500">Privacy</Link>
            <Link href="/termini" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Termini</Link>
            <Link href="/landing" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1.5">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
