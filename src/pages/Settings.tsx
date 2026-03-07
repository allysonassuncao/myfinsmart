import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield, CreditCard, HelpCircle } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <Layout title="Configurações">
      <div className="">
        {/* User info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informações da Conta</h2>
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="bg-[#e6f7f1] rounded-full w-16 h-16 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
              <User size={32} className="text-[#11ab77]" />
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Bell size={20} className="text-[#11ab77] mr-2" />
              <h3 className="text-lg font-semibold">Notificações</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Alertas de orçamento</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e6f7f1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11ab77]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Resumo semanal</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e6f7f1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11ab77]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Dicas financeiras</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e6f7f1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11ab77]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Shield size={20} className="text-[#11ab77] mr-2" />
              <h3 className="text-lg font-semibold">Segurança</h3>
            </div>
            <div className="space-y-4">
              <button className="w-full text-left py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Alterar senha
              </button>
              <button className="w-full text-left py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Verificação em duas etapas
              </button>
              <button className="w-full text-left py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Dispositivos conectados
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CreditCard size={20} className="text-[#11ab77] mr-2" />
              <h3 className="text-lg font-semibold">Métodos de Pagamento</h3>
            </div>
            <div className="space-y-4">
              <button className="w-full text-left py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Adicionar cartão de crédito
              </button>
              <button className="w-full text-left py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Conectar conta bancária
              </button>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <HelpCircle size={20} className="text-[#11ab77] mr-2" />
              <h3 className="text-lg font-semibold">Ajuda e Suporte</h3>
            </div>
            <div className="space-y-4">
              <button className="w-full text-left py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Central de ajuda
              </button>
              <button className="w-full text-left py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Contatar suporte
              </button>
              <button className="w-full text-left py-2 px-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Termos de uso e privacidade
              </button>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-8 bg-red-50 rounded-lg border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Zona de Perigo</h3>
          <p className="text-red-600 mb-4">
            Ações nesta seção podem resultar em perda permanente de dados.
          </p>
          <div className="space-y-3">
            <button className="w-full md:w-auto text-left py-2 px-4 border border-red-300 text-red-700 rounded-md hover:bg-red-100 transition-colors">
              Exportar todos os dados
            </button>
            <button className="w-full md:w-auto text-left py-2 px-4 border border-red-300 text-red-700 rounded-md hover:bg-red-100 transition-colors">
              Excluir conta
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}