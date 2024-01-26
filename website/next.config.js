/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    assetPrefix:
        process.env.ENABLE_ASSET_PREFIX === "true"
            ? "https://cdn.aistudybuddy.se"
            : undefined,
    images: {
        remotePatterns: [{ hostname: "cdn.aistudybuddy.se" }],
        unoptimized: true,
    },
}

module.exports = nextConfig
