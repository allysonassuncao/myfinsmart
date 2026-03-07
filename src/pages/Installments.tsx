import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Edit, Plus, Filter, Search, X, ChevronLeft, ChevronRight, Loader2, Tag, Check } from 'lucide-react';

interface InstallmentRecord {
  user_id: string;
  created_at: string;
  descricao: string;
  categoria: string;
  tipo: string;
  valor: number;
  data: string;
  hora: string;
  subcategoria: string;
  registro_id: string;
  card_id: string;
  card_name: string;
  parcelas: number;
  valor_por_parcela: number;
  parcela: number;
  data_pagamento: string;
}

interface GroupedInstallment {
  descricao: string;
  cardName: string;
  parcelas: number;
  tipo: string;
  categoria: string;
  subcategoria: string;
  monthlyValues: { [key: string]: number };
}

interface TipoOption {
  id: number;
  name: string;
  value: string;
}

interface CategoriaOption {
  id: number;
  name: string;
  value: string;
}

interface SubcategoriaOption {
  id: number;
  name: string;
  value: string;
  tipo_value: string;
  categoria_value: string;
}

interface CreditCard {
  card_id: string;
  name: string;
  number: number;
  close_date: string;
  main: boolean;
}

interface InstallmentFormData {
  descricao: string;
  card_id: string;
  tipo: string;
  categoria: string;
  subcategoria: string;
  valor: string;
  parcelas: string;
  data: string;
}

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: InstallmentFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  cards: CreditCard[];
  tipos: TipoOption[];
  categorias: CategoriaOption[];
  filteredSubcategorias: SubcategoriaOption[];
  isEditing: boolean;
}

// Utility functions
const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Components
const LoadingRow = () => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
    </td>
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-6 py-4 whitespace-nowrap text-right">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-24 ml-auto"></div>
      </td>
    ))}
  </tr>
);

const NoDataRow = ({ searchTerm }: { searchTerm: string }) => (
  <tr>
    <td colSpan={12} className="px-6 py-4 text-center text-sm text-gray-500">
      {searchTerm ? 'Nenhum parcelamento encontrado para esta busca' : 'Nenhum parcelamento encontrado'}
    </td>
  </tr>
);

