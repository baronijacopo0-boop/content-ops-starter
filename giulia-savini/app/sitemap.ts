import type { MetadataRoute } from 'next';
import { legal, services } from '@/data/profile';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    const pages: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/`, lastModified, changeFrequency: 'monthly', priority: 1 },
        ...services.map((s) => ({ url: `${siteUrl}/percorsi/${s.slug}`, lastModified, changeFrequency: 'yearly' as const, priority: 0.8 }))
    ];
    if (legal.reviewed) {
        pages.push(
            { url: `${siteUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
            { url: `${siteUrl}/cookie-policy`, lastModified, changeFrequency: 'yearly', priority: 0.2 }
        );
    }
    return pages;
}
