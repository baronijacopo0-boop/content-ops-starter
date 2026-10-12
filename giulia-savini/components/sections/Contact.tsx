import { Mail, MapPin, Phone, Video } from 'lucide-react';
import { content, profile } from '@/data/profile';
import { formatStreet, telHref } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from './ContactForm';

export function Contact() {
    const { contact } = content;
    return (
        <section id="contatti" aria-labelledby="contact-title" className="section">
            <div className="container grid gap-14 lg:grid-cols-12 lg:gap-10">
                <Reveal className="lg:col-span-5">
                    <p className="eyebrow">{contact.eyebrow}</p>
                    <h2 id="contact-title" className="h-section mt-5">
                        {contact.title}
                    </h2>
                    <p className="lead mt-6 max-w-md">{contact.text}</p>

                    <ul className="mt-10 space-y-5 border-t border-ink/10 pt-8">
                        <li className="flex gap-4">
                            <MapPin aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-sage" strokeWidth={1.4} />
                            <span className="leading-relaxed text-ink-soft">
                                <span className="block font-medium text-ink">Studio</span>
                                {formatStreet()}, {profile.address.city}
                            </span>
                        </li>
                        <li className="flex gap-4">
                            <Video aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-sage" strokeWidth={1.4} />
                            <span className="leading-relaxed text-ink-soft">
                                <span className="block font-medium text-ink">Online</span>
                                Incontri in videochiamata
                            </span>
                        </li>
                        {profile.phone && (
                            <li className="flex gap-4">
                                <Phone aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-sage" strokeWidth={1.4} />
                                <a href={telHref(profile.phone)} className="link-underline text-ink">
                                    {profile.phone}
                                </a>
                            </li>
                        )}
                        {profile.email && (
                            <li className="flex gap-4">
                                <Mail aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-sage" strokeWidth={1.4} />
                                <a href={`mailto:${profile.email}`} className="link-underline break-all text-ink">
                                    {profile.email}
                                </a>
                            </li>
                        )}
                    </ul>
                    <p className="mt-8 max-w-md text-sm leading-relaxed text-ink-soft">{contact.privacyNote}</p>
                </Reveal>

                <Reveal delay={100} className="lg:col-span-7">
                    <div className="rounded-[1.75rem] bg-sand p-1.5 sm:p-3">
                        <ContactForm reassurance={contact.reassurance} fallbackEmail={profile.email} />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