const InstallmentModal: React.FC<InstallmentModalProps> = ({
  isOpen,
  onClose,
  formData,
  handleInputChange,
  handleSubmit,
  isSubmitting,
  error,
  cards,
  tipos,
  categorias,
  filteredSubcategorias,
  isEditing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Editar Parcelamento' : 'Novo Parcelamento'}
          </h2>
          <button 
            onClick={onClose}
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
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              placeholder="Ex: Compra na loja X"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="card_id" className="block text-sm font-medium text-gray-700 mb-1">
              Cartão
            </label>
            <select
              id="card_id"
              name="card_id"
              value={formData.card_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              disabled={isSubmitting}
              required
            >
              <option value="">Selecione um cartão</option>
              {cards.map(card => (
                <option key={card.card_id} value={card.card_id}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              disabled={isSubmitting}
              required
            >
              <option value="">Selecione um tipo</option>
              {tipos.map(tipo => (
                <option key={tipo.id} value={tipo.value}>
                  {tipo.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              disabled={isSubmitting || !formData.tipo}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.value}>
                  {categoria.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 mb-1">
              Subcategoria
            </label>
            <select
              id="subcategoria"
              name="subcategoria"
              value={formData.subcategoria}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              disabled={isSubmitting || !formData.tipo || !formData.categoria}
            >
              <option value="">Selecione uma subcategoria</option>
              {filteredSubcategorias.map(subcategoria => (
                <option key={subcategoria.id} value={subcategoria.value}>
                  {subcategoria.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
              Valor Total (R$)
            </label>
            <input
              type="number"
              id="valor"
              name="valor"
              value={formData.valor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="parcelas" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Parcelas
            </label>
            <input
              type="number"
              id="parcelas"
              name="parcelas"
              value={formData.parcelas}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              placeholder="1"
              min="1"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
              Data da Compra
            </label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
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
  );
};

function Installments() {
  const { user } = useAuth();
  const [records, setRecords] = useState<InstallmentRecord[]>([]);
  const [groupedRecords, setGroupedRecords] = useState<GroupedInstallment[]>([]);
  const [monthColumns, setMonthColumns] = useState<string[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<InstallmentRecord | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<InstallmentFormData>({
    descricao: '',
    card_id: '',
    tipo: '',
    categoria: '',
    subcategoria: '',
    valor: '',
    parcelas: '',
    data: new Date().toISOString().split('T')[0]
  });
  
  // Options for dropdowns
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [tipos, setTipos] = useState<TipoOption[]>([]);
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaOption[]>([]);
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<SubcategoriaOption[]>([]);

  // Current month state
  const [currentMonth, setCurrentMonth] = useState<string>('');

  useEffect(() => {
    // Generate months options including next month
    const months = [];
    // const currentDate = new Date(2025, 2, 31); // March 31, 2025
    const currentDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    
    // Start from next month (i = -1) and include 6 months back
    for (let i = -1; i < 5; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthStr = `${month.toString().padStart(2, '0')}/${year}`;
      months.push(monthStr);
      
      // Set current month (when i = 0, it's the current month)
      if (i === 0) {
        setCurrentMonth(monthStr);
      }
    }
    
    setMonthColumns(months);
  }, []);

  useEffect(() => {
    if (user) {
      fetchInstallments();
      fetchOptions();
    }
  }, [user, searchTerm]);

  useEffect(() => {
    if (subcategorias.length > 0) {
      filterSubcategorias();
    }
  }, [formData.tipo, formData.categoria, subcategorias]);

  const fetchOptions = async () => {
    try {
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Fetch credit cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', userId)
        .order('main', { ascending: false })
        .order('name', { ascending: true });
      
      if (cardsError) throw cardsError;
      setCards(cardsData || []);

      // Fetch tipos
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos')
        .select('id, name, value')
        .eq('user_id', userId);
      
      if (tiposError) throw tiposError;
      setTipos(tiposData || []);

      // Fetch categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('id, name, value')
        .eq('user_id', userId);
      
      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Fetch subcategorias with the new columns
      const { data: subcategoriasData, error: subcategoriasError } = await supabase
        .from('subcategorias')
        .select('id, name, value, tipo_value, categoria_value')
        .eq('user_id', userId);
      
      if (subcategoriasError) throw subcategoriasError;
      setSubcategorias(subcategoriasData || []);
      setFilteredSubcategorias(subcategoriasData || []);
      
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const filterSubcategorias = () => {
    if (!formData.tipo && !formData.categoria) {
      setFilteredSubcategorias(subcategorias);
      return;
    }

    const selectedTipo = formData.tipo ? 
      tipos.find(t => t.value === formData.tipo)?.value : null;
    
    const selectedCategoria = formData.categoria ? 
      categorias.find(c => c.value === formData.categoria)?.value : null;

    const filtered = subcategorias.filter(sub => {
      const matchesTipo = !selectedTipo || sub.tipo_value === selectedTipo;
      const matchesCategoria = !selectedCategoria || sub.categoria_value === selectedCategoria;
      return matchesTipo && matchesCategoria;
    });

    setFilteredSubcategorias(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'tipo' || name === 'categoria') {
      setFormData(prev => ({ ...prev, subcategoria: '' }));
    }
  };

  const handleOpenModal = (record?: InstallmentRecord) => {
    if (record) {
      // Set form data for editing
      setSelectedInstallment(record);
      setFormData({
        descricao: record.descricao,
        card_id: record.card_id,
        tipo: record.tipo,
        categoria: record.categoria || '',
        subcategoria: record.subcategoria || '',
        valor: record.valor.toString(),
        parcelas: record.parcelas.toString(),
        data: record.data
      });
    } else {
      // Reset form data for new record
      setSelectedInstallment(null);
      setFormData({
        descricao: '',
        card_id: '',
        tipo: '',
        categoria: '',
        subcategoria: '',
        valor: '',
        parcelas: '',
        data: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInstallment(null);
    setFormData({
      descricao: '',
      card_id: '',
      tipo: '',
      categoria: '',
      subcategoria: '',
      valor: '',
      parcelas: '',
      data: new Date().toISOString().split('T')[0]
    });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.descricao.trim()) {
      setError('A descrição é obrigatória');
      return false;
    }
    if (!formData.card_id) {
      setError('Selecione um cartão');
      return false;
    }
    if (!formData.tipo) {
      setError('Selecione um tipo');
      return false;
    }
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setError('O valor deve ser maior que zero');
      return false;
    }
    if (!formData.parcelas || parseInt(formData.parcelas) <= 0) {
      setError('O número de parcelas deve ser maior que zero');
      return false;
    }
    if (!formData.data) {
      setError('A data é obrigatória');
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
      // Convert the selected date to the first day of the month
      const selectedDate = new Date(formData.data);
      const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const formattedDate = firstDayOfMonth.toISOString().split('T')[0];

      const installmentData = {
        user_id: user.id,
        card_id: formData.card_id,
        descricao: formData.descricao,
        tipo: formData.tipo,
        categoria: formData.categoria || null,
        subcategoria: formData.subcategoria || null,
        valor: parseFloat(formData.valor),
        parcelas: parseInt(formData.parcelas),
        data: formattedDate,
        hora: new Date().toTimeString().split(' ')[0].substring(0, 5)
      };

      let error;

      if (selectedInstallment) {
        // Update existing installment
        const { error: updateError } = await supabase
          .from('registros_cartoes')
          .update(installmentData)
          .eq('registro_id', selectedInstallment.registro_id);
        
        error = updateError;
      } else {
        // Create new installment
        const { error: insertError } = await supabase
          .from('registros_cartoes')
          .insert([installmentData]);
        
        error = insertError;
      }
      
      if (error) throw error;
      
      await fetchInstallments();
      handleCloseModal();
      setSuccess(selectedInstallment ? 'Parcelamento atualizado com sucesso' : 'Parcelamento cadastrado com sucesso');
    } catch (error) {
      console.error('Error saving installment:', error);
      setError('Erro ao salvar parcelamento. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInstallments = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('view_todos_registros_cartao')
        .select('*')
        .eq('user_id', user.id)
        .not('parcelas', 'is', null);
      
      if (searchTerm) {
        query = query.or(`descricao.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,tipo.ilike.%${searchTerm}%,subcategoria.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching installments:', error);
        setRecords([]);
      } else if (data) {
        setRecords(data);
        processRecords(data);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processRecords = (records: InstallmentRecord[]) => {
    const months = new Set<string>();
    records.forEach(record => {
      if (record.data_pagamento) {
        const [year, month] = record.data_pagamento.split('-');
        months.add(`${month}/${year}`);
      }
    });

    const sortedMonths = Array.from(months).sort((a, b) => {
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      return new Date(`${yearA}-${monthA}`).getTime() - new Date(`${yearB}-${monthB}`).getTime();
    });

    setMonthColumns(sortedMonths);

    const totals: { [key: string]: number } = {};
    sortedMonths.forEach(month => {
      totals[month] = 0;
    });

    const grouped = records.reduce<{ [key: string]: GroupedInstallment }>((acc, record) => {
      const key = record.descricao;
      
      if (!acc[key]) {
        acc[key] = {
          descricao: record.descricao,
          cardName: record.card_name || '-',
          parcelas: record.parcelas,
          tipo: record.tipo,
          categoria: record.categoria,
          subcategoria: record.subcategoria,
          monthlyValues: {}
        };
      }

      if (record.data_pagamento) {
        const [year, month] = record.data_pagamento.split('-');
        const monthKey = `${month}/${year}`;
        acc[key].monthlyValues[monthKey] = record.valor_por_parcela;
        
        totals[monthKey] = (totals[monthKey] || 0) + record.valor_por_parcela;
      }

      return acc;
    }, {});

    setGroupedRecords(Object.values(grouped));
    setMonthlyTotals(totals);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Layout title="Parcelamentos">
      <div className="max-w-[1450px] w-full mx-auto">
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar parcelamentos..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968] whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span>Novo</span>
            </button>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden">
          <div className="table-wrapper">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Descrição
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Cartão
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Qtd. Parcelas
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Tipo
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Categoria
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Subcategoria
                  </th>
                  {monthColumns.map(month => (
                    <th 
                      key={month} 
                      className={`px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] ${
                        month === currentMonth ? 'bg-[#e6f7f1]' : ''
                      }`}
                    >
                      {month}
                    </th>
                  ))}
                  <th className="px-6 py-2 text-right text-xs font-medium text-gray-500  uppercase tracking-wider min-w-[80px]">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <LoadingRow key={index} />
                  ))
                ) : groupedRecords.length > 0 ? (
                  <>
                    {groupedRecords.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 break-words overflow-wrap">
                          {record.descricao}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 break-words overflow-wrap">
                          {record.cardName}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 break-words overflow-wrap">
                          {record.parcelas}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 break-words overflow-wrap">
                          {record.tipo || '-'}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 break-words overflow-wrap">
                          {record.categoria || '-'}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 break-words overflow-wrap">
                          {record.subcategoria || '-'}
                        </td>
                        {monthColumns.map(month => (
                          <td 
                            key={month} 
                            className={`px-6 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-600 break-words overflow-wrap ${
                              month === currentMonth ? 'bg-[#e6f7f1]' : ''
                            }`}
                          >
                            {formatCurrency(record.monthlyValues[month])}
                          </td>
                        ))}
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => handleOpenModal(records.find(r => r.descricao === record.descricao))}
                            className="text-gray-400 hover:text-[#11ab77] transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                      {monthColumns.map(month => (
                        <td 
                          key={month} 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-600 ${
                            month === currentMonth ? 'bg-[#e6f7f1]' : ''
                          }`}
                        >
                          {formatCurrency(monthlyTotals[month])}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        -
                      </td>
                    </tr>
                  </>
                ) : (
                  <NoDataRow searchTerm={searchTerm} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <InstallmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        cards={cards}
        tipos={tipos}
        categorias={categorias}
        filteredSubcategorias={filteredSubcategorias}
        isEditing={!!selectedInstallment}
      />
    </Layout>
  );
}

export default Installments;