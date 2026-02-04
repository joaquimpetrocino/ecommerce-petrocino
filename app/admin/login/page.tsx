
import { signIn } from "@/auth";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-primary via-primary-dark to-primary flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="font-heading font-bold text-white text-5xl uppercase tracking-tighter">
                        League<span className="text-accent">Sports</span>
                    </h1>
                    <p className="text-white/80 font-body mt-2">Painel Administrativo</p>
                </div>

                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <h2 className="font-heading font-bold text-neutral-900 text-2xl uppercase tracking-tight mb-6">
                        Login Admin
                    </h2>

                    <form
                        action={async () => {
                            "use server";
                            await signIn("google");
                        }}
                        className="space-y-4"
                    >
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-600 font-body mb-4">
                            <p>O acesso é restrito apenas a administradores autorizados.</p>
                            <p className="mt-2 font-bold text-neutral-800">Email autorizado: joaquimpetrocino@gmail.com</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-lg font-heading font-bold text-lg uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <LogIn className="w-5 h-5" />
                            Entrar com Google
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
