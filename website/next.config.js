/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    assetPrefix:
        process.env.ENABLE_ASSET_PREFIX === "true"
            ? "https://cdn.aistudybuddy.se"
            : undefined,
    images: {
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 31536000,
        remotePatterns: [{ hostname: "cdn.aistudybuddy.se" }],
    },
}

module.exports = nextConfig
