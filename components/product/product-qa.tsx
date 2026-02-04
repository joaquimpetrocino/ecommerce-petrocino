"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, User, CheckCircle } from "lucide-react";

interface Question {
    id: string;
    userName: string;
    question: string;
    answer?: string;
    createdAt: number;
    answeredAt?: number;
}

interface ProductQAProps {
    productId: string;
    productName: string;
    productImage: string;
}

export function ProductQA({ productId, productName, productImage }: ProductQAProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        userName: "",
        userEmail: "",
        question: "",
        honeypot: "" // Anti-spam hidden field
    });

    useEffect(() => {
        fetchQuestions();
    }, [productId]);

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`/api/questions?productId=${productId}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setQuestions(data);
                } else {
                    console.error("API response is not an array:", data);
                    setQuestions([]);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar perguntas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    productName,
                    productImage,
                    ...formData
                })
            });

            if (res.ok) {
                setSuccess(true);
                setFormData({ userName: "", userEmail: "", question: "", honeypot: "" });
            } else {
                alert("Erro ao enviar pergunta. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao enviar pergunta:", error);
            alert("Erro ao enviar pergunta. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8 shadow-sm my-12" id="perguntas">
            <h2 className="font-heading font-bold text-2xl uppercase tracking-tight text-neutral-900 mb-8 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                Perguntas e Respostas
            </h2>

            {/* Formulário de Pergunta */}
            <div className="mb-12">
                <h3 className="font-heading font-bold text-lg text-neutral-900 mb-4">
                    Tire suas dúvidas sobre este produto
                </h3>

                {success ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4 animate-fade-in">
                        <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-green-800 text-lg mb-1">Pergunta enviada com sucesso!</h4>
                            <p className="text-green-700">
                                Sua pergunta foi encaminhada para nossa equipe e será respondida em breve.
                                Assim que aprovada, ela aparecerá aqui.
                            </p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="mt-4 text-sm font-bold text-green-800 underline hover:text-green-900"
                            >
                                Enviar nova pergunta
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                        <div className="grid gap-4 md:grid-cols-2 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-1">Seu Nome *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.userName}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z\sÀ-ÿ]/g, "");
                                        setFormData({ ...formData, userName: value });
                                    }}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Ex: Maria Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-1">Seu Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.userEmail}
                                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Não será publicado"
                                />
                                <p className="text-xs text-neutral-500 mt-1">Usaremos apenas para notificar a resposta.</p>
                            </div>
                        </div>

                        {/* Honeypot field (hidden) */}
                        <div className="hidden">
                            <input
                                type="text"
                                name="honeypot"
                                value={formData.honeypot}
                                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-neutral-700 mb-1">Sua Pergunta *</label>
                            <textarea
                                required
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                                placeholder="Escreva sua dúvida aqui..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-lg font-heading font-bold uppercase transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? "Enviando..." : (
                                <>
                                    Enviar Pergunta
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>

            {/* Lista de Perguntas */}
            <div>
                <h3 className="font-heading font-bold text-lg text-neutral-900 mb-6">
                    Últimas perguntas
                </h3>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-neutral-100 h-24 rounded-lg"></div>
                        ))}
                    </div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                        <MessageCircle className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500">Nenhuma pergunta feita ainda. Seja o primeiro!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((q) => (
                            <div key={q.id} className="border-b border-neutral-100 last:border-0 pb-6 last:pb-0">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="bg-neutral-100 p-2 rounded-full">
                                        <MessageCircle className="w-4 h-4 text-neutral-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900 text-lg leading-snug">
                                            {q.question}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            Por: {q.userName.split(" ")[0]} • {formatDate(q.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {q.answer && (
                                    <div className="flex items-start gap-3 ml-4 pl-4 border-l-2 border-primary/20">
                                        <div className="bg-primary/10 p-2 rounded-full mt-1">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-body text-neutral-700 leading-relaxed bg-neutral-50 p-4 rounded-lg rounded-tl-none">
                                                {q.answer}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-1 ml-1">
                                                Resposta da Loja • {formatDate(q.answeredAt!)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
