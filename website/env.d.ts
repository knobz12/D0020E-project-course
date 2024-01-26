namespace NodeJS {
    interface ProcessEnv {
        // Browser and server
        NEXT_PUBLIC_API_URL: string

        // Only server
        NEXTAUTH_URL: string
        NEXTAUTH_SECRET: string
        CHROMA_URL: string
        DATABASE_URL: string
        GITHUB_ID: string
        GITHUB_SECRET: string
        GOOGLE_ID: string
        GOOGLE_SECRET: string
    }
}
