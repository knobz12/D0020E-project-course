import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("aisb.session-token")

    if (!token?.value) {
        const url = new URL(request.url)
        return NextResponse.redirect(`${url.origin}/api/auth/signin`)
    }

    return NextResponse.next({
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        },
    })
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
