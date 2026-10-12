import { content } from '@/data/profile';
import { bookingMode } from '@/lib/booking/status';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { BookingCalendar } from './BookingCalendar';

/** Prenotazione online: calendario con giorni e orari, collegato al Google Calendar della professionista. */
export function Booking() {
    if (bookingMode() === 'off') return null;
    const { booking } = content;

    return (
        <section id="prenota" aria-labelledby="booking-title" className="section pb-0 sm:pb-0 lg:pb-0">
            <div className="container">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading id="booking-title" eyebrow={booking.eyebrow} title={booking.title}>
                        <p>{booking.text}</p>
                    </SectionHeading>
                    <Reveal delay={80} className="lg:pb-3">
                        <p className="text-ink-soft">
                            {booking.alternative}{' '}
                            <a href="#contatti" className="link-underline link-underline-static tap-target whitespace-nowrap text-forest">
                                {booking.alternativeCta}
                            </a>
                        </p>
                    </Reveal>
                </div>
                <Reveal delay={100} className="mt-10 lg:mt-12">
                    <div className="rounded-[1.75rem] bg-sand p-1.5 sm:p-3">
                        <BookingCalendar alternative={booking.alternative} alternativeCta={booking.alternativeCta} note={booking.note} />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
