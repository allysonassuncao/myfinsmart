import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Plus, Edit, Trash, X, Check, Loader2, Tag, Filter } from 'lucide-react';

interface Subcategory {
  id: number;
  name: string;
  value: string;
  tipo_value: string;
  categoria_value: string;
  user_id: string;
}

interface Tipo {
  id: number;
  name: string;
  value: string;
}

interface Categoria {
  id: number;
  name: string;
  value: string;
}

interface GroupedSubcategories {
  [key: string]: {
    tipo_name: string;
    categorias: {
      [key: string]: {
        categoria_name: string;
        subcategorias: Subcategory[];
      }
    }
  }
}

export default function Subcategories() {
  const { user } = useAuth();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newTipoValue, setNewTipoValue] = useState('');
  const [newCategoriaValue, setNewCategoriaValue] = useState('');
  const [editSubcategoryName, setEditSubcategoryName] = useState('');
  const [editTipoValue, setEditTipoValue] = useState('');
  const [editCategoriaValue, setEditCategoriaValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [groupedSubcategories, setGroupedSubcategories] = useState<GroupedSubcategories>({});
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterCategoria, setFilterCategoria] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchData();
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

  // Filter categorias based on selected tipo
  useEffect(() => {
    if (newTipoValue) {
      const filtered = categorias.filter(categoria => {
        const matchingSubcategories = subcategories.filter(
          sub => sub.tipo_value === newTipoValue && sub.categoria_value === categoria.value
        );
        return matchingSubcategories.length > 0 || true; // Include all categories for now
      });
      setFilteredCategorias(filtered);
    } else {
      setFilteredCategorias(categorias);
    }
  }, [newTipoValue, categorias, subcategories]);

  // Filter categorias based on selected tipo for edit
  useEffect(() => {
    if (editTipoValue) {
      const filtered = categorias.filter(categoria => {
        const matchingSubcategories = subcategories.filter(
          sub => sub.tipo_value === editTipoValue && sub.categoria_value === categoria.value
        );
        return matchingSubcategories.length > 0 || true; // Include all categories for now
      });
      setFilteredCategorias(filtered);
    } else {
      setFilteredCategorias(categorias);
    }
  }, [editTipoValue, categorias, subcategories]);

  // Group subcategories by tipo and categoria
  useEffect(() => {
    const grouped: GroupedSubcategories = {};

    // First, organize by tipo
    subcategories.forEach(subcategory => {
      const tipoObj = tipos.find(t => t.value === subcategory.tipo_value);
      const categoriaObj = categorias.find(c => c.value === subcategory.categoria_value);
      
      const tipoName = tipoObj ? tipoObj.name : 'Sem tipo';
      const categoriaName = categoriaObj ? categoriaObj.name : 'Sem categoria';
      
      // Apply filters if they exist
      if ((filterTipo && subcategory.tipo_value !== filterTipo) || 
          (filterCategoria && subcategory.categoria_value !== filterCategoria)) {
        return;
      }

      if (!grouped[subcategory.tipo_value]) {
        grouped[subcategory.tipo_value] = {
          tipo_name: tipoName,
          categorias: {}
        };
      }
      
      if (!grouped[subcategory.tipo_value].categorias[subcategory.categoria_value]) {
        grouped[subcategory.tipo_value].categorias[subcategory.categoria_value] = {
          categoria_name: categoriaName,
          subcategorias: []
        };
      }
      
      grouped[subcategory.tipo_value].categorias[subcategory.categoria_value].subcategorias.push(subcategory);
    });

    setGroupedSubcategories(grouped);
  }, [subcategories, tipos, categorias, filterTipo, filterCategoria]);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch tipos
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (tiposError) throw tiposError;
      setTipos(tiposData || []);

      // Fetch categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);
      setFilteredCategorias(categoriasData || []);

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategorias')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (subcategoriesError) throw subcategoriesError;
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!newSubcategoryName.trim()) {
      setError('O nome da subcategoria não pode estar vazio');
      setIsSubmitting(false);
      return;
    }
    
    if (!newTipoValue) {
      setError('É necessário selecionar um tipo');
      setIsSubmitting(false);
      return;
    }
    
    if (!newCategoriaValue) {
      setError('É necessário selecionar uma categoria');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Generate a slug-like value from the name
      const value = newSubcategoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_');
      
      // Check if subcategory with same name or value already exists
      const existingSubcategory = subcategories.find(
        sub => sub.name.toLowerCase() === newSubcategoryName.toLowerCase() || sub.value === value
      );
      
      if (existingSubcategory) {
        setError('Uma subcategoria com este nome já existe');
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase
        .from('subcategorias')
        .insert([
          { 
            name: newSubcategoryName,
            value: value,
            tipo_value: newTipoValue,
            categoria_value: newCategoriaValue,
            user_id: user.id
          }
        ]);
      
      if (error) throw error;
      
      // Refresh subcategories list
      await fetchData();
      
      // Reset form and close modal
      setNewSubcategoryName('');
      setNewTipoValue('');
      setNewCategoriaValue('');
      setIsAddModalOpen(false);
      setSuccess('Subcategoria adicionada com sucesso');
    } catch (error) {
      console.error('Error adding subcategory:', error);
      setError('Erro ao adicionar subcategoria. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!editSubcategoryName.trim()) {
      setError('O nome da subcategoria não pode estar vazio');
      setIsSubmitting(false);
      return;
    }
    
    if (!editTipoValue) {
      setError('É necessário selecionar um tipo');
      setIsSubmitting(false);
      return;
    }
    
    if (!editCategoriaValue) {
      setError('É necessário selecionar uma categoria');
      setIsSubmitting(false);
      return;
    }
    
    if (!selectedSubcategory) {
      setError('Nenhuma subcategoria selecionada');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Generate a slug-like value from the name
      const value = editSubcategoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_');
      
      // Check if another subcategory with same name or value already exists
      const existingSubcategory = subcategories.find(
        sub => (sub.name.toLowerCase() === editSubcategoryName.toLowerCase() || sub.value === value) && sub.id !== selectedSubcategory.id
      );
      
      if (existingSubcategory) {
        setError('Uma subcategoria com este nome já existe');
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase
        .from('subcategorias')
        .update({ 
          name: editSubcategoryName,
          value: value,
          tipo_value: editTipoValue,
          categoria_value: editCategoriaValue
        })
        .eq('id', selectedSubcategory.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Refresh subcategories list
      await fetchData();
      
      // Reset form and close modal
      setEditSubcategoryName('');
      setEditTipoValue('');
      setEditCategoriaValue('');
      setSelectedSubcategory(null);
      setIsEditModalOpen(false);
      setSuccess('Subcategoria atualizada com sucesso');
    } catch (error) {
      console.error('Error updating subcategory:', error);
      setError('Erro ao atualizar subcategoria. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubcategory = async () => {
    setIsSubmitting(true);
    setError(null);
    
    if (!selectedSubcategory) {
      setError('Nenhuma subcategoria selecionada');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('subcategorias')
        .delete()
        .eq('id', selectedSubcategory.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Refresh subcategories list
      await fetchData();
      
      // Reset form and close modal
      setSelectedSubcategory(null);
      setIsDeleteModalOpen(false);
      setSuccess('Subcategoria excluída com sucesso');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      setError('Erro ao excluir subcategoria. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setEditSubcategoryName(subcategory.name);
    setEditTipoValue(subcategory.tipo_value);
    setEditCategoriaValue(subcategory.categoria_value);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsDeleteModalOpen(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'filterTipo') {
      setFilterTipo(value);
      // Reset categoria filter if tipo changes
      if (value === '') {
        setFilterCategoria('');
      }
    } else if (name === 'filterCategoria') {
      setFilterCategoria(value);
    }
  };

  const resetFilters = () => {
    setFilterTipo('');
    setFilterCategoria('');
  };

  return (
    <Layout title="Subcategorias">
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

        {/* Header with add button and filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Subcategorias</h2>
            <p className="text-gray-600 mt-1">
              Visualize, edite e crie novas subcategorias para organizar suas transações.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <select
                  name="filterTipo"
                  value={filterTipo}
                  onChange={handleFilterChange}
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] appearance-none bg-white"
                >
                  <option value="">Todos os tipos</option>
                  {tipos.map(tipo => (
                    <option key={tipo.id} value={tipo.value}>
                      {tipo.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
              </div>
              <div className="relative">
                <select
                  name="filterCategoria"
                  value={filterCategoria}
                  onChange={handleFilterChange}
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77] appearance-none bg-white"
                  disabled={!filterTipo}
                >
                  <option value="">Todas as categorias</option>
                  {categorias
                    .filter(cat => {
                      if (!filterTipo) return true;
                      return subcategories.some(sub => 
                        sub.tipo_value === filterTipo && 
                        sub.categoria_value === cat.value
                      );
                    })
                    .map(categoria => (
                      <option key={categoria.id} value={categoria.value}>
                        {categoria.name}
                      </option>
                    ))
                  }
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
              </div>
              {(filterTipo || filterCategoria) && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Limpar filtros
                </button>
              )}
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968] whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span>Nova Subcategoria</span>
            </button>
          </div>
        </div>

        {/* Subcategories list */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-6 flex justify-center">
              <Loader2 className="h-8 w-8 text-[#11ab77] animate-spin" />
            </div>
          ) : Object.keys(groupedSubcategories).length > 0 ? (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedSubcategories).map(([tipoValue, tipoGroup]) => (
                <div key={tipoValue} className="overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3">
                    <h3 className="text-lg font-medium text-gray-900">{tipoGroup.tipo_name}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {Object.entries(tipoGroup.categorias).map(([categoriaValue, categoriaGroup]) => (
                      <div key={`${tipoValue}-${categoriaValue}`} className="px-6 py-4">
                        <h4 className="text-md font-medium text-gray-700 mb-2">{categoriaGroup.categoria_name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categoriaGroup.subcategorias.map(subcategory => (
                            <div 
                              key={subcategory.id} 
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-md hover:bg-gray-100"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{subcategory.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{subcategory.value}</p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openEditModal(subcategory)}
                                  className="text-gray-600 hover:text-green-500 p-1"
                                  title="Editar"
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {filterTipo || filterCategoria ? (
                <p>Nenhuma subcategoria encontrada com os filtros selecionados.</p>
              ) : (
                <p>Nenhuma subcategoria encontrada. Clique em "Nova Subcategoria" para criar uma.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Subcategory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Nova Subcategoria
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
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
            
            <form onSubmit={handleAddSubcategory} className="p-4">
              <div className="mb-4">
                <label htmlFor="subcategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Subcategoria
                </label>
                <input
                  type="text"
                  id="subcategoryName"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  placeholder="Ex: Restaurantes, Supermercado, etc."
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="tipoValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  id="tipoValue"
                  value={newTipoValue}
                  onChange={(e) => setNewTipoValue(e.target.value)}
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
                <label htmlFor="categoriaValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  id="categoriaValue"
                  value={newCategoriaValue}
                  onChange={(e) => setNewCategoriaValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  disabled={isSubmitting || !newTipoValue}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {filteredCategorias.map(categoria => (
                    <option key={categoria.id} value={categoria.value}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
                {!newTipoValue && (
                  <p className="text-xs text-gray-500 mt-1">Selecione um tipo primeiro</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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

      {/* Edit Subcategory Modal */}
      {isEditModalOpen && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Editar Subcategoria
              </h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
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
            
            <form onSubmit={handleEditSubcategory} className="p-4">
              <div className="mb-4">
                <label htmlFor="editSubcategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Subcategoria
                </label>
                <input
                  type="text"
                  id="editSubcategoryName"
                  value={editSubcategoryName}
                  onChange={(e) => setEditSubcategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  placeholder="Ex: Restaurantes, Supermercado, etc."
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="editTipoValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  id="editTipoValue"
                  value={editTipoValue}
                  onChange={(e) => setEditTipoValue(e.target.value)}
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
                <label htmlFor="editCategoriaValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  id="editCategoriaValue"
                  value={editCategoriaValue}
                  onChange={(e) => setEditCategoriaValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  disabled={isSubmitting || !editTipoValue}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {filteredCategorias.map(categoria => (
                    <option key={categoria.id} value={categoria.value}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
                {!editTipoValue && (
                  <p className="text-xs text-gray-500 mt-1">Selecione um tipo primeiro</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirmar Exclusão
              </h2>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
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
            
            <div className="p-4">
              <p className="text-gray-700 mb-4">
                Tem certeza que deseja excluir a subcategoria <strong>{selectedSubcategory.name}</strong>?
              </p>
              <p className="text-red-600 text-sm mb-6">
                Esta ação não pode ser desfeita e pode afetar transações que usam esta subcategoria.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubcategory}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <span>Excluir</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}