import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Transaction {
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

export interface FilterOptions {
    startDate: string;
    endDate: string;
    tipo: string;
    categoria: string;
    subcategoria: string;
    minValue: string;
    maxValue: string;
}

export function useTransactions(
    userId: string | undefined,
    currentPage: number,
    itemsPerPage: number,
    activeFilters: FilterOptions,
    searchTerm: string,
    filtersApplied: boolean,
    tipos: any[],
    categorias: any[],
    subcategorias: any[]
) {
    return useQuery({
        queryKey: ['transactions', userId, currentPage, itemsPerPage, activeFilters, searchTerm, filtersApplied],
        queryFn: async () => {
            if (!userId) return { data: [], count: 0 };

            let query = supabase
                .from('view_todos_registros')
                .select('id, registro_id, descricao, valor, data, hora, tipo_name, categoria_name, subcategoria_name, tipo, categoria', { count: 'exact' })
                .eq('user_id', userId);

            if (searchTerm) {
                query = query.or(`descricao.ilike.%${searchTerm}%,tipo_name.ilike.%${searchTerm}%,categoria_name.ilike.%${searchTerm}%,subcategoria_name.ilike.%${searchTerm}%`);
            }

            if (filtersApplied) {
                if (activeFilters.startDate) query = query.gte('data', activeFilters.startDate);
                if (activeFilters.endDate) query = query.lte('data', activeFilters.endDate);

                if (activeFilters.tipo) {
                    const selectedTipo = tipos.find(t => t.id.toString() === activeFilters.tipo);
                    if (selectedTipo) query = query.eq('tipo', selectedTipo.value);
                }

                if (activeFilters.categoria) {
                    const selectedCategoria = categorias.find(c => c.id.toString() === activeFilters.categoria);
                    if (selectedCategoria) query = query.eq('categoria', selectedCategoria.value);
                }

                if (activeFilters.subcategoria) {
                    const selectedSubcategoria = subcategorias.find(s => s.id.toString() === activeFilters.subcategoria);
                    if (selectedSubcategoria) query = query.eq('subcategoria', selectedSubcategoria.value);
                }

                if (activeFilters.minValue) query = query.gte('valor', parseFloat(activeFilters.minValue));
                if (activeFilters.maxValue) query = query.lte('valor', parseFloat(activeFilters.maxValue));
            }

            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            query = query
                .order('data', { ascending: false })
                .order('hora', { ascending: false })
                .range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;
            return { data: data as Transaction[], count: count || 0 };
        },
        enabled: !!userId,
    });
}

export function useTransactionFilters(userId: string | undefined) {
    return useQuery({
        queryKey: ['transactionFilters', userId],
        queryFn: async () => {
            if (!userId) return { tipos: [], categorias: [], subcategorias: [] };

            const [tiposRes, catsRes, subcatsRes] = await Promise.all([
                supabase.from('tipos').select('id, name, value').eq('user_id', userId),
                supabase.from('categorias').select('id, name, value').eq('user_id', userId),
                supabase.from('subcategorias').select('id, name, value, tipo_value, categoria_value').eq('user_id', userId)
            ]);

            if (tiposRes.error) throw tiposRes.error;
            if (catsRes.error) throw catsRes.error;
            if (subcatsRes.error) throw subcatsRes.error;

            return {
                tipos: tiposRes.data || [],
                categorias: catsRes.data || [],
                subcategorias: subcatsRes.data || []
            };
        },
        enabled: !!userId,
    });
}
