import { getStoreConfig } from "@/lib/admin/store-config";

export default async function TermsOfServicePage() {
    const config = await getStoreConfig();
    const storeName = config.module === "sports" ? "LeagueSports" : "AutoParts Online";
    const fullAddress = `${config.storeAddress}${config.storeNumber ? `, ${config.storeNumber}` : ""}${config.storeComplement ? ` - ${config.storeComplement}` : ""}`;

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-8 border-b pb-4">
                Termos de Uso
            </h1>

            <div className="space-y-6 text-neutral-700 font-body leading-relaxed">
                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">1. Termos</h2>
                    <p>
                        Ao acessar ao site <strong className="text-primary">{storeName}</strong>, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">2. Uso de Licença</h2>
                    <p>
                        É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site {storeName} , apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>modificar ou copiar os materiais;</li>
                        <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
                        <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site {storeName};</li>
                        <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
                        <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
                    </ul>
                    <p className="mt-2">
                        Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida por {storeName} a qualquer momento. Ao encerrar a visualização desses materiais ou após o término desta licença, você deve apagar todos os materiais baixados em sua posse, seja em formato eletrônico ou impresso.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">3. Isenção de responsabilidade</h2>
                    <ol className="list-decimal list-inside ml-4 space-y-2">
                        <li>
                            Os materiais no site da {storeName} são fornecidos 'como estão'. {storeName} não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
                        </li>
                        <li>
                            Além disso, o {storeName} não garante ou faz qualquer representação relativa à precisão, aos resultados prováveis ou à confiabilidade do uso dos materiais em seu site ou de outra forma relacionado a esses materiais ou em sites vinculados a este site.
                        </li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">4. Limitações</h2>
                    <p>
                        Em nenhum caso o {storeName} ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em {storeName}, mesmo que {storeName} ou um representante autorizado da {storeName} tenha sido notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por danos conseqüentes ou incidentais, essas limitações podem não se aplicar a você.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">5. Precisão dos materiais</h2>
                    <p>
                        Os materiais exibidos no site da {storeName} podem incluir erros técnicos, tipográficos ou fotográficos. {storeName} não garante que qualquer material em seu site seja preciso, completo ou atual. {storeName} pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, {storeName} não se compromete a atualizar os materiais.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">6. Links</h2>
                    <p>
                        O {storeName} não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por {storeName} do site. O uso de qualquer site vinculado é por conta e risco do usuário.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-heading font-bold text-neutral-800 mb-3">Modificações</h2>
                    <p>
                        O {storeName} pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
                    </p>
                </section>

                <section className="mt-8 border-t pt-8">
                    <h2 className="text-lg font-heading font-bold text-neutral-800 mb-2">Lei aplicável</h2>
                    <p>
                        Estes termos e condições são regidos e interpretados de acordo com as leis do Brasil e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
                    </p>
                    <p className="mt-4 text-sm text-neutral-500">
                        Dados de Contato: {config.storeEmail} | {fullAddress}
                    </p>
                </section>
            </div>
        </div>
    );
}
