import type { NextConfig } from 'next';

/**
 * FLIP AI – Next.js configuration.
 *
 * Two deployment targets are supported (see docs/DEPLOY_HOSTINGER.md):
 *  - default: Node.js server (`npm run build && npm start`) → Hostinger "Node.js Web App" or VPS.
 *  - NEXT_OUTPUT=export: fully static build in `out/` → any Hostinger shared plan (public_html).
 *    In static mode the API routes are excluded and the AI layer falls back to the built-in mock engine.
 */
const isStaticExport = process.env.NEXT_OUTPUT === 'export';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_STATIC_EXPORT: isStaticExport ? '1' : '' },
  poweredByHeader: false,
  // Route handlers live in `route.ts` files: excluding the `.ts` page extension drops them from a static export.
  pageExtensions: isStaticExport ? ['tsx'] : ['tsx', 'ts'],
  ...(isStaticExport ? { output: 'export', trailingSlash: true } : {}),
  images: {
    // Avoids the sharp/native image optimizer on shared hosting; images are already resized client-side on upload.
    unoptimized: true,
  },
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [{ source: '/:path*', headers: securityHeaders }];
        },
      }),
};

export default nextConfig;
