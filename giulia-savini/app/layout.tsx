import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { RevealObserver } from '@/components/layout/RevealObserver';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { JsonLd } from '@/components/JsonLd';
import { profile } from '@/data/profile';
import { buildJsonLd } from '@/lib/schema';
import { seo, siteUrl } from '@/lib/site';

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
    metadataBase: new URL(siteUrl),
    title: { default: seo.title, template: `%s | ${profile.fullName}` },
    description: seo.description,
    applicationName: profile.fullName,
    authors: [{ name: profile.fullName }],
    creator: profile.fullName,
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        locale: seo.locale,
        url: '/',
        siteName: profile.fullName,
        title: seo.title,
        description: seo.description
    },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false, email: false, address: false }
};

export const viewport: Viewport = {
    themeColor: '#F7F4EF',
    width: 'device-width',
    initialScale: 1
};

// Abilita le animazioni di comparsa solo con JS attivo; fallback se l'idratazione non avviene.
const revealScript = `document.documentElement.classList.add('js');setTimeout(function(){if(!window.__revealReady)document.documentElement.classList.remove('js')},2500);`;

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="it" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: revealScript }} />
                <JsonLd data={buildJsonLd()} />
            </head>
            <body>
                <a
                    href="#contenuto"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-cream"
                >
                    Vai al contenuto
                </a>
                <Navbar />
                <main id="contenuto" tabIndex={-1} className="outline-none">
                    {children}
                </main>
                <Footer />
                <WhatsAppButton />
                <RevealObserver />
            </body>
        </html>
    );
}
