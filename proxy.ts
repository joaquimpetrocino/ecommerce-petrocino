import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session;
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isLoginRoute = nextUrl.pathname.startsWith("/admin/login");

    if (isAdminRoute && !isLoginRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }

    if (isLoginRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*", "/admin"],
};
