import { NextResponse } from 'next/server';
import { bookingConfig } from '@/data/profile';
import { fetchBusy } from '@/lib/booking/google';
import { bookingRange, computeAvailability } from '@/lib/booking/slots';
import { bookingMode } from '@/lib/booking/status';
import { addDays, zonedToUtc } from '@/lib/booking/time';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Restituisce gli orari liberi per i prossimi giorni prenotabili. */
export async function GET() {
    const mode = bookingMode();
    if (mode === 'off') return NextResponse.json({ ok: false, error: 'Prenotazione online non attiva.' }, { status: 404 });

    const now = new Date();
    const { first, last } = bookingRange(now);
    let busy: Awaited<ReturnType<typeof fetchBusy>> = [];

    if (mode === 'live') {
        try {
            busy = await fetchBusy(
                zonedToUtc(first, '00:00', bookingConfig.timeZone),
                zonedToUtc(addDays(last, 1), '00:00', bookingConfig.timeZone),
                bookingConfig.timeZone
            );
        } catch (err) {
            console.error('[booking] Lettura disponibilità non riuscita:', err instanceof Error ? err.message : err);
            return NextResponse.json({ ok: false, error: 'Non è stato possibile caricare le disponibilità.' }, { status: 502 });
        }
    }

    return NextResponse.json(
        {
            ok: true,
            mode,
            first,
            last,
            slotMinutes: bookingConfig.slotMinutes,
            availability: computeAvailability(busy, now)
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}
