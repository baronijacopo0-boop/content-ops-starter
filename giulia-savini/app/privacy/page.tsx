import type { Metadata } from 'next';
import Link from 'next/link';
import { legal, profile } from '@/data/profile';
import { formatAddress } from '@/lib/site';
import { pageMetadata } from '@/lib/site';
import { LegalPage, Todo } from '@/components/layout/LegalPage';

export const metadata: Metadata = pageMetadata({
    title: 'Privacy Policy',
    description: `Informativa sul trattamento dei dati personali del sito di ${profile.fullName}.`,
    path: '/privacy',
    index: legal.reviewed
});

export default function PrivacyPage() {
    return (
        <LegalPage title="Privacy Policy">
            <p>
                Questa informativa descrive come vengono trattati i dati personali degli utenti che visitano il sito e che inviano una richiesta di contatto, ai
                sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 («GDPR») e della normativa italiana applicabile.
            </p>

            <h2>1. Titolare del trattamento</h2>
            <p>
                <strong>{profile.fullName}</strong>
                <br />
                {formatAddress()}
                <br />
                P. IVA {profile.vatNumber}
                <br />
                Email: {profile.email ?? <Todo>indirizzo email di contatto per la privacy</Todo>}
            </p>

            <h2>2. Dati trattati</h2>
            <ul>
                <li>
                    <strong>Dati di navigazione</strong>: informazioni tecniche (ad esempio indirizzo IP, tipo di browser, data e ora della richiesta) raccolte
                    automaticamente dai sistemi del fornitore di hosting per garantire il funzionamento e la sicurezza del sito.
                </li>
                <li>
                    <strong>Dati forniti volontariamente</strong> tramite il modulo di contatto: nome, indirizzo email, numero di telefono (facoltativo),
                    modalità preferita per l’incontro e testo del messaggio.
                </li>
            </ul>
            <p>
                Ti invitiamo a <strong>non inserire nel modulo informazioni relative alla salute</strong> o altri dati particolari: per una prima richiesta sono
                sufficienti poche righe. Eventuali informazioni di questo tipo saranno trattate solo nella misura strettamente necessaria a rispondere.
            </p>

            <h2>3. Finalità e basi giuridiche</h2>
            <ul>
                <li>
                    Rispondere alle richieste di informazioni e di primo colloquio inviate dall’utente: esecuzione di misure precontrattuali adottate su
                    richiesta dell’interessato (art. 6, par. 1, lett. b GDPR).
                </li>
                <li>Garantire la sicurezza e il corretto funzionamento del sito: legittimo interesse del titolare (art. 6, par. 1, lett. f GDPR).</li>
            </ul>

            <h2>4. Modalità e tempi di conservazione</h2>
            <p>
                I dati sono trattati con strumenti elettronici e misure organizzative adeguate a proteggerne la riservatezza. I dati inviati tramite il modulo
                di contatto sono conservati per il tempo necessario a gestire la richiesta e comunque non oltre <Todo>periodo di conservazione</Todo>, salvo
                l’instaurarsi di un rapporto professionale.
            </p>

            <h2>5. Destinatari dei dati</h2>
            <p>I dati possono essere trattati, in qualità di responsabili del trattamento, da fornitori che erogano servizi tecnici necessari al sito:</p>
            <ul>
                <li>
                    servizio di hosting: <Todo>nome del fornitore di hosting e sede</Todo>;
                </li>
                <li>
                    servizio di invio email del modulo di contatto: <Todo>nome del fornitore email e sede</Todo>.
                </li>
            </ul>
            <p>
                Qualora un fornitore abbia sede al di fuori dello Spazio Economico Europeo, il trasferimento avviene sulla base delle garanzie previste dagli
                artt. 44 e seguenti del GDPR <Todo>da verificare per ciascun fornitore</Todo>. I dati non sono diffusi né ceduti a terzi per finalità
                commerciali.
            </p>

            <h2>6. Dati relativi ai percorsi psicologici</h2>
            <p>
                Il presente sito non raccoglie dati relativi alla salute. I dati trattati nell’ambito dei colloqui e dei percorsi psicologici sono oggetto di
                un’informativa specifica e di un consenso informato forniti all’inizio del rapporto professionale, nel rispetto del segreto professionale e del
                Codice Deontologico degli Psicologi italiani.
            </p>

            <h2>7. Diritti dell’interessato</h2>
            <p>
                In ogni momento puoi chiedere l’accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione del trattamento, la portabilità, nonché
                opporti al trattamento (artt. 15–22 GDPR), scrivendo ai recapiti del titolare indicati sopra. Hai inoltre il diritto di proporre reclamo al
                Garante per la protezione dei dati personali (
                <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
                    www.garanteprivacy.it
                </a>
                ).
            </p>

            <h2>8. Cookie</h2>
            <p>
                Per informazioni sull’uso dei cookie consulta la <Link href="/cookie-policy">Cookie Policy</Link>.
            </p>

            <h2>9. Modifiche</h2>
            <p>La presente informativa può essere aggiornata. La data dell’ultimo aggiornamento è indicata in cima alla pagina.</p>
        </LegalPage>
    );
}
