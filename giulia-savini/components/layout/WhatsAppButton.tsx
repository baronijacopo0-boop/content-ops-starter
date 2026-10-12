import { MessageCircle } from 'lucide-react';
import { whatsappNumber, whatsappUrl } from '@/lib/site';

/** Compare solo se la variabile d'ambiente WHATSAPP_NUMBER è valorizzata. */
export function WhatsAppButton() {
    const number = whatsappNumber();
    if (!number) return null;

    return (
        <a
            href={whatsappUrl(number)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Scrivimi su WhatsApp (si apre in una nuova finestra)"
            className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream shadow-[0_10px_30px_-10px_rgba(41,42,39,0.45)] transition-[transform,background-color] duration-300 ease-gentle hover:-translate-y-0.5 hover:bg-forest-deep sm:bottom-7 sm:right-7"
        >
            <MessageCircle aria-hidden className="h-6 w-6" strokeWidth={1.5} />
        </a>
    );
}
