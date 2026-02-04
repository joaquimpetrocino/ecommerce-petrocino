import Link from "next/link";
import { getStoreConfig } from "@/lib/admin/store-config";
import { splitStoreName } from "@/lib/utils";
import { MapPin, Mail, Phone, ShoppingBag, ShoppingCart } from "lucide-react";
import Ca from "zod/v4/locales/ca.js";

export async function Footer() {
    const config = await getStoreConfig();
    const storeName = config.module === "sports" ? "LeagueSports" : "AutoParts Online";

    return (
        <footer className="border-t border-neutral-200 bg-neutral-50/50">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-5 ">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            <div className="text-3xl font-heading font-bold text-primary uppercase tracking-tighter">
                                {config.logoUrl ? (
                                    <div className="relative h-24 w-auto">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={config.logoUrl}
                                            alt={storeName}
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>
                                ) : (
                                    (() => {
                                        const { first, second } = splitStoreName(config.storeName);
                                        return (
                                            <>{first}{second && <span className="text-accent">{second}</span>}</>
                                        );
                                    })()
                                )}
                            </div>
                        </Link>
                        <p className="text-neutral-500 font-body leading-relaxed max-w-sm text-base">
                            {config.module === "sports"
                                ? "Excelência em artigos esportivos. Produtos oficiais e qualidade garantida para sua melhor performance."
                                : "A maior variedade de peças automotivas. Qualidade e confiança para o seu veículo em um só lugar."}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-3">
                        <h3 className="mb-6 font-heading font-bold text-neutral-900 uppercase tracking-widest text-xs">
                            Links Rápidos
                        </h3>
                        <ul className="space-y-4 font-body text-neutral-600">
                            <li>
                                <Link href="/produtos" className="hover:text-primary transition-colors flex items-center gap-2 group text-sm">
                                    <ShoppingBag className="w-4 h-4 text-neutral-400 group-hover:text-primary transition-colors" />
                                    Todos os Produtos
                                </Link>
                            </li>
                            <li>
                                <Link href="/carrinho" className="hover:text-primary transition-colors flex items-center gap-2 group text-sm">
                                    <ShoppingCart className="h-4 w-4 text-neutral-400 group-hover:text-primary transition-colors" />
                                    Meu Carrinho
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="lg:col-span-4">
                        <h3 className="mb-6 font-heading font-bold text-neutral-900 uppercase tracking-widest text-xs">
                            Atendimento
                        </h3>
                        <div className="space-y-5 font-body">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm">
                                    <Phone className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">WhatsApp</span>
                                    <a
                                        href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, vim através do site da ${storeName} e gostaria de mais informações.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-700 hover:text-primary transition-colors font-medium text-sm"
                                    >
                                        {config.whatsappNumber}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm">
                                    <Mail className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">E-mail</span>
                                    <a
                                        href={`mailto:${config.storeEmail}?subject=${encodeURIComponent(`Contato via site ${storeName}`)}&body=${encodeURIComponent("Olá, \n\nVim através do site e gostaria de mais informações.")}`}
                                        className="text-neutral-700 hover:text-primary transition-colors font-medium text-sm break-all"
                                    >
                                        {config.storeEmail}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Endereço</span>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${config.storeAddress}${config.storeNumber ? `, ${config.storeNumber}` : ""}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-700 hover:text-primary transition-colors leading-snug font-medium text-sm block"
                                    >
                                        {config.storeAddress}{config.storeNumber && `, ${config.storeNumber}`}
                                        {config.storeComplement && <span className="block text-neutral-400 font-normal">{config.storeComplement}</span>}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-neutral-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center font-body text-xs text-neutral-400">
                    <p>&copy; {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacidade" className="hover:text-primary transition-colors cursor-pointer">Privacidade</Link>
                        <Link href="/termos" className="hover:text-primary transition-colors cursor-pointer">Termos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
