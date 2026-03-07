import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowLeft } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="bg-[#11ab77] p-2 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">FinSmart</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link 
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Voltar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
        
        <div className="prose prose-lg">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Termos</h2>
            <p className="text-gray-600 mb-4 text-justify">Ao acessar ao site Finsmart, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Uso de Licença</h2>
            <p className="text-gray-600 mb-4 text-justify">É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Finsmart , apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode: </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 text-justify">
              <li>modificar ou copiar os materiais;</li>
              <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
              <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Finsmart;</li>
              <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
              <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
            </ul>
            <p className="text-gray-600 mb-4 text-justify">Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida por Finsmart a qualquer momento. Ao encerrar a visualização desses materiais ou após o término desta licença, você deve apagar todos os materiais baixados em sua posse, seja em formato eletrónico ou impresso.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Isenção de responsabilidade</h2>
            <ul className="list-disc pl-6 text-gray-600 mb-4 text-justify">
              <li>Os materiais no site da Finsmart são fornecidos 'como estão'. Finsmart não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.</li>
              <li>Além disso, o Finsmart não garante ou faz qualquer representação relativa à precisão, aos resultados prováveis ​​ou à confiabilidade do uso dos materiais em seu site ou de outra forma relacionado a esses materiais ou em sites vinculados a este site.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Limitações</h2>
            <p className="text-gray-600 mb-4 text-justify">Em nenhum caso o Finsmart ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Finsmart, mesmo que Finsmart ou um representante autorizado da Finsmart tenha sido notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por danos conseqüentes ou incidentais, essas limitações podem não se aplicar a você.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Precisão dos materiais</h2>
            <p className="text-gray-600 mb-4 text-justify">Os materiais exibidos no site da Finsmart podem incluir erros técnicos, tipográficos ou fotográficos. Finsmart não garante que qualquer material em seu site seja preciso, completo ou atual. Finsmart pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, Finsmart não se compromete a atualizar os materiais.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Links</h2>
            <p className="text-gray-600 mb-4 text-justify">O Finsmart não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por Finsmart do site. O uso de qualquer site vinculado é por conta e risco do usuário.</p>
            <p className="text-gray-600 mb-4 text-justify"><strong>Modificações</strong><br/><br/>O Finsmart pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.</p>
             <p className="text-gray-600 mb-4 text-justify"><strong>Lei aplicável</strong><br/><br/>Estes termos e condições são regidos e interpretados de acordo com as leis do Finsmart e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.</p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} FinSmart. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}