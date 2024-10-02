'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface BillTransaction {
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

interface BillResult {
  success: boolean;
  message: string;
  transaction?: BillTransaction;
}

export const useBills = () => {
  const [loading, setLoading] = useState(false);
  const { refreshUserData } = useAuth();

  const validateBill = (
    accountNumber: string,
    pin: string,
    billType: string
  ): { isValid: boolean; message: string } => {
    if (!billType) {
      return { isValid: false, message: 'Please select a bill type.' };
    }

    if (!accountNumber || accountNumber.length < 6) {
      return {
        isValid: false,
        message: 'Please provide a valid account number.',
      };
    }

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return { isValid: false, message: 'Please enter a valid 4-digit PIN.' };
    }

    return { isValid: true, message: '' };
  };

  const handleBill = async (
    billType: string,
    accountNumber: string,
    pin: string
  ): Promise<BillResult> => {
    const validation = validateBill(accountNumber, pin, billType);
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billType,
          accountNumber,
          pin,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await refreshUserData();
        return {
          success: true,
          message: `${billType} payment successful`,
          transaction: result.transaction,
        };
      } else {
        const errorMessage = result.error || `${billType} payment failed`;
        return {
          success: false,
          message: errorMessage,
          transaction: result.transaction,
        };
      }
    } catch (error) {
      console.error(`Error making ${billType} payment:`, error);
      return {
        success: false,
        message: `An error occurred while processing the ${billType} payment.`,
      };
    } finally {
      setLoading(false);
    }
  };

  return { handleBill, loading };
};