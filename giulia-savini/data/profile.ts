/**
 * ============================================================================
 *  DATI DELLA PROFESSIONISTA — file unico da modificare
 * ============================================================================
 *
 *  Tutti i testi e i dati del sito sono centralizzati qui.
 *
 *  Regola: i campi impostati a `null` (o array vuoti) NON vengono mostrati
 *  sul sito. Per pubblicare un dato basta valorizzarlo.
 *  I commenti `TODO` indicano informazioni da verificare/inserire con
 *  la Dott.ssa prima della pubblicazione.
 * ============================================================================
 */

export type Review = {
    /** Testo della recensione, riportato fedelmente dalla fonte */
    text: string;
    /** Nome o iniziali come appaiono sulla fonte (es. "M.R.") */
    author: string;
    /** Data come riportata dalla fonte (es. "Marzo 2025") */
    date?: string;
    /** Nome della piattaforma (es. "GuidaPsicologi") */
    source: string;
    /** Link alla pagina della recensione */
    sourceUrl?: string;
};

export type Service = {
    slug: string;
    icon: 'user' | 'couple' | 'sexology' | 'parenting' | 'online';
    title: string;
    short: string;
    intro: string;
    forWhom: string[];
    howItWorks: string;
    seoDescription: string;
};

export const profile = {
    firstName: 'Giulia',
    lastName: 'Savini',
    name: 'Giulia Savini',
    fullName: 'Dott.ssa Giulia Savini',
    /** Sotto il logo testuale */
    shortTitle: 'Psicologa · Sessuologa',
    professionalTitle: 'Psicologa · Sessuologa Clinica',
    titles: ['Psicologa', 'Specializzata in Sessuologia Clinica', 'Psicoterapeuta Sistemico-Relazionale in formazione'],

    education: ['Laurea Magistrale in Psicologia applicata, clinica e della salute – Psicologia della devianza e sessuologia'],

    /** N° iscrizione all'Albo degli Psicologi */
    registrationNumber: '4249',
    /** TODO: indicare l'Ordine regionale di iscrizione (es. "Ordine degli Psicologi della Regione …"). Se null non viene mostrato. */
    registrationBody: null as string | null,
    vatNumber: '02177390677',

    address: {
        street: 'Viale Bovio',
        /** TODO: numero civico. Se null viene mostrato solo "Viale Bovio". */
        streetNumber: null as string | null,
        postalCode: '64100',
        city: 'Teramo',
        province: 'TE',
        region: 'Abruzzo',
        country: 'IT',
        /** TODO: eventuali indicazioni (piano, citofono, parcheggio). */
        notes: null as string | null
    },

    /** TODO: telefono professionale (es. "+39 …"). Se null non viene mostrato. */
    phone: null as string | null,
    /** TODO: email professionale. Se null non viene mostrata. */
    email: null as string | null,
    /**
     * Numero WhatsApp: si imposta con la variabile d'ambiente WHATSAPP_NUMBER
     * (vedi .env.example). Se vuota il pulsante non compare.
     */
    whatsappMessage: 'Buongiorno Dott.ssa Savini, vorrei ricevere informazioni per un primo colloquio.',

    /** TODO: profili social professionali, es. { label: 'Instagram', url: 'https://…' } */
    socialLinks: [] as { label: string; url: string }[],

    /** Profilo pubblico su piattaforma esterna (fonte delle opinioni) */
    externalProfile: {
        label: 'GuidaPsicologi',
        url: 'https://www.guidapsicologi.it/procard/dottssa-giulia-savini'
    },

    /**
     * Valutazione pubblica sulla piattaforma esterna.
     * NON viene usata nei dati strutturati Schema.org (le linee guida Google
     * escludono le recensioni raccolte da terze parti sul proprio sito).
     * Aggiornare periodicamente o impostare `show: false`.
     */
    rating: {
        show: true,
        value: '4,9',
        scale: '5',
        count: 4,
        source: 'GuidaPsicologi'
    },

    /**
     * Recensioni: inserire SOLO testi realmente pubblicati e verificabili,
     * riportati fedelmente e con la fonte. Lasciare l'array vuoto per
     * mostrare soltanto il riepilogo della valutazione con il link alla fonte.
     */
    reviews: [] as Review[],

    /**
     * Foto: è sufficiente caricare i file con questi nomi in /public/images.
     * Finché un file manca, al suo posto compare una grafica astratta oppure,
     * con SHOW_PHOTO_PLACEHOLDERS=true, una cornice demo con le indicazioni.
     * `hint` è il testo mostrato nella cornice demo.
     */
    photos: {
        hero: {
            src: '/images/giulia-savini.jpg',
            alt: 'Ritratto della Dott.ssa Giulia Savini, psicologa e sessuologa a Teramo',
            hint: 'Ritratto della Dott.ssa'
        },
        about: {
            src: '/images/giulia-savini-studio.jpg',
            alt: 'La Dott.ssa Giulia Savini nel suo studio di Teramo',
            hint: 'Foto della Dott.ssa in studio'
        },
        /** Galleria "Lo studio": se nessuna foto è presente (e la demo è spenta) la sezione non compare. */
        studio: [
            { src: '/images/studio-1.jpg', alt: 'Lo studio della Dott.ssa Giulia Savini a Teramo', hint: 'Lo studio' },
            { src: '/images/studio-2.jpg', alt: 'Uno scorcio dello studio', hint: 'Uno scorcio dello studio' },
            { src: '/images/studio-3.jpg', alt: 'Un dettaglio dello studio', hint: 'Un dettaglio' }
        ]
    },

    quote: 'Guarire non significa che la ferita non sia mai esistita, ma che non controlla più la tua vita.'
};

