import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const securityHeaders = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' }
];

const nextConfig = {
    // Il progetto vive in una sottocartella del repository: evita che Next.js usi la root sbagliata
    outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
    reactStrictMode: true,
    poweredByHeader: false,
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [375, 430, 640, 768, 1024, 1280, 1440, 1920]
    },
    async headers() {
        return [{ source: '/:path*', headers: securityHeaders }];
    }
};

export default nextConfig;
