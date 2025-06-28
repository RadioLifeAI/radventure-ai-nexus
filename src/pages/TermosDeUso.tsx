
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
              <strong>Última atualização:</strong> 28/06/2025
            </p>

            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-lg mb-8">
              <p className="text-lg font-semibold text-cyan-800 dark:text-cyan-200 mb-2">
                Seja bem-vindo ao RadVenture!
              </p>
              <p className="text-cyan-700 dark:text-cyan-300">
                Ao acessar este site ou aplicativo, você concorda com os presentes Termos de Uso. 
                Caso não concorde, recomendamos que interrompa o uso imediatamente.
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Finalidade
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  O RadVenture é uma plataforma educacional interativa, <strong>sem fins comerciais</strong>, 
                  voltada ao ensino de radiologia por meio de quizzes, gamificação e inteligência artificial. 
                  O objetivo é facilitar o aprendizado médico, especialmente para estudantes, residentes e 
                  jovens profissionais de saúde.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Público-alvo
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  A plataforma é recomendada para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Estudantes de medicina</li>
                  <li>Residentes e médicos em formação</li>
                  <li>Profissionais da saúde com interesse em radiologia</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  A idade mínima recomendada para uso é 18 anos. Menores de idade só poderão utilizar 
                  a plataforma com consentimento formal de um responsável.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Cadastro e Acesso
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Para acessar funcionalidades como rankings e progresso pessoal, é necessário criar 
                  uma conta com e-mail válido. Os dados são tratados conforme nossa 
                  <a href="/privacidade" className="text-cyan-600 dark:text-cyan-400 hover:underline"> Política de Privacidade</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Propriedade Intelectual
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Todo conteúdo gerado ou compartilhado na plataforma — incluindo textos, quizzes, 
                  imagens e ícones — é protegido por direitos autorais e/ou licenciado sob Creative Commons. 
                  São utilizados apenas:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Casos próprios e imagens geradas artificialmente</li>
                  <li>Casos com autorização expressa de colegas radiologistas</li>
                  <li>Casos sob <strong>licença CC BY-NC-SA</strong>, com a devida atribuição</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  O uso do conteúdo é estritamente educacional. É proibida a reprodução, 
                  redistribuição ou comercialização.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Limitações de Responsabilidade
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  O conteúdo do RadVenture tem caráter didático e não substitui avaliação clínica, 
                  diagnóstico por imagem ou parecer profissional.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Não nos responsabilizamos por decisões clínicas tomadas com base em conteúdo 
                  exibido na plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Monetização e Publicidade
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  O projeto é mantido com recursos próprios. Eventuais anúncios não invasivos ou 
                  recursos extras pagos poderão ser implementados apenas para cobrir custos operacionais 
                  (ex: hospedagem, API de IA).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Cancelamento
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Você pode solicitar a exclusão de sua conta a qualquer momento, com remoção total 
                  de seus dados da plataforma Supabase, conforme nossa 
                  <a href="/privacidade" className="text-cyan-600 dark:text-cyan-400 hover:underline"> Política de Privacidade</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Alterações
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Estes Termos poderão ser atualizados a qualquer momento. A data de revisão será 
                  informada no topo desta página.
                </p>
              </section>

              <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Contato
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p><strong>📧 E-mail:</strong> contato@radventure.com.br</p>
                  <p><strong>📞 WhatsApp:</strong> +55 77 98864-0691</p>
                  <p className="text-sm mt-4">
                    Para dúvidas sobre casos autorizados ou sugestões educacionais
                  </p>
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
