'use client';

import { useEffect, useState } from 'react';

/** Anno corrente: calcolato al build e aggiornato nel browser, così resta corretto anche su pagine statiche. */
export function CurrentYear() {
    const [year, setYear] = useState(() => new Date().getFullYear());
    useEffect(() => setYear(new Date().getFullYear()), []);
    return <span suppressHydrationWarning>{year}</span>;
}
