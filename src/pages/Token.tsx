import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Key, ExternalLink, Copy, Check } from 'lucide-react';

interface Token {
  id: number;
  token: string;
  created_at: string;
}

export default function Token() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchTokens();
    }
  }, [user]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copiedId !== null) {
      const timer = setTimeout(() => {
        setCopiedId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedId]);

  const fetchTokens = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('id, token, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tokens:', error);
        setTokens([]);
      } else if (data) {
        setTokens(data);
      } else {
        setTokens([]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date values
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy token to clipboard
  const copyToClipboard = (id: number, token: string) => {
    navigator.clipboard.writeText(token)
      .then(() => {
        setCopiedId(id);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <Layout title="Aplicativo">
      <div>
        {/* App Installation Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Shortcuts App Promotion Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 md:p-6 flex flex-col md:flex-row">
              <img 
                src="https://is1-ssl.mzstatic.com/image/thumb/Purple113/v4/3e/52/07/3e520776-0908-893c-2248-6c9d29a03cc7/AppIcon-0-1x_U007emarketing-0-0-GLES2_U002c0-512MB-sRGB-0-0-0-85-220-0-0-0-7.png/230x0w.webp" 
                alt="Shortcuts App" 
                className="h-20 w-20 rounded-lg shadow-md me-4" 
              />
              <div className="text-white text-center md:text-left">
                <h2 className="text-lg md:text-xl font-bold mb-2">1. Baixe o app Shortcuts</h2>
                <p className="text-sm md:text-base mb-4">Faça o Download do app Shortcuts na Apple Store para habilitar sua experiência completa com a FinSmart.</p>
                <a 
                  href="https://apps.apple.com/us/app/shortcuts/id915249334" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Baixar Shortcuts <ExternalLink size={16} className="ml-2" />
                </a>
              </div>
            </div>
          </div>

          {/* Install FinSmart Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 md:p-6 flex flex-col md:flex-row">
              <img 
                src="https://is1-ssl.mzstatic.com/image/thumb/Purple113/v4/3e/52/07/3e520776-0908-893c-2248-6c9d29a03cc7/AppIcon-0-1x_U007emarketing-0-0-GLES2_U002c0-512MB-sRGB-0-0-0-85-220-0-0-0-7.png/230x0w.webp" 
                alt="Shortcuts App" 
                className="h-20 w-20 rounded-lg shadow-md me-4" 
              />
              <div className="text-white text-center md:text-left">
                <h2 className="text-lg md:text-xl font-bold mb-2">2. Instalar FinSmart</h2>
                <p className="text-sm md:text-base mb-4">Agora com o app Shortcut já configurado, clique no botão para instalar o FinSmart em seu iPhone.</p>
                <a 
                  href="https://www.icloud.com/shortcuts/98f99842ab9c41ba87ded414d3b341d2" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center bg-white text-green-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Instalar FinSmart <ExternalLink size={16} className="ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
  
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 md:p-6">
            <div className="flex items-center mb-4">
              <Key className="h-6 w-6 text-[#11ab77] mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Tokens de acesso do app mobile</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm md:text-base">
              Abaixo estão listados todos os seus tokens de acesso à API. Estes tokens permitem que aplicações autorizadas acessem seus dados.
            </p>
          </div>
        </div>

        {/* Tokens table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-32 md:w-64"></div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-24 md:w-32"></div>
                      </td>
                    </tr>
                  ))
                ) : tokens.length > 0 ? (
                  // Tokens data
                  tokens.map((token) => (
                    <tr key={token.id}>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-xs md:text-sm font-mono text-gray-900 truncate max-w-[150px] md:max-w-[300px]">
                            {token.token}
                          </span>
                          <button
                            onClick={() => copyToClipboard(token.id, token.token)}
                            className="text-gray-400 hover:text-[#11ab77] transition-colors p-1 rounded-md hover:bg-gray-100 ms-3"
                            title="Copiar token"
                          >
                            {copiedId === token.id ? (
                              <Check size={18} className="text-green-500" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                        {formatDate(token.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  // No tokens
                  <tr>
                    <td colSpan={3} className="px-4 md:px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum token encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}