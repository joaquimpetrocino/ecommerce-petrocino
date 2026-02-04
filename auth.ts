import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "joaquimpetrocino@gmail.com").split(",").map(email => email.trim());

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    pages: {
        signIn: "/admin/login",
        error: "/admin/login", // Redirect to login page on error
    },
    callbacks: {
        async signIn({ user }) {
            // Permitir apenas os e-mails da lista de administradores
            if (user.email && ADMIN_EMAILS.includes(user.email)) {
                return true;
            }
            return false;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            return session;
        }
    },
    secret: process.env.AUTH_SECRET,
    session: {
        strategy: "jwt",
    },
});
