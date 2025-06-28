
import { useState, useEffect } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { useContact } from '@/hooks/useContact';

export default function Contato() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const { sendMessage, isSending } = useContact();

  useEffect(() => {
    document.title = "Contato - RadVenture";
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await sendMessage(formData.name, formData.email, formData.message);
    if (success) {
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#181842] via-[#262975] to-[#1cbad6] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Entre em <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Contato</span>
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 leading-relaxed">
              Estamos aqui para ajudar você a revolucionar seus estudos médicos
            </p>
          </div>
        </section>

        {/* Contato Principal */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Informações de Contato */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Fale Conosco
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Tem dúvidas, sugestões ou precisa de ajuda? Nossa equipe está 
                    pronta para atendê-lo e garantir a melhor experiência educacional.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <Mail className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        E-mail
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">contato@radventure.com.br</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Respondemos em até 24 horas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                      <Phone className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        WhatsApp
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">(11) 99999-8888</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Seg a Sex, 9h às 18h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Endereço
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        São Paulo, SP<br />
                        Brasil
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Horário de Atendimento
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Segunda a Sexta: 9h às 18h<br />
                        Sábado: 9h às 14h<br />
                        Domingo: Fechado
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário de Contato */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Envie sua Mensagem
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                      Nome Completo *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">
                      Mensagem *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="mt-1"
                      placeholder="Conte-nos como podemos ajudar você..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                  * Campos obrigatórios | Responderemos em até 24 horas
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Rápido */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Respostas rápidas para as dúvidas mais comuns
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "Como faço para começar a usar o RadVenture?",
                  answer: "Basta criar uma conta gratuita clicando em 'Começar Agora'. Você terá acesso imediato a casos clínicos básicos e poderá explorar todas as funcionalidades."
                },
                {
                  question: "O RadVenture é gratuito?",
                  answer: "Sim! Oferecemos um plano gratuito com acesso a casos selecionados. Para funcionalidades avançadas e acesso completo, temos planos premium acessíveis."
                },
                {
                  question: "Posso usar o RadVenture no celular?",
                  answer: "Absolutamente! Nossa plataforma é totalmente responsiva e funciona perfeitamente em dispositivos móveis, tablets e computadores."
                },
                {
                  question: "Como funciona o sistema de pontuação?",
                  answer: "Você ganha pontos resolvendo casos clínicos corretamente. Quanto mais difícil o caso, mais pontos você recebe. Use os pontos para subir no ranking e desbloquear conquistas!"
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
