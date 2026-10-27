/**
 * Educational content for "Guida Reselling". Plain data so it can later move to a CMS or Supabase table
 * without touching the UI.
 */
export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  tip?: string;
}

export interface Guide {
  slug: string;
  title: string;
  category: GuideCategoryId;
  summary: string;
  readingMinutes: number;
  level: 'Base' | 'Intermedio' | 'Avanzato';
  sections: GuideSection[];
  takeaways: string[];
}

export type GuideCategoryId =
  | 'iniziare'
  | 'cosa-comprare'
  | 'occasioni'
  | 'fotografie'
  | 'titoli'
  | 'descrizioni'
  | 'pricing'
  | 'negoziazione'
  | 'spedizioni'
  | 'vendite'
  | 'inventario'
  | 'roi'
  | 'errori'
  | 'brand'
  | 'vintage'
  | 'streetwear';

export const GUIDE_CATEGORIES: { id: GuideCategoryId; label: string; emoji: string; description: string }[] =
  [
    {
      id: 'iniziare',
      label: 'Come iniziare',
      emoji: '🚀',
      description: 'Budget, primi acquisti e mentalità giusta.',
    },
    {
      id: 'cosa-comprare',
      label: 'Cosa comprare',
      emoji: '🛍️',
      description: 'Capi e brand che si rivendono davvero.',
    },
    {
      id: 'occasioni',
      label: 'Come trovare occasioni',
      emoji: '🔎',
      description: 'Dove cercare e come riconoscere un affare.',
    },
    {
      id: 'fotografie',
      label: 'Fotografie',
      emoji: '📸',
      description: 'Foto che fanno vendere di più e prima.',
    },
    { id: 'titoli', label: 'Titoli', emoji: '🏷️', description: 'Titoli che vengono trovati nelle ricerche.' },
    {
      id: 'descrizioni',
      label: 'Descrizioni',
      emoji: '📝',
      description: 'Descrizioni chiare che evitano resi.',
    },
    {
      id: 'pricing',
      label: 'Pricing',
      emoji: '💶',
      description: 'Scegliere il prezzo giusto e quando ribassare.',
    },
    {
      id: 'negoziazione',
      label: 'Negoziazione',
      emoji: '🤝',
      description: 'Trattare in acquisto e in vendita.',
    },
    { id: 'spedizioni', label: 'Spedizioni', emoji: '📦', description: 'Imballaggio, tempi e costi.' },
    {
      id: 'vendite',
      label: 'Come aumentare le vendite',
      emoji: '📈',
      description: 'Visibilità, bundle e reputazione.',
    },
    {
      id: 'inventario',
      label: 'Gestione inventario',
      emoji: '🗂️',
      description: 'Stock age, capitale bloccato, organizzazione.',
    },
    {
      id: 'roi',
      label: 'Calcolo ROI',
      emoji: '🧮',
      description: 'Profitto, ROI e margine spiegati semplice.',
    },
    {
      id: 'errori',
      label: 'Errori da evitare',
      emoji: '⛔',
      description: 'Gli sbagli più costosi dei principianti.',
    },
    {
      id: 'brand',
      label: 'Brand da conoscere',
      emoji: '⭐',
      description: 'Brand richiesti e come riconoscerli.',
    },
    {
      id: 'vintage',
      label: 'Vintage basics',
      emoji: '📼',
      description: 'Etichette, epoche e dettagli che valgono.',
    },
    {
      id: 'streetwear',
      label: 'Streetwear basics',
      emoji: '🧢',
      description: 'Hype, drop e capi evergreen.',
    },
  ];

