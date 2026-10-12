import Link from 'next/link';
import { navigation, profile } from '@/data/profile';
import { formatCityLine, formatStreet, telHref } from '@/lib/site';
import { CurrentYear } from './CurrentYear';

export function Footer() {
    return (
        <footer className="on-dark bg-forest-deep text-cream">
            <div className="container py-16 lg:py-20">
                <div className="grid gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <p className="font-serif text-3xl leading-tight">{profile.fullName}</p>
                        <p className="mt-3 text-sm uppercase tracking-[0.18em] text-sage-light">{profile.professionalTitle}</p>
                        <p className="mt-6 text-cream/75">{profile.address.city} · Consulenze online</p>
                    </div>

                    <nav aria-label="Navigazione nel footer" className="lg:col-span-3">
                        <p className="text-eyebrow font-semibold uppercase text-sage-light">Navigazione</p>
                        <ul className="mt-3 grid grid-cols-2 gap-x-6 text-[0.95rem] lg:grid-cols-1">
                            {navigation.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="link-underline tap-target text-cream/85 hover:text-cream">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="lg:col-span-4">
                        <p className="text-eyebrow font-semibold uppercase text-sage-light">Studio</p>
                        <address className="mt-5 not-italic leading-relaxed text-cream/85">
                            {formatStreet()}
                            <br />
                            {formatCityLine()}
                        </address>
                        {(profile.phone || profile.email) && (
                            <ul className="mt-4 space-y-1 text-cream/85">
                                {profile.phone && (
                                    <li>
                                        <a href={telHref(profile.phone)} className="link-underline tap-target">
                                            {profile.phone}
                                        </a>
                                    </li>
                                )}
                                {profile.email && (
                                    <li>
                                        <a href={`mailto:${profile.email}`} className="link-underline tap-target">
                                            {profile.email}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        )}
                        {profile.socialLinks.length > 0 && (
                            <ul className="mt-4 flex gap-5">
                                {profile.socialLinks.map((s) => (
                                    <li key={s.url}>
                                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline tap-target text-cream/85">
                                            {s.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="mt-16 flex flex-col gap-6 border-t border-cream/15 pt-8 text-sm text-cream/70 lg:flex-row lg:items-center lg:justify-between">
                    <p>
                        Iscrizione Albo degli Psicologi n. {profile.registrationNumber}
                        {profile.registrationBody && ` · ${profile.registrationBody}`}
                        <span aria-hidden> · </span>
                        <br className="sm:hidden" />
                        P. IVA {profile.vatNumber}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <Link href="/privacy" className="link-underline tap-target hover:text-cream">
                            Privacy Policy
                        </Link>
                        <Link href="/cookie-policy" className="link-underline tap-target hover:text-cream">
                            Cookie Policy
                        </Link>
                        <p>
                            © <CurrentYear /> {profile.fullName}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
