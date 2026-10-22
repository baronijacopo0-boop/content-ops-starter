import waveforms from './waveforms.json';

// ---------------------------------------------------------------------------
// Configurazione del sito: modifica qui nome, contatti, beat, licenze e servizi.
// I valori segnati con TODO sono segnaposto da sostituire con quelli reali.
// ---------------------------------------------------------------------------

export const producer = {
    name: 'Jacopo Sei Fuori',
    short: 'JSF',
    tag: 'prod. JSF',
    tagline: 'Beat philly drill, trap, rap e rage. Premi play e sei fuori.',
    city: 'Italia', // TODO: la tua città
    contacts: {
        email: 'TODO-email@esempio.com', // TODO
        instagram: 'TODO_instagram', // TODO: handle senza @
        whatsapp: '390000000000', // TODO: numero con prefisso, senza + e spazi
        youtube: '', // TODO: link canale (opzionale)
        spotify: '', // TODO: link profilo (opzionale)
        beatstars: '' // TODO: link store (opzionale)
    }
};

export type Beat = {
    slug: string;
    title: string;
    bpm: number;
    key: string;
    duration: number; // secondi
    tags: string[];
    mood: string;
    priceFrom: number;
    featured?: boolean;
    src: string;
    peaks: number[];
};

const beat = (b: Omit<Beat, 'src' | 'peaks'>): Beat => ({
    ...b,
    src: `/beats/${b.slug}.mp3`,
    peaks: (waveforms as Record<string, number[]>)[b.slug]
});

// Categorie del beat store (i filtri seguono quest'ordine)
export const genres = ['Philly Drill', 'Trap', 'Rap/Hip Hop', 'Rage'];

// BPM e tonalità: i primi 5 stimati via analisi audio, gli altri dai nomi dei file (Strade stimato).
export const beats: Beat[] = [
    beat({ slug: 'sei-fuori', title: 'Sei Fuori', bpm: 152, key: 'G# maj', duration: 154, tags: ['Trap'], mood: 'Energico', priceFrom: 19.99, featured: true }),
    beat({ slug: 'veleno', title: 'Veleno', bpm: 161, key: 'D# min', duration: 169, tags: ['Philly Drill'], mood: 'Aggressivo', priceFrom: 19.99 }),
    beat({ slug: 'sirene', title: 'Sirene', bpm: 161, key: 'C# min', duration: 170, tags: ['Rage'], mood: 'Cupo', priceFrom: 19.99 }),
    beat({ slug: 'notte-fonda', title: 'Notte Fonda', bpm: 76, key: 'D# min', duration: 126, tags: ['Rap/Hip Hop'], mood: 'Notturno', priceFrom: 19.99 }),
    beat({ slug: 'luce', title: 'Luce', bpm: 72, key: 'C maj', duration: 132, tags: ['Rap/Hip Hop'], mood: 'Melodico', priceFrom: 19.99 }),
    beat({ slug: 'freddo', title: 'Freddo', bpm: 128, key: 'E min', duration: 227, tags: ['Philly Drill'], mood: 'Gelido', priceFrom: 19.99 }),
    beat({ slug: 'adrenalina', title: 'Adrenalina', bpm: 163, key: 'A min', duration: 165, tags: ['Rage'], mood: 'Esplosivo', priceFrom: 19.99 }),
    beat({ slug: 'fuoco', title: 'Fuoco', bpm: 153, key: 'D min', duration: 201, tags: ['Trap'], mood: 'Energico', priceFrom: 19.99 }),
    beat({ slug: 'corsa', title: 'Corsa', bpm: 130, key: 'G# min', duration: 134, tags: ['Philly Drill'], mood: 'Veloce', priceFrom: 19.99 }),
    beat({ slug: 'polvere', title: 'Polvere', bpm: 119, key: 'E min', duration: 157, tags: ['Rap/Hip Hop'], mood: 'Riflessivo', priceFrom: 19.99 }),
    beat({ slug: 'blocco', title: 'Blocco', bpm: 120, key: 'C min', duration: 208, tags: ['Philly Drill'], mood: 'Crudo', priceFrom: 19.99 }),
    beat({ slug: 'strade', title: 'Strade', bpm: 129, key: 'C# min', duration: 180, tags: ['Philly Drill'], mood: 'Notturno', priceFrom: 19.99 }),
    beat({ slug: 'ricordi', title: 'Ricordi', bpm: 119, key: 'F min', duration: 178, tags: ['Rap/Hip Hop'], mood: 'Malinconico', priceFrom: 19.99 }),
    beat({ slug: 'frenesia', title: 'Frenesia', bpm: 170, key: 'C min', duration: 181, tags: ['Rage'], mood: 'Aggressivo', priceFrom: 19.99 }),
    beat({ slug: 'abisso', title: 'Abisso', bpm: 150, key: 'B min', duration: 171, tags: ['Trap'], mood: 'Cupo', priceFrom: 19.99 }),
    beat({ slug: 'lampi', title: 'Lampi', bpm: 138, key: 'F min', duration: 140, tags: ['Trap'], mood: 'Teso', priceFrom: 19.99 }),
    beat({ slug: 'fumo', title: 'Fumo', bpm: 121, key: 'C# min', duration: 159, tags: ['Rap/Hip Hop'], mood: 'Rilassato', priceFrom: 19.99 })
];

export type License = {
    id: string;
    name: string;
    price: number | null; // null = su richiesta
    files: string;
    perks: string[];
    highlight?: boolean;
};

// Nessun limite di stream: si paga in base ai file. Il tag del producer resta sempre.
const usage = ['Stream e vendite illimitati', 'Videoclip illimitati', 'Live illimitati', 'Credit obbligatorio: prod. JSF'];

export const licenses: License[] = [
    {
        id: 'mp3',
        name: 'MP3',
        price: 19.99,
        files: 'Beat in MP3 320kbps con tag',
        perks: usage
    },
    {
        id: 'wav',
        name: 'WAV',
        price: 34.99,
        files: 'Beat in WAV alta qualità + MP3, con tag',
        perks: usage,
        highlight: true
    },
    {
        id: 'stems',
        name: 'Multitraccia',
        price: 69.99,
        files: 'Stems di tutti gli strumenti + WAV + MP3, con tag',
        perks: ['Tracce separate per mixare il pezzo', ...usage]
    },
    {
        id: 'exclusive',
        name: 'Esclusiva',
        price: null,
        files: 'Tutti i file + diritti esclusivi',
        perks: ['Il beat è solo tuo e viene rimosso dallo store', 'Stream, video e live illimitati', 'Contratto personalizzato', 'Credit obbligatorio: prod. JSF']
    }
];

export const services = [
    {
        title: 'Beat su misura',
        text: 'Partiamo dalle tue reference e costruiamo il beat attorno alla tua voce: BPM, mood e struttura pensati per il pezzo.'
    },
    {
        title: 'Mix & Master',
        text: 'Voce e beat che suonano come un pezzo vero: pulizia, spazio, punch e un master pronto per le piattaforme.'
    },
    {
        title: 'Collab & Sessioni',
        text: 'Artisti, producer, topliner: se hai un progetto serio scrivimi e vediamo cosa tirare fuori insieme.'
    }
];

export const formatPrice = (p: number | null) => (p === null ? 'Su richiesta' : `€${p.toFixed(2).replace('.', ',')}`);

export const formatTime = (s: number) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
};

export const contactLinks = (message: string, subject = 'Info beat') => {
    const { email, instagram, whatsapp } = producer.contacts;
    return {
        email: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
        whatsapp: `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
        instagram: `https://ig.me/m/${instagram}`
    };
};
