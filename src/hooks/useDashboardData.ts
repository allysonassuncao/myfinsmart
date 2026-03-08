import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Interfaces
export interface FinancialData {
    receita: number;
    gasto: number;
    saldo: number;
    investimento: number;
    valor_cartoes: number;
}

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

export interface MonthlyChartData {
    month: string;
    receita: number;
    gasto: number;
    valor_cartoes: number;
}

export interface ExpenseByTypeData {
    tipo_name: string;
    soma_valor: number;
    tipo_value: string;
}

export interface ExpenseByCategoryData {
    categoria_name: string;
    soma_valor: number;
    categoria_value: string;
}

export function useFinancialData(userId: string | undefined, selectedMonth: string) {
    return useQuery({
        queryKey: ['financialData', userId, selectedMonth],
        queryFn: async () => {
            if (!userId || !selectedMonth) return null;
            const [month, year] = selectedMonth.split('/');
            const dateString = `${year}-${month}-01`;

            const { data, error } = await supabase
                .from('view_total_saldo_mensal')
                .select('receita, gasto, saldo, investimento, valor_cartoes')
                .eq('user_id', userId)
                .eq('mes', dateString)
                .single();

            if (error) throw error;

            const totalGasto = (data.gasto || 0) + (data.valor_cartoes || 0);
            return {
                receita: data.receita || 0,
                gasto: totalGasto,
                saldo: (data.receita || 0) - totalGasto,
                investimento: data.investimento || 0,
                valor_cartoes: data.valor_cartoes || 0
            } as FinancialData;
        },
        enabled: !!userId && !!selectedMonth,
    });
}

export function useExpenseByType(userId: string | undefined, selectedMonth: string) {
    return useQuery({
        queryKey: ['expenseByType', userId, selectedMonth],
        queryFn: async () => {
            if (!userId || !selectedMonth) return [];
            const [month, year] = selectedMonth.split('/');
            const dateString = `${year}-${month}-01`;

            const { data, error } = await supabase
                .from('view_gasto_mensal_por_tipo')
                .select('tipo_name, soma_valor, tipo_value')
                .eq('user_id', userId)
                .eq('mes', dateString);

            if (error) throw error;
            return (data || []).filter(item =>
                item.tipo_value !== 'receita' &&
                item.tipo_value !== 'liberdade_financeira'
            ) as ExpenseByTypeData[];
        },
        enabled: !!userId && !!selectedMonth,
    });
}

export function useExpenseByCategory(userId: string | undefined, selectedMonth: string) {
    return useQuery({
        queryKey: ['expenseByCategory', userId, selectedMonth],
        queryFn: async () => {
            if (!userId || !selectedMonth) return [];
            const [month, year] = selectedMonth.split('/');
            const dateString = `${year}-${month}-01`;

            const { data, error } = await supabase
                .from('view_gasto_mensal_por_categoria')
                .select('categoria_name, soma_valor, categoria_value')
                .eq('user_id', userId)
                .eq('mes', dateString);

            if (error) throw error;
            return (data || []).filter(item =>
                item.categoria_value !== 'receita' &&
                item.categoria_value !== 'investimento'
            ) as ExpenseByCategoryData[];
        },
        enabled: !!userId && !!selectedMonth,
    });
}

export function useRecentTransactions(userId: string | undefined) {
    return useQuery({
        queryKey: ['recentTransactions', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('view_todos_registros')
                .select('id, registro_id, descricao, valor, data, hora, tipo_name, categoria_name, subcategoria_name, tipo, categoria')
                .eq('user_id', userId)
                .order('data', { ascending: false })
                .order('hora', { ascending: false })
                .limit(20);

            if (error) throw error;
            return (data || []) as Transaction[];
        },
        enabled: !!userId,
    });
}

export function useChartData(userId: string | undefined) {
    return useQuery({
        queryKey: ['chartData', userId],
        queryFn: async () => {
            if (!userId) return [];

            const monthsArray: { dateString: string, displayMonth: string }[] = [];
            const currentDate = new Date();

            for (let i = 5; i >= 0; i--) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                monthsArray.push({
                    dateString: `${year}-${month}-01`,
                    displayMonth: `${month}/${year}`
                });
            }

            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            const nmMonth = (nextMonth.getMonth() + 1).toString().padStart(2, '0');
            monthsArray.push({
                dateString: `${nextMonth.getFullYear()}-${nmMonth}-01`,
                displayMonth: `${nmMonth}/${nextMonth.getFullYear()}`
            });

            const { data, error } = await supabase
                .from('view_total_saldo_mensal')
                .select('mes, receita, gasto, valor_cartoes')
                .eq('user_id', userId)
                .in('mes', monthsArray.map(m => m.dateString));

            if (error) throw error;

            const dataMap = new Map();
            (data || []).forEach(item => {
                dataMap.set(item.mes, {
                    receita: item.receita || 0,
                    gasto: item.gasto || 0,
                    valor_cartoes: item.valor_cartoes || 0
                });
            });

            return monthsArray.map(m => {
                const monthData = dataMap.get(m.dateString);
                return {
                    month: m.displayMonth,
                    receita: monthData ? monthData.receita : 0,
                    gasto: monthData ? monthData.gasto : 0,
                    valor_cartoes: monthData ? monthData.valor_cartoes : 0
                };
            }) as MonthlyChartData[];
        },
    });
}

export interface WishlistItem {
    id: number;
    user_id: string;
    registro_id: string | null;
    nome: string;
    prioridade: number;
    valor: number;
    created_at: string;
}

export function useWishlist(userId: string | undefined) {
    return useQuery({
        queryKey: ['wishlist', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('registros_lista_desejo')
                .select('*')
                .eq('user_id', userId)
                .order('prioridade', { ascending: true });

            if (error) throw error;
            return (data || []) as WishlistItem[];
        },
        enabled: !!userId,
    });
}
