import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { About, Approach, Areas, Contact, FaqSection, Footer, Hero, Navbar, PreviewBanner } from '@/components/sections';
import { getPsicologo, psicologi } from '@/data/psicologi';
import { defaultTagline, fullName } from '@/data/standard';
import { themeStyle } from '@/data/themes';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
    return psicologi.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const p = getPsicologo((await params).slug);
    if (!p) return {};
    return {
        title: `${fullName(p)} · ${p.title} a ${p.city}`,
        description: p.tagline ?? defaultTagline(p)
    };
}

export default async function AnteprimaPage({ params }: Props) {
    const p = getPsicologo((await params).slug);
    if (!p) notFound();
    return (
        <div style={themeStyle(p.theme)} className="bg-paper text-ink">
            <PreviewBanner />
            <Navbar p={p} />
            <main>
                <Hero p={p} />
                <About p={p} />
                <Areas p={p} />
                <Approach p={p} />
                <FaqSection p={p} />
                <Contact p={p} />
            </main>
            <Footer p={p} />
        </div>
    );
}
