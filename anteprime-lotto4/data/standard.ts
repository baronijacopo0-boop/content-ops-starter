import type { Faq, Psicologo } from './types';

/** Testi comuni a tutte le anteprime, usati quando il dato specifico manca. */

export function defaultTagline(p: Psicologo) {
    const where = [p.inPerson && `a ${p.city}`, p.online && 'online'].filter(Boolean).join(' e ');
    return `Uno spazio di ascolto e di cura, ${where}. Insieme diamo un nome a ciò che stai vivendo e costruiamo un percorso su misura.`;
}

export const defaultApproach = [
    'Ogni percorso parte da un primo colloquio conoscitivo: è il momento per raccontare cosa ti porta, porre domande e capire se il modo di lavorare fa per te.',
    'Gli obiettivi si definiscono insieme e si rivedono lungo la strada, con tempi e frequenza degli incontri concordati in modo trasparente.'
];

export const steps = [
    { title: 'Il primo contatto', text: 'Scrivi o chiama per fissare un primo colloquio. Bastano poche righe: non serve spiegare tutto subito.' },
    { title: 'Il colloquio conoscitivo', text: 'Ci incontriamo per capire la richiesta, la situazione attuale e cosa ti aspetti dal percorso.' },
    { title: 'Il percorso', text: 'Se decidiamo di proseguire, concordiamo obiettivi, frequenza e durata degli incontri.' }
];

export function standardFaq(p: Psicologo): Faq[] {
    const items: Faq[] = [
        {
            question: 'Come si svolge il primo colloquio?',
            answer: 'È un incontro conoscitivo in cui racconti cosa ti porta a chiedere aiuto. Serve a capire la richiesta e a valutare insieme il percorso più adatto, senza alcun impegno a proseguire.'
        },
        {
            question: 'Quanto dura un percorso?',
            answer: 'Dipende dalla richiesta e dagli obiettivi. La durata e la frequenza degli incontri vengono definite insieme e riviste nel tempo.'
        }
    ];
    if (p.online) {
        items.push({
            question: 'I colloqui online sono efficaci quanto quelli in studio?',
            answer: 'Per molte richieste sì. Il colloquio online si svolge in videochiamata, da un luogo tranquillo e riservato, con la stessa cura e le stesse regole di riservatezza.'
        });
    }
    items.push({
        question: 'Quello che dico resta riservato?',
        answer: 'Sì. Lo psicologo è tenuto al segreto professionale previsto dal Codice Deontologico degli Psicologi Italiani.'
    });
    return items;
}

export function fullName(p: Psicologo) {
    return `${p.honorific} ${p.firstName} ${p.lastName}`;
}

export function initials(p: Psicologo) {
    return `${p.firstName[0]}·${p.lastName[0]}`;
}

export function telHref(phone: string) {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function mapsUrl(p: Psicologo) {
    if (!p.address) return null;
    const query = [p.address.street, p.address.postalCode, p.city].filter(Boolean).join(' ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
