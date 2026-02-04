import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;

    // Se for rota de admin e não estiver logado
    if (nextUrl.pathname.startsWith("/admin") && !nextUrl.pathname.startsWith("/admin/login")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/admin/login", nextUrl));
        }
    }

    // Se estiver logado e tentar acessar o login
    if (nextUrl.pathname.startsWith("/admin/login") && isLoggedIn) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*"],
};
