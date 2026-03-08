import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Edit, Plus, Search, X, Loader2, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useInstallments, useInstallmentOptions, InstallmentRecord, CreditCard } from '../hooks/useInstallments';

interface GroupedInstallment {
  descricao: string;
  cardName: string;
  parcelas: number;
  tipo: string;
  categoria: string;
  subcategoria: string;
  monthlyValues: { [key: string]: number };
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
  tipos: any[];
  categorias: any[];
  filteredSubcategorias: any[];
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
const LoadingRow = ({ columnsCount }: { columnsCount: number }) => (
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
    {Array.from({ length: columnsCount }).map((_, i) => (
      <td key={i} className="px-6 py-4 whitespace-nowrap text-right">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-20 ml-auto"></div>
      </td>
    ))}
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <div className="animate-pulse h-4 bg-gray-200 rounded w-8 ml-auto"></div>
    </td>
  </tr>
);

const NoDataRow = ({ searchTerm, colSpan }: { searchTerm: string; colSpan: number }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50">
      {searchTerm ? 'Nenhum parcelamento encontrado para esta busca.' : 'Nenhum parcelamento encontrado.'}
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Editar Parcelamento' : 'Novo Parcelamento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-4 text-sm rounded">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] transition-all"
                placeholder="Ex: Compra na loja X"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="card_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Cartão
                </label>
                <select
                  id="card_id"
                  name="card_id"
                  value={formData.card_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] transition-all"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Selecione</option>
                  {cards.map(card => (
                    <option key={card.card_id} value={card.card_id}>
                      {card.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] transition-all"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Selecione</option>
                  {tipos.map(tipo => (
                    <option key={tipo.id} value={tipo.value}>
                      {tipo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] transition-all"
                  disabled={isSubmitting || !formData.tipo}
                >
                  <option value="">Selecione</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.value}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoria
                </label>
                <select
                  id="subcategoria"
                  name="subcategoria"
                  value={formData.subcategoria}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] transition-all"
                  disabled={isSubmitting || !formData.tipo || !formData.categoria}
                >
                  <option value="">Selecione</option>
                  {filteredSubcategorias.map(subcategoria => (
                    <option key={subcategoria.id} value={subcategoria.value}>
                      {subcategoria.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">R$</span>
                  <input
                    type="number"
                    id="valor"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] transition-all"
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="parcelas" className="block text-sm font-medium text-gray-700 mb-1">
                  Parcelas
                </label>
                <input
                  type="number"
                  id="parcelas"
                  name="parcelas"
                  value={formData.parcelas}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] transition-all"
                  placeholder="12"
                  min="1"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                Data da Compra
              </label>
              <input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] transition-all"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968] focus:outline-none focus:ring-2 focus:ring-[#11ab77] flex items-center shadow-sm transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar Parcelamento</span>
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
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Queries
  const { data: records = [], isLoading } = useInstallments(user?.id, searchTerm);
  const { data: options = { cards: [], tipos: [], categorias: [], subcategorias: [] } } = useInstallmentOptions(user?.id);

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

  // Clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Derived data with useMemo
  const { monthColumns, currentMonth, groupedRecords, monthlyTotals } = useMemo(() => {
    // 1. Current Month
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const actualMonth = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    // 2. Build months from records
    const monthsSet = new Set<string>();
    records.forEach(record => {
      if (record.data_pagamento) {
        const [year, month] = record.data_pagamento.split('-');
        monthsSet.add(`${month}/${year}`);
      }
    });

    // Also include surrounding months if empty
    if (monthsSet.size === 0) {
      for (let i = -1; i < 5; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsSet.add(`${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`);
      }
    }

    const sortedMonths = Array.from(monthsSet).sort((a, b) => {
      const [mA, yA] = a.split('/');
      const [mB, yB] = b.split('/');
      return new Date(`${yA}-${mA}-01`).getTime() - new Date(`${yB}-${mB}-01`).getTime();
    });

    // 3. Process records into groups and totals
    const totals: { [key: string]: number } = {};
    sortedMonths.forEach(m => (totals[m] = 0));

    const groupedMap: { [key: string]: GroupedInstallment } = {};

    records.forEach(record => {
      const key = `${record.descricao}-${record.card_id}`; // Better key to distinguish same description on different cards

      if (!groupedMap[key]) {
        groupedMap[key] = {
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
        const mKey = `${month}/${year}`;
        groupedMap[key].monthlyValues[mKey] = (groupedMap[key].monthlyValues[mKey] || 0) + record.valor_por_parcela;
        totals[mKey] = (totals[mKey] || 0) + record.valor_por_parcela;
      }
    });

    return {
      monthColumns: sortedMonths,
      currentMonth: actualMonth,
      groupedRecords: Object.values(groupedMap),
      monthlyTotals: totals
    };
  }, [records]);

  // Filtered subcategories for modal
  const filteredSubcategorias = useMemo(() => {
    if (!formData.tipo && !formData.categoria) return options.subcategorias;

    return options.subcategorias.filter(sub => {
      const matchesTipo = !formData.tipo || sub.tipo_value === formData.tipo;
      const matchesCategoria = !formData.categoria || sub.categoria_value === formData.categoria;
      return matchesTipo && matchesCategoria;
    });
  }, [formData.tipo, formData.categoria, options.subcategorias]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'tipo' || name === 'categoria') {
      setFormData(prev => ({ ...prev, subcategoria: '' }));
    }
  };

  const handleOpenModal = (descrip?: string) => {
    if (descrip) {
      const record = records.find(r => r.descricao === descrip);
      if (record) {
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
      }
    } else {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
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

      let saveError;
      if (selectedInstallment) {
        const { error } = await supabase
          .from('registros_cartoes')
          .update(installmentData)
          .eq('registro_id', selectedInstallment.registro_id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('registros_cartoes')
          .insert([installmentData]);
        saveError = error;
      }

      if (saveError) throw saveError;

      queryClient.invalidateQueries({ queryKey: ['installments'] });
      handleCloseModal();
      setSuccess(selectedInstallment ? 'Parcelamento atualizado com sucesso' : 'Parcelamento cadastrado com sucesso');
    } catch (err: any) {
      console.error('Error saving installment:', err);
      setError('Erro ao salvar parcelamento. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Parcelamentos">
      <div className="flex flex-col h-full w-full overflow-hidden -mt-2">
        {/* Success message */}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded flex items-center animate-in slide-in-from-top-4 duration-300 flex-shrink-0">
            <Check className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        {/* Filters Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 flex-shrink-0">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar parcelas..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] transition-all bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-6 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968] shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="font-medium">Novo Parcelamento</span>
          </button>
        </div>

        {/* Main Table area */}
        <div className="bg-white rounded-lg shadow-md flex flex-col flex-1 min-h-0 overflow-hidden border border-gray-100">
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-200">
            <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
              <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b min-w-[200px]">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b min-w-[150px]">
                    Cartão
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b min-w-[80px]">
                    Parcelas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b min-w-[120px]">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b min-w-[120px]">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b min-w-[120px]">
                    Subcategoria
                  </th>
                  {monthColumns.map(month => (
                    <th
                      key={month}
                      className={`px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b min-w-[120px] ${month === currentMonth ? 'bg-[#f0f9f6] text-[#11ab77]' : ''
                        }`}
                    >
                      {month}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b min-w-[80px] sticky right-0 z-30 border-l border-gray-200">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <LoadingRow key={i} columnsCount={monthColumns.length} />
                  ))
                ) : groupedRecords.length > 0 ? (
                  <>
                    {groupedRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-50 max-w-[200px] truncate" title={record.descricao}>
                          {record.descricao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.cardName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">{record.parcelas}x</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {record.tipo || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.categoria || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                          {record.subcategoria || '-'}
                        </td>
                        {monthColumns.map(month => (
                          <td
                            key={month}
                            className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-700 ${month === currentMonth ? 'bg-[#f0f9f6] border-x border-[#f0f9f6]' : ''
                              }`}
                          >
                            {record.monthlyValues[month] > 0 ? formatCurrency(record.monthlyValues[month]) : <span className="text-gray-200">-</span>}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right sticky right-0 bg-white group-hover:bg-gray-50 border-l border-gray-100 z-10 transition-colors">
                          <button
                            onClick={() => handleOpenModal(record.descricao)}
                            className="text-gray-400 hover:text-[#11ab77] p-2 hover:bg-green-50 rounded-full transition-all"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Summary Row */}
                    <tr className="bg-gray-50 font-bold sticky bottom-0 z-10 border-t-2 border-gray-200">
                      <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase tracking-wider">
                        Total Geral das Parcelas
                      </td>
                      {monthColumns.map(month => (
                        <td
                          key={month}
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-[#0c8a60] ${month === currentMonth ? 'bg-[#e6f7f1]' : ''
                            }`}
                        >
                          {formatCurrency(monthlyTotals[month])}
                        </td>
                      ))}
                      <td className="px-6 py-4 bg-gray-50 sticky right-0 z-20 border-l border-gray-200"></td>
                    </tr>
                  </>
                ) : (
                  <NoDataRow searchTerm={searchTerm} colSpan={7 + monthColumns.length} />
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
        cards={options.cards}
        tipos={options.tipos}
        categorias={options.categorias}
        filteredSubcategorias={filteredSubcategorias}
        isEditing={!!selectedInstallment}
      />
    </Layout>
  );
}

export default Installments;
