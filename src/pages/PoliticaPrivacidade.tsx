
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
              <strong>Última atualização:</strong> 28/06/2025
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                Esta política descreve como o RadVenture coleta, armazena e utiliza suas informações pessoais, 
                em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018)</strong> 
                e alinhada às diretrizes do <strong>Conselho Federal de Medicina (CFM)</strong> e do 
                <strong> Colégio Brasileiro de Radiologia (CBR)</strong>.
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Dados Coletados
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Durante o uso da plataforma, podemos coletar:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li><strong>Dados pessoais:</strong> Nome, e-mail, senha criptografada, país de origem</li>
                  <li><strong>Dados de navegação:</strong> Pontuação em quizzes, tempo de uso, ranking</li>
                  <li><strong>Dados voluntários:</strong> Mensagens via formulário, feedbacks e sugestões</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  2. Finalidade do Uso
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Esses dados são usados para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Personalizar sua experiência educacional</li>
                  <li>Melhorar o conteúdo e funcionalidades da plataforma</li>
                  <li>Garantir segurança e integridade das contas</li>
                  <li>Comunicar novidades educacionais, se autorizado</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  3. Armazenamento e Segurança
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Seus dados são armazenados com criptografia e segurança reforçada no serviço 
                  <strong> Supabase</strong>, respeitando práticas de segurança modernas 
                  (TLS, controle de acesso, backup automático).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  4. Compartilhamento de Dados
                </h2>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 font-semibold">
                    O RadVenture <strong>NÃO vende, aluga ou compartilha seus dados com terceiros</strong>. 
                    O acesso é restrito aos administradores do projeto e apenas para os fins aqui descritos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Direitos do Usuário (LGPD)
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Você pode, a qualquer momento:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incorretos ou desatualizados</li>
                  <li>Solicitar exclusão completa da conta</li>
                  <li>Revogar consentimento para processamento</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  Para exercer esses direitos, entre em contato:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    📧 <strong>contato@radventure.com.br</strong>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Uso de Imagens Médicas
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  A plataforma utiliza apenas:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Imagens de arquivo próprio (totalmente anônimas)</li>
                  <li>Casos com consentimento expresso e autorização</li>
                  <li>Casos licenciados sob <strong>Creative Commons (CC BY-NC-SA)</strong></li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  Todo conteúdo segue rigorosamente as diretrizes da LGPD, CFM e CBR.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Tempo de Retenção
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Os dados serão armazenados apenas enquanto o usuário mantiver sua conta ativa. 
                  Ao solicitar exclusão, todos os registros pessoais serão permanentemente apagados 
                  da base de dados Supabase.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Atualizações
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Esta Política pode ser alterada a qualquer momento para manter conformidade legal. 
                  Alterações significativas serão comunicadas via e-mail ou diretamente na plataforma.
                </p>
              </section>

              <section className="bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-cyan-800 dark:text-cyan-200 mb-4">
                  Contato - Encarregado de Dados (DPO)
                </h2>
                <div className="space-y-2 text-cyan-700 dark:text-cyan-300">
                  <p><strong>📧 E-mail:</strong> contato@radventure.com.br</p>
                  <p><strong>📞 WhatsApp:</strong> +55 77 98864-0691</p>
                  <p><strong>Responsável:</strong> Dr. Nailson Costa</p>
                  <p className="text-sm mt-4">
                    Para questões sobre privacidade, proteção de dados ou exercício de direitos LGPD
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
