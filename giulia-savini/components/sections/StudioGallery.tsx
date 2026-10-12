import { content, profile } from '@/data/profile';
import { photoPlaceholdersEnabled, publicFileExists } from '@/lib/photos';
import { cn } from '@/lib/cn';
import { Portrait } from '@/components/ui/Portrait';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const layout = [
    { box: 'sm:col-span-7 lg:col-span-5', ratio: 'aspect-[4/5]', format: 'verticale 4:5', variant: 'hero' as const },
    { box: 'sm:col-span-5 lg:col-span-4 lg:mt-24', ratio: 'aspect-[3/4]', format: 'verticale 3:4', variant: 'about' as const },
    { box: 'sm:col-span-12 lg:col-span-3 lg:self-end', ratio: 'aspect-[4/3] lg:aspect-square', format: 'quadrata o orizzontale', variant: 'hero' as const }
];

/** Galleria dello studio: visibile se almeno una foto è presente o se le cornici demo sono attive. */
export function StudioGallery() {
    const photos = profile.photos.studio;
    const available = photos.filter((p) => publicFileExists(p.src));
    const demo = photoPlaceholdersEnabled();
    if (available.length === 0 && !demo) return null;
    const items = demo ? photos : available;
    const { studioGallery } = content;

    return (
        <section aria-labelledby="studio-gallery-title" className="pb-20 sm:pb-24 lg:pb-32">
            <div className="container">
                <SectionHeading id="studio-gallery-title" eyebrow={studioGallery.eyebrow} title={studioGallery.title}>
                    <p>{studioGallery.text}</p>
                </SectionHeading>
                <ul className="mt-12 grid gap-5 sm:grid-cols-12 lg:mt-16 lg:gap-6">
                    {items.map((photo, i) => {
                        const l = layout[i % layout.length];
                        return (
                            <Reveal as="li" key={photo.src} delay={i * 90} className={cn(l.box)}>
                                <Portrait
                                    src={photo.src}
                                    alt={photo.alt}
                                    hint={photo.hint}
                                    format={l.format}
                                    variant={l.variant}
                                    sizes="(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 92vw"
                                    className={cn(l.ratio, 'rounded-[1.5rem]')}
                                />
                            </Reveal>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
