import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit, Plus, Filter, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import TransactionEditModal from '../components/TransactionEditModal';
import { useQueryClient } from '@tanstack/react-query';
import { useTransactions, useTransactionFilters, FilterOptions } from '../hooks/useTransactions';

export default function Transactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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

  // Query Filters data
  const { data: filterData = { tipos: [], categorias: [], subcategorias: [] } } = useTransactionFilters(user?.id);
  const { tipos, categorias, subcategorias } = filterData;
  const [filteredSubcategorias, setFilteredSubcategorias] = useState<any[]>([]);

  // Main Transactions Query
  const { data: transactionInfo = { data: [], count: 0 }, isLoading } = useTransactions(
    user?.id,
    currentPage,
    itemsPerPage,
    activeFilters,
    searchTerm,
    filtersApplied,
    tipos,
    categorias,
    subcategorias
  );

  const transactions = transactionInfo.data;
  const totalPages = Math.ceil(transactionInfo.count / itemsPerPage);

  useEffect(() => {
    // Filter subcategorias based on selected tipo and categoria in filter modal
    if (subcategorias.length > 0) {
      filterSubcategoriasLogic();
    }
  }, [filterOptions.tipo, filterOptions.categoria, subcategorias]);

  const filterSubcategoriasLogic = () => {
    if (!filterOptions.tipo && !filterOptions.categoria) {
      setFilteredSubcategorias(subcategorias);
      return;
    }

    const selectedTipo = filterOptions.tipo ?
      tipos.find((t: any) => t.id.toString() === filterOptions.tipo)?.value : null;

    const selectedCategoria = filterOptions.categoria ?
      categorias.find((c: any) => c.id.toString() === filterOptions.categoria)?.value : null;

    const filtered = subcategorias.filter((sub: any) => {
      const matchesTipo = !selectedTipo || sub.tipo_value === selectedTipo;
      const matchesCategoria = !selectedCategoria || sub.categoria_value === selectedCategoria;
      return matchesTipo && matchesCategoria;
    });

    setFilteredSubcategorias(filtered);
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
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
      <div className="flex flex-col h-full">
        {/* Search and filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 flex-shrink-0">
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
              className={`flex items-center px-4 py-2 border rounded-md hover:bg-gray-50 ${filtersApplied
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
        <div className="bg-white rounded-lg shadow flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
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
                  Array.from({ length: 15 }).map((_, index) => (
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
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 flex-shrink-0 bg-white">
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
                    className={`p-2 rounded-md ${currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${currentPage === totalPages
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