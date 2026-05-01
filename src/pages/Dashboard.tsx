import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  PieChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Edit,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Star,
  ListTodo
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import Layout from '@/components/Layout';
import TransactionEditModal from '@/components/TransactionEditModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import {
  useFinancialData,
  useExpenseByType,
  useExpenseByCategory,
  useRecentTransactions,
  useChartData,
  useWishlist
} from '@/hooks/useDashboardData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthOptions, setMonthOptions] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // TanStack Query Hooks
  const { data: financialData = { receita: 0, gasto: 0, saldo: 0, investimento: 0, valor_cartoes: 0 }, isLoading: isLoadingFinancial } = useFinancialData(user?.id, selectedMonth);
  const { data: expenseByTypeData = [], isLoading: isLoadingExpenseChart } = useExpenseByType(user?.id, selectedMonth);
  const { data: expenseByCategoryData = [], isLoading: isLoadingExpenseCategoryChart } = useExpenseByCategory(user?.id, selectedMonth);
  const { data: transactions = [], isLoading: isLoadingTransactions } = useRecentTransactions(user?.id);
  const { data: chartData = [], isLoading: isLoadingChart } = useChartData(user?.id);
  const { data: wishlist = [], isLoading: isLoadingWishlist } = useWishlist(user?.id);

  useEffect(() => {
    // Generate months options
    const months = [];
    const currentDate = new Date();
    for (let i = -1; i < 5; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      months.push(`${month}/${year}`);
    }
    setMonthOptions(months);
    setSelectedMonth(months[1]);
  }, []);

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
    // Refresh all data by invalidating queries
    queryClient.invalidateQueries({ queryKey: ['financialData'] });
    queryClient.invalidateQueries({ queryKey: ['expenseByType'] });
    queryClient.invalidateQueries({ queryKey: ['expenseByCategory'] });
    queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
    queryClient.invalidateQueries({ queryKey: ['chartData'] });
  };

  // Prepare chart data for Chart.js
  const lineChartData = {
    labels: chartData.map(d => d.month),
    datasets: [
      {
        label: 'Receitas',
        data: chartData.map(d => d.receita),
        borderColor: '#10b981', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10b981',
        borderWidth: 3,
      },
      {
        label: 'Despesas',
        data: chartData.map(d => Math.abs(d.gasto)),
        borderColor: '#f43f5e', // Rose 500
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f43f5e',
        borderWidth: 3,
      },
      {
        label: 'Parcelamentos',
        data: chartData.map(d => Math.abs(d.valor_cartoes)),
        borderColor: '#f59e0b', // Amber 500
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f59e0b',
        borderWidth: 3,
      }
    ],
  };

  // Modern vibrant colors for charts
  const generateModernColors = (count: number) => {
    const palette = [
      '#6366f1', // Indigo 500
      '#8b5cf6', // Violet 500
      '#ec4899', // Pink 500
      '#f43f5e', // Rose 500
      '#f97316', // Orange 500
      '#f59e0b', // Amber 500
      '#10b981', // Emerald 500
      '#06b6d4', // Cyan 500
      '#3b82f6', // Blue 500
      '#64748b', // Slate 500
    ];

    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  };

  const expenseTypePercentages = dataToPercentages(expenseByTypeData);
  const expenseCategoryPercentages = dataToPercentages(expenseByCategoryData);

  function dataToPercentages<T extends { soma_valor: number }>(data: T[]) {
    const total = data.reduce((sum, item) => sum + Math.abs(item.soma_valor), 0);
    return data.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((Math.abs(item.soma_valor) / total) * 100) : 0
    }));
  }

  // Prepare pie chart data for expense by type
  const pieChartTypeData = {
    labels: expenseByTypeData.map(d => d.tipo_name),
    datasets: [
      {
        data: expenseByTypeData.map(d => Math.abs(d.soma_valor)),
        backgroundColor: generateModernColors(expenseByTypeData.length),
        borderColor: 'white',
        borderWidth: 3,
        hoverOffset: 12,
        cutout: '75%'
      },
    ],
  };

  // Prepare pie chart data for expense by category
  const pieChartCategoryData = {
    labels: expenseByCategoryData.map(d => d.categoria_name),
    datasets: [
      {
        data: expenseByCategoryData.map(d => Math.abs(d.soma_valor)),
        backgroundColor: generateModernColors(expenseByCategoryData.length),
        borderColor: 'white',
        borderWidth: 3,
        hoverOffset: 12,
        cutout: '75%'
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500'
          },
          color: '#64748b'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#f1f5f9',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        cornerRadius: 8,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
            weight: '500'
          },
          color: '#94a3b8',
          padding: 10
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(241, 245, 249, 0.6)',
          drawBorder: false,
        },
        border: {
          display: false,
          dash: [6, 6]
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 10,
            weight: '500'
          },
          color: '#94a3b8',
          padding: 12,
          stepSize: 1000,
          callback: function (value: any) {
            if (value === 0) return '0';
            if (value >= 1000) {
              return 'R$ ' + (value / 1000) + 'k';
            }
            return 'R$ ' + value;
          }
        }
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#f1f5f9',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart' as const
    }
  };

  return (
    <Layout title="Início">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Visão Geral</h2>
            <p className="text-gray-500">Acompanhe seu desempenho financeiro em tempo real.</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-between border-gray-200 shadow-sm bg-white">
                {selectedMonth}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              {monthOptions.map((month) => (
                <DropdownMenuItem
                  key={month}
                  onClick={() => handleMonthChange(month)}
                  className={selectedMonth === month ? "bg-accent font-medium text-[#11ab77]" : ""}
                >
                  {month}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Balance card */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Saldo Total</CardTitle>
              <Wallet className="h-5 w-5 text-[#11ab77]" />
            </CardHeader>
            <CardContent>
              {isLoadingFinancial ? (
                <div className="animate-pulse h-9 bg-gray-100 rounded-md w-3/4"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold tracking-tight">{formatCurrency(financialData!.saldo)}</div>
                  <p className="text-xs text-gray-500 mt-1">Disponível em conta</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Income card */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Receitas</CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {isLoadingFinancial ? (
                <div className="animate-pulse h-9 bg-gray-100 rounded-md w-3/4"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold tracking-tight text-emerald-600">{formatCurrency(financialData!.receita)}</div>
                  <p className="text-xs text-emerald-500/80 mt-1 font-medium flex items-center">
                    <ArrowUpRight className="mr-1 h-3 w-3" /> Entrada este mês
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Expenses card */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Despesas</CardTitle>
              <TrendingDown className="h-5 w-5 text-rose-500" />
            </CardHeader>
            <CardContent>
              {isLoadingFinancial ? (
                <div className="animate-pulse h-9 bg-gray-100 rounded-md w-3/4"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold tracking-tight text-rose-600">{formatCurrency(financialData!.gasto)}</div>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-rose-500/80 font-medium flex items-center">
                      <ArrowDownRight className="mr-1 h-3 w-3" /> Saída total
                    </p>
                    {financialData!.valor_cartoes > 0 && (
                      <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                        incl. cartões
                      </span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Investments card */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Investimentos</CardTitle>
              <PiggyBank className="h-5 w-5 text-sky-500" />
            </CardHeader>
            <CardContent>
              {isLoadingFinancial ? (
                <div className="animate-pulse h-9 bg-gray-100 rounded-md w-3/4"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold tracking-tight text-sky-600">{formatCurrency(financialData!.investimento)}</div>
                  <p className="text-xs text-sky-500/80 mt-1 font-medium">Patrimônio em construção</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense by Type Pie Chart */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Despesas por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingExpenseChart ? (
                <div className="animate-pulse h-64 bg-gray-100 rounded-md w-full"></div>
              ) : expenseByTypeData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="w-full h-56 relative flex items-center justify-center">
                    <Doughnut data={pieChartTypeData} options={pieChartOptions} />
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total</span>
                      <span className="text-lg font-extrabold text-slate-800">
                        {formatCurrency(expenseByTypeData.reduce((sum, item) => sum + Math.abs(item.soma_valor), 0))}
                      </span>
                    </div>
                  </div>
                  <div className="w-full mt-6 space-y-3 px-2">
                    {expenseTypePercentages.map((item, index) => (
                      <div key={index} className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center">
                          <div
                            className="w-2.5 h-2.5 rounded-full mr-3 shadow-sm transition-transform group-hover:scale-125"
                            style={{ backgroundColor: pieChartTypeData.datasets[0].backgroundColor[index] }}
                          ></div>
                          <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{item.tipo_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-800">{formatCurrency(item.soma_valor)}</span>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                  <PieChart className="h-10 w-10 text-gray-300" />
                  <p className="text-gray-500 text-sm">Nenhuma despesa este mês</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense by Category Pie Chart */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingExpenseCategoryChart ? (
                <div className="animate-pulse h-64 bg-gray-100 rounded-md w-full"></div>
              ) : expenseByCategoryData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="w-full h-56 relative flex items-center justify-center">
                    <Doughnut data={pieChartCategoryData} options={pieChartOptions} />
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Categorias</span>
                      <span className="text-lg font-extrabold text-slate-800">
                        {expenseByCategoryData.length}
                      </span>
                    </div>
                  </div>
                  <div className="w-full mt-6 space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar px-2">
                    {expenseCategoryPercentages.map((item, index) => (
                      <div key={index} className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center">
                          <div
                            className="w-2.5 h-2.5 rounded-full mr-3 shadow-sm transition-transform group-hover:scale-125"
                            style={{ backgroundColor: pieChartCategoryData.datasets[0].backgroundColor[index] }}
                          ></div>
                          <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{item.categoria_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-800">{formatCurrency(item.soma_valor)}</span>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                  <PieChart className="h-10 w-10 text-gray-300" />
                  <p className="text-gray-500 text-sm">Nesta categoria não há dados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Chart */}
          <Card className="border-none shadow-md lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingChart ? (
                <div className="animate-pulse h-64 bg-gray-100 rounded-md w-full"></div>
              ) : (
                <div className="h-64 pt-4">
                  <Line data={lineChartData} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent transactions */}
        {/* Bottom Section: Transactions + Wishlist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent transactions */}
          <Card className="border-none shadow-md overflow-hidden bg-white lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-slate-50/50">
              <div>
                <CardTitle className="text-xl font-bold">Transações Recentes</CardTitle>
                <CardDescription>Suas últimas atividades financeiras</CardDescription>
              </div>
              <Button variant="ghost" className="text-[#11ab77] hover:text-[#0e9968] font-semibold" asChild>
                <a href="/transactions">Ver todas</a>
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoadingTransactions ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
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
                    transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.descricao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.data, '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                          <span className={transaction.tipo == "receita" || (transaction.categoria == "investimento" && transaction.valor > 0) ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(transaction.valor)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => handleEditTransaction(transaction.registro_id)}
                            className="text-gray-400 hover:text-[#11ab77] transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Wishlist / Priorities */}
          <Card className="border-none shadow-md overflow-hidden bg-white flex flex-col">
            <CardHeader className="border-b border-gray-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <ListTodo className="mr-2 h-5 w-5 text-[#11ab77]" />
                    Lista de Desejos
                  </CardTitle>
                  <CardDescription>Metas e prioridades de compra</CardDescription>
                </div>
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto max-h-[500px] custom-scrollbar">
              {isLoadingWishlist ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex justify-between items-center animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-32"></div>
                        <div className="h-3 bg-gray-50 rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-gray-100 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : wishlist.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {wishlist.map((item) => (
                    <li key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 mr-2 group-hover:bg-[#11ab77] group-hover:text-white transition-colors">
                              {item.prioridade}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-900">{item.nome}</h4>
                          </div>
                          <p className="text-[10px] text-gray-400 ml-7">
                            Adicionado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#11ab77]">
                            {formatCurrency(item.valor)}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6 grayscale opacity-40">
                  <Star className="h-10 w-10 mb-2 border-none" />
                  <p className="text-sm text-gray-500">Sua lista está vazia.<br />Comece a planejar seus sonhos!</p>
                </div>
              )}
            </CardContent>
            <div className="p-3 bg-slate-50/30 border-t border-gray-100 mt-auto">
              <p className="text-[10px] text-center text-gray-400 italic">
                A prioridade ajuda você a focar no que é mais importante.
              </p>
            </div>
          </Card>
        </div>

        {/* Transaction Edit Modal */}
        <TransactionEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          transactionId={selectedTransactionId}
          onSave={handleTransactionSaved}
        />
      </div>
    </Layout>
  );
}