import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Plus, Edit, Trash, X, Check, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCategories, Category } from '../hooks/useCategories';

export default function Categories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useCategories(user?.id);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!newCategoryName.trim()) {
      setError('O nome da categoria não pode estar vazio');
      setIsSubmitting(false);
      return;
    }

    try {
      // Generate a slug-like value from the name
      const value = newCategoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_');

      // Check if category with same name or value already exists
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === newCategoryName.toLowerCase() || cat.value === value
      );

      if (existingCategory) {
        setError('Uma categoria com este nome já existe');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('categorias')
        .insert([
          {
            name: newCategoryName,
            value: value,
            user_id: user!.id
          }
        ]);

      if (error) throw error;

      // Refresh categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });

      // Reset form and close modal
      setNewCategoryName('');
      setIsAddModalOpen(false);
      setSuccess('Categoria adicionada com sucesso');
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Erro ao adicionar categoria. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!editCategoryName.trim()) {
      setError('O nome da categoria não pode estar vazio');
      setIsSubmitting(false);
      return;
    }

    if (!selectedCategory) {
      setError('Nenhuma categoria selecionada');
      setIsSubmitting(false);
      return;
    }

    if (!user?.id) {
      setError('Usuário não autenticado.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Generate a slug-like value from the name
      const value = editCategoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_');

      // Check if another category with same name or value already exists
      const existingCategory = categories.find(
        cat => (cat.name.toLowerCase() === editCategoryName.toLowerCase() || cat.value === value) && cat.id !== selectedCategory.id
      );

      if (existingCategory) {
        setError('Uma categoria com este nome já existe');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('categorias')
        .update({
          name: editCategoryName,
          value: value
        })
        .eq('id', selectedCategory.id)
        .eq('user_id', user!.id);

      if (error) throw error;

      // Refresh categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });

      // Reset form and close modal
      setEditCategoryName('');
      setSelectedCategory(null);
      setIsEditModalOpen(false);
      setSuccess('Categoria atualizada com sucesso');
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Erro ao atualizar categoria. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    setIsSubmitting(true);
    setError(null);

    if (!selectedCategory) {
      setError('Nenhuma categoria selecionada');
      setIsSubmitting(false);
      return;
    }

    if (!user?.id) {
      setError('Usuário não autenticado.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', selectedCategory.id)
        .eq('user_id', user!.id);

      if (error) throw error;

      // Refresh categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });

      // Reset form and close modal
      setSelectedCategory(null);
      setIsDeleteModalOpen(false);
      setSuccess('Categoria excluída com sucesso');
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Erro ao excluir categoria. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryName(category.name);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  return (
    <Layout title="Categorias">
      <div className="flex flex-col h-full">
        {/* Success message */}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded flex-shrink-0">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* Header with add button */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h2>
            <p className="text-gray-600 mt-1">
              Visualize, edite e crie novas categorias para organizar suas transações.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-[#11ab77] text-white rounded-md hover:bg-[#0e9968]"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Nova Categoria</span>
          </button>
        </div>

        {/* Categories list */}
        <div className="bg-white rounded-lg shadow flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor (ID)
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
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : categories.length > 0 ? (
                  // Categories data
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {category.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="text-gray-600 hover:text-green-500"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(category)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Excluir"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // No categories
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhuma categoria encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Nova Categoria
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

            <form onSubmit={handleAddCategory} className="p-4">
              <div className="mb-4">
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  placeholder="Ex: Alimentação, Transporte, etc."
                  disabled={isSubmitting}
                  required
                />
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

      {/* Edit Category Modal */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Editar Categoria
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

            <form onSubmit={handleEditCategory} className="p-4">
              <div className="mb-4">
                <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  id="editCategoryName"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#11ab77]"
                  placeholder="Ex: Alimentação, Transporte, etc."
                  disabled={isSubmitting}
                  required
                />
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
      {isDeleteModalOpen && selectedCategory && (
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
                Tem certeza que deseja excluir a categoria <strong>{selectedCategory.name}</strong>?
              </p>
              <p className="text-red-600 text-sm mb-6">
                Esta ação não pode ser desfeita e pode afetar transações que usam esta categoria.
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
                  onClick={handleDeleteCategory}
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