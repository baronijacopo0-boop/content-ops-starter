/** @type {import('next').NextConfig} */
const nextConfig = {
    // Sito statico: ogni anteprima diventa una cartella HTML in /out
    output: 'export',
    trailingSlash: true,
    reactStrictMode: true,
    images: { unoptimized: true }
};

export default nextConfig;
