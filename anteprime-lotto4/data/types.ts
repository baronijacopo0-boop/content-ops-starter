/**
 * Modello dati di un'anteprima.
 *
 * Regola: un campo `null` (o un array vuoto) NON viene mostrato. Nessun dato
 * va inventato: telefono, email, indirizzo, iscrizione all'Albo e simili si
 * inseriscono solo se verificati (vedi /mnt/project-files/lotto4/candidati.md).
 */

export type ThemeName = 'salvia' | 'argilla' | 'notte' | 'lavanda' | 'mare';

export type Area = {
    title: string;
    text: string;
};

export type Faq = {
    question: string;
    answer: string;
};

export type Psicologo = {
    /** Percorso dell'anteprima, es. "mario-rossi" → /mario-rossi/ */
    slug: string;
    /** "Dott." oppure "Dott.ssa" */
    honorific: 'Dott.' | 'Dott.ssa';
    firstName: string;
    lastName: string;
    /** Titolo professionale principale, es. "Psicologa · Psicoterapeuta" */
    title: string;
    /** Orientamento o scuola, es. "Psicoterapeuta cognitivo-comportamentale" */
    orientation: string | null;
    city: string;
    province: string | null;

    /** Frase breve dell'hero. Se null si usa un testo standard. */
    tagline: string | null;
    /** Presentazione in prima persona, un paragrafo per elemento. */
    bio: string[];
    education: string[];
    areas: Area[];
    /** Come lavora (approccio). Se vuoto la sezione mostra un testo standard. */
    approach: string[];
    /** Domande aggiuntive, in coda a quelle standard. */
    faq: Faq[];

    inPerson: boolean;
    online: boolean;

    /** Albo: es. { number: "12345", body: "Ordine degli Psicologi del Lazio" } */
    registration: { number: string; body: string | null } | null;
    vatNumber: string | null;

    address: {
        street: string;
        postalCode: string | null;
    } | null;
    phone: string | null;
    email: string | null;

    /** Fonti dei dati (sito attuale, profili): uso interno, non compaiono sul sito */
    sources: { label: string; url: string }[];

    theme: ThemeName;
    /** Note interne per chi prepara l'anteprima: non compaiono sul sito. */
    notes?: string;
};
