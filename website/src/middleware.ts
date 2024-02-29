import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

export async function middleware(request: NextRequest) {
    console.log("Middleware:")
    console.log(request.nextUrl.toString())
    console.log(request.headers)
    console.log()
    const token = request.cookies.get("aisb.session-token")

    if (!token?.value) {
        return NextResponse.next()
    }

    try {
        await jose.jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.NEXTAUTH_SECRET),
        )
    } catch (e) {
        console.error(e)
        const url = new URL(request.url, "/api/auth/signin")
        request.cookies.delete("aisb.session-token")
        return NextResponse.redirect(url)
    }

    return NextResponse.next({
        headers: {
            ...(process.env.NEXT_PUBLIC_API_URL
                ? {
                      "Access-Control-Allow-Origin":
                          process.env.NEXT_PUBLIC_API_URL,
                  }
                : {}),
            "Access-Control-Allow-Credentials": "true",
        },
    })
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
