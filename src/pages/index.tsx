import Head from 'next/head';
import { useCallback, useState } from 'react';
import { producer, type Beat } from '../producer/data';
import { Marquee, useReveal } from '../producer/motion';
import { PlayerProvider } from '../producer/player';
import { About, BeatStore, Contact, Footer, Hero, LicenseModal, Licenses, Nav, PlayerBar, Services } from '../producer/sections';

const description = `${producer.name} (${producer.short}) – producer trap, drill e boom bap. Ascolta i beat, scegli la licenza o richiedi un beat su misura.`;

export default function Home() {
    const [buying, setBuying] = useState<Beat | null>(null);
    const close = useCallback(() => setBuying(null), []);
    useReveal();
    return (
        <PlayerProvider>
            <Head>
                <title>{`${producer.name} | Beat Trap, Drill & Boom Bap`}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta property="og:title" content={`${producer.name} | Beat Trap, Drill & Boom Bap`} />
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
                    <Marquee items={['Trap', 'Drill', 'Boom Bap', 'Hip Hop', 'prod. JSF', 'Beat su misura', 'Mix & Master']} />
                    <BeatStore onBuy={setBuying} />
                    <Licenses />
                    <Services />
                    <Marquee items={['Premi play', 'Sei fuori', 'Jacopo Sei Fuori', 'JSF', 'Premi play', 'Sei fuori']} />
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
