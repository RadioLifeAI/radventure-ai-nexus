
import { useEffect } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function PoliticaCookies() {
  useEffect(() => {
    document.title = "Política de Cookies - RadVenture";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Política de Cookies
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              <strong>Última atualização:</strong> Janeiro de 2025
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. O que são Cookies?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Cookies são pequenos arquivos de texto armazenados no seu dispositivo 
                  (computador, tablet ou celular) quando você visita um site. Eles nos 
                  ajudam a tornar sua experiência na plataforma RadVenture mais eficiente, 
                  segura e personalizada.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Tipos de Cookies que Utilizamos
                </h2>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Cookies Estritamente Necessários
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      <strong>Sempre Ativos - Não requerem consentimento</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Essenciais para o funcionamento básico da plataforma. Incluem 
                      autenticação, segurança, preferências de idioma e carrinho de compras.
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300">
                      <li>Cookie de sessão de login</li>
                      <li>Token de segurança CSRF</li>
                      <li>Preferências de tema (claro/escuro)</li>
                      <li>Configurações de acessibilidade</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Cookies de Performance e Funcionalidade
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      <strong>Requer consentimento</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Melhoram a funcionalidade da plataforma, lembrando suas escolhas 
                      e preferências para uma experiência mais personalizada.
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300">
                      <li>Progresso em casos clínicos</li>
                      <li>Filtros de pesquisa personalizados</li>
                      <li>Histórico de navegação na plataforma</li>
                      <li>Configurações de dashboard</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Cookies Analíticos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      <strong>Requer consentimento</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Nos ajudam a entender como você usa a plataforma para melhorarmos 
                      continuamente nossos serviços educacionais.
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300">
                      <li>Google Analytics (anonimizado)</li>
                      <li>Métricas de uso de funcionalidades</li>
                      <li>Análise de performance de casos clínicos</li>
                      <li>Estatísticas de engajamento educacional</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Cookies de Marketing
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      <strong>Requer consentimento</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Utilizados para mostrar conteúdo relevante e medir a eficácia 
                      de nossas campanhas educacionais.
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300">
                      <li>Pixels de remarketing (Facebook, Google)</li>
                      <li>Cookies de rastreamento de conversão</li>
                      <li>Personalização de anúncios educacionais</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Cookies de Terceiros
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>Utilizamos alguns serviços de terceiros que podem definir cookies:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Google Analytics:</strong> Análise de tráfego e comportamento (Analytics)</li>
                    <li><strong>YouTube:</strong> Reprodução de vídeos educacionais (Funcionalidade)</li>
                    <li><strong>Stripe:</strong> Processamento seguro de pagamentos (Necessário)</li>
                    <li><strong>Supabase:</strong> Infraestrutura de backend e autenticação (Necessário)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Gestão de Consentimento
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p><strong>Como dar ou retirar consentimento:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Banner de Cookies:</strong> Na primeira visita, você pode escolher 
                    quais categorias de cookies aceitar</li>
                    <li><strong>Central de Preferências:</strong> Acesse a qualquer momento 
                    através do ícone de cookies no rodapé</li>
                    <li><strong>Configurações do Navegador:</strong> Você pode bloquear ou excluir 
                    cookies diretamente no seu navegador</li>
                  </ul>
                  
                  <p className="mt-4"><strong>Importante:</strong> Retirar o consentimento não afeta 
                  a legalidade do processamento baseado no consentimento antes da retirada.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Tempo de Armazenamento
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Cookies de Sessão:</strong> Expiram quando você fecha o navegador</li>
                    <li><strong>Cookies Persistentes:</strong> Variam de 30 dias a 2 anos, 
                    dependendo da finalidade</li>
                    <li><strong>Cookies de Autenticação:</strong> 30 dias (renovados automaticamente)</li>
                    <li><strong>Cookies Analíticos:</strong> 26 meses (Google Analytics padrão)</li>
                    <li><strong>Cookies de Preferências:</strong> 1 ano</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Como Gerenciar Cookies no seu Navegador
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>Você pode controlar cookies através das configurações do seu navegador:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Chrome</h4>
                      <p className="text-sm">Configurações → Privacidade e Segurança → Cookies</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Firefox</h4>
                      <p className="text-sm">Preferências → Privacidade e Segurança</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Safari</h4>
                      <p className="text-sm">Preferências → Privacidade → Cookies</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Edge</h4>
                      <p className="text-sm">Configurações → Privacidade → Cookies</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Impacto da Desativação de Cookies
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p><strong>Se você desativar cookies essenciais:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Não conseguirá fazer login na plataforma</li>
                    <li>Configurações não serão salvas</li>
                    <li>Funcionalidades básicas podem não funcionar</li>
                  </ul>
                  
                  <p><strong>Se você desativar cookies opcionais:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Experiência menos personalizada</li>
                    <li>Não lembraremos suas preferências</li>
                    <li>Anúncios menos relevantes</li>
                    <li>Dificuldade para melhorarmos nossos serviços</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Alterações nesta Política
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Podemos atualizar esta Política de Cookies ocasionalmente para refletir 
                  mudanças em nossas práticas ou por outros motivos operacionais, legais 
                  ou regulamentares. Notificaremos sobre mudanças significativas através 
                  da plataforma ou por e-mail.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Contato
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>Para dúvidas sobre nossa Política de Cookies:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>E-mail:</strong> privacidade@radventure.com.br</li>
                    <li><strong>Formulário de Contato:</strong> Disponível na plataforma</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
