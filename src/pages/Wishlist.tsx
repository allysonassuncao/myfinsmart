import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
    Plus,
    Edit,
    Trash,
    X,
    Check,
    Loader2,
    Star,
    Search,
    Filter,
    ArrowUpDown,
    GripVertical
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useWishlist, WishlistItem } from '@/hooks/useDashboardData';

export default function Wishlist() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [localItems, setLocalItems] = useState<WishlistItem[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        nome: '',
        valor: '',
        prioridade: '1'
    });

    const { data: wishlist = [], isLoading } = useWishlist(user?.id);

    // Sync local items with fetched data
    useEffect(() => {
        if (wishlist.length > 0) {
            setLocalItems(wishlist);
        } else {
            setLocalItems([]);
        }
    }, [wishlist]);

    // Clear success message
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(localItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local state immediately for smooth UI
        setLocalItems(items);

        // Update priorities in DB
        try {
            const updates = items.map((item, index) => ({
                id: item.id,
                prioridade: index + 1
            }));

            // Multi-update strategy: logic varies by backend, here we do sequential due to Supabase JS limitations for varied data
            // Or we could use an RPC, but for small lists this is fine
            for (const update of updates) {
                const originalItem = localItems.find(i => i.id === update.id);
                if (originalItem && originalItem.prioridade !== update.prioridade) {
                    await supabase
                        .from('registros_lista_desejo')
                        .update({ prioridade: update.prioridade })
                        .eq('id', update.id);
                }
            }

            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            setSuccess('Prioridades atualizadas');
        } catch (err) {
            console.error('Error updating prioritites:', err);
            setError('Falha ao sincronizar nova ordem.');
            // Revert on error
            setLocalItems(localItems);
        }
    };

    const handleOpenModal = (item: WishlistItem | null = null) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                nome: item.nome,
                valor: item.valor.toString(),
                prioridade: item.prioridade.toString()
            });
        } else {
            setSelectedItem(null);
            setFormData({
                nome: '',
                valor: '',
                prioridade: (localItems.length + 1).toString()
            });
        }
        setError(null);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (!user?.id) throw new Error('Usuário não autenticado');

            const payload = {
                nome: formData.nome,
                valor: parseFloat(formData.valor),
                prioridade: parseInt(formData.prioridade),
                user_id: user.id
            };

            if (selectedItem) {
                const { error } = await supabase
                    .from('registros_lista_desejo')
                    .update(payload)
                    .eq('id', selectedItem.id);
                if (error) throw error;
                setSuccess('Item atualizado com sucesso');
            } else {
                const { error } = await supabase
                    .from('registros_lista_desejo')
                    .insert([payload]);
                if (error) throw error;
                setSuccess('Item adicionado à lista de desejos');
            }

            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('Error saving wishlist item:', err);
            setError('Erro ao salvar item. Verifique os dados e tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('registros_lista_desejo')
                .delete()
                .eq('id', selectedItem.id);

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            setIsDeleteModalOpen(false);
            setSuccess('Item removido com sucesso');
        } catch (err) {
            console.error('Error deleting item:', err);
            setError('Erro ao excluir item.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const displayItems = localItems.filter(item =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout title="Lista de Desejos">
            <div className="flex flex-col h-full animate-in fade-in duration-500">
                {/* Success Alert */}
                {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm flex items-center shrink-0">
                        <Check className="h-5 w-5 mr-2" />
                        <p className="font-medium text-sm">{success}</p>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Minha Lista de Desejos</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Arraste os itens para redefinir a prioridade das suas conquistas.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-5 py-2.5 bg-[#11ab77] text-white rounded-xl hover:bg-[#0e9968] shadow-lg shadow-[#11ab77]/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Novo Desejo</span>
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar na lista..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#11ab77]/20 focus:border-[#11ab77] transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <table className="min-w-full divide-y divide-gray-100 table-fixed">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="w-12 px-6 py-4"></th>
                                        <th className="w-24 px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Prioridade</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição</th>
                                        <th className="w-40 px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Criado em</th>
                                        <th className="w-48 px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Estimado</th>
                                        <th className="w-32 px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <Droppable droppableId="wishlist">
                                    {(provided) => (
                                        <tbody
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="bg-white divide-y divide-gray-50"
                                        >
                                            {isLoading ? (
                                                Array.from({ length: 10 }).map((_, i) => (
                                                    <tr key={i}>
                                                        <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-50 rounded animate-pulse w-full"></div></td>
                                                    </tr>
                                                ))
                                            ) : displayItems.length > 0 ? (
                                                displayItems.map((item, index) => (
                                                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                                        {(provided, snapshot) => (
                                                            <tr
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`transition-colors group ${snapshot.isDragging ? 'bg-emerald-50 shadow-lg' : 'hover:bg-slate-50/50'}`}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    display: snapshot.isDragging ? 'table' : 'table-row'
                                                                }}
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-[#11ab77] transition-colors">
                                                                        <GripVertical size={20} />
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${item.prioridade === 1 ? 'bg-amber-100 text-amber-600' :
                                                                        item.prioridade === 2 ? 'bg-blue-100 text-blue-600' :
                                                                            'bg-slate-100 text-slate-600'
                                                                        }`}>
                                                                        {item.prioridade}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                                                            <Star className={`h-4 w-4 ${item.prioridade === 1 ? 'text-amber-500 fill-amber-500' : 'text-emerald-500'}`} />
                                                                        </div>
                                                                        <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{item.nome}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                                                    {formatCurrency(item.valor)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleOpenModal(item)}
                                                                            className="p-2 text-gray-400 hover:text-[#11ab77] hover:bg-emerald-50 rounded-lg transition-all"
                                                                        >
                                                                            <Edit size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => { setSelectedItem(item); setIsDeleteModalOpen(true); }}
                                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                        >
                                                                            <Trash size={18} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-20 text-center">
                                                        <div className="flex flex-col items-center justify-center grayscale opacity-50">
                                                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                                                <Star className="h-10 w-10 text-slate-300" />
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-400">Sua lista está vazia</h3>
                                                            <p className="text-sm text-gray-400 mt-1">O que você vai conquistar hoje?</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {provided.placeholder}
                                        </tbody>
                                    )}
                                </Droppable>
                            </table>
                        </DragDropContext>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedItem ? 'Editar Desejo' : 'Novo Desejo'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">O que você deseja?</label>
                                <input
                                    type="text"
                                    name="nome"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#11ab77]/20 focus:border-[#11ab77] transition-all outline-none"
                                    placeholder="Ex: Novo Smartphone, Viagem para Europa..."
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Valor Estimado</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="valor"
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#11ab77]/20 focus:border-[#11ab77] transition-all outline-none"
                                        placeholder="0,00"
                                        value={formData.valor}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Prioridade</label>
                                    <select
                                        name="prioridade"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#11ab77]/20 focus:border-[#11ab77] transition-all outline-none bg-white"
                                        value={formData.prioridade}
                                        onChange={handleInputChange}
                                    >
                                        <option value="1">1 - Crítica</option>
                                        <option value="2">2 - Alta</option>
                                        <option value="3">3 - Média</option>
                                        <option value="4">4 - Baixa</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] px-4 py-3 bg-[#11ab77] text-white rounded-xl font-bold hover:bg-[#0e9968] shadow-lg shadow-[#11ab77]/20 transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (selectedItem ? 'Salvar Alterações' : 'Adicionar à Lista')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Remover Item?</h3>
                        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                            Você tem certeza que deseja remover <strong>{selectedItem?.nome}</strong> da sua lista de desejos?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50"
                            >
                                Manter
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Remover'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
