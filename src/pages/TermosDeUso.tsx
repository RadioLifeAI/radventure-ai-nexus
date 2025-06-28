
import { useEffect } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function TermosDeUso() {
  useEffect(() => {
    document.title = "Termos de Uso - RadVenture";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Termos de Uso
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              <strong>Última atualização:</strong> Janeiro de 2025
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Aceitação dos Termos
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Ao acessar e utilizar a plataforma RadVenture, você concorda integralmente com estes 
                  Termos de Uso. Se você não concorda com qualquer parte destes termos, não deve 
                  utilizar nossos serviços.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Descrição do Serviço
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  O RadVenture é uma plataforma educacional médica gamificada que oferece:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Casos clínicos interativos de radiologia</li>
                  <li>Sistema de gamificação com pontos e rankings</li>
                  <li>Assistente de inteligência artificial educacional</li>
                  <li>Comunidade colaborativa de estudantes e profissionais</li>
                  <li>Ferramentas de acompanhamento de progresso</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Elegibilidade e Cadastro
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    Para utilizar o RadVenture, você deve:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Ter pelo menos 16 anos de idade</li>
                    <li>Fornecer informações verdadeiras e atualizadas</li>
                    <li>Manter a confidencialidade de suas credenciais de acesso</li>
                    <li>Ser responsável por todas as atividades em sua conta</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Planos e Pagamentos
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    <strong>Plano Gratuito:</strong> Acesso limitado a funcionalidades básicas, 
                    incluindo casos clínicos selecionados e sistema de pontuação.
                  </p>
                  <p>
                    <strong>Planos Pagos:</strong> Acesso completo a todos os recursos, incluindo 
                    IA avançada, casos ilimitados e funcionalidades premium.
                  </p>
                  <p>
                    Os pagamentos são processados de forma segura e os planos podem ser 
                    cancelados a qualquer momento através do painel do usuário.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Propriedade Intelectual
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Todo o conteúdo da plataforma, incluindo textos, imagens, casos clínicos, 
                  algoritmos de IA e design, são protegidos por direitos autorais e pertencem 
                  ao RadVenture ou seus licenciadores.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  É proibida a reprodução, distribuição ou modificação do conteúdo sem 
                  autorização expressa por escrito.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Uso Adequado
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Você concorda em utilizar a plataforma apenas para fins educacionais e se compromete a:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Não compartilhar suas credenciais com terceiros</li>
                  <li>Não tentar burlar sistemas de segurança</li>
                  <li>Não usar a plataforma para fins comerciais não autorizados</li>
                  <li>Respeitar outros usuários da comunidade</li>
                  <li>Não publicar conteúdo ofensivo ou inadequado</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Limitação de Responsabilidade
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  O RadVenture é uma ferramenta educacional complementar e não substitui 
                  a educação médica formal, supervisão profissional ou julgamento clínico. 
                  Não nos responsabilizamos por decisões tomadas com base exclusivamente 
                  no conteúdo da plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Modificações dos Termos
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Reservamos o direito de modificar estes termos a qualquer momento. 
                  Alterações significativas serão comunicadas por e-mail ou através da plataforma. 
                  O uso continuado após as modificações constitui aceitação dos novos termos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Rescisão
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Você pode encerrar sua conta a qualquer momento. Podemos suspender ou 
                  encerrar sua conta em caso de violação destes termos. Após o encerramento, 
                  seu acesso ao conteúdo será interrompido.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Lei Aplicável
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Estes termos são regidos pela legislação brasileira. Disputas serão 
                  resolvidas preferencialmente por mediação, ou, se necessário, 
                  pelos tribunais competentes do Brasil.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  11. Contato
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Para dúvidas sobre estes termos, entre em contato conosco através 
                  da página de contato ou pelo e-mail: <strong>legal@radventure.com.br</strong>
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
