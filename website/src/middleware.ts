import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("aisb.session-token")

    if (!token?.value) {
        const url = new URL(request.url)
        return NextResponse.redirect(`${url.origin}/api/auth/signin`)
    }

    try {
        await jose.jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.NEXTAUTH_SECRET),
        )
    } catch (e) {
        console.error(e)
        const url = new URL(request.url)
        request.cookies.delete("aisb.session-token")
        return NextResponse.redirect(`${url.origin}/api/auth/signin`)
    }

    return NextResponse.next({
        headers: {
            "Access-Control-Allow-Origin": "http://localhost:3030",
            "Access-Control-Allow-Credentials": "true",
            // "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        },
    })
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
