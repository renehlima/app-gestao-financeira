'use client';

import { AlertTriangle, Clock, X } from 'lucide-react';
import { Alert, Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: Alert[];
  transactions: Transaction[];
}

export function AlertsPanel({ alerts, transactions }: AlertsPanelProps) {
  if (alerts.length === 0) return null;

  const getTransactionById = (id: string) => {
    return transactions.find(t => t.id === id);
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-l-4 border-orange-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
              Alertas de Vencimento ({alerts.length})
            </h3>
            <div className="space-y-2">
              {alerts.slice(0, 3).map(alert => {
                const transaction = getTransactionById(alert.transactionId);
                if (!transaction) return null;

                return (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === 'overdue' ? 'bg-red-500' : 'bg-orange-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(transaction.amount)} • {formatDate(alert.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.type === 'overdue' ? (
                        <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                          Vencida
                        </span>
                      ) : (
                        <Clock className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                );
              })}
              
              {alerts.length > 3 && (
                <p className="text-xs text-orange-700 dark:text-orange-300 text-center pt-2">
                  +{alerts.length - 3} outros alertas
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}