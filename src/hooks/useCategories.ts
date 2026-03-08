import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Category {
    id: number;
    name: string;
    value: string;
    user_id: string;
}

export function useCategories(userId: string | undefined) {
    return useQuery({
        queryKey: ['categories', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('categorias')
                .select('*')
                .eq('user_id', userId)
                .order('name', { ascending: true });

            if (error) throw error;
            return (data || []) as Category[];
        },
        enabled: !!userId,
    });
}
