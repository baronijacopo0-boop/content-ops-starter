import Head from 'next/head';
import { useCallback, useState } from 'react';
import { producer, type Beat } from '../producer/data';
import { PlayerProvider } from '../producer/player';
import { About, BeatStore, Contact, Footer, Hero, LicenseModal, Licenses, Nav, PlayerBar, Services } from '../producer/sections';

const description = `${producer.name} (${producer.short}) – producer trap & drill. Ascolta i beat, scegli la licenza o richiedi un beat su misura.`;

export default function Home() {
    const [buying, setBuying] = useState<Beat | null>(null);
    const close = useCallback(() => setBuying(null), []);
    return (
        <PlayerProvider>
            <Head>
                <title>{`${producer.name} | Beat Trap & Drill`}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta property="og:title" content={`${producer.name} | Beat Trap & Drill`} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content="/images/jsf/icon-512.png" />
                <meta property="og:type" content="website" />
                <link rel="icon" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/images/jsf/apple-touch-icon.png" />
            </Head>
            <div className="jsf min-h-screen bg-ink font-body text-cream antialiased">
                <Nav />
                <main>
                    <Hero />
                    <BeatStore onBuy={setBuying} />
                    <Licenses />
                    <Services />
                    <About />
                    <Contact />
                </main>
                <Footer />
                <PlayerBar onBuy={setBuying} />
                <LicenseModal beat={buying} onClose={close} />
            </div>
        </PlayerProvider>
    );
}
