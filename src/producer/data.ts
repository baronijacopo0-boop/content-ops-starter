import waveforms from './waveforms.json';

// ---------------------------------------------------------------------------
// Configurazione del sito: modifica qui nome, contatti, beat, licenze e servizi.
// I valori segnati con TODO sono segnaposto da sostituire con quelli reali.
// ---------------------------------------------------------------------------

export const producer = {
    name: 'Jacopo Sei Fuori',
    short: 'JSF',
    tag: 'prod. JSF',
    tagline: 'Beat trap & drill. Premi play e sei fuori.',
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

// BPM e tonalità stimati via analisi audio: verificali con i dati del progetto.
export const beats: Beat[] = [
    beat({ slug: 'sei-fuori', title: 'Sei Fuori', bpm: 152, key: 'G# maj', duration: 154, tags: ['Trap', 'Bounce'], mood: 'Energico', priceFrom: 29.99, featured: true }),
    beat({ slug: 'veleno', title: 'Veleno', bpm: 161, key: 'D# min', duration: 169, tags: ['Drill', 'Aggressive'], mood: 'Aggressivo', priceFrom: 29.99 }),
    beat({ slug: 'sirene', title: 'Sirene', bpm: 161, key: 'C# min', duration: 170, tags: ['Drill', 'Dark'], mood: 'Cupo', priceFrom: 29.99 }),
    beat({ slug: 'notte-fonda', title: 'Notte Fonda', bpm: 152, key: 'D# min', duration: 126, tags: ['Trap', 'Dark'], mood: 'Notturno', priceFrom: 29.99 }),
    beat({ slug: 'luce', title: 'Luce', bpm: 144, key: 'C maj', duration: 132, tags: ['Trap', 'Melodic'], mood: 'Melodico', priceFrom: 29.99 })
];

export type License = {
    id: string;
    name: string;
    price: number | null; // null = su richiesta
    files: string;
    perks: string[];
    highlight?: boolean;
};

export const licenses: License[] = [
    {
        id: 'mp3',
        name: 'MP3 Lease',
        price: 29.99,
        files: 'MP3 320kbps senza tag',
        perks: ['Fino a 5.000 stream', '1 videoclip musicale', 'Esibizioni live non a pagamento', 'Credit obbligatorio: prod. JSF']
    },
    {
        id: 'wav',
        name: 'WAV Lease',
        price: 49.99,
        files: 'WAV + MP3 senza tag',
        perks: ['Fino a 50.000 stream', '1 videoclip musicale', 'Esibizioni live a pagamento', 'Credit obbligatorio: prod. JSF'],
        highlight: true
    },
    {
        id: 'stems',
        name: 'Trackout',
        price: 99.99,
        files: 'Stems (tracce separate) + WAV + MP3',
        perks: ['Fino a 250.000 stream', 'Videoclip illimitati', 'Mix completo sulle tracce', 'Credit obbligatorio: prod. JSF']
    },
    {
        id: 'exclusive',
        name: 'Esclusiva',
        price: null,
        files: 'Tutti i file + diritti esclusivi',
        perks: ['Stream illimitati', 'Il beat viene rimosso dallo store', 'Contratto personalizzato', 'Split da concordare']
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
