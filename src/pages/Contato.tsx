
import { useState, useEffect } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send, Loader2, MessageCircle } from 'lucide-react';
import { useContact } from '@/hooks/useContact';

export default function Contato() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const { sendMessage, isSending } = useContact();

  useEffect(() => {
    document.title = "Fale Conosco - RadVenture";
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
              Fale <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Conosco</span>
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 leading-relaxed">
              Tem dúvidas, sugestões ou deseja compartilhar um caso autorizado?
              Estamos aqui para ajudar a comunidade médica.
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
                    Entre em Contato
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    O RadVenture é um projeto educacional colaborativo. Sua participação, 
                    feedback e sugestões são fundamentais para o crescimento da plataforma.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <Mail className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        E-mail Principal
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 font-semibold">contato@radventure.com.br</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Para dúvidas gerais, sugestões e parcerias educacionais
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        WhatsApp
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 font-semibold">+55 77 98864-0691</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Para envio de casos autorizados e dúvidas técnicas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Localização
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Brasil<br />
                        Projeto Nacional de Educação Médica
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Disponibilidade
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Segunda a Sexta: 8h às 18h<br />
                        Fins de Semana: Conforme disponibilidade<br />
                        <span className="text-sm text-gray-500">Resposta em até 48h</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Sobre o Dr. Nailson Costa
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Radiologista e educador, idealizador do RadVenture. 
                    Dedicado ao ensino ético e responsável da radiologia no Brasil.
                  </p>
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
                      placeholder="Conte-nos como podemos ajudar, suas sugestões ou dúvidas sobre a plataforma..."
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

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    * Campos obrigatórios | Todos os dados são criptografados e protegidos pela LGPD
                  </p>
                </div>
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
                Respostas rápidas para as dúvidas mais comuns sobre o projeto
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "Como posso contribuir com casos clínicos?",
                  answer: "Entre em contato via WhatsApp ou e-mail com casos devidamente autorizados e anonimizados. Todos os casos passam por revisão ética antes da inclusão."
                },
                {
                  question: "O RadVenture é realmente gratuito?",
                  answer: "Sim! É um projeto educacional sem fins comerciais, mantido com recursos próprios. O objetivo é democratizar o ensino da radiologia no Brasil."
                },
                {
                  question: "Como vocês garantem a conformidade com LGPD?",
                  answer: "Seguimos rigorosamente a LGPD, armazenando dados de forma criptografada no Supabase, com políticas claras de privacidade e direito ao esquecimento."
                },
                {
                  question: "Posso usar o conteúdo em aulas ou apresentações?",
                  answer: "O conteúdo é para fins educacionais pessoais. Para uso em apresentações ou aulas, entre em contato para autorização específica."
                },
                {
                  question: "Como reportar problemas técnicos?",
                  answer: "Use o formulário acima ou entre em contato via WhatsApp descrevendo o problema. Tentamos resolver questões técnicas em até 48 horas."
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
