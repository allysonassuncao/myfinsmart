import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Plus, Edit, X, Check, Loader2 } from 'lucide-react';

interface CustomTerm {
  term_id: string;
  title: string;
  description: string;
  status: boolean;
}

export default function CustomTerms() {
  const { user } = useAuth();
  const [terms, setTerms] = useState<CustomTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<CustomTerm | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTerms();
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchTerms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('termos_personalizados')
        .select('*')
        .eq('user_id', user.id)
        .order('title', { ascending: true });

      if (error) throw error;
      setTerms(data || []);
    } catch (error) {
      console.error('Error fetching terms:', error);
      setTerms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (term?: CustomTerm) => {
    if (term) {
      setSelectedTerm(term);
      setFormData({
        title: term.title,
        description: term.description
      });
    } else {
      setSelectedTerm(null);
      setFormData({
        title: '',
        description: ''
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTerm(null);
    setFormData({
      title: '',
      description: ''
    });
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        throw new Error('O título é obrigatório');
      }

      const termData = {
        title: formData.title,
        description: formData.description,
        user_id: user.id
      };

      let error;

      if (selectedTerm) {
        const { error: updateError } = await supabase
          .from('termos_personalizados')
          .update(termData)
          .eq('term_id', selectedTerm.term_id);

        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('termos_personalizados')
          .insert([termData]);

        error = insertError;
      }

      if (error) throw error;

      await fetchTerms();
      handleCloseModal();
      setSuccess(selectedTerm ? 'Termo atualizado com sucesso' : 'Termo cadastrado com sucesso');
    } catch (error: any) {
      console.error('Error saving term:', error);
      setError(error.message || 'Erro ao salvar termo. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (term: CustomTerm) => {
    try {
      // Update frontend state immediately
      setTerms(prevTerms => 
        prevTerms.map(t => 
          t.term_id === term.term_id 
            ? { ...t, status: !t.status }
            : t
        )
      );

      // Update backend
      const { error } = await supabase
        .from('termos_personalizados')
        .update({ status: !term.status })
        .eq('term_id', term.term_id);

      if (error) {
        // Revert frontend state if backend update fails
        setTerms(prevTerms => 
          prevTerms.map(t => 
            t.term_id === term.term_id 
              ? { ...t, status: term.status }
              : t
          )
        );
        throw error;
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  return (
    <Layout title="Termos Personalizados">
      <div>
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Termos</h2>
            <p className="text-gray-600 mt-1">
              Visualize, edite e crie novos termos personalizados.
            </p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968]"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Novo Termo</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-6 w-12 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="animate-pulse h-4 w-8 bg-gray-200 rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : terms.length > 0 ? (
                  terms.map((term) => (
                    <tr key={term.term_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={term.status}
                            onChange={() => handleToggleStatus(term)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e6f7f1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#11ab77]"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {term.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {term.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleOpenModal(term)}
                          className="text-gray-400 hover:text-[#11ab77] transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum termo personalizado encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedTerm ? 'Editar Termo' : 'Novo Termo'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-4">
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  placeholder="Digite o título do termo"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  placeholder="Digite a descrição do termo"
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968] focus:outline-none focus:ring-2 focus:ring-[#11ab77] flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}