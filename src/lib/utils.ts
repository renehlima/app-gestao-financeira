import { Transaction, Category, Alert } from './types';

// Local Storage Keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'financial-app-transactions',
  CATEGORIES: 'financial-app-categories',
  ALERTS: 'financial-app-alerts',
} as const;

// Default Categories
export const DEFAULT_CATEGORIES: Category[] = [
  // Income Categories
  { id: '1', name: 'Salário', type: 'income', color: '#10b981' },
  { id: '2', name: 'Freelance', type: 'income', color: '#059669' },
  { id: '3', name: 'Investimentos', type: 'income', color: '#047857' },
  { id: '4', name: 'Outros', type: 'income', color: '#065f46' },
  
  // Expense Categories
  { id: '5', name: 'Alimentação', type: 'expense', color: '#ef4444' },
  { id: '6', name: 'Transporte', type: 'expense', color: '#dc2626' },
  { id: '7', name: 'Moradia', type: 'expense', color: '#b91c1c' },
  { id: '8', name: 'Saúde', type: 'expense', color: '#991b1b' },
  { id: '9', name: 'Educação', type: 'expense', color: '#7f1d1d' },
  { id: '10', name: 'Lazer', type: 'expense', color: '#fbbf24' },
  { id: '11', name: 'Outros', type: 'expense', color: '#6b7280' },
];

// Storage Functions
export const storage = {
  // Transactions
  getTransactions: (): Transaction[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveTransactions: (transactions: Transaction[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const transactions = storage.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    storage.saveTransactions(transactions);
    return newTransaction;
  },

  updateTransaction: (id: string, updates: Partial<Transaction>): void => {
    const transactions = storage.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      storage.saveTransactions(transactions);
    }
  },

  deleteTransaction: (id: string): void => {
    const transactions = storage.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    storage.saveTransactions(filtered);
  },

  // Categories
  getCategories: (): Category[] => {
    if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  },

  saveCategories: (categories: Category[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  // Alerts
  getAlerts: (): Alert[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  },

  saveAlerts: (alerts: Alert[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },
};

// Utility Functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const generateCSV = (transactions: Transaction[]): string => {
  const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Status'];
  const rows = transactions.map(t => [
    formatDate(t.date),
    t.type === 'income' ? 'Receita' : 'Despesa',
    t.description,
    t.category,
    t.amount.toString(),
    t.isPaid ? 'Pago' : 'Pendente'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const checkDueAlerts = (transactions: Transaction[]): Alert[] => {
  const today = new Date();
  const alerts: Alert[] = [];
  
  transactions.forEach(transaction => {
    if (!transaction.isPaid && transaction.dueDate) {
      const dueDate = new Date(transaction.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        alerts.push({
          id: `alert-${transaction.id}`,
          transactionId: transaction.id,
          message: `${transaction.description} está vencida`,
          type: 'overdue',
          date: transaction.dueDate,
        });
      } else if (diffDays <= 3) {
        alerts.push({
          id: `alert-${transaction.id}`,
          transactionId: transaction.id,
          message: `${transaction.description} vence em ${diffDays} dia(s)`,
          type: 'due',
          date: transaction.dueDate,
        });
      }
    }
  });
  
  return alerts;
};