export const GUIDES: Guide[] = [
  {
    slug: 'come-capire-se-un-capo-e-un-buon-affare',
    title: 'Come capire se un capo è un buon affare',
    category: 'occasioni',
    summary: 'Il metodo in 5 domande per decidere in 30 secondi se comprare, trattare o lasciar perdere.',
    readingMinutes: 5,
    level: 'Base',
    sections: [
      {
        heading: 'Il principio: si guadagna quando si compra',
        paragraphs: [
          'Nel reselling il profitto si decide al momento dell’acquisto, non della vendita. Se paghi troppo, nessuna foto o descrizione potrà salvarti il margine.',
          'Prima di comprare devi sapere tre numeri: quanto vale il capo sul mercato, quanto ci metterà a vendersi e quanto puoi pagarlo al massimo.',
        ],
      },
      {
        heading: 'Le 5 domande da farti',
        bullets: [
          'Il brand è richiesto? Nike, Carhartt, Ralph Lauren, The North Face vendono; i brand fast fashion quasi mai.',
          'A quanto si vendono capi simili? Guarda i VENDUTI, non gli annunci attivi: il prezzo richiesto non è il prezzo di mercato.',
          'In che condizioni è? Macchie, buchi, scritte rovinate tagliano il prezzo del 20-40%.',
          'La taglia è facile? M e L vendono prima; XS e XXL possono restare ferme settimane.',
          'Il ROI supera il tuo obiettivo? Con meno del 50-100% di ROI il rischio raramente vale la pena.',
        ],
      },
      {
        heading: 'Usa il Deal Score',
        paragraphs: [
          'FLIP AI combina questi fattori nel Deal Score (0-100): 30% prezzo rispetto al mercato, 20% domanda del brand, 20% ROI, 15% velocità di vendita, 10% condizione e 5% taglia.',
          'Sopra 80 è un HOT DEAL, tra 65 e 79 un buon affare, tra 45 e 64 conviene solo trattando, sotto 45 lascia stare.',
        ],
        tip: 'Guarda sempre il “prezzo massimo consigliato”: se il venditore chiede di più, fai un’offerta a quella cifra.',
      },
    ],
    takeaways: [
      'Il margine si crea in acquisto.',
      'Confronta con i venduti, non con gli annunci.',
      'Fissa un ROI minimo e rispettalo.',
    ],
  },
  {
    slug: 'come-fare-fotografie-che-vendono',
    title: 'Come fare fotografie che vendono',
    category: 'fotografie',
    summary: 'Luce, sfondo, inquadrature e ordine delle foto: le regole per far fermare lo scroll.',
    readingMinutes: 6,
    level: 'Base',
    sections: [
      {
        heading: 'Luce naturale, sempre',
        paragraphs: [
          'Fotografa vicino a una finestra, di giorno, senza flash. La luce naturale mostra i colori reali e riduce contestazioni del tipo “il colore era diverso”.',
        ],
      },
      {
        heading: 'Sfondo pulito e capo stirato',
        bullets: [
          'Sfondo neutro: muro bianco, pavimento chiaro o un lenzuolo.',
          'Stira o passa il vapore: le pieghe fanno sembrare il capo vecchio.',
          'Togli peli e pallini con un rullo prima di scattare.',
        ],
      },
      {
        heading: 'Le 6 foto essenziali',
        bullets: [
          'Copertina: capo intero, frontale, ben centrato (indossato o su gruccia).',
          'Retro completo.',
          'Dettaglio logo / grafica.',
          'Etichetta brand e taglia.',
          'Etichetta composizione.',
          'Eventuali difetti, in primo piano.',
        ],
        tip: 'Fotografare i difetti non fa perdere vendite: fa perdere resi e recensioni negative.',
      },
      {
        heading: 'La copertina decide il click',
        paragraphs: [
          'Su un marketplace la tua prima foto compete con decine di altre. Formato verticale, capo grande nell’inquadratura e nessun elemento di disturbo.',
        ],
      },
    ],
    takeaways: [
      'Luce naturale e sfondo neutro.',
      'Mostra etichette e difetti.',
      'Cura la copertina più di tutto.',
    ],
  },
  {
    slug: 'come-scegliere-il-prezzo',
    title: 'Come scegliere il prezzo',
    category: 'pricing',
    summary: 'Vendita veloce, prezzo consigliato o massimo profitto: quale strategia usare e quando.',
    readingMinutes: 5,
    level: 'Base',
    sections: [
      {
        heading: 'Parti dai venduti',
        paragraphs: [
          'Cerca capi simili (stesso brand, tipo, condizione) già VENDUTI. La mediana di quei prezzi è il tuo punto di partenza: è ciò che il mercato paga davvero.',
        ],
      },
      {
        heading: 'Tre strategie',
        bullets: [
          'Vendita veloce (≈ -15/20%): per liberare capitale o per capi stagionali a fine stagione.',
          'Prezzo consigliato (mediana): equilibrio tra tempo e guadagno. È la scelta di default.',
          'Massimo profitto (fascia alta): per capi rari, in condizioni perfette, con foto eccellenti. Richiede pazienza.',
        ],
      },
      {
        heading: 'Lascia margine per la trattativa',
        paragraphs: [
          'Molti acquirenti fanno un’offerta. Pubblicare il 5-10% sopra il prezzo che vuoi davvero ti permette di accettare senza perdere margine.',
        ],
        tip: 'Il Price Advisor di FLIP AI calcola le tre strategie con i giorni di vendita stimati: scegli in base a quanto ti serve liquidità.',
      },
    ],
    takeaways: [
      'Mediana dei venduti = prezzo di partenza.',
      'Scegli la strategia in base alla liquidità.',
      'Tieni un piccolo margine per le offerte.',
    ],
  },
  {
    slug: 'come-aumentare-il-margine',
    title: 'Come aumentare il margine',
    category: 'roi',
    summary: 'Le 6 leve concrete per guadagnare di più su ogni capo, senza vendere di più.',
    readingMinutes: 5,
    level: 'Intermedio',
    sections: [
      {
        heading: 'Leva n.1: compra meglio',
        paragraphs: [
          'Abbassare di 3€ il prezzo medio di acquisto su un capo da 15€ aumenta il ROI di decine di punti. Tratta sempre, compra in blocco, cerca dove la concorrenza è bassa (mercatini, svuota cantine).',
        ],
      },
      {
        heading: 'Le altre leve',
        bullets: [
          'Bundle in acquisto: 3 capi dallo stesso venditore = sconto + una sola spedizione.',
          'Valorizza il capo: lavaggio, vapore, piccoli rammendi costano poco e alzano il prezzo.',
          'Titoli e foto migliori: stesso capo, più visualizzazioni, prezzo più alto.',
          'Riduci i costi extra: imballaggi riciclati, acquisto buste in stock.',
          'Taglia i brand che non rendono: guarda “5 brand peggiori” in Analytics.',
        ],
      },
    ],
    takeaways: [
      'Il prezzo d’acquisto è la leva più forte.',
      'Piccoli costi ripetuti erodono il margine.',
      'Usa i dati per tagliare ciò che non rende.',
    ],
  },
  {
    slug: '10-errori-dei-nuovi-reseller',
    title: '10 errori dei nuovi reseller',
    category: 'errori',
    summary: 'Gli sbagli che fanno perdere soldi (e tempo) a quasi tutti all’inizio.',
    readingMinutes: 6,
    level: 'Base',
    sections: [
      {
        heading: 'Gli errori',
        bullets: [
          '1. Comprare per gusto personale invece che per domanda di mercato.',
          '2. Guardare il prezzo degli annunci attivi invece dei venduti.',
          '3. Non calcolare costi extra (imballi, lavaggi, viaggi).',
          '4. Comprare taglie difficili perché “costavano poco”.',
          '5. Lasciare capi in casa senza pubblicarli per settimane.',
          '6. Foto al buio, con sfondi disordinati.',
          '7. Descrizioni vaghe che generano domande e resi.',
          '8. Non ribassare mai, bloccando capitale per mesi.',
          '9. Non tenere traccia di acquisti e vendite.',
          '10. Dichiarare autenticità o materiali senza esserne certi.',
        ],
        tip: 'FLIP AI ti protegge da quasi tutti: Deal Score per gli acquisti, Inventory Health per lo stock fermo, tracking automatico di profitto e ROI.',
      },
    ],
    takeaways: [
      'Compra per il mercato, non per te.',
      'Traccia tutto.',
      'Mai dichiarare ciò che non puoi provare.',
    ],
  },
  {
    slug: 'come-calcolare-il-roi',
    title: 'Come calcolare il ROI',
    category: 'roi',
    summary: 'Profitto, ROI e margine: le tre formule che ogni reseller deve conoscere, con esempi.',
    readingMinutes: 4,
    level: 'Base',
    sections: [
      {
        heading: 'Le formule',
        bullets: [
          'Profitto = prezzo di vendita − prezzo di acquisto − costi extra',
          'ROI = profitto ÷ prezzo di acquisto × 100',
          'Margine = profitto ÷ prezzo di vendita × 100',
        ],
      },
      {
        heading: 'Esempio',
        paragraphs: [
          'Compri una felpa a 10€, la vendi a 30€ e spendi 2€ di imballaggio. Profitto = 30 − 10 − 2 = 18€. ROI = 18 ÷ 10 × 100 = 180%. Margine = 18 ÷ 30 × 100 = 60%.',
          'Il ROI ti dice quanto rende ogni euro investito; il margine quanta parte dell’incasso ti resta in tasca.',
        ],
      },
      {
        heading: 'Il prezzo massimo da pagare',
        paragraphs: [
          'Se vuoi un ROI del 100% e pensi di rivendere a 40€ con 2€ di costi: prezzo massimo = (40 − 2) ÷ 2 = 19€. Oltre quella cifra, tratta o rinuncia.',
        ],
        tip: 'Il Calcolatore Profitto di FLIP AI fa questi conti per te in tempo reale.',
      },
    ],
    takeaways: [
      'ROI = rendimento del capitale.',
      'Margine = quanto resta dell’incasso.',
      'Calcola il prezzo massimo prima di trattare.',
    ],
  },
  {
    slug: 'come-capire-quando-abbassare-un-prezzo',
    title: 'Come capire quando abbassare un prezzo',
    category: 'pricing',
    summary: 'Visualizzazioni, preferiti e giorni online: i segnali che ti dicono che è ora di ribassare.',
    readingMinutes: 4,
    level: 'Intermedio',
    sections: [
      {
        heading: 'Leggi i segnali',
        bullets: [
          'Molte visualizzazioni, pochi preferiti: il prezzo spaventa → ribassa del 10%.',
          'Molti preferiti, nessuna offerta: le persone aspettano un calo → invia un’offerta ai preferiti o ribassa del 5-10%.',
          'Poche visualizzazioni: il problema è la visibilità → migliora titolo e copertina prima del prezzo.',
        ],
      },
      {
        heading: 'La regola dei 14/30/60 giorni',
        bullets: [
          '14 giorni senza offerte: rivedi foto e titolo.',
          '30 giorni: ribasso del 10%.',
          '60 giorni (OLD STOCK): ribasso del 15-20% o bundle. Il capitale fermo costa.',
        ],
      },
    ],
    takeaways: [
      'Diagnostica prima di ribassare.',
      'Ribassi piccoli e programmati.',
      'Oltre 60 giorni conta liberare capitale.',
    ],
  },
  {
    slug: 'come-gestire-articoli-invenduti',
    title: 'Come gestire articoli invenduti',
    category: 'inventario',
    summary:
      'Cosa fare con lo stock fermo: ribassi, bundle, riposizionamento e quando accettare una piccola perdita.',
    readingMinutes: 5,
    level: 'Intermedio',
    sections: [
      {
        heading: 'Perché lo stock fermo è un problema',
        paragraphs: [
          'Ogni capo invenduto è capitale che non lavora. Con quei soldi potresti comprare un HOT DEAL che si vende in una settimana.',
        ],
      },
      {
        heading: 'Le strategie',
        bullets: [
          'Rinnova l’annuncio: nuove foto, nuovo titolo, ripubblicalo.',
          'Bundle: “2 capi a 30€” sposta più pezzi lenti insieme.',
          'Cambia stagione: un piumino a luglio non vende, a ottobre sì. Rimettilo online al momento giusto.',
          'Cambia piattaforma: alcuni capi vanno meglio su altri marketplace.',
          'Vendi in pareggio: recuperare il capitale è meglio che tenerlo fermo per mesi.',
        ],
        tip: 'Inventory Health in dashboard ti mostra quanti articoli sono SLOW (31-60g) e OLD STOCK (60g+) e quanto capitale è bloccato.',
      },
    ],
    takeaways: [
      'Il capitale fermo ha un costo.',
      'Agisci a 30 giorni, non a 90.',
      'A volte il pareggio è una vittoria.',
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}

export function guidesByCategory(category: GuideCategoryId) {
  return GUIDES.filter((g) => g.category === category);
}
