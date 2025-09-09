'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Transaction, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
}

export function Dashboard({ transactions, categories }: DashboardProps) {
  // Monthly data for cash flow chart
  const monthlyData = useMemo(() => {
    const months = {};
    
    transactions.forEach(transaction => {
      if (!transaction.isPaid) return;
      
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = {
          month: new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('pt-BR', { 
            month: 'short', 
            year: 'numeric' 
          }),
          income: 0,
          expenses: 0,
          balance: 0,
        };
      }
      
      if (transaction.type === 'income') {
        months[monthKey].income += transaction.amount;
      } else {
        months[monthKey].expenses += transaction.amount;
      }
      
      months[monthKey].balance = months[monthKey].income - months[monthKey].expenses;
    });
    
    return Object.values(months).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [transactions]);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const categoryTotals = {};
    
    transactions
      .filter(t => t.isPaid)
      .forEach(transaction => {
        if (!categoryTotals[transaction.category]) {
          const category = categories.find(cat => cat.name === transaction.category);
          categoryTotals[transaction.category] = {
            name: transaction.category,
            value: 0,
            color: category?.color || '#6b7280',
            type: transaction.type,
          };
        }
        categoryTotals[transaction.category].value += transaction.amount;
      });
    
    return Object.values(categoryTotals);
  }, [transactions, categories]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Pending transactions
  const pendingTransactions = useMemo(() => {
    return transactions.filter(t => !t.isPaid);
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Cash Flow */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fluxo de Caixa Mensal
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="#10b981" name="Receitas" />
                <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Gastos por Categoria
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.filter((item: any) => item.type === 'expense')}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  className="text-xs"
                >
                  {categoryData
                    .filter((item: any) => item.type === 'expense')
                    .map((entry: any, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value), 'Valor']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Balance Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Evolução do Saldo
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Saldo"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Transações Recentes
          </h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: categories.find(cat => cat.name === transaction.category)?.color || '#6b7280' 
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhuma transação encontrada
              </p>
            )}
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Transações Pendentes
          </h3>
          <div className="space-y-3">
            {pendingTransactions.length > 0 ? (
              pendingTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: categories.find(cat => cat.name === transaction.category)?.color || '#6b7280' 
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.category}
                        {transaction.dueDate && (
                          <span className="ml-2 text-orange-500">
                            Vence: {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhuma transação pendente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}