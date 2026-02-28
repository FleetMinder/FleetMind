import Link from "next/link";
import { Truck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termini di Servizio | FleetMind",
  description: "Condizioni generali di utilizzo della piattaforma FleetMind.",
};

export default function TerminiPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Termini di Servizio</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Condizioni generali che regolano l&apos;utilizzo della piattaforma FleetMind.
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">Ultimo aggiornamento: febbraio 2026</p>
        </div>

        <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">

          <Section title="1. Accettazione dei termini">
            <p>
              Utilizzando la piattaforma FleetMind (il &ldquo;Servizio&rdquo;), l&apos;utente accetta integralmente
              i presenti Termini di Servizio. Se agisci per conto di un&apos;azienda, dichiari di avere
              l&apos;autorità per vincolare l&apos;azienda a questi termini.
            </p>
            <p>
              Se non accetti questi termini, non puoi utilizzare il Servizio.
              I presenti Termini si applicano congiuntamente all&apos;
              <Link href="/privacy" className="text-blue-500 hover:underline">Informativa Privacy</Link>.
            </p>
          </Section>

          <Section title="2. Descrizione del servizio">
            <p>
              FleetMind è una piattaforma SaaS (Software as a Service) per la gestione di flotte di
              autotrasporto, che include funzionalità di:
            </p>
            <ul>
              <li>Pianificazione automatizzata dei viaggi tramite intelligenza artificiale (AI Dispatch);</li>
              <li>Monitoraggio della compliance normativa (Reg. CE 561/2006, ADR, CQC, revisioni);</li>
              <li>Calcolo dei costi minimi MIT per tratta;</li>
              <li>Gestione di ordini, autisti, veicoli e partner commerciali.</li>
            </ul>
            <p>
              FleetMind si riserva il diritto di modificare, aggiungere o rimuovere funzionalità in
              qualsiasi momento, con comunicazione preventiva agli utenti attivi.
            </p>
          </Section>

          <Section title="3. Registrazione e account">
            <p>
              Per accedere al Servizio è necessario creare un account aziendale. L&apos;utente è
              responsabile della riservatezza delle proprie credenziali e di tutte le attività
              svolte tramite il proprio account.
            </p>
            <p>
              L&apos;utente si impegna a fornire informazioni accurate e aggiornate durante la registrazione
              e a notificare tempestivamente eventuali accessi non autorizzati all&apos;indirizzo{" "}
              <a href="mailto:support@fleetmind.co" className="text-blue-500 hover:underline">
                support@fleetmind.co
              </a>.
            </p>
          </Section>

          <Section title="4. Trial gratuito e abbonamento">
            <SubSection title="4.1 Periodo di prova">
              <p>
                I nuovi utenti registrati accedono a un periodo di prova gratuito di <strong>14 giorni</strong>,
                senza necessità di inserire i dati di pagamento. Al termine del trial, per continuare
                a utilizzare il Servizio è necessario sottoscrivere un abbonamento a pagamento.
              </p>
            </SubSection>

            <SubSection title="4.2 Piani di abbonamento">
              <p>I piani disponibili sono:</p>
              <ul>
                <li><strong>Starter:</strong> €49/mese — fino a 10 veicoli;</li>
                <li><strong>Professional:</strong> €149/mese — fino a 30 veicoli;</li>
                <li><strong>Business:</strong> €299/mese — fino a 100 veicoli.</li>
              </ul>
              <p>
                Tutti i prezzi si intendono IVA esclusa. I piani sono rinnovati automaticamente
                ogni mese salvo disdetta.
              </p>
            </SubSection>

            <SubSection title="4.3 Pagamento e rinnovo">
              <p>
                I pagamenti sono elaborati da Stripe, Inc. L&apos;utente autorizza l&apos;addebito
                automatico mensile sul metodo di pagamento registrato. In caso di mancato pagamento,
                l&apos;accesso al Servizio può essere sospeso dopo 7 giorni di grazia.
              </p>
            </SubSection>

            <SubSection title="4.4 Disdetta">
              <p>
                L&apos;utente può disdire l&apos;abbonamento in qualsiasi momento dalla sezione
                Impostazioni. L&apos;accesso rimane attivo fino alla fine del periodo già pagato.
                Non sono previsti rimborsi per periodi parzialmente utilizzati, salvo obblighi
                di legge (es. diritto di recesso ai sensi del D.Lgs. 206/2005 per contratti a distanza
                con consumatori — non applicabile ai contratti B2B).
              </p>
            </SubSection>
          </Section>

          <Section title="5. Uso accettabile">
            <p>L&apos;utente si impegna a non:</p>
            <ul>
              <li>Utilizzare il Servizio per scopi illegali o contrari alla normativa italiana ed europea;</li>
              <li>Tentare di accedere non autorizzato ai sistemi di FleetMind o di altri utenti;</li>
              <li>Effettuare reverse engineering, decompilare o disassemblare il software;</li>
              <li>Inserire dati falsi, fraudolenti o relativi a terzi senza autorizzazione;</li>
              <li>Sovraccaricare o danneggiare intenzionalmente i sistemi (DoS, scraping massiccio);</li>
              <li>Rivendere o sublicenziare l&apos;accesso al Servizio a terzi.</li>
            </ul>
            <p>
              FleetMind si riserva il diritto di sospendere o terminare l&apos;account in caso di
              violazione del presente articolo, senza preavviso e senza rimborso.
            </p>
          </Section>

          <Section title="6. Dati e contenuti dell'utente">
            <p>
              L&apos;utente mantiene la piena titolarità dei dati inseriti nella piattaforma
              (dati di flotta, ordini, autisti, partner). FleetMind tratta tali dati esclusivamente
              per erogare il Servizio, come descritto nell&apos;
              <Link href="/privacy" className="text-blue-500 hover:underline">Informativa Privacy</Link>.
            </p>
            <p>
              L&apos;utente garantisce di avere il diritto di inserire e trattare i dati dei propri
              autisti e dipendenti conformemente alla normativa applicabile (GDPR, Statuto dei Lavoratori),
              assumendo la responsabilità di Titolare del trattamento nei loro confronti.
            </p>
            <p>
              In caso di cessazione del Servizio, l&apos;utente può esportare i propri dati entro
              30 giorni dalla data di cancellazione dell&apos;account.
            </p>
          </Section>

          <Section title="7. Intelligenza artificiale e raccomandazioni">
            <p>
              Le funzionalità di AI Dispatch forniscono <strong>suggerimenti e raccomandazioni</strong> per
              la pianificazione logistica. Tali raccomandazioni richiedono sempre revisione e approvazione
              da parte dell&apos;utente prima di essere eseguite.
            </p>
            <p>
              FleetMind non è responsabile per decisioni operative adottate sulla base delle
              raccomandazioni AI senza adeguata verifica da parte dell&apos;operatore umano.
              L&apos;utente è il solo responsabile delle operazioni di trasporto eseguite.
            </p>
            <p>
              Le informazioni sulla compliance normativa (ore guida, ADR, CQC) sono indicative
              e non sostituiscono il parere di un consulente legale o del trasporto.
            </p>
          </Section>

          <Section title="8. Proprietà intellettuale">
            <p>
              Il Servizio, inclusi software, interfaccia, loghi, marchi e documentazione,
              è di proprietà esclusiva di FleetMind e protetto dalle leggi sulla proprietà
              intellettuale. Nessun diritto viene trasferito all&apos;utente al di fuori
              della licenza d&apos;uso non esclusiva e non trasferibile per l&apos;utilizzo
              del Servizio durante il periodo di abbonamento.
            </p>
          </Section>

          <Section title="9. Limitazione di responsabilità">
            <p>
              Nei limiti consentiti dalla legge applicabile, FleetMind non è responsabile per:
            </p>
            <ul>
              <li>Perdita di dati dovuta a comportamenti dell&apos;utente o a eventi di forza maggiore;</li>
              <li>Danni indiretti, consequenziali o perdita di profitto;</li>
              <li>Interruzioni del Servizio per manutenzione pianificata (comunicata con preavviso) o cause di forza maggiore;</li>
              <li>Inaccuratezze delle informazioni normative derivanti da aggiornamenti legislativi non ancora recepiti.</li>
            </ul>
            <p>
              La responsabilità massima aggregata di FleetMind nei confronti di un utente non supera
              il totale degli importi pagati dall&apos;utente nei 3 mesi precedenti al fatto generatore del danno.
            </p>
          </Section>

          <Section title="10. Disponibilità del servizio">
            <p>
              FleetMind si impegna a garantire la disponibilità del Servizio per almeno il <strong>99,5%</strong> del
              tempo su base mensile (escluse manutenzioni pianificate comunicate con almeno 24 ore di preavviso).
              In caso di disservizi, FleetMind comunica gli aggiornamenti allo stato del servizio via email
              o tramite il sito.
            </p>
          </Section>

          <Section title="11. Modifiche ai termini">
            <p>
              FleetMind può aggiornare i presenti Termini. Le modifiche sostanziali vengono comunicate
              via email agli utenti attivi con almeno <strong>30 giorni</strong> di preavviso.
              In caso di disaccordo con le nuove condizioni, l&apos;utente può disdire l&apos;abbonamento
              prima della data di entrata in vigore. L&apos;uso continuato del Servizio dopo tale data
              costituisce accettazione delle nuove condizioni.
            </p>
          </Section>

          <Section title="12. Legge applicabile e foro competente">
            <p>
              I presenti Termini sono regolati dalla legge italiana e dall&apos;ordinamento
              dell&apos;Unione Europea. Per qualsiasi controversia è competente in via esclusiva
              il Foro di Milano, salvo diversa disposizione inderogabile di legge.
            </p>
            <p>
              Per i contratti conclusi con consumatori (non applicabile al servizio B2B FleetMind),
              si applica il Regolamento UE 524/2013 sulla risoluzione delle controversie online (ODR).
            </p>
          </Section>

          <Section title="13. Contatti">
            <p>
              Per qualsiasi domanda sui presenti Termini, scrivere a:{" "}
              <a href="mailto:legal@fleetmind.co" className="text-blue-500 hover:underline">
                legal@fleetmind.co
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
            <Link href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Privacy</Link>
            <Link href="/termini" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors font-medium text-zinc-500 dark:text-zinc-500">Termini</Link>
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
