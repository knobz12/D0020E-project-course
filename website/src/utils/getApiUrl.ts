export function getApiUrl(path: string): string {
    const url = new URL(path, process.env.NEXT_PUBLIC_API_URL)
    return url.toString()
}

export function getApiUrlUrl(path: string): URL {
    return new URL(path, process.env.NEXT_PUBLIC_API_URL)
}
