// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const prelaunch = process.env.NEXT_PUBLIC_PRELAUNCH === "1";
    const { pathname } = req.nextUrl;

    // allow api, next assets, static files, and the launch page itself
    const isAsset = pathname.includes(".") || pathname.startsWith("/_next");
    if (pathname.startsWith("/api") || pathname.startsWith("/launch") || isAsset) {
        return NextResponse.next();
    }

    // during prelaunch, redirect the root route to /launch
    if (prelaunch && pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = "/launch";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
