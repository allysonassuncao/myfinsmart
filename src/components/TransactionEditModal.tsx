import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
  onSave: () => void;
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

interface TransactionData {
  descricao: string;
  tipo: string | null;
  categoria: string | null;
  subcategoria: string | null;
  data: string;
  hora: string;
  valor: number;
}

export default function TransactionEditModal({ 
  isOpen, 
  onClose, 
  transactionId,
  onSave
}: TransactionEditModalProps) {
  const [transaction, setTransaction] = useState<TransactionData>({
    descricao: '',
    tipo: null,
    categoria: null,
    subcategoria: null,
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
    valor: 0
  });
  
  const [tipos, setTipos] = useState<TipoOption[]>([]);
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaOption[]>([]);
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<SubcategoriaOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [transactionLoaded, setTransactionLoaded] = useState(false);
  const [valorInput, setValorInput] = useState('0');

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (transactionId) {
        fetchTransactionData(transactionId);
      } else {
        resetForm();
      }
    }
  }, [isOpen, transactionId]);

  // This effect runs when both options and transaction data are loaded
  useEffect(() => {
    if (optionsLoaded && transactionLoaded && transaction.tipo) {
      mapValuesToIds();
    }
  }, [optionsLoaded, transactionLoaded, tipos, categorias, subcategorias]);

  // Update valorInput when transaction.valor changes
  useEffect(() => {
    setValorInput(Math.abs(transaction.valor).toString());
  }, [transaction.valor]);

  // Filter subcategorias based on selected tipo and categoria
  useEffect(() => {
    if (subcategorias.length > 0) {
      filterSubcategorias();
    }
  }, [transaction.tipo, transaction.categoria, subcategorias]);

  const fetchOptions = async () => {
    setIsLoading(true);
    setOptionsLoaded(false);
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

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
      
      setOptionsLoaded(true);
    } catch (error) {
      console.error('Error fetching options:', error);
      setError('Erro ao carregar opções. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactionData = async (id: string) => {
    setIsLoading(true);
    setTransactionLoaded(false);
    try {
      // Fetch transaction data from the registros table
      const { data, error } = await supabase
        .from('registros')
        .select('descricao, tipo, categoria, subcategoria, data, hora, valor')
        .eq('registro_id', id)
        .single();
      
      if (error) {
        console.error('Supabase request failed', error);
        throw error;
      }
      
      if (data) {
        setTransaction({
          descricao: data.descricao || '',
          tipo: data.tipo,
          categoria: data.categoria,
          subcategoria: data.subcategoria,
          data: data.data || new Date().toISOString().split('T')[0],
          hora: data.hora || new Date().toTimeString().split(' ')[0].substring(0, 5),
          valor: data.valor || 0
        });
        setTransactionLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setError('Erro ao carregar dados da transação. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTransaction({
      descricao: '',
      tipo: null,
      categoria: null,
      subcategoria: null,
      data: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
      valor: 0
    });
    setValorInput('0');
    setError(null);
    setTransactionLoaded(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tipo' || name === 'categoria' || name === 'subcategoria') {
      // For these fields, store the value directly as string
      setTransaction(prev => ({ ...prev, [name]: value || null }));
      
      // Reset subcategoria when tipo or categoria changes
      if (name === 'tipo' || name === 'categoria') {
        setTransaction(prev => ({ ...prev, subcategoria: null }));
      }
    } else if (name !== 'valor') {
      // Handle other inputs except valor
      setTransaction(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle valor input changes
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow digits and decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(input) || input === '') {
      setValorInput(input);
      
      // Update the transaction value
      const numericValue = parseFloat(input) || 0;
      const isNegative = document.getElementById('valorNegative')?.getAttribute('aria-pressed') === 'true';
      setTransaction(prev => ({ 
        ...prev, 
        valor: isNegative ? -numericValue : numericValue 
      }));
    }
  };

  // Toggle between positive and negative values
  const toggleValorSign = () => {
    setTransaction(prev => ({ 
      ...prev, 
      valor: -prev.valor 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      if (!transaction.descricao) {
        throw new Error('Descrição é obrigatória');
      }
      
      if (!transaction.tipo) {
        throw new Error('Tipo é obrigatório');
      }
      
      if (!transaction.data) {
        throw new Error('Data é obrigatória');
      }
      
      if (transaction.valor === 0) {
        throw new Error('Valor não pode ser zero');
      }

      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Find the corresponding value for the selected tipo, categoria, and subcategoria
      const selectedTipo = tipos.find(t => t.id.toString() === transaction.tipo);
      const selectedCategoria = categorias.find(c => c.id.toString() === transaction.categoria);
      const selectedSubcategoria = subcategorias.find(s => s.id.toString() === transaction.subcategoria);
      
      const transactionData = {
        descricao: transaction.descricao,
        tipo: selectedTipo?.value || null,
        categoria: selectedCategoria?.value || null,
        subcategoria: selectedSubcategoria?.value || null,
        data: transaction.data,
        hora: transaction.hora,
        valor: transaction.valor,
        user_id: userId
      };

      let error;

      if (transactionId) {
        // Update existing transaction
        const { error: updateError } = await supabase
          .from('registros')
          .update(transactionData)
          .eq('registro_id', transactionId);
        
        error = updateError;
      } else {
        // Create new transaction
        const { error: insertError } = await supabase
          .from('registros')
          .insert([transactionData]);
        
        error = insertError;
      }
      
      if (error) throw error;
      
      // Call onSave to refresh the parent component
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      setError(error.message || 'Erro ao salvar transação. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Find the ID for a given value
  const findIdByValue = (options: any[], value: string | null) => {
    if (!value) return '';
    const option = options.find(opt => opt.value === value);
    return option ? option.id.toString() : '';
  };

  // Map the database values to dropdown IDs
  const mapValuesToIds = () => {
    const tipoId = findIdByValue(tipos, transaction.tipo);
    const categoriaId = findIdByValue(categorias, transaction.categoria);
    const subcategoriaId = findIdByValue(subcategorias, transaction.subcategoria);
    
    setTransaction(prev => ({
      ...prev,
      tipo: tipoId,
      categoria: categoriaId,
      subcategoria: subcategoriaId
    }));
  };

  // Filter subcategorias based on selected tipo and categoria
  const filterSubcategorias = () => {
    if (!transaction.tipo && !transaction.categoria) {
      // If no tipo or categoria selected, show all subcategorias
      setFilteredSubcategorias(subcategorias);
      return;
    }

    // Get the selected tipo and categoria values
    const selectedTipo = transaction.tipo ? 
      tipos.find(t => t.id.toString() === transaction.tipo)?.value : null;
    
    const selectedCategoria = transaction.categoria ? 
      categorias.find(c => c.id.toString() === transaction.categoria)?.value : null;

    // Filter subcategorias based on tipo_value and categoria_value
    const filtered = subcategorias.filter(sub => {
      const matchesTipo = !selectedTipo || sub.tipo_value === selectedTipo;
      const matchesCategoria = !selectedCategoria || sub.categoria_value === selectedCategoria;
      
      return matchesTipo && matchesCategoria;
    });

    setFilteredSubcategorias(filtered);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {transactionId ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-4">
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11ab77]"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                id="descricao"
                name="descricao"
                value={transaction.descricao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                placeholder="Descrição da transação"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                id="tipo"
                name="tipo"
                value={transaction.tipo || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                required
              >
                <option value="">Selecione um tipo</option>
                {tipos.map(tipo => (
                  <option key={tipo.id} value={tipo.id.toString()}>
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
                value={transaction.categoria || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id.toString()}>
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
                value={transaction.subcategoria || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              >
                <option value="">Selecione uma subcategoria</option>
                {filteredSubcategorias.map(subcategoria => (
                  <option key={subcategoria.id} value={subcategoria.id.toString()}>
                    {subcategoria.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  id="data"
                  name="data"
                  value={transaction.data}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  id="hora"
                  name="hora"
                  value={transaction.hora}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="valor"
                  name="valor"
                  value={valorInput}
                  onChange={handleValorChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  placeholder="0"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use o botão para alternar entre valores positivos e negativos
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968] focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}