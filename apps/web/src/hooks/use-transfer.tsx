import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Transaction {
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  payer: {
    name: string;
    email: string;
    payer_id: string;
  };
  merchant: {
    recipient_id: string;
    recipient_name: string;
  };
  fee: number;
  type: string;
  processor: string;
  summary: string;
}

interface TransferResult {
  success: boolean;
  message: string;
  transaction?: Transaction;
}

export const useTransfer = () => {
  const [loading, setLoading] = useState(false);
  const { refreshUserData } = useAuth();

  const validateTransfer = (accountNumber: string, amount: string, pin: string): { isValid: boolean; message: string } => {
    if (!accountNumber || accountNumber.trim() === '') {
      return { isValid: false, message: 'Please provide a valid account number.' };
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      return { isValid: false, message: 'Please enter a valid amount (minimum 1).' };
    }

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return { isValid: false, message: 'Please enter a valid 4-digit PIN.' };
    }

    return { isValid: true, message: '' };
  };

  const handleTransfer = async (
    senderAccountNumber: string,
    recipientAccountNumber: string,
    amount: string,
    pin: string
  ): Promise<TransferResult> => {
    const validation = validateTransfer(recipientAccountNumber, amount, pin);
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    setLoading(true);

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderAccountNumber,
          recipientAccountNumber,
          amount: Number(amount),
          pin,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await refreshUserData();
        return { 
          success: true, 
          message: 'Transfer successful', 
          transaction: result.transaction 
        };
      } else {
        const errorMessage = result.error || 'Transfer failed';
        return { 
          success: false, 
          message: errorMessage, 
          transaction: result.transaction 
        };
      }
    } catch (error) {
      console.error('Error making transfer:', error);
      const errorMessage = 'An error occurred while processing the transfer.';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { handleTransfer, loading };
};
