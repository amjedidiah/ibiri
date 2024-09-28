'use client';

import {
  Card,
  CardContent,
  CardHeader,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@ibiri/components';
import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ibiri/components';
import { Spinner } from '../../../../assets';
import { useAuth } from '../../../../context/AuthContext';
import { useTransfer } from '../../../../hooks/use-transfer';
import { toast } from 'react-toastify';
import { TransferSuccessMessage } from '../../../../components';

interface FormValues {
  accountNumber: string;
  amount: string;
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

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  maxLength = 4,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
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
        />
      ))}
    </div>
  );
};

const SendIbiriCustomers = () => {
  const { user, updateUser } = useAuth();
  const { handleTransfer, loading } = useTransfer();
  const [successTransaction, setSuccessTransaction] =
    useState<Transaction | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showCreatePinDialog, setShowCreatePinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isPinCreationStep, setIsPinCreationStep] = useState(true);

  const form = useForm<FormValues>({
    defaultValues: {
      accountNumber: '',
      amount: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (user && !user.hasPin) {
      setShowCreatePinDialog(true);
    }
  }, [user]);

  const onSubmit = async (data: FormValues) => {
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
        // setShowPinDialog(true);
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
    const data = form.getValues();

    try {
      const result = await handleTransfer(
        user?.bankAccount[0]?.accountNumber as string,
        data.accountNumber,
        data.amount,
        pin
      );

      if (result.success) {
        setSuccessTransaction(result.transaction as Transaction);
        form.reset();
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
    }
  };

  const closeSuccessMessage = () => {
    setSuccessTransaction(null);
  };

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue ? numericValue : '';
  };

  const inputClassName = `
    focus:outline-none h-16 placeholder:text-[#8592ad] text-black font-light text-2xl
    border focus:border-[#2467e3] focus:ring-0 focus:ring-offset-0
    transition-colors duration-200
    focus-visible:ring-0 focus-visible:ring-offset-0
    focus:shadow-none
  `;

  return (
    <div>
      <Card className="mt-6 max-w-2xl mx-auto">
        <CardHeader className="font-bold text-2xl text-center">
          Send Money to an Ibirian
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-right">
            <span className="font-semibold">Current Balance: </span>
            <span>₦ {Number(user?.bankAccount[0]?.balance).toFixed(2)}</span>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="accountNumber"
                rules={{
                  required: 'Account number is required',
                  validate: {
                    onlyNumbers: (value) =>
                      /^\d+$/.test(value) ||
                      'Account number should only contain numbers',
                    minLength: (value) =>
                      value.length >= 10 ||
                      'Account number should be at least 10 characters long',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-light">Account Number</FormLabel>
                    <FormControl>
                      <Input
                        className={`${inputClassName} ${
                          form.formState.errors.accountNumber
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter account number"
                        {...field}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(
                            /\D/g,
                            ''
                          );
                          field.onChange(numericValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="font-light" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                rules={{
                  required: 'Amount is required',
                  validate: (value) => {
                    const amount = parseFloat(value);
                    return (
                      amount >= 1 || 'Please enter a valid amount (minimum 1)'
                    );
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-light">Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className={`${inputClassName} pl-8 ${
                            form.formState.errors.amount
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          type="text"
                          placeholder="0.00"
                          value={formatAmount(field.value)}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl font-semibold">
                          ₦
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className="font-light" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="group space-y-8 hover:bg-[#2467e3] relative w-full h-12 flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-bg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? <Spinner /> : 'Transfer'}
              </Button>
            </form>
          </Form>
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
};

export default SendIbiriCustomers;
