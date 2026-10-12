import { CalendarDays } from 'lucide-react';
import { content } from '@/data/profile';
import { bookingEmbedUrl, bookingUrl } from '@/lib/booking';
import { photoPlaceholdersEnabled } from '@/lib/photos';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BookingEmbed } from './BookingEmbed';

/** Prenotazione online collegata al Google Calendar della professionista. */
export function Booking() {
    const url = bookingUrl();
    const demo = !url && photoPlaceholdersEnabled();
    if (!url && !demo) return null;
    const { booking } = content;

    return (
        <section id="prenota" aria-labelledby="booking-title" className="section pb-0 sm:pb-0 lg:pb-0">
            <div className="container grid gap-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-5">
                    <SectionHeading id="booking-title" eyebrow={booking.eyebrow} title={booking.title}>
                        <p>{booking.text}</p>
                    </SectionHeading>
                    <Reveal delay={80}>
                        <p className="mt-6 text-ink-soft">
                            {booking.alternative}{' '}
                            <a href="#contatti" className="link-underline link-underline-static tap-target whitespace-nowrap text-forest">
                                {booking.alternativeCta}
                            </a>
                        </p>
                    </Reveal>
                </div>
                <Reveal delay={100} className="lg:col-span-7">
                    <div className="rounded-[1.75rem] bg-sand p-1.5 sm:p-3">
                        {url ? (
                            <BookingEmbed
                                embedUrl={bookingEmbedUrl(url)}
                                externalUrl={url}
                                loadCta={booking.loadCta}
                                consent={booking.consent}
                                externalCta={booking.externalCta}
                            />
                        ) : (
                            <BookingPreview />
                        )}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/** Anteprima dimostrativa mostrata solo in modalità demo, finché il calendario non è collegato. */
function BookingPreview() {
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven'];
    return (
        <div
            className="relative overflow-hidden rounded-[1.25rem] bg-white/70 p-6 sm:p-8"
            role="img"
            aria-label="Anteprima del calendario di prenotazione, in attesa di collegamento"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-3 font-serif text-2xl text-ink">
                    <CalendarDays aria-hidden className="h-6 w-6 text-forest" strokeWidth={1.3} />
                    Primo colloquio
                </p>
                <span className="rounded-full border border-dashed border-clay-dark/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-clay-dark">
                    Anteprima demo
                </span>
            </div>
            <div aria-hidden className="mt-8 grid grid-cols-5 gap-2 sm:gap-3">
                {days.map((d, i) => (
                    <div key={d} className="flex flex-col items-center gap-2 sm:gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{d}</span>
                        {Array.from({ length: 4 }).map((_, j) => (
                            <span
                                key={j}
                                className={
                                    (i + j) % 3 === 0 ? 'h-10 w-full rounded-lg border border-dashed border-ink/15' : 'h-10 w-full rounded-lg bg-sage-pale/80'
                                }
                            />
                        ))}
                    </div>
                ))}
            </div>
            <p className="mt-8 border-t border-ink/10 pt-6 text-center text-sm leading-relaxed text-ink-soft">
                Qui comparirà il calendario delle disponibilità collegato a Google Calendar.
                <br className="hidden sm:block" /> Le prenotazioni arriveranno direttamente nel calendario della Dott.ssa.
            </p>
        </div>
    );
}
