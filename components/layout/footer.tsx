import Link from "next/link";
import { getStoreConfig } from "@/lib/admin/store-config";

export async function Footer() {
    const config = await getStoreConfig();
    const storeName = config.module === "sports" ? "LeagueSports" : "AutoParts Online";

    return (
        <footer className="border-t border-neutral-200 bg-white">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div>
                        <div className="mb-4 text-3xl font-heading font-bold text-primary uppercase tracking-tighter">
                            {config.module === "sports" ? (
                                <>League<span className="text-accent">Sports</span></>
                            ) : (
                                <>Auto<span className="text-accent">Parts</span></>
                            )}
                        </div>
                        <p className="text-neutral-600 font-body leading-relaxed">
                            {config.module === "sports"
                                ? "Sua loja de artigos esportivos de futebol. Produtos oficiais e de qualidade."
                                : "A melhor seleção de peças automotivas para seu veículo. Peças originais e pronta entrega."}
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                            Links Rápidos
                        </h3>
                        <ul className="space-y-2 font-body text-neutral-600">
                            <li>
                                <Link href="/produtos" className="hover:text-primary transition-colors">
                                    Todos os Produtos
                                </Link>
                            </li>
                            <li>
                                <Link href="/carrinho" className="hover:text-primary transition-colors">
                                    Carrinho
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-heading font-bold text-neutral-900 uppercase tracking-wide text-sm">
                            Contato
                        </h3>
                        <div className="space-y-2 font-body text-neutral-600">
                            <p>
                                <span className="font-semibold text-neutral-900">WhatsApp:</span>{" "}
                                {config.whatsappNumber}
                            </p>
                            <p>
                                <span className="font-semibold text-neutral-900">Email:</span>{" "}
                                {config.storeEmail}
                            </p>
                            <p>
                                <span className="font-semibold text-neutral-900">Endereço:</span>{" "}
                                {config.storeAddress}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-neutral-200 pt-8 text-center font-body text-sm text-neutral-600">
                    <p>&copy; {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
