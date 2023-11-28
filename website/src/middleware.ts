import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    //   return NextResponse.redirect(new URL('/home', request.url))
    return NextResponse.next({
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        },
    })
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: "/:path*",
}
