import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnAdminPanel = req.nextUrl.pathname.startsWith("/admin")
    const isLoginPage = req.nextUrl.pathname.startsWith("/admin/login")

    if (isOnAdminPanel) {
        if (isLoginPage) {
            if (isLoggedIn) {
                return Response.redirect(new URL("/admin", req.nextUrl))
            }
            return // Allow access to login page
        }

        if (!isLoggedIn) {
            return Response.redirect(new URL("/admin/login", req.nextUrl))
        }
    }
})

export const config = {
    matcher: ["/admin/:path*"],
}
