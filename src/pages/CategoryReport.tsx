import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { ChevronDown, Download } from 'lucide-react';

interface CategoryReportData {
  categoria_name: string;
  subcategoria_name: string;
  tipo_name: string;
  month_date: string;
  value: number;
}

export default function CategoryReport() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<CategoryReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthColumns, setMonthColumns] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>('');

  useEffect(() => {
    const months = [];
    // Use Brazil timezone for date calculations
    const currentDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed (0=Jan, 1=Feb...)
    
    // Add next month first
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    months.push(`${(nextMonth + 1).toString().padStart(2, '0')}/${nextYear}`);
    
    // Add current month and previous months
    for (let i = 0; i < 5; i++) {
      // Calculate month and year explicitly
      let month = currentMonth - i;
      let year = currentYear;
      
      // Handle negative months by adjusting year
      while (month < 0) {
        month += 12;
        year -= 1;
      }
      
      // Format month (add 1 because getMonth is 0-indexed)
      const monthStr = (month + 1).toString().padStart(2, '0');
      const formattedMonth = `${monthStr}/${year}`;
      months.push(formattedMonth);
      
      // Set current month
      if (i === 0) {
        setCurrentMonth(formattedMonth);
      }
    }
    
    setMonthColumns(months);
  }, []);

  useEffect(() => {
    if (user && monthColumns.length > 0) {
      fetchCategoryReportData();
    }
  }, [user, monthColumns]);

  const fetchCategoryReportData = async () => {
    setIsLoading(true);
    
    try {
      const promises = monthColumns.map(async (monthYear) => {
        const [monthStr, yearStr] = monthYear.split('/');
        // Parse as integers
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        
        // Create date string in YYYY-MM-DD format, ensuring consistent formatting
        const selectedMonthDate = `${yearStr}-${monthStr}-01`;
        
        const { data, error } = await supabase
          .from('view_categoria_subcategoria_report')
          .select('categoria_name, subcategoria_name, tipo_name, month_date, value')
          .eq('user_id', user.id)
          .eq('month_date', selectedMonthDate);
        
        if (error) throw error;
        
        return data || [];
      });
      
      const results = await Promise.all(promises);
      const allData = results.flat();
      
      // Debug: Check all month_date values
      const uniqueDates = [...new Set(allData.map(item => item.month_date))];
      
      setReportData(allData);
    } catch (error) {
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency values
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Group data by category and subcategory
  const processReportData = () => {
    // First, group by category and subcategory
    const groupedByCategoryAndSubcategory = reportData.reduce((acc, item) => {
      const key = `${item.categoria_name || 'Sem categoria'}-${item.subcategoria_name || 'Sem subcategoria'}`;
      
      if (!acc[key]) {
        acc[key] = {
          categoria_name: item.categoria_name || 'Sem categoria',
          subcategoria_name: item.subcategoria_name || 'Sem subcategoria',
          tipo_name: item.tipo_name || 'Sem tipo',
          monthlyValues: {}
        };
      }
      
      // Get month/year from the date
      // Inside processReportData and other functions that handle dates
      if (item.month_date) {
        // Create date from string ensuring UTC to avoid timezone issues
        const dateParts = item.month_date.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        
        // Format directly without creating a Date object
        const monthYear = `${month.toString().padStart(2, '0')}/${year}`;
        
        acc[key].monthlyValues[monthYear] = (acc[key].monthlyValues[monthYear] || 0) + item.value;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by category and subcategory
    const result = Object.values(groupedByCategoryAndSubcategory).sort((a, b) => {
      if (a.categoria_name < b.categoria_name) return -1;
      if (a.categoria_name > b.categoria_name) return 1;
      if (a.subcategoria_name < b.subcategoria_name) return -1;
      if (a.subcategoria_name > b.subcategoria_name) return 1;
      return 0;
    });
    
    return result;
  };

  // Group data by category for totals
  const calculateCategoryTotals = () => {
    const totals = reportData.reduce((acc, item) => {
      const categoryName = item.categoria_name || 'Sem categoria';
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          categoria_name: categoryName,
          monthlyValues: {}
        };
      }
      
      // Get month/year from the date
      if (item.month_date) {
        const dateParts = item.month_date.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const monthYear = `${month.toString().padStart(2, '0')}/${year}`;
        
        // Ensure we're adding a number
        const numericValue = typeof item.value === 'number' ? item.value : parseFloat(item.value || 0);
        acc[categoryName].monthlyValues[monthYear] = (acc[categoryName].monthlyValues[monthYear] || 0) + numericValue;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(totals).sort((a, b) => {
      if (a.categoria_name < b.categoria_name) return -1;
      if (a.categoria_name > b.categoria_name) return 1;
      return 0;
    });
  };

  // Calculate totals by type (Receita, Investimento, Geral)
  const calculateTotalsByType = () => {
    const totals = {
      receita: {} as Record<string, number>,
      investimento: {} as Record<string, number>,
      geral: {} as Record<string, number>
    };

    reportData.forEach(item => {
      if (item.month_date) {
        const dateParts = item.month_date.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const monthYear = `${month.toString().padStart(2, '0')}/${year}`;
        
        // Ensure we're adding a number
        const numericValue = typeof item.value === 'number' ? item.value : parseFloat(item.value || 0);

        // Initialize month totals if they don't exist
        if (!totals.receita[monthYear]) totals.receita[monthYear] = 0;
        if (!totals.investimento[monthYear]) totals.investimento[monthYear] = 0;
        if (!totals.geral[monthYear]) totals.geral[monthYear] = 0;

        // Add to appropriate total based on category
        if (item.categoria_name === 'Receita') {
          totals.receita[monthYear] += numericValue;
        } else if (item.categoria_name === 'Investimento') {
          totals.investimento[monthYear] += numericValue;
        } else {
          totals.geral[monthYear] += numericValue;
        }
      }
    });

    return totals;
  };

  const processedData = processReportData();
  const categoryTotals = calculateCategoryTotals();
  const totalsByType = calculateTotalsByType();

  // Group processed data by category
  const groupedByCategory = processedData.reduce((acc, item) => {
    if (!acc[item.categoria_name]) {
      acc[item.categoria_name] = [];
    }
    acc[item.categoria_name].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Layout title="Relatório por Categoria">
      <div>
        {/* <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Relatório por Categoria</h2>
            <p className="text-gray-600 mt-1">
              Análise detalhada dos gastos por categoria nos últimos 3 meses.
            </p>
          </div>
        </div> */}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria/Subcategoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  {monthColumns.map(month => (
                    <th 
                      key={month} 
                      className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        month === currentMonth ? 'bg-[#e6f7f1]' : ''
                      }`}
                    >
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      {monthColumns.map((_, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="animate-pulse h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : Object.keys(groupedByCategory).length > 0 ? (
                  // Render data grouped by category
                  Object.keys(groupedByCategory).map((category, categoryIndex) => {
                    const categoryTotal = categoryTotals.find(c => c.categoria_name === category);
                    
                    return (
                      <React.Fragment key={category}>
                        {/* Category row */}
                        <tr className="bg-gray-50">
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                            {category}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {/* Empty cell for tipo */}
                          </td>
                          {monthColumns.map(month => (
                            <td 
                              key={month} 
                              className={`px-6 py-3 whitespace-nowrap text-sm text-right font-bold ${
                                month === currentMonth ? 'bg-[#e6f7f1]' : ''
                              }`}
                            >
                              {formatCurrency(categoryTotal?.monthlyValues[month] || 0)}
                            </td>
                          ))}
                        </tr>
                        
                        {/* Subcategory rows */}
                        {groupedByCategory[category].map((item, index) => (
                          <tr key={`${category}-${item.subcategoria_name}-${index}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 pl-10">
                              {item.subcategoria_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.tipo_name}
                            </td>
                            {monthColumns.map(month => (
                              <td 
                                key={month} 
                                className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                                  month === currentMonth ? 'bg-[#e6f7f1]' : ''
                                }`}
                              >
                                {formatCurrency(item.monthlyValues[month] || 0)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={2 + monthColumns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum dado encontrado para este período
                    </td>
                  </tr>
                )}
                {/* Total rows */}
                {Object.keys(groupedByCategory).length > 0 && (
                  <>
                    {/* Total Receita */}
                    <tr className="bg-green-50 font-bold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                        Total Receita
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                        {/* Empty cell for tipo */}
                      </td>
                      {monthColumns.map(month => (
                        <td 
                          key={month} 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right text-green-700 ${
                            month === currentMonth ? 'bg-[#e6f7f1]' : ''
                          }`}
                        >
                          {formatCurrency(totalsByType.receita[month] || 0)}
                        </td>
                      ))}
                    </tr>
                    {/* Total Investimento */}
                    <tr className="bg-blue-50 font-bold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                        Total Investimento
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                        {/* Empty cell for tipo */}
                      </td>
                      {monthColumns.map(month => (
                        <td 
                          key={month} 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right text-blue-700 ${
                            month === currentMonth ? 'bg-[#e6f7f1]' : ''
                          }`}
                        >
                          {formatCurrency(totalsByType.investimento[month] || 0)}
                        </td>
                      ))}
                    </tr>
                    {/* Total Geral (outras categorias) */}
                    <tr className="bg-gray-100 font-bold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Total Geral
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {/* Empty cell for tipo */}
                      </td>
                      {monthColumns.map(month => (
                        <td 
                          key={month} 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                            month === currentMonth ? 'bg-[#e6f7f1]' : ''
                          }`}
                        >
                          {formatCurrency(totalsByType.geral[month] || 0)}
                        </td>
                      ))}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}