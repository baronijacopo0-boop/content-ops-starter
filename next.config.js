/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    // Export statico (HTML/CSS/JS) per hosting tradizionale come Hostinger
    output: 'export',
    images: { unoptimized: true },
    env: {
        stackbitPreview: process.env.STACKBIT_PREVIEW
    },
    trailingSlash: true,
    reactStrictMode: true,
    allowedDevOrigins: [
        '192.168.1.84'
    ]
};

module.exports = nextConfig;
