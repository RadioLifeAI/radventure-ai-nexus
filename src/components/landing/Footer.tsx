
import { Link } from 'react-router-dom';
import { Rocket, Instagram, Youtube, Linkedin, Twitter, Mail, Phone } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  return (
    <footer className="bg-gradient-to-t from-[#0a0b1e] to-[#131f3a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-full">
                <Rocket className="text-white" size={24}/>
              </span>
              <span className="text-xl font-bold">RadVenture</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Plataforma educacional gratuita para ensino de radiologia. 
              Projeto independente e sem fins comerciais do Dr. Nailson Costa.
            </p>
            
            {/* Contatos Diretos */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail size={16} />
                <span>contato@radventure.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone size={16} />
                <span>+55 77 98864-0691</span>
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => document.getElementById('funcionalidades')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Funcionalidades
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Sobre o Projeto
                </button>
              </li>
              <li>
                <Link 
                  to="/contato" 
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Legais */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Informações Legais</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/termos" 
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacidade" 
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link 
                  to="/cookies" 
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-gray-300 text-sm mb-4">
              Receba atualizações sobre novos casos e funcionalidades
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 RadVenture – Projeto educacional sem fins comerciais | Dr. Nailson Costa
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Conformidade: LGPD • CFM • CBR
          </p>
        </div>
      </div>
    </footer>
  );
}
