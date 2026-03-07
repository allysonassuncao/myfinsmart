import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ChevronRight, 
  BarChart2, 
  PieChart, 
  CreditCard, 
  Shield, 
  Check, 
  Menu, 
  X,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-[#11ab77] p-2 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">FinSmart</span>
              </div>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-[#11ab77] transition-colors">
                Funcionalidades
              </a>
              <a href="#benefits" className="text-gray-700 hover:text-[#11ab77] transition-colors">
                Benefícios
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-[#11ab77] transition-colors">
                Planos
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-[#11ab77] transition-colors">
                Depoimentos
              </a>
              <Link to="/login" className="bg-[#11ab77] text-white px-4 py-2 rounded-md hover:bg-[#0e9968] transition-colors">
                Entrar
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-[#11ab77] focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a 
                href="#features" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#11ab77] hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Funcionalidades
              </a>
              <a 
                href="#benefits" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#11ab77] hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Benefícios
              </a>
              <a 
                href="#pricing" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#11ab77] hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Planos
              </a>
              <a 
                href="#testimonials" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#11ab77] hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Depoimentos
              </a>
              <Link 
                to="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium bg-[#11ab77] text-white hover:bg-[#0e9968]"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#e6f7f1] to-[#f0f4ff] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Seu dinheiro organizado com 2 cliques
              </h1>
              <p className="text-lg text-gray-700 mb-8 pe-4">
                O FinSmart é <strong className="text-[#11ab77]">seu assistente financeiro pessoal com inteligência artificial</strong> que ajuda a categorizar seus gastos, organizar suas finanças e alcançar seus objetivos financeiros com facilidade.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <a 
                  href="#pricing"
                  className="bg-[#11ab77] text-white px-6 py-3 rounded-md hover:bg-[#0e9968] transition-colors text-center"
                >
                  Conhecer planos
                </a>
                <a 
                  href="#features" 
                  className="bg-white text-[#11ab77] border border-[#11ab77] px-6 py-3 rounded-md hover:bg-[#f0faf7] transition-colors text-center flex items-center justify-center"
                >
                  Saiba mais <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1611174743420-3d7df880ce32?q=80&w=600&auto=format&fit=crop" 
                alt="FinSmart App" 
                className="rounded-lg shadow-xl max-w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Funcionalidades Principais</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              O FinSmart oferece todas as ferramentas que você precisa para organizar seu dinheiro na correria do dia a dia.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-[#e6f7f1] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <BarChart2 size={24} className="text-[#11ab77]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Categorização de Gastos</h3>
              <p className="text-gray-700">
                A I.A da FinSmart fica com a parte chata de categorizar cada novo gasto que você envia.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-[#e6f7f1] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <BarChart2 size={24} className="text-[#11ab77]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Análise de Gastos</h3>
              <p className="text-gray-700">
                Visualize em tempo real seus gastos por categoria e entenda onde seu dinheiro precisa de mais atenção.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-[#e6f7f1] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <CreditCard size={24} className="text-[#11ab77]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Histórico de Comportamento</h3>
              <p className="text-gray-700">
                Mantenha um histórico completo de suas finanças facilitando qualquer tomada de decisão financeira em sua vida.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-[#e6f7f1] p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <PieChart size={24} className="text-[#11ab77]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Orçamentos Personalizados</h3>
              <p className="text-gray-700">
                Crie orçamentos para diferentes categorias e receba alertas quando estiver próximo de atingir seus limites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefícios do FinSmart</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Descubra como o FinSmart pode transformar sua relação com o dinheiro e ajudar você a alcançar seus objetivos financeiros.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col justify-center">
              <div className="mb-8">
                <div className="flex items-start mb-4">
                  <div className="bg-[#11ab77] p-1 rounded-full mr-3 mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Esqueça a parte chata</h3>
                    <p className="text-gray-700">
                      Automatize o controle financeiro e dedique mais tempo ao que realmente importa.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start mb-4">
                  <div className="bg-[#11ab77] p-1 rounded-full mr-3 mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Reduza o estresse financeiro</h3>
                    <p className="text-gray-700">
                      Tenha clareza sobre sua situação financeira e tome decisões mais conscientes e tranquilas.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#11ab77] p-1 rounded-full mr-3 mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Alcance seus objetivos</h3>
                    <p className="text-gray-700">
                      Defina metas financeiras e acompanhe seu progresso com ferramentas visuais e intuitivas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?q=80&w=600&auto=format&fit=crop" 
                alt="Benefícios FinSmart" 
                className="rounded-lg shadow-xl max-w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-[#e6f7f1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Planos e Preços</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Simples e objetivo. Escolha o plano que melhor se adapta à você.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            {/* <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Básico</h3>
                <p className="text-gray-700 mb-4">Perfeito para começar</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">Grátis</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Controle de transações</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Categorização básica</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Relatórios mensais</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6">
                <Link 
                  to="/login" 
                  className="block w-full bg-white text-[#11ab77] border border-[#11ab77] text-center px-4 py-2 rounded-md hover:bg-[#f0faf7] transition-colors"
                >
                  Começar grátis
                </Link>
              </div>
            </div> */}
            
            {/* Pro Plan */}
            {/* <div className="bg-white rounded-lg shadow-md overflow-hidden transform scale-105 border-2 border-[#11ab77]">
              <div className="bg-[#11ab77] text-white text-center py-2 text-sm font-medium">
                MAIS POPULAR
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-700 mb-4">Para controle financeiro avançado</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">R$19,90</span>
                  <span className="text-gray-600 ml-1">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Tudo do plano Básico</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Categorização automática</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Orçamentos personalizados</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Alertas e notificações</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Suporte prioritário</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6">
                <Link 
                  to="/login" 
                  className="block w-full bg-[#11ab77] text-white text-center px-4 py-2 rounded-md hover:bg-[#0e9968] transition-colors"
                >
                  Assinar agora
                </Link>
              </div>
            </div> */}
            
            {/* Premium Plan */}
            {/* <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium</h3>
                <p className="text-gray-700 mb-4">Para planejamento financeiro completo</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">R$39,90</span>
                  <span className="text-gray-600 ml-1">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Tudo do plano Pro</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Planejamento de investimentos</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Consultoria financeira</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Relatórios avançados</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6">
                <Link 
                  to="/login" 
                  className="block w-full bg-white text-[#11ab77] border border-[#11ab77] text-center px-4 py-2 rounded-md hover:bg-[#f0faf7] transition-colors"
                >
                  Assinar Premium
                </Link>
              </div>
            </div> */}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mensal</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">R$9,90</span>
                  <span className="text-gray-600 ml-1">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Categorização automática de transações</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Controle de transações</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Acesso ao app FinSmart</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Relatórios em tempo real dos seus gastos</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6">
                <a href="https://buy.stripe.com/cN2eXy0lMfiu5FK7ss" target="_blank" className="block w-full bg-[#11ab77] text-white text-center px-4 py-2 rounded-md hover:bg-[#0e9968] transition-colors">
                  Assinar
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Anual</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">R$79,90</span>
                  <span className="text-gray-600 ml-1">/ano</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Categorização automática de transações</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Controle de transações</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Acesso ao app FinSmart</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={16} className="text-[#11ab77] mr-2" />
                    <span className="text-gray-700">Relatórios em tempo real dos seus gastos</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6">
                <a href="https://buy.stripe.com/aEU4iU2tU4DQ4BGeUV" target="_blank" className="block w-full bg-[#11ab77] text-white text-center px-4 py-2 rounded-md hover:bg-[#0e9968] transition-colors">
                  Assinar
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O que nossos usuários dizem</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Milhares de pessoas já transformaram suas finanças com o FinSmart.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f9fafb] p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "O FinSmart mudou completamente minha relação com o dinheiro. Agora consigo visualizar exatamente para onde vai cada centavo e tomar decisões mais conscientes."
              </p>
              <div className="flex items-center">
                <div className="bg-[#11ab77] w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900">Mariana Silva</h4>
                  <p className="text-xs text-gray-600">Usuária há 3 meses</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#f9fafb] p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Os relatórios mensais me ajudaram a identificar gastos desnecessários que eu nem percebia. Em apenas 1 mês, consegui economizar o suficiente para comprar meu novo celular."
              </p>
              <div className="flex items-center">
                <div className="bg-[#11ab77] w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                  R
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900">Rafael Oliveira</h4>
                  <p className="text-xs text-gray-600">Usuário há 1 mês</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#f9fafb] p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Como estudante, precisava de um app prático que me ajudasse a organizar minhas finanças. O FinSmart faz isso perfeitamente e ainda me dá dados valiosos de onde posso economizar."
              </p>
              <div className="flex items-center">
                <div className="bg-[#11ab77] w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                  C
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900">Carlos Santos</h4>
                  <p className="text-xs text-gray-600">Usuário há 2 meses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#11ab77]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Comece a organizar seu dinheiro hoje
          </h2>
          <p className="text-lg text-white mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de pessoas que já estão economizando dinheiro e alcançando seus objetivos financeiros com o FinSmart.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="#pricing"
              className="bg-white text-[#11ab77] px-8 py-3 rounded-md hover:bg-gray-100 transition-colors text-center font-medium"
            >
              Assinar meu plano
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-[#11ab77] p-2 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">FinSmart</span>
              </div>
              <p className="text-gray-400 mb-4">
                Seu assistente financeiro pessoal com I.A para organizar seu dinheiro com facilidade.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Planos</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="mailto:contato@finsmart.app.br" className="text-gray-400 hover:text-white transition-colors">contato@finsmart.app.br</a></li>
                <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Política de privacidade</Link></li>
                <li><Link to="/terms-of-use" className="text-gray-400 hover:text-white transition-colors">Termos de uso</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} FinSmart. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}