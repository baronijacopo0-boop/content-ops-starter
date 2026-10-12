import type { Metadata } from 'next';
import Link from 'next/link';
import { legal, profile } from '@/data/profile';
import { pageMetadata } from '@/lib/site';
import { LegalPage, Todo } from '@/components/layout/LegalPage';

export const metadata: Metadata = pageMetadata({
    title: 'Cookie Policy',
    description: `Informazioni sull’uso dei cookie nel sito di ${profile.fullName}.`,
    path: '/cookie-policy',
    index: legal.reviewed
});

export default function CookiePolicyPage() {
    return (
        <LegalPage title="Cookie Policy">
            <p>
                I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo dell’utente, dove vengono memorizzati per essere poi ritrasmessi
                agli stessi siti alla visita successiva.
            </p>

            <h2>Cookie utilizzati da questo sito</h2>
            <p>
                Nella sua configurazione attuale questo sito{' '}
                <strong>non utilizza cookie di profilazione né strumenti di analisi statistica di terze parti</strong>. Eventuali cookie o strumenti tecnici
                strettamente necessari al funzionamento del sito non richiedono il consenso dell’utente, in conformità alle Linee guida del Garante per la
                protezione dei dati personali del 10 giugno 2021.
            </p>
            <p>
                Per questo motivo il sito non mostra un banner per la raccolta del consenso.{' '}
                <Todo>verificare prima della pubblicazione che la configurazione dell’hosting non aggiunga cookie non tecnici</Todo>
            </p>
            <p>I caratteri tipografici sono ospitati direttamente sul sito: la loro visualizzazione non comporta connessioni a server di terze parti.</p>

            <h2>Calendario di prenotazione (Google Calendar)</h2>
            <p>
                Se è attiva la prenotazione online, il calendario delle disponibilità è un servizio di Google LLC incorporato nel sito.{' '}
                <strong>Viene caricato solo se l’utente sceglie di visualizzarlo</strong> premendo il pulsante “Mostra le disponibilità”: prima di quel momento
                non avviene alcuna connessione ai server di Google. Una volta caricato, Google può utilizzare cookie e trattare dati di navigazione secondo la
                propria{' '}
                <a href="https://policies.google.com/privacy?hl=it" target="_blank" rel="noopener noreferrer">
                    informativa privacy
                </a>
                . In alternativa è sempre possibile aprire il calendario in una nuova finestra o usare il modulo di contatto.
            </p>

            <h2>Link a siti esterni</h2>
            <p>
                Il sito contiene collegamenti a servizi esterni (ad esempio Google Maps, WhatsApp o piattaforme di recensioni). Questi servizi vengono raggiunti
                solo se l’utente sceglie di aprirli e sono regolati dalle rispettive informative sulla privacy e sui cookie.
            </p>

            <h2>Eventuali strumenti futuri</h2>
            <p>
                Qualora in futuro venissero introdotti strumenti di analisi o di marketing che utilizzano cookie non tecnici, il sito richiederà il consenso
                preventivo dell’utente tramite un apposito banner, e la presente informativa sarà aggiornata.
            </p>

            <h2>Gestione dei cookie dal browser</h2>
            <p>
                È sempre possibile gestire o eliminare i cookie tramite le impostazioni del proprio browser. Per maggiori informazioni sul trattamento dei dati
                personali consulta la <Link href="/privacy">Privacy Policy</Link>.
            </p>
        </LegalPage>
    );
}
