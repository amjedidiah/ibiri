import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Transaction {
  created_at: string;
  summary: string;
  amount: number;
  type: string;
  status: string;
}

export const useTransactions = (accountNumber: string | undefined, limit = 5) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (accountNumber) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/transactions?accountNumber=${accountNumber}&limit=${limit}`);
          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }
          const data = await response.json();
          setTransactions(data.transactions);
        } catch (error) {
          console.error('Error fetching transactions:', error);
          toast.error('Failed to load transactions');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [accountNumber, limit]);

  return { transactions, isLoading };
};