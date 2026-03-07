import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  DollarSign, 
  BarChart3, 
  CreditCard, 
  PieChart, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  User,
  ChevronDown,
  Edit
} from 'lucide-react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import Layout from '../components/Layout';
import TransactionEditModal from '../components/TransactionEditModal';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Interface for financial data
interface FinancialData {
  receita: number;
  gasto: number;
  saldo: number;
  investimento: number;
  valor_cartoes: number;
}

// Interface for transaction data
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

// Interface for monthly chart data
interface MonthlyChartData {
  month: string;
  receita: number;
  gasto: number;
  valor_cartoes: number;
}

// Interface for expense by type data
interface ExpenseByTypeData {
  tipo_name: string;
  soma_valor: number;
  tipo_value: string;
}

// Interface for expense by category data
interface ExpenseByCategoryData {
  categoria_name: string;
  soma_valor: number;
  categoria_value: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [monthOptions, setMonthOptions] = useState<string[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData>({
    receita: 0,
    gasto: 0,
    saldo: 0,
    investimento: 0,
    valor_cartoes: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [chartData, setChartData] = useState<MonthlyChartData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [expenseByTypeData, setExpenseByTypeData] = useState<ExpenseByTypeData[]>([]);
  const [isLoadingExpenseChart, setIsLoadingExpenseChart] = useState(true);
  const [expenseByCategoryData, setExpenseByCategoryData] = useState<ExpenseByCategoryData[]>([]);
  const [isLoadingExpenseCategoryChart, setIsLoadingExpenseCategoryChart] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  useEffect(() => {
    // Generate months options including next month
    const months = [];
    const currentDate = new Date();
    
    // Start from next month (i = -1) and include 6 months back
    for (let i = -1; i < 5; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      months.push(`${month.toString().padStart(2, '0')}/${year}`);
    }
    
    setMonthOptions(months);
    setSelectedMonth(months[1]); // Set current month as default (index 1 since next month is at index 0)
  }, []);

  useEffect(() => {
    if (user && selectedMonth) {
      fetchFinancialData();
      fetchExpenseByTypeData();
      fetchExpenseByCategoryData();
    }
  }, [user, selectedMonth]);

  useEffect(() => {
    if (user) {
      fetchRecentTransactions();
      fetchChartData();
    }
  }, [user]);

  const fetchFinancialData = async () => {
    if (!user || !selectedMonth) return;
    
    setIsLoading(true);
    
    try {
      // Parse the selected month to create a date string for the query
      const [month, year] = selectedMonth.split('/');
      const dateString = `${year}-${month}-01`; // First day of the month
      
      // Query the view_total_saldo_mensal table
      const { data, error } = await supabase
        .from('view_total_saldo_mensal')
        .select('receita, gasto, saldo, investimento, valor_cartoes')
        .eq('user_id', user.id)
        .eq('mes', dateString)
        .single();
      
      if (error) {
        console.error('Error fetching financial data:', error);
        // Set default values if there's an error
        setFinancialData({
          receita: 0,
          gasto: 0,
          saldo: 0,
          investimento: 0,
          valor_cartoes: 0
        });
      } else if (data) {
        const totalGasto = (data.gasto || 0) + (data.valor_cartoes || 0);
        // Update state with the fetched data and recalculate saldo
        setFinancialData({
          receita: data.receita || 0,
          gasto: totalGasto, // Soma o valor dos cartões ao gasto
          saldo: (data.receita || 0) - totalGasto, // Recalcula o saldo considerando o gasto total
          investimento: data.investimento || 0,
          valor_cartoes: data.valor_cartoes || 0
        });
      } else {
        // No data found for this month, set defaults
        setFinancialData({
          receita: 0,
          gasto: 0,
          saldo: 0,
          investimento: 0,
          valor_cartoes: 0
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setFinancialData({
        receita: 0,
        gasto: 0,
        saldo: 0,
        investimento: 0,
        valor_cartoes: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenseByTypeData = async () => {
    if (!user || !selectedMonth) return;
    
    setIsLoadingExpenseChart(true);
    
    try {
      // Parse the selected month to create a date string for the query
      const [month, year] = selectedMonth.split('/');
      const dateString = `${year}-${month}-01`; // First day of the month
      
      // Query the view_gasto_mensal_por_tipo table
      const { data, error } = await supabase
        .from('view_gasto_mensal_por_tipo')
        .select('tipo_name, soma_valor, tipo_value')
        .eq('user_id', user.id)
        .eq('mes', dateString);
      
      if (error) {
        console.error('Error fetching expense by type data:', error);
        setExpenseByTypeData([]);
      } else if (data && data.length > 0) {
        // Filter out "receita" and "liberdade_financeira" types
        const filteredData = data.filter(item => 
          item.tipo_value !== 'receita' && 
          item.tipo_value !== 'liberdade_financeira'
        );
        setExpenseByTypeData(filteredData);
      } else {
        setExpenseByTypeData([]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setExpenseByTypeData([]);
    } finally {
      setIsLoadingExpenseChart(false);
    }
  };

  const fetchExpenseByCategoryData = async () => {
    if (!user || !selectedMonth) return;
    
    setIsLoadingExpenseCategoryChart(true);
    
    try {
      // Parse the selected month to create a date string for the query
      const [month, year] = selectedMonth.split('/');
      const dateString = `${year}-${month}-01`; // First day of the month
      
      // Query the view_gasto_mensal_por_categoria table
      const { data, error } = await supabase
        .from('view_gasto_mensal_por_categoria')
        .select('categoria_name, soma_valor, categoria_value')
        .eq('user_id', user.id)
        .eq('mes', dateString);
      
      if (error) {
        console.error('Error fetching expense by category data:', error);
        setExpenseByCategoryData([]);
      } else if (data && data.length > 0) {
        // Filter out "receita" and "liberdade_financeira" types
        const filteredData = data.filter(item => 
          item.categoria_value !== 'receita' && 
          item.categoria_value !== 'investimento'
        );
        setExpenseByCategoryData(filteredData);
      } else {
        setExpenseByCategoryData([]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setExpenseByCategoryData([]);
    } finally {
      setIsLoadingExpenseCategoryChart(false);
    }
  };

  const fetchRecentTransactions = async () => {
    if (!user) return;
    
    setIsLoadingTransactions(true);
    
    try {
      // Query the view_todos_registros table
      const { data, error } = await supabase
        .from('view_todos_registros')
        .select('id, registro_id, descricao, valor, data, hora, tipo_name, categoria_name, subcategoria_name, tipo, categoria')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .order('hora', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } else if (data) {
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchChartData = async () => {
    if (!user) return;
    
    setIsLoadingChart(true);
    
    try {
      // Generate the last 6 months for chart (oldest to newest)
      const monthsArray = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const dateString = `${year}-${month.toString().padStart(2, '0')}-01`;
        const displayMonth = `${month.toString().padStart(2, '0')}/${year}`;
        
        monthsArray.push({
          dateString,
          displayMonth
        });
      }

      // Add next month
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const nextMonthNum = nextMonth.getMonth() + 1;
      const nextMonthYear = nextMonth.getFullYear();
      monthsArray.push({
        dateString: `${nextMonthYear}-${nextMonthNum.toString().padStart(2, '0')}-01`,
        displayMonth: `${nextMonthNum.toString().padStart(2, '0')}/${nextMonthYear}`
      });
      
      // Query the view_total_saldo_mensal table for all months
      const { data, error } = await supabase
        .from('view_total_saldo_mensal')
        .select('mes, receita, gasto, valor_cartoes')
        .eq('user_id', user.id)
        .in('mes', monthsArray.map(m => m.dateString));
      
      if (error) {
        console.error('Error fetching chart data:', error);
        // Create empty chart data
        setChartData(monthsArray.map(m => ({
          month: m.displayMonth,
          receita: 0,
          gasto: 0,
          valor_cartoes: 0
        })));
      } else {
        // Create a map for easier lookup
        const dataMap = new Map();
        
        if (data) {
          data.forEach(item => {
            // Store data with the exact date string format as the key
            dataMap.set(item.mes, {
              receita: item.receita || 0,
              gasto: item.gasto || 0,
              valor_cartoes: item.valor_cartoes || 0
            });
          });
        }
        
        // Map the data to the months, ensuring correct alignment
        const chartData = monthsArray.map(m => {
          const monthData = dataMap.get(m.dateString);
          
          return {
            month: m.displayMonth,
            receita: monthData ? monthData.receita : 0,
            gasto: monthData ? monthData.gasto : 0,
            valor_cartoes: monthData ? monthData.valor_cartoes : 0
          };
        });
        
        setChartData(chartData);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setChartData([]);
    } finally {
      setIsLoadingChart(false);
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

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setIsDropdownOpen(false);
  };

  const handleEditTransaction = (id: string) => {
    setSelectedTransactionId(id);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedTransactionId(null);
  };

  const handleTransactionSaved = () => {
    // Refresh data after a transaction is saved
    fetchRecentTransactions();
    fetchFinancialData();
    fetchExpenseByTypeData();
    fetchExpenseByCategoryData();
    fetchChartData();
  };

  // Prepare chart data for Chart.js
  const barChartData = {
    labels: chartData.map(d => d.month),
    datasets: [
      {
        label: 'Receitas',
        data: chartData.map(d => d.receita),
        backgroundColor: 'rgba(22, 163, 74, 0.8)',
        borderColor: 'rgba(22, 163, 74, 1)',
        borderWidth: 1,
      },
      {
        label: 'Despesas',
        data: chartData.map(d => Math.abs(d.gasto)),
        backgroundColor: 'rgba(220, 38, 38, 0.8)',
        borderColor: 'rgba(220, 38, 38, 1)',
        borderWidth: 1,
      },
      {
        label: 'Parcelamentos',
        data: chartData.map(d => Math.abs(d.valor_cartoes)),
        backgroundColor: 'rgba(249, 115, 22, 0.8)', // Cor laranja para parcelamentos
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Generate pastel colors for pie chart
  const generatePastelColors = (count: number) => {
    const colors = [
      'rgba(221, 182, 242, 1)',  // Pastel purple
      'rgba(155, 140, 245, 1)',  // Pastel blue-purple
      'rgba(69, 179, 224, 1)',   // Pastel blue
      'rgba(144, 224, 186, 1)',  // Pastel green
      'rgba(255, 241, 118, 1)'   // Pastel yellow
    ];
    
    // If we need more colors than we have defined, generate them
    if (count > colors.length) {
      for (let i = colors.length; i < count; i++) {
        const hue = (i * 137) % 360; // Use golden ratio to spread colors
        colors.push(`hsla(${hue}, 70%, 80%, 1)`);
      }
    }
    
    return colors.slice(0, count);
  };

  // Calculate percentages for each expense type
  const calculatePercentages = (data: ExpenseByTypeData[] | ExpenseByCategoryData[]) => {
    const total = data.reduce((sum, item) => sum + Math.abs(item.soma_valor), 0);
    return data.map(item => {
      const percentage = total > 0 ? Math.round((Math.abs(item.soma_valor) / total) * 100) : 0;
      return {
        ...item,
        percentage
      };
    });
  };

  const expenseTypePercentages = calculatePercentages(expenseByTypeData);
  const expenseCategoryPercentages = calculatePercentages(expenseByCategoryData);

  // Prepare pie chart data for expense by type
  const pieChartTypeData = {
    labels: expenseByTypeData.map(d => d.tipo_name),
    datasets: [
      {
        data: expenseByTypeData.map(d => Math.abs(d.soma_valor)),
        backgroundColor: generatePastelColors(expenseByTypeData.length),
        borderColor: 'white',
        borderWidth: 2,
        hoverOffset: 15,
        cutout: '60%'
      },
    ],
  };

  // Prepare pie chart data for expense by category
  const pieChartCategoryData = {
    labels: expenseByCategoryData.map(d => d.categoria_name),
    datasets: [
      {
        data: expenseByCategoryData.map(d => Math.abs(d.soma_valor)),
        backgroundColor: generatePastelColors(expenseByCategoryData.length),
        borderColor: 'white',
        borderWidth: 2,
        hoverOffset: 15,
        cutout: '60%'
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  return (
    <Layout title="Início">
      <div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
            <div className="relative">
              <button 
                className="flex items-center bg-white px-4 py-2 rounded-md shadow text-gray-700 hover:bg-gray-50"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedMonth}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                  <ul className="py-1">
                    {monthOptions.map((month) => (
                      <li key={month}>
                        <button
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            selectedMonth === month ? 'bg-gray-100 text-[#11ab77]' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => handleMonthChange(month)}
                        >
                          {month}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Balance card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Saldo Total</h3>
                <Wallet className="h-6 w-6 text-[#11ab77]" />
              </div>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-32 mb-2"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(financialData.saldo)}</p>
              )}
            </div>
            
            {/* Income card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Receitas (mês)</h3>
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-32 mb-2"></div>
              ) : (
                <p className="text-3xl font-bold text-green-600">{formatCurrency(financialData.receita)}</p>
              )}
            </div>
            
            {/* Expenses card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Despesas (mês)</h3>
                <ArrowDownRight className="h-6 w-6 text-red-600" />
              </div>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-32 mb-2"></div>
              ) : (
                <p className="text-3xl font-bold text-red-600">{formatCurrency(financialData.gasto)}</p>
              )}
            </div>

            {/* Investiments card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Investimentos (mês)</h3>
                <ArrowDownRight className="h-6 w-6 text-blue-600" />
              </div>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-32 mb-2"></div>
              ) : (
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(financialData.investimento)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Expense by Type Pie Chart */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Despesas por Tipo</h2>
              <div className="bg-white rounded-lg shadow p-6">
                {isLoadingExpenseChart ? (
                  <div className="animate-pulse h-64 bg-gray-200 rounded w-full"></div>
                ) : expenseByTypeData.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/2 h-64 relative">
                      <Doughnut data={pieChartTypeData} options={pieChartOptions} />
                    </div>
                    <div className="w-full md:w-1/2 mt-4 md:mt-0">
                      <div className="space-y-3">
                        {expenseTypePercentages.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-sm mr-2" 
                              style={{ backgroundColor: pieChartTypeData.datasets[0].backgroundColor[index] }}
                            ></div>
                            <div className="flex-1 text-sm">
                              <span className="font-medium">{item.tipo_name}</span>
                            </div>
                            <div className="text-sm font-medium">
                              {item.percentage}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Nenhuma despesa registrada para este mês</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Expense by Category Pie Chart */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Despesas por Categoria</h2>
              <div className="bg-white rounded-lg shadow p-6">
                {isLoadingExpenseCategoryChart ? (
                  <div className="animate-pulse h-64 bg-gray-200 rounded w-full"></div>
                ) : expenseByCategoryData.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/2 h-64 relative">
                      <Doughnut data={pieChartCategoryData} options={pieChartOptions} />
                    </div>
                    <div className="w-full md:w-1/2 mt-4 md:mt-0">
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {expenseCategoryPercentages.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-sm mr-2" 
                              style={{ backgroundColor: pieChartCategoryData.datasets[0].backgroundColor[index] }}
                            ></div>
                            <div className="flex-1 text-sm">
                              <span className="font-medium">{item.categoria_name}</span>
                            </div>
                            <div className="text-sm font-medium">
                              {item.percentage}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Nenhuma despesa registrada para este mês</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Monthly Chart */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Histórico Mensal</h2>
              <div className="bg-white rounded-lg shadow p-6">
                {isLoadingChart ? (
                  <div className="animate-pulse h-64 bg-gray-200 rounded w-full"></div>
                ) : (
                  <div className="h-64">
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Transações Recentes</h2>
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
                  {isLoadingTransactions ? (
                    // Loading state
                    Array.from({ length: 4 }).map((_, index) => (
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
          </div>
        </div>
      </div>

      {/* Transaction Edit Modal */}
      <TransactionEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        transactionId={selectedTransactionId}
        onSave={handleTransactionSaved}
      />
    </Layout>
  );
}