/* ---------------------------------------------------------------------------
 * Navigazione
 * ------------------------------------------------------------------------- */
export const navigation = [
    { label: 'Home', href: '/#top' },
    { label: 'Chi sono', href: '/#chi-sono' },
    { label: 'Percorsi', href: '/#percorsi' },
    { label: 'Approccio', href: '/#approccio' },
    { label: 'Studio e Online', href: '/#studio-online' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Contatti', href: '/#contatti' }
];

/* ---------------------------------------------------------------------------
 * Testi della homepage
 * ------------------------------------------------------------------------- */
export const content = {
    hero: {
        eyebrow: 'Psicologa · Sessuologa Clinica',
        titleLines: ['Uno spazio per ascoltarti,', 'comprenderti e'],
        titleEmphasis: 'ritrovarti.',
        text: 'Percorsi di consulenza e sostegno psicologico per individui e coppie, a Teramo e online.',
        primaryCta: 'Richiedi un primo colloquio',
        secondaryCta: 'Scopri il mio approccio',
        highlights: ['Studio a Teramo', 'Consulenze online', 'Percorsi individuali e di coppia']
    },

    intro: {
        eyebrow: 'Il percorso',
        titleLines: ['Ogni difficoltà racconta qualcosa.'],
        titleEmphasis: 'Insieme possiamo ascoltarla.',
        paragraphs: [
            'Chi chiede aiuto non è il suo sintomo. È una persona con una storia, delle relazioni, dei luoghi e dei legami che la attraversano ogni giorno.',
            'Per questo il mio lavoro parte dall’ascolto di ciò che stai vivendo all’interno del contesto in cui prende forma. Il percorso diventa così uno spazio libero dal giudizio, dove dare un senso a ciò che accade e riconoscere risorse che forse non sapevi di avere.'
        ],
        cta: 'Conosci il mio approccio'
    },

    about: {
        eyebrow: 'Chi sono',
        title: 'Piacere, sono Giulia.',
        paragraphs: [
            'Sono psicologa, specializzata in Sessuologia Clinica e in formazione come psicoterapeuta a orientamento sistemico-relazionale.',
            'Accolgo adulti, adolescenti e coppie, nel mio studio di Teramo e online. Credo in un ascolto attento e rispettoso, che guarda alla persona nella sua interezza: ai suoi legami, alla sua storia, ai contesti che abita.'
        ]
    },

    services: {
        eyebrow: 'Percorsi',
        title: 'Come posso accompagnarti',
        text: 'Ogni percorso nasce da un primo incontro e prende forma insieme, nel rispetto dei tuoi tempi.'
    },

    areas: {
        eyebrow: 'Aree di intervento',
        title: 'Possiamo lavorare insieme su…',
        items: [
            'Ansia',
            'Attacchi di panico',
            'Stress',
            'Autostima',
            'Dipendenza affettiva',
            'Difficoltà relazionali',
            'Difficoltà di coppia',
            'Problemi sessuali',
            'Trauma psicologico',
            'Disturbi dell’umore',
            'Somatizzazione',
            'Momenti di cambiamento',
            'Genitorialità',
            'Crescita personale'
        ],
        notFoundTitle: 'Non trovi qui ciò che stai vivendo?',
        notFoundText: 'Questo elenco non può raccontare tutto. Se senti il bisogno di parlarne, scrivimi: valuteremo insieme come posso esserti utile.',
        cta: 'Parliamone'
    },

    approach: {
        eyebrow: 'Approccio sistemico-relazionale',
        title: 'Non siamo isole.',
        paragraphs: [
            'Ognuno di noi vive dentro una rete di relazioni: la famiglia da cui proviene, la coppia, le amicizie, il lavoro, la società, le esperienze che ha attraversato.',
            'L’approccio sistemico-relazionale osserva il disagio non soltanto come un problema del singolo, ma anche alla luce delle dinamiche e dei contesti in cui emerge. Cambiare prospettiva su questi legami può aprire nuove possibilità di comprensione e di movimento.'
        ],
        rings: {
            center: 'Persona',
            middle: 'Relazioni',
            outer: 'Contesto'
        },
        contexts: ['Famiglia', 'Coppia', 'Amicizie', 'Lavoro', 'Società', 'Esperienze passate']
    },

    quote: {
        eyebrow: 'Un pensiero che guida il mio lavoro'
    },

    steps: {
        eyebrow: 'Come funziona',
        title: 'Da dove iniziamo?',
        items: [
            { title: 'Contatto', text: 'Scrivimi brevemente cosa ti porta qui. Bastano poche righe.' },
            { title: 'Primo colloquio', text: 'Ci conosciamo e comprendiamo insieme la tua richiesta.' },
            { title: 'Percorso', text: 'Definiamo insieme modalità e obiettivi del percorso.' }
        ],
        cta: 'Richiedi un primo colloquio'
    },

    places: {
        eyebrow: 'Studio e online',
        title: 'In studio o a distanza, con la stessa cura.',
        studio: {
            label: 'Studio',
            text: 'Gli incontri in presenza si svolgono nello studio di Teramo, in un contesto riservato.',
            mapCta: 'Apri in Google Maps'
        },
        online: {
            label: 'Online',
            title: 'Consulenze online',
            text: 'Gli incontri possono svolgersi anche in videochiamata, da un luogo in cui ti senti a tuo agio. Una possibilità utile se vivi lontano, hai poco tempo o semplicemente preferisci questa modalità.',
            cta: 'Richiedi una consulenza online'
        }
    },

    studioGallery: {
        eyebrow: 'Lo studio',
        title: 'Lo spazio dei nostri incontri',
        text: 'Alcune immagini dello studio di Teramo, dove si svolgono i colloqui in presenza.'
    },

    reviews: {
        eyebrow: 'Opinioni',
        title: 'Le parole di chi ha scelto questo percorso'
    },

    faq: {
        eyebrow: 'Domande frequenti',
        title: 'Qualche risposta, prima di iniziare'
    },

    finalCta: {
        title: 'Possiamo iniziare da qui.',
        text: 'Se senti che è arrivato il momento di dedicare uno spazio a ciò che stai vivendo, possiamo parlarne insieme.',
        primary: 'Richiedi un primo colloquio',
        secondary: 'Contattami'
    },

    booking: {
        eyebrow: 'Prenota online',
        title: 'Scegli tu il momento',
        text: 'Puoi vedere le disponibilità e prenotare direttamente il primo colloquio, in studio o online. Riceverai una conferma via email.',
        loadCta: 'Mostra le disponibilità',
        consent:
            'Il calendario è fornito da Google. Caricandolo, Google potrà trattare alcuni dati di navigazione e impostare cookie secondo la propria informativa.',
        externalCta: 'Apri il calendario in una nuova finestra',
        alternative: 'Preferisci scrivermi prima?',
        alternativeCta: 'Usa il modulo di contatto'
    },

    contact: {
        eyebrow: 'Contatti',
        title: 'Scrivimi',
        text: 'Compila il modulo per richiedere un primo colloquio o qualche informazione. Non è necessario entrare nei dettagli: ne parleremo con calma, insieme.',
        reassurance: 'Ti ricontatterò appena possibile.',
        privacyNote: 'I dati inviati sono trattati con riservatezza e utilizzati solo per risponderti.',
        /** Indicazioni per le emergenze: il sito non è un servizio di pronto intervento. */
        emergency: {
            title: 'In caso di emergenza',
            text: 'Questo modulo non è adatto alle situazioni urgenti. Se tu o qualcuno vicino a te è in pericolo, chiama subito il numero di emergenza 112 o rivolgiti al pronto soccorso più vicino.',
            phone: '112'
        }
    }
};

/* ---------------------------------------------------------------------------
 * Percorsi (card in homepage + pagine /percorsi/[slug])
 * ------------------------------------------------------------------------- */
export const services: Service[] = [
    {
        slug: 'sostegno-psicologico-individuale',
        icon: 'user',
        title: 'Sostegno psicologico individuale',
        short: 'Uno spazio tuo, per fermarti, mettere ordine e comprendere ciò che stai attraversando.',
        intro: 'Ci sono momenti in cui ansia, stress, cambiamenti o vecchie ferite rendono più faticoso il quotidiano. Il sostegno individuale offre un tempo dedicato per ascoltarti, dare parole a ciò che senti e guardarlo da una prospettiva nuova.',
        forWhom: [
            'Adulti e adolescenti che attraversano un momento di difficoltà',
            'Chi vive ansia, stress o un calo dell’umore',
            'Chi affronta un cambiamento o una scelta importante',
            'Chi desidera conoscersi meglio e prendersi cura di sé'
        ],
        howItWorks:
            'Il percorso inizia con un primo colloquio, in cui accolgo la tua richiesta. Da lì definiamo insieme modalità, tempi e obiettivi, che possono essere rivisti man mano.',
        seoDescription:
            'Sostegno psicologico individuale a Teramo e online con la Dott.ssa Giulia Savini, psicologa. Uno spazio di ascolto per adulti e adolescenti.'
    },
    {
        slug: 'percorsi-di-coppia',
        icon: 'couple',
        title: 'Percorsi di coppia',
        short: 'Difficoltà relazionali, comunicazione, cambiamenti e momenti di crisi.',
        intro: 'Ogni coppia attraversa fasi diverse. A volte la comunicazione si inceppa, i conflitti si ripetono, un cambiamento rimette tutto in discussione. Il percorso di coppia è uno spazio terzo, in cui entrambi possono sentirsi ascoltati.',
        forWhom: [
            'Coppie che faticano a comunicare o vivono conflitti ricorrenti',
            'Momenti di crisi, distanza o perdita di fiducia',
            'Cambiamenti importanti: convivenza, nascita di un figlio, trasferimenti',
            'Coppie che vogliono comprendere meglio le proprie dinamiche'
        ],
        howItWorks:
            'Gli incontri coinvolgono entrambi i partner. In un’ottica sistemico-relazionale l’attenzione è rivolta alla relazione: a come ciascuno partecipa alle dinamiche della coppia e a ciò che potrebbe cambiare.',
        seoDescription:
            'Percorsi di coppia a Teramo e online con la Dott.ssa Giulia Savini: comunicazione, conflitti, crisi e cambiamenti, in ottica sistemico-relazionale.'
    },
    {
        slug: 'consulenza-sessuologica',
        icon: 'sexology',
        title: 'Consulenza sessuologica',
        short: 'Uno spazio professionale e riservato per affrontare difficoltà e tematiche legate alla sessualità.',
        intro: 'La sessualità è una parte importante del benessere personale e di coppia, ma spesso è difficile parlarne. La consulenza sessuologica offre un contesto professionale, riservato e privo di giudizio in cui affrontare dubbi, difficoltà e vissuti legati alla sfera sessuale.',
        forWhom: [
            'Persone che vivono difficoltà o disagi nella sfera sessuale',
            'Coppie in cui la sessualità è diventata fonte di distanza o tensione',
            'Chi desidera uno spazio per riflettere sulla propria identità e sul proprio vissuto',
            'Chi ha dubbi o domande che non sa a chi rivolgere'
        ],
        howItWorks:
            'Dopo un primo colloquio conoscitivo valutiamo insieme la richiesta e la forma più adatta del percorso, individuale o di coppia. Quando utile, il lavoro può integrarsi con quello di altri professionisti della salute.',
        seoDescription:
            'Consulenza sessuologica a Teramo e online con la Dott.ssa Giulia Savini, psicologa specializzata in Sessuologia Clinica. Uno spazio riservato e privo di giudizio.'
    },
    {
        slug: 'supporto-alla-genitorialita',
        icon: 'parenting',
        title: 'Supporto alla genitorialità',
        short: 'Un sostegno per orientarsi tra dubbi, fatiche e cambiamenti del diventare ed essere genitori.',
        intro: 'Essere genitori porta con sé gioie, ma anche domande, stanchezza e momenti di incertezza. Il supporto alla genitorialità è uno spazio per fermarsi, confrontarsi e ritrovare una direzione.',
        forWhom: [
            'Genitori che attraversano una fase complessa nella relazione con i figli',
            'Famiglie alle prese con cambiamenti, separazioni o nuovi equilibri',
            'Genitori di adolescenti che faticano a ritrovare un dialogo',
            'Chi si sta preparando a diventare genitore'
        ],
        howItWorks:
            'Gli incontri possono coinvolgere uno o entrambi i genitori. Lo sguardo sistemico aiuta a leggere le difficoltà all’interno delle relazioni familiari, valorizzando le risorse già presenti.',
        seoDescription:
            'Supporto alla genitorialità a Teramo e online con la Dott.ssa Giulia Savini, psicologa: uno spazio per genitori e famiglie che attraversano cambiamenti.'
    },
    {
        slug: 'consulenza-online',
        icon: 'online',
        title: 'Consulenza online',
        short: 'Percorsi accessibili anche a distanza, con la stessa attenzione e riservatezza.',
        intro: 'La consulenza psicologica online permette di iniziare o proseguire un percorso anche quando la distanza, gli orari o altre esigenze rendono difficile raggiungere lo studio.',
        forWhom: [
            'Chi vive lontano da Teramo o si sposta spesso',
            'Chi ha orari complessi da conciliare',
            'Chi si sente più a proprio agio in un ambiente familiare',
            'Chi desidera proseguire un percorso già avviato in studio'
        ],
        howItWorks:
            'Gli incontri si svolgono in videochiamata. È sufficiente una connessione stabile e un luogo tranquillo e riservato, in cui sentirsi liberi di parlare.',
        seoDescription: 'Consulenza psicologica e sessuologica online con la Dott.ssa Giulia Savini: percorsi individuali e di coppia in videochiamata.'
    }
];

/* ---------------------------------------------------------------------------
 * FAQ
 * Le risposte su durata, frequenza e onorari sono volutamente generiche:
 * TODO — completarle con le informazioni fornite dalla Dott.ssa.
 * ------------------------------------------------------------------------- */
export const faqs: { question: string; answer: string }[] = [
    {
        question: 'Come funziona il primo colloquio?',
        answer: 'Il primo colloquio è un momento di conoscenza reciproca. Mi racconti cosa ti ha portato a cercare un aiuto e insieme proviamo a comprendere la tua richiesta. Al termine valutiamo se e come proseguire, senza alcun impegno.'
    },
    {
        question: 'Posso svolgere gli incontri online?',
        answer: 'Sì, sono disponibili consulenze psicologiche online in videochiamata. Serve soltanto una connessione stabile e un luogo tranquillo in cui sentirti libero o libera di parlare.'
    },
    {
        question: 'Quanto dura un incontro?',
        // TODO: indicare la durata effettiva degli incontri (es. "circa 50 minuti").
        answer: 'La durata degli incontri ti verrà indicata con precisione al momento del contatto, insieme a tutte le informazioni pratiche.'
    },
    {
        question: 'Con quale frequenza si svolgono gli incontri?',
        // TODO: eventualmente specificare la frequenza abituale.
        answer: 'La frequenza viene concordata insieme dopo i primi colloqui, in base alla richiesta, agli obiettivi e alle tue esigenze, e può cambiare nel corso del percorso.'
    },
    {
        question: 'Come posso prenotare?',
        answer: 'Puoi compilare il modulo di contatto presente in questa pagina indicando se preferisci un incontro in studio o online. Ti ricontatterò per concordare insieme il primo appuntamento.'
    },
    {
        question: 'Dove si trova lo studio?',
        answer: 'Lo studio si trova a Teramo, in Viale Bovio. L’indirizzo completo ti verrà confermato al momento della prenotazione. In alternativa, gli incontri possono svolgersi online.'
    },
    {
        question: 'Il percorso è individuale o anche di coppia?',
        answer: 'Entrambi. Accolgo persone adulte, adolescenti e coppie. Nel primo colloquio valutiamo insieme quale forma di percorso sia più adatta alla tua richiesta.'
    },
    {
        question: 'Come posso capire se questo percorso fa per me?',
        answer: 'Non è necessario avere le idee chiare prima di iniziare. Se senti che qualcosa ti pesa, o semplicemente desideri uno spazio per comprenderti meglio, il primo colloquio può aiutarti a capire se e come proseguire.'
    }
];

/* ---------------------------------------------------------------------------
 * Pagine legali
 * Impostare `reviewed: true` SOLO dopo la verifica dei testi da parte di
 * un professionista: rimuove l'avviso "template" e rende le pagine indicizzabili.
 * ------------------------------------------------------------------------- */
export const legal = {
    reviewed: false,
    lastUpdated: '2026-10-12'
};

/* ---------------------------------------------------------------------------
 * Prenotazione online (Google Calendar)
 *
 * Come collegarlo:
 * 1. Su Google Calendar: Crea → Programma di appuntamenti (Appointment schedule),
 *    imposta durata, disponibilità e, se serve, il link Google Meet per gli incontri online.
 * 2. Apri il programma → Condividi → "Pagina di prenotazione" e copia il link
 *    (inizia con https://calendar.google.com/calendar/appointments/schedules/...).
 * 3. Inseriscilo nella variabile d'ambiente GOOGLE_CALENDAR_BOOKING_URL (oppure qui sotto).
 *
 * Gli appuntamenti prenotati compaiono direttamente nel Google Calendar della Dott.ssa.
 * Se il link è vuoto la sezione non compare (in modalità demo mostra un'anteprima).
 * ------------------------------------------------------------------------- */
export const bookingConfig = {
    url: null as string | null
};
