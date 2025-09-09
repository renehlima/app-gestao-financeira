'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, AlertCircle, Download, Calendar } from 'lucide-react';
import { Transaction, Category, Alert } from '@/lib/types';
import { storage, formatCurrency, generateCSV, downloadCSV, checkDueAlerts } from '@/lib/utils';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { Dashboard } from '@/components/Dashboard';
import { AlertsPanel } from '@/components/AlertsPanel';

export default function FinancialApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'add'>('dashboard');
  const [showForm, setShowForm] = useState(false);

  // Load data on mount
  useEffect(() => {
    setTransactions(storage.getTransactions());
    setCategories(storage.getCategories());
  }, []);

  // Update alerts when transactions change
  useEffect(() => {
    const newAlerts = checkDueAlerts(transactions);
    setAlerts(newAlerts);
    storage.saveAlerts(newAlerts);
  }, [transactions]);

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction = storage.addTransaction(transactionData);
    setTransactions(prev => [...prev, newTransaction]);
    setShowForm(false);
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    storage.updateTransaction(id, updates);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTransaction = (id: string) => {
    storage.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleExportCSV = () => {
    const csv = generateCSV(transactions);
    const filename = `financas-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Gestão Financeira
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Transação</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {alerts.length > 0 && (
        <AlertsPanel alerts={alerts} transactions={transactions} />
      )}

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Receitas
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Despesas
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Saldo
                </p>
                <p className={`text-2xl font-bold ${
                  balance >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                balance >= 0 
                  ? 'bg-blue-100 dark:bg-blue-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                <Calendar className={`w-6 h-6 ${
                  balance >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Transações
          </button>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && (
          <Dashboard transactions={transactions} categories={categories} />
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            categories={categories}
            onUpdate={handleUpdateTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          categories={categories}
          onSubmit={handleAddTransaction}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}