'use client'

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AirtimeTransaction {
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

interface AirtimeResult {
  success: boolean;
  message: string;
  transaction?: AirtimeTransaction;
}

export const useAirtime = () => {
  const [loading, setLoading] = useState(false);
  const { refreshUserData } = useAuth();

  // Function to validate the airtime form inputs
  const validateAirtime = (phoneNumber: string, amount: string, pin: string): { isValid: boolean; message: string } => {
    console.log(phoneNumber);
    
    if (!phoneNumber || !/^\d{11}$/.test(phoneNumber)) {
      return { isValid: false, message: 'Please provide a valid 11-digit phone number.' };
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

  // Function to handle the airtime transaction
  const handleAirtime = async (
    phoneNumber: string,
    accountNumber: string,
    amount: string,
    pin: string
  ): Promise<AirtimeResult> => {
    const validation = validateAirtime(phoneNumber, amount, pin);
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    setLoading(true);

    try {
      const response = await fetch('/api/airtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          accountNumber,
          amount: Number(amount),
          pin,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await refreshUserData();
        return { 
          success: true, 
          message: 'Airtime purchase successful', 
          transaction: result.transaction 
        };
      } else {
        const errorMessage = result.error || 'Airtime purchase failed';
        return { 
          success: false, 
          message: errorMessage, 
          transaction: result.transaction 
        };
      }
    } catch (error) {
      console.error('Error making airtime purchase:', error);
      const errorMessage = 'An error occurred while processing the airtime purchase.';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { handleAirtime, loading };
};
