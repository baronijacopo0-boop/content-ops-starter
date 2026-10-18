import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import '@/styles/globals.css';

const serif = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-serif'
});

const sans = Manrope({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sans'
});

export const metadata: Metadata = {
    title: { default: 'Anteprime Lotto 4', template: '%s · Anteprima' },
    // Anteprime riservate: non vanno indicizzate
    robots: { index: false, follow: false },
    formatDetection: { telephone: false, email: false, address: false }
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="it" className={`${serif.variable} ${sans.variable}`}>
            <body>{children}</body>
        </html>
    );
}
