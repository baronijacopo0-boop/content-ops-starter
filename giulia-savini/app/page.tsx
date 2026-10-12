import { About } from '@/components/sections/About';
import { Booking } from '@/components/sections/Booking';
import { Approach } from '@/components/sections/Approach';
import { Contact } from '@/components/sections/Contact';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { Hero } from '@/components/sections/Hero';
import { Intro } from '@/components/sections/Intro';
import { Places } from '@/components/sections/Places';
import { Quote } from '@/components/sections/Quote';
import { Reviews } from '@/components/sections/Reviews';
import { Services } from '@/components/sections/Services';
import { Steps } from '@/components/sections/Steps';
import { StudioGallery } from '@/components/sections/StudioGallery';

export default function HomePage() {
    return (
        <>
            <Hero />
            <Intro />
            <About />
            <Services />
            <Approach />
            <Quote />
            <Steps />
            <Places />
            <StudioGallery />
            <Reviews />
            <Faq />
            <FinalCta />
            <Booking />
            <Contact />
        </>
    );
}
