import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Edit, Plus, Filter, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import TransactionEditModal from '../components/TransactionEditModal';

interface Transaction {
  id: number;
  registro_id: string;
  descricao: string;
  valor: number;
  data: string;
  hora: string;
  tipo_name: string;
  categoria_name: string;
  subcategoria_name: string;
  tipo: string;
  categoria: string;
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  tipo: string;
  categoria: string;
  subcategoria: string;
  minValue: string;
  maxValue: string;
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

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    tipo: '',
    categoria: '',
    subcategoria: '',
    minValue: '',
    maxValue: ''
  });
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    tipo: '',
    categoria: '',
    subcategoria: '',
    minValue: '',
    maxValue: ''
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Options for dropdowns
  const [tipos, setTipos] = useState<TipoOption[]>([]);
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaOption[]>([]);
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<SubcategoriaOption[]>([]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchFilterOptions();
    }
  }, [user, currentPage, itemsPerPage, activeFilters, searchTerm]);

  useEffect(() => {
    // Filter subcategorias based on selected tipo and categoria in filter modal
    if (subcategorias.length > 0) {
      filterSubcategorias();
    }
  }, [filterOptions.tipo, filterOptions.categoria, subcategorias]);

  const fetchFilterOptions = async () => {
    try {
      const userId = user?.id;
      
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
      setFilteredSubcategorias(subcategoriasData || []);
      
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const filterSubcategorias = () => {
    if (!filterOptions.tipo && !filterOptions.categoria) {
      // If no tipo or categoria selected, show all subcategorias
      setFilteredSubcategorias(subcategorias);
      return;
    }

    // Get the selected tipo and categoria values
    const selectedTipo = filterOptions.tipo ? 
      tipos.find(t => t.id.toString() === filterOptions.tipo)?.value : null;
    
    const selectedCategoria = filterOptions.categoria ? 
      categorias.find(c => c.id.toString() === filterOptions.categoria)?.value : null;

    // Filter subcategorias based on tipo_value and categoria_value
    const filtered = subcategorias.filter(sub => {
      const matchesTipo = !selectedTipo || sub.tipo_value === selectedTipo;
      const matchesCategoria = !selectedCategoria || sub.categoria_value === selectedCategoria;
      
      return matchesTipo && matchesCategoria;
    });

    setFilteredSubcategorias(filtered);
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('view_todos_registros')
        .select('id, registro_id, descricao, valor, data, hora, tipo_name, categoria_name, subcategoria_name, tipo, categoria', { count: 'exact' })
        .eq('user_id', user.id);
      
      // Apply search term if it exists
      if (searchTerm) {
        query = query.or(`descricao.ilike.%${searchTerm}%,tipo_name.ilike.%${searchTerm}%,categoria_name.ilike.%${searchTerm}%,subcategoria_name.ilike.%${searchTerm}%`);
      }

      // Apply filters if they exist
      if (filtersApplied) {
        // Date range filter
        if (activeFilters.startDate) {
          query = query.gte('data', activeFilters.startDate);
        }
        if (activeFilters.endDate) {
          query = query.lte('data', activeFilters.endDate);
        }
        
        // Tipo filter
        if (activeFilters.tipo) {
          const selectedTipo = tipos.find(t => t.id.toString() === activeFilters.tipo);
          if (selectedTipo) {
            query = query.eq('tipo', selectedTipo.value);
          }
        }
        
        // Categoria filter
        if (activeFilters.categoria) {
          const selectedCategoria = categorias.find(c => c.id.toString() === activeFilters.categoria);
          if (selectedCategoria) {
            query = query.eq('categoria', selectedCategoria.value);
          }
        }
        
        // Subcategoria filter
        if (activeFilters.subcategoria) {
          const selectedSubcategoria = subcategorias.find(s => s.id.toString() === activeFilters.subcategoria);
          if (selectedSubcategoria) {
            query = query.eq('subcategoria', selectedSubcategoria.value);
          }
        }
        
        // Value range filter
        if (activeFilters.minValue) {
          query = query.gte('valor', parseFloat(activeFilters.minValue));
        }
        if (activeFilters.maxValue) {
          query = query.lte('valor', parseFloat(activeFilters.maxValue));
        }
      }
      
      // Calculate pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      // Add pagination to query
      query = query
        .order('data', { ascending: false })
        .order('hora', { ascending: false })
        .range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } else if (data) {
        setTransactions(data);
        
        // Calculate total pages
        if (count !== null) {
          setTotalPages(Math.ceil(count / itemsPerPage));
        }
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format date values
  const formatDate = (dateStr: string, timeStr: string) => {
    if (!dateStr) return '';
    
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year} ${timeStr || ''}`;
  };

  const handleEditTransaction = (id: string) => {
    setSelectedTransactionId(id);
    setIsEditModalOpen(true);
  };

  const handleNewTransaction = () => {
    setSelectedTransactionId(null);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedTransactionId(null);
  };

  const handleTransactionSaved = () => {
    // Refresh data after a transaction is saved
    fetchTransactions();
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFilterOptions(prev => ({ ...prev, [name]: value }));
    
    // Reset subcategoria when tipo or categoria changes
    if (name === 'tipo' || name === 'categoria') {
      setFilterOptions(prev => ({ ...prev, subcategoria: '' }));
    }
  };

  const handleApplyFilters = () => {
    setActiveFilters(filterOptions);
    setFiltersApplied(true);
    setCurrentPage(1); // Reset to first page when applying filters
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      startDate: '',
      endDate: '',
      tipo: '',
      categoria: '',
      subcategoria: '',
      minValue: '',
      maxValue: ''
    };
    
    setFilterOptions(emptyFilters);
    setActiveFilters(emptyFilters);
    setFiltersApplied(false);
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <Layout title="Transações">
      <div>
        {/* Search and filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar transações..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2">
            <button 
              className={`flex items-center px-4 py-2 border rounded-md hover:bg-gray-50 ${
                filtersApplied 
                  ? 'bg-[#e6f7f1] border-[#11ab77] text-[#11ab77]' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
              onClick={handleOpenFilterModal}
            >
              <Filter className="h-5 w-5 mr-2" />
              <span>Filtros</span>
              {filtersApplied && <span className="ml-1 text-xs bg-[#11ab77] text-white rounded-full w-5 h-5 flex items-center justify-center">✓</span>}
            </button>
            <button 
              onClick={handleNewTransaction}
              className="flex items-center px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968]"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span>Nova</span>
            </button>
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subcategoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>                  
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-8 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  // Transactions data
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.tipo_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.categoria_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.subcategoria_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.data, transaction.hora)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        <span className={transaction.tipo == "receita" || (transaction.categoria == "investimento" && transaction.valor > 0) ? 'text-green-600' : 'text-red-600'}>
                          {transaction.tipo == "receita" || (transaction.categoria == "investimento" && transaction.valor > 0) ? '+ ' : '- '}
                          {formatCurrency(Math.abs(transaction.valor))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button 
                          onClick={() => handleEditTransaction(transaction.registro_id)}
                          className="text-gray-400 hover:text-[#11ab77] transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  // No transactions
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'Nenhuma transação encontrada para esta busca' : 'Nenhuma transação encontrada'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!isLoading && transactions.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">
                  Mostrar
                </span>
                <select
                  className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="250">250</option>
                  <option value="500">500</option>
                </select>
                <span className="text-sm text-gray-700 ml-2">
                  por página
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Edit Modal */}
      <TransactionEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        transactionId={selectedTransactionId}
        onSave={handleTransactionSaved}
      />
      
      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Filtrar Transações
              </h2>
              <button 
                onClick={handleCloseFilterModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Período</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-xs text-gray-500 mb-1">
                      Data inicial
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={filterOptions.startDate}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-xs text-gray-500 mb-1">
                      Data final
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={filterOptions.endDate}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categorização</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="tipo" className="block text-xs text-gray-500 mb-1">
                      Tipo
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={filterOptions.tipo}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                    >
                      <option value="">Todos os tipos</option>
                      {tipos.map(tipo => (
                        <option key={tipo.id} value={tipo.id.toString()}>
                          {tipo.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="categoria" className="block text-xs text-gray-500 mb-1">
                      Categoria
                    </label>
                    <select
                      id="categoria"
                      name="categoria"
                      value={filterOptions.categoria}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                    >
                      <option value="">Todas as categorias</option>
                      {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id.toString()}>
                          {categoria.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="subcategoria" className="block text-xs text-gray-500 mb-1">
                      Subcategoria
                    </label>
                    <select
                      id="subcategoria"
                      name="subcategoria"
                      value={filterOptions.subcategoria}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                    >
                      <option value="">Todas as subcategorias</option>
                      {filteredSubcategorias.map(subcategoria => (
                        <option key={subcategoria.id} value={subcategoria.id.toString()}>
                          {subcategoria.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Valor (R$)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minValue" className="block text-xs text-gray-500 mb-1">
                      Valor mínimo
                    </label>
                    <input
                      type="number"
                      id="minValue"
                      name="minValue"
                      value={filterOptions.minValue}
                      onChange={handleFilterChange}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxValue" className="block text-xs text-gray-500 mb-1">
                      Valor máximo
                    </label>
                    <input
                      type="number"
                      id="maxValue"
                      name="maxValue"
                      value={filterOptions.maxValue}
                      onChange={handleFilterChange}
                      placeholder="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968] focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}