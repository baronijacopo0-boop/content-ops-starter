import { profile, services, type Service } from '@/data/profile';
import { formatStreet, siteUrl } from '@/lib/site';

/**
 * Dati strutturati Schema.org.
 * - Person: la professionista
 * - ProfessionalService: lo studio (attività locale)
 * Nessun aggregateRating: le opinioni provengono da una piattaforma terza.
 */
export function buildJsonLd() {
    const personId = `${siteUrl}/#person`;
    const businessId = `${siteUrl}/#studio`;
    const sameAs = [profile.externalProfile.url, ...profile.socialLinks.map((s) => s.url)];

    const person = {
        '@type': 'Person',
        '@id': personId,
        name: profile.fullName,
        givenName: profile.firstName,
        familyName: profile.lastName,
        honorificPrefix: 'Dott.ssa',
        jobTitle: profile.titles.join(', '),
        description: `${profile.titles.join(', ')}. Consulenza psicologica e sessuologica a ${profile.address.city} e online.`,
        url: siteUrl,
        knowsAbout: ['Psicologia clinica', 'Sessuologia clinica', 'Approccio sistemico-relazionale', 'Psicologia di coppia', 'Sostegno alla genitorialità'],
        worksFor: { '@id': businessId },
        sameAs,
        ...(profile.email && { email: profile.email }),
        ...(profile.phone && { telephone: profile.phone })
    };

    const business = {
        '@type': 'ProfessionalService',
        '@id': businessId,
        name: `${profile.fullName} – ${profile.professionalTitle}`,
        description: `Studio di psicologia e sessuologia clinica a ${profile.address.city}. Percorsi individuali e di coppia, consulenza sessuologica, supporto alla genitorialità e consulenze online.`,
        url: siteUrl,
        image: `${siteUrl}/opengraph-image`,
        founder: { '@id': personId },
        employee: { '@id': personId },
        vatID: `IT${profile.vatNumber}`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: formatStreet(),
            postalCode: profile.address.postalCode,
            addressLocality: profile.address.city,
            addressRegion: profile.address.province,
            addressCountry: profile.address.country
        },
        areaServed: [
            { '@type': 'City', name: profile.address.city },
            { '@type': 'Country', name: 'Italia' }
        ],
        availableLanguage: 'it',
        knowsLanguage: 'it',
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Percorsi',
            itemListElement: services.map((s) => ({
                '@type': 'Offer',
                itemOffered: { '@type': 'Service', name: s.title, url: `${siteUrl}/percorsi/${s.slug}` }
            }))
        },
        sameAs,
        ...(profile.email && { email: profile.email }),
        ...(profile.phone && { telephone: profile.phone })
    };

    const website = {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: profile.fullName,
        inLanguage: 'it-IT',
        publisher: { '@id': personId }
    };

    return {
        '@context': 'https://schema.org',
        '@graph': [website, person, business]
    };
}

export function buildServiceJsonLd(service: Service) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        description: service.seoDescription,
        url: `${siteUrl}/percorsi/${service.slug}`,
        provider: { '@id': `${siteUrl}/#studio` },
        areaServed: [profile.address.city, 'Online']
    };
}
