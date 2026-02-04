import Link from "next/link";
import { LayoutDashboard, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminNotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Ícone de Alerta */}
                <div className="inline-flex p-6 bg-red-50 rounded-full text-red-500 animate-pulse">
                    <AlertCircle className="w-16 h-16" />
                </div>

                {/* Conteúdo */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-heading font-black text-neutral-900 uppercase tracking-tighter">
                        Área Restrita / Erro 404
                    </h1>
                    <p className="text-neutral-500 font-body text-lg">
                        O recurso administrativo que você tentou acessar não existe ou foi movido.
                    </p>
                </div>

                {/* Divisor */}
                <div className="h-px bg-neutral-200 w-24 mx-auto"></div>

                {/* Botões */}
                <div className="grid gap-3 pt-4">
                    <Link
                        href="/admin/home"
                        className="bg-neutral-900 hover:bg-black text-white px-6 py-3 rounded-xl font-heading font-bold uppercase transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Ir para o Painel
                    </Link>
                    <Link
                        href="/"
                        className="text-neutral-500 hover:text-neutral-900 font-body font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Acessar Loja Pública
                    </Link>
                </div>
            </div>
        </div>
    );
}
