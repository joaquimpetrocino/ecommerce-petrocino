import { getStoreConfig } from "@/lib/admin/store-config";

export default async function PrivacyPolicyPage() {
    const config = await getStoreConfig();
    const storeName = config.storeName || "Loja Virtual";
    const fullAddress = `${config.storeAddress}${config.storeNumber ? `, ${config.storeNumber}` : ""}${config.storeComplement ? ` - ${config.storeComplement}` : ""}`;

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-neural-900 mb-8 border-b pb-4">
                Política de Privacidade
            </h1>

            <div className="space-y-6 text-neutral-700 font-body leading-relaxed">
                <section>
                    <p>
                        A sua privacidade é importante para nós. É política do(a) <strong>{storeName}</strong> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site <a href="#" className="text-primary hover:underline">{storeName}</a>, e outros sites que possuímos e operamos.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">Coleta de Informações</h2>
                    <p>
                        Solicitamos informações pessoais, como nome, e-mail, e telefone (via WhatsApp), apenas quando realmente precisamos delas para lhe fornecer um serviço (como responder a um pedido ou dúvida). Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">Uso e Retenção de Dados</h2>
                    <p>
                        Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                    </p>
                    <p className="mt-2">
                        Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">Cookies</h2>
                    <p>
                        O nosso site usa cookies para melhorar a experiência do usuário. Ao continuar navegando, você concorda com o uso de cookies. Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">Links para Sites de Terceiros</h2>
                    <p>
                        O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">Mais Informações</h2>
                    <p>
                        Esperamos que isso esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
                    </p>
                    <p className="mt-4 text-sm text-neutral-500">
                        Esta política é efetiva a partir de {new Date().getFullYear()}.
                    </p>
                </section>

                <section className="mt-8 border-t pt-8">
                    <h2 className="text-lg font-heading font-bold text-neutral-800 mb-2">Contato</h2>
                    <p>
                        Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco:
                    </p>
                    <ul className="list-disc list-inside mt-2 ml-4">
                        <li>E-mail: {config.storeEmail}</li>
                        <li>WhatsApp: {config.whatsappNumber}</li>
                        <li>Endereço: {fullAddress}</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
