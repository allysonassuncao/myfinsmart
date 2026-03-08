import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface InstallmentRecord {
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

export interface CreditCard {
    card_id: string;
    name: string;
    number: number;
    close_date: string;
    main: boolean;
}

export function useInstallments(userId: string | undefined, searchTerm: string = '') {
    return useQuery({
        queryKey: ['installments', userId, searchTerm],
        queryFn: async () => {
            if (!userId) return [];

            let query = supabase
                .from('view_todos_registros_cartao')
                .select('*')
                .eq('user_id', userId)
                .not('parcelas', 'is', null);

            if (searchTerm) {
                query = query.or(`descricao.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,tipo.ilike.%${searchTerm}%,subcategoria.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as InstallmentRecord[];
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useInstallmentOptions(userId: string | undefined) {
    return useQuery({
        queryKey: ['installment-options', userId],
        queryFn: async () => {
            if (!userId) return { cards: [], tipos: [], categorias: [], subcategorias: [] };

            const [cardsRes, tiposRes, categoriasRes, subcategoriasRes] = await Promise.all([
                supabase
                    .from('cartoes')
                    .select('*')
                    .eq('user_id', userId)
                    .order('main', { ascending: false })
                    .order('name', { ascending: true }),
                supabase
                    .from('tipos')
                    .select('id, name, value')
                    .eq('user_id', userId),
                supabase
                    .from('categorias')
                    .select('id, name, value')
                    .eq('user_id', userId),
                supabase
                    .from('subcategorias')
                    .select('id, name, value, tipo_value, categoria_value')
                    .eq('user_id', userId)
            ]);

            if (cardsRes.error) throw cardsRes.error;
            if (tiposRes.error) throw tiposRes.error;
            if (categoriasRes.error) throw categoriasRes.error;
            if (subcategoriasRes.error) throw subcategoriasRes.error;

            return {
                cards: cardsRes.data || [],
                tipos: tiposRes.data || [],
                categorias: categoriasRes.data || [],
                subcategorias: subcategoriasRes.data || []
            };
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}
