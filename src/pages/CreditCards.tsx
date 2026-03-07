import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { CreditCard, Loader2, Plus, Edit, X, Check } from 'lucide-react';

interface CreditCard {
  card_id: string;
  name: string;
  number: number;
  close_date: string;
  main: boolean;
}

interface CardFormData {
  name: string;
  number: string;
  close_date: string;
  main: boolean;
}

export default function CreditCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [formData, setFormData] = useState<CardFormData>({
    name: '',
    number: '',
    close_date: '',
    main: false
  });

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchCards = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', user.id)
        .order('main', { ascending: false })
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching cards:', error);
        setCards([]);
      } else if (data) {
        setCards(data);
      } else {
        setCards([]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format card number to show only last 4 digits
  const formatCardNumber = (number: number) => {
    const numberStr = number.toString();
    return `•••• ${numberStr.slice(-4)}`;
  };

  // Format date to Brazilian format
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleOpenModal = (card?: CreditCard) => {
    if (card) {
      setSelectedCard(card);
      setFormData({
        name: card.name,
        number: card.number.toString(),
        close_date: card.close_date,
        main: card.main
      });
    } else {
      setSelectedCard(null);
      setFormData({
        name: '',
        number: '',
        close_date: '',
        main: false
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
    setFormData({
      name: '',
      number: '',
      close_date: '',
      main: false
    });
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('O nome do cartão é obrigatório');
      return false;
    }
    if (!formData.number.trim() || !/^\d+$/.test(formData.number)) {
      setError('Número do cartão inválido');
      return false;
    }
    if (!formData.close_date) {
      setError('A data de vencimento é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (formData.main) {
        // If this card is being set as main, update all other cards to not be main
        await supabase
          .from('cartoes')
          .update({ main: false })
          .eq('user_id', user.id);
      }
      
      if (selectedCard) {
        // Update existing card
        const { error } = await supabase
          .from('cartoes')
          .update({
            name: formData.name,
            number: parseInt(formData.number),
            close_date: formData.close_date,
            main: formData.main
          })
          .eq('card_id', selectedCard.card_id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setSuccess('Cartão atualizado com sucesso');
      } else {
        // Create new card
        const { error } = await supabase
          .from('cartoes')
          .insert([{
            name: formData.name,
            number: parseInt(formData.number),
            close_date: formData.close_date,
            main: formData.main,
            user_id: user.id
          }]);
        
        if (error) throw error;
        setSuccess('Cartão cadastrado com sucesso');
      }
      
      // Refresh cards list
      await fetchCards();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving card:', error);
      setError('Erro ao salvar cartão. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Cartões de Crédito">
      <div>
        {/* Success message */}
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
            <h2 className="text-2xl font-bold text-gray-900">Seus Cartões</h2>
            <p className="text-gray-600 mt-1">
              Gerencie seus cartões de crédito e suas faturas.
            </p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968]"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Novo Cartão</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 text-[#11ab77] animate-spin" />
          </div>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div 
                key={card.card_id}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  card.main ? 'ring-2 ring-[#11ab77]' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
                      <p className="text-gray-500 font-mono">{formatCardNumber(card.number)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(card)}
                        className="text-gray-400 hover:text-[#11ab77] transition-colors p-1"
                        title="Editar cartão"
                      >
                        <Edit size={16} />
                      </button>
                      <CreditCard 
                        className={`h-6 w-6 ${card.main ? 'text-[#11ab77]' : 'text-gray-400'}`}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Vencimento</p>
                      <p className="font-medium">{formatDate(card.close_date)}</p>
                    </div>
                    
                    {card.main && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Principal
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cartão cadastrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Você ainda não possui cartões de crédito cadastrados.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedCard ? 'Editar Cartão' : 'Novo Cartão'}
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  placeholder="Ex: Nubank, Inter, etc."
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  placeholder="Somente números"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="close_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  id="close_date"
                  name="close_date"
                  value={formData.close_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="main"
                    checked={formData.main}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#11ab77] focus:ring-[#11ab77] border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Definir como cartão principal</span>
                </label>
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