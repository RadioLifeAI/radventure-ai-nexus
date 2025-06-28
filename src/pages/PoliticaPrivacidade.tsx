
import { useEffect } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function PoliticaPrivacidade() {
  useEffect(() => {
    document.title = "Política de Privacidade - RadVenture";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Política de Privacidade
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              <strong>Última atualização:</strong> Janeiro de 2025<br/>
              <strong>Vigência:</strong> Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Informações Gerais
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Esta Política de Privacidade descreve como o RadVenture coleta, usa, armazena 
                  e protege suas informações pessoais. Respeitamos sua privacidade e estamos 
                  comprometidos com a proteção de seus dados pessoais.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Dados Pessoais Coletados
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p><strong>Dados de Identificação:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Cidade e estado</li>
                    <li>Instituição de ensino</li>
                    <li>Especialidade médica e estágio acadêmico</li>
                  </ul>
                  
                  <p><strong>Dados de Navegação e Uso:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Endereço IP</li>
                    <li>Informações do dispositivo e navegador</li>
                    <li>Páginas visitadas e tempo de permanência</li>
                    <li>Interações com o conteúdo educacional</li>
                    <li>Progresso nos casos clínicos</li>
                    <li>Pontuações e conquistas</li>
                  </ul>

                  <p><strong>Dados de Pagamento:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Informações de cobrança (processadas por terceiros seguros)</li>
                    <li>Histórico de transações</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Finalidades do Tratamento
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p><strong>Prestação do Serviço:</strong> Fornecer acesso à plataforma educacional, 
                  personalizar conteúdo e acompanhar progresso acadêmico.</p>
                  
                  <p><strong>Comunicação:</strong> Enviar notificações importantes, atualizações 
                  do serviço e newsletter educacional (mediante consentimento).</p>
                  
                  <p><strong>Melhoria da Plataforma:</strong> Analisar uso para melhorar 
                  funcionalidades, desenvolver novos recursos e otimizar a experiência educacional.</p>
                  
                  <p><strong>Segurança:</strong> Prevenir fraudes, proteger a plataforma 
                  e garantir a segurança dos usuários.</p>
                  
                  <p><strong>Conformidade Legal:</strong> Cumprir obrigações legais e 
                  regulamentares aplicáveis ao setor educacional.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Base Legal para o Tratamento
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p><strong>Execução de Contrato:</strong> Para prestação dos serviços educacionais contratados.</p>
                  <p><strong>Interesse Legítimo:</strong> Para melhoria da plataforma e segurança dos usuários.</p>
                  <p><strong>Consentimento:</strong> Para envio de comunicações de marketing e newsletter.</p>
                  <p><strong>Cumprimento de Obrigação Legal:</strong> Para atender requisitos legais e regulatórios.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Compartilhamento de Dados
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p>Seus dados pessoais podem ser compartilhados apenas nas seguintes situações:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Prestadores de Serviço:</strong> Empresas que fornecem infraestrutura, 
                    pagamentos e analytics (com contratos de proteção de dados)</li>
                    <li><strong>Obrigação Legal:</strong> Quando exigido por lei ou autoridades competentes</li>
                    <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos legais 
                    ou dos usuários</li>
                    <li><strong>Consentimento Expresso:</strong> Quando você autorizar expressamente</li>
                  </ul>
                  <p><strong>Nunca vendemos seus dados pessoais para terceiros.</strong></p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Armazenamento e Segurança
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p><strong>Localização:</strong> Dados armazenados em servidores seguros 
                  no Brasil e Estados Unidos (Supabase/AWS).</p>
                  
                  <p><strong>Segurança:</strong> Utilizamos criptografia, controle de acesso 
                  rigoroso, monitoramento contínuo e backups seguros.</p>
                  
                  <p><strong>Retenção:</strong> Dados são mantidos apenas pelo tempo necessário 
                  para as finalidades descritas ou conforme exigido por lei.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Seus Direitos (LGPD)
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Acesso:</strong> Confirmar a existência e obter cópia dos seus dados</li>
                    <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                    <li><strong>Exclusão:</strong> Solicitar eliminação dos dados desnecessários</li>
                    <li><strong>Portabilidade:</strong> Obter seus dados em formato estruturado</li>
                    <li><strong>Oposição:</strong> Opor-se ao tratamento baseado em interesse legítimo</li>
                    <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
                    <li><strong>Informação:</strong> Obter informações sobre compartilhamento</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Cookies e Tecnologias Similares
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Utilizamos cookies para melhorar sua experiência, lembrar preferências 
                  e analisar o uso da plataforma. Você pode gerenciar cookies através 
                  das configurações do seu navegador ou da nossa Central de Preferências.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Menores de Idade
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Para usuários entre 16 e 18 anos, solicitamos autorização dos responsáveis legais. 
                  Não coletamos intencionalmente dados de menores de 16 anos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Alterações nesta Política
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Podemos atualizar esta política periodicamente. Alterações significativas 
                  serão comunicadas por e-mail e através da plataforma com 30 dias de antecedência.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  11. Encarregado de Dados e Contato
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p><strong>Encarregado de Proteção de Dados (DPO):</strong> dpo@radventure.com.br</p>
                  <p><strong>Para exercer seus direitos ou esclarecer dúvidas:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>E-mail: privacidade@radventure.com.br</li>
                    <li>Formulário: Página de Contato da plataforma</li>
                    <li>Resposta em até 15 dias úteis</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  12. Autoridade Nacional de Proteção de Dados
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Se não conseguirmos resolver sua questão de privacidade, você pode 
                  contactar a ANPD através do site: <strong>gov.br/anpd</strong>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
