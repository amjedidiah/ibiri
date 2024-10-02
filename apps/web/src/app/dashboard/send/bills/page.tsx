'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
} from '@ibiri/components';
import TransferSuccessMessage from '../../../../components/TransferSuccessMessage';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../context/AuthContext';
import { useBills } from '../../../../hooks/use-bills';

interface Bill {
  name: string;
  amount: number;
  isPaid: boolean;
}

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

interface Transaction {
  transaction_id: string;
  amount: number;
  currency: string;
  merchant: {
    recipient_name: string;
  };
  created_at: string;
}

export const initialBills: Bill[] = [
  { name: 'Electricity', amount: 5000, isPaid: false },
  { name: 'Insurance', amount: 3000, isPaid: false },
  { name: 'Cable TV', amount: 2500, isPaid: false },
  { name: 'Taxes', amount: 10000, isPaid: false },
  { name: 'Utility', amount: 1500, isPaid: false },
  { name: 'Rent', amount: 20000, isPaid: false },
];

const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  maxLength = 4,
}) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newValue = e.target.value;
    if (newValue.length <= 1 && /^\d*$/.test(newValue)) {
      const newPin = value.split('');
      newPin[index] = newValue;
      onChange(newPin.join(''));
      if (newValue.length === 1 && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {[...Array(maxLength)].map((_, index) => (
        <Input
          key={index}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className="w-12 h-12 text-center text-2xl"
          aria-label={`PIN digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default function Bills() {
  const { user, updateUser } = useAuth();
  const { handleBill } = useBills();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [successTransaction, setSuccessTransaction] =
    useState<Transaction | null>(null);
  const [showCreatePinDialog, setShowCreatePinDialog] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isPinCreationStep, setIsPinCreationStep] = useState(true);
  const [bills, setBills] = useState<Bill[]>(() => {
    const savedBills = sessionStorage.getItem('bills');
    return savedBills ? JSON.parse(savedBills) : initialBills;
  });

  useEffect(() => {
    const savedBills = sessionStorage.getItem('bills');
    if (!savedBills) {
      sessionStorage.setItem('bills', JSON.stringify(initialBills));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    if (user && !user.hasPin) {
      setShowCreatePinDialog(true);
    }
  }, [user]);

  const onSubmit = async (bill: Bill) => {
    setSelectedBill(bill);
    if (!user?.hasPin) {
      setShowCreatePinDialog(true);
    } else {
      setShowPinDialog(true);
    }
  };

  const handleCreatePin = async () => {
    if (isPinCreationStep) {
      if (newPin.length !== 4) {
        toast.error('PIN must be 4 digits');
        return;
      }
      setIsPinCreationStep(false);
      return;
    }

    if (confirmPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      setNewPin('');
      setConfirmPin('');
      setIsPinCreationStep(true);
      return;
    }

    try {
      const response = await fetch('/api/user/pin-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: newPin }),
      });

      if (response.ok) {
        toast.success('PIN created successfully');
        updateUser({ ...user, hasPin: true });
        setShowCreatePinDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create PIN');
      }
    } catch (error) {
      console.error('Error creating PIN:', error);
      toast.error('An error occurred while creating PIN');
    } finally {
      setNewPin('');
      setConfirmPin('');
      setIsPinCreationStep(true);
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    setShowPinDialog(false);

    if (selectedBill && user?.bankAccount[0]?.accountNumber) {
      try {
        const result = await handleBill(
          selectedBill.name,
          user.bankAccount[0].accountNumber,
          pin
        );

        if (result.success) {
          setSuccessTransaction(result.transaction as Transaction);
          setBills(
            bills.map((bill) =>
              bill.name === selectedBill.name ? { ...bill, isPaid: true } : bill
            )
          );
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error
            ? error.message
            : 'An error occurred. Please try again.'
        );
      } finally {
        setPin('');
        setSelectedBill(null);
      }
    }
  };

  const closeSuccessMessage = () => {
    setSuccessTransaction(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-xl pt-4 pb-0 font-semibold">
          Pay your bills on time to improve your credit score 📈
        </CardHeader>
        <CardContent className="pt-10">
          {bills.map((bill, index) => (
            <div
              key={index}
              className="flex items-center justify-between border rounded-xl p-5 gap-4 sm:gap-72 w-full sm:w-[500px] mx-auto mb-3 hover:border-[#2467e3] duration-300 transition-all"
            >
              <div>
                <h2 className="text-2xl font-semibold">{bill.name}</h2>
                <p className="text-sm text-gray-500">Amount: ₦{bill.amount}</p>
              </div>
              {bill.isPaid ? (
                <span className="text-green-500 font-semibold">Paid</span>
              ) : (
                <Button
                  onClick={() => onSubmit(bill)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Pay
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      {successTransaction && (
        <TransferSuccessMessage
          transaction={successTransaction}
          onClose={closeSuccessMessage}
        />
      )}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your PIN</DialogTitle>
          </DialogHeader>
          <PinInput value={pin} onChange={setPin} />
          <Button onClick={handlePinSubmit} disabled={pin.length !== 4}>
            Confirm
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={showCreatePinDialog} onOpenChange={setShowCreatePinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPinCreationStep ? 'Create your PIN' : 'Confirm your PIN'}
            </DialogTitle>
          </DialogHeader>
          <PinInput
            value={isPinCreationStep ? newPin : confirmPin}
            onChange={isPinCreationStep ? setNewPin : setConfirmPin}
          />
          <Button
            onClick={handleCreatePin}
            className="group relative w-full h-12 flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-bg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={(isPinCreationStep ? newPin : confirmPin).length !== 4}
          >
            {isPinCreationStep ? 'Next' : 'Create PIN'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
