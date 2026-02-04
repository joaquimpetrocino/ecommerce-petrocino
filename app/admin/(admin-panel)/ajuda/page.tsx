"use client";

import { useEffect, useState } from "react";
import {
    Database,
    Cloud,
    Server,
    ShieldCheck,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    Info
} from "lucide-react";

export default function HelpPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/system-status")
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="font-heading font-bold text-neutral-900 text-4xl uppercase tracking-tight">
                    Ajuda & Status do Sistema
                </h1>
                <p className="text-neutral-500 font-body mt-2">
                    Informações sobre a infraestrutura da sua loja e serviços utilizados.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

                {/* MongoDB Card */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex items-center gap-3">
                        <Database className="w-6 h-6 text-green-600" />
                        <div>
                            <h3 className="font-heading font-bold text-neutral-900 text-lg">Banco de Dados (MongoDB)</h3>
                            <p className="text-xs text-neutral-500 font-body">Armazena produtos, pedidos e clientes.</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between text-sm font-body">
                            <span className="text-neutral-600">Plano Atual:</span>
                            <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Gratuito (Shared)</span>
                        </div>

                        {loading ? (
                            <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase text-neutral-500">
                                    <span>Uso: {formatBytes(stats?.mongodb?.used || 0)}</span>
                                    <span>Limite: 512 MB</span>
                                </div>
                                <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${stats?.mongodb?.percent > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(stats?.mongodb?.percent || 0, 100)}%` }}
                                    />
                                </div>
                                {stats?.mongodb?.percent > 80 && (
                                    <div className="flex items-start gap-2 text-red-600 text-xs mt-2 bg-red-50 p-2 rounded">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <p>Seu banco de dados está quase cheio. Considere fazer upgrade do plano no MongoDB Atlas ou limpar registros antigos.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-neutral-100">
                            <a
                                href="https://cloud.mongodb.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                            >
                                Acessar MongoDB Atlas <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* UploadThing Card */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex items-center gap-3">
                        <Cloud className="w-6 h-6 text-red-600" />
                        <div>
                            <h3 className="font-heading font-bold text-neutral-900 text-lg">Imagens (UploadThing)</h3>
                            <p className="text-xs text-neutral-500 font-body">Armazenamento das fotos dos produtos.</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between text-sm font-body">
                            <span className="text-neutral-600">Plano Atual:</span>
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Gratuito</span>
                        </div>

                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start gap-2">
                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>
                                O plano gratuito possui um limite de <strong>2GB</strong> compartilhado.
                                Se atingir o limite, o upload de novas imagens falhará.
                                <br /><br />
                                <span className="text-xs opacity-80">Dica: Exclua imagens de produtos antigos que não são mais vendidos.</span>
                            </p>
                        </div>

                        <div className="pt-4 border-t border-neutral-100">
                            <a
                                href="https://uploadthing.com/dashboard/joaquimpetrocino-personal-team/gb6fusesss"
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                            >
                                Gerenciar Arquivos no UploadThing <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Vercel Card */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex items-center gap-3">
                        <Server className="w-6 h-6 text-black" />
                        <div>
                            <h3 className="font-heading font-bold text-neutral-900 text-lg">Hospedagem (Vercel)</h3>
                            <p className="text-xs text-neutral-500 font-body">Onde o site "mora" e roda.</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between text-sm font-body">
                            <span className="text-neutral-600">Plano Atual:</span>
                            <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-1 rounded">Hobby (Gratuito)</span>
                        </div>

                        <ul className="space-y-2 text-sm text-neutral-600">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                <span>Ideal para projetos pessoais e testes.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                                <span>Possui limites de uso comercial.</span>
                            </li>
                        </ul>

                        <div className="pt-4 border-t border-neutral-100">
                            <a
                                href="https://vercel.com/dashboard"
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                            >
                                Acessar Dashboard Vercel <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                        <div>
                            <h3 className="font-heading font-bold text-neutral-900 text-lg">Autenticação</h3>
                            <p className="text-xs text-neutral-500 font-body">Sistema de login seguro.</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-neutral-50 p-4 rounded-lg">
                            <p className="text-sm text-neutral-700">
                                O login administrativo é feito via <span className="font-bold">Conta Google</span>.
                                Isso significa que você não precisa gerenciar uma senha extra para este site.
                                A segurança depende da sua conta Google.
                            </p>
                        </div>
                        <div className="text-xs text-neutral-500">
                            <p>Emails autorizados são configurados via variáveis de ambiente no sistema.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
