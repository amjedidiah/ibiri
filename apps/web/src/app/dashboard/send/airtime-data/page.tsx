'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@ibiri/components';
import { useAirtime } from '../../../../hooks/use-airtime';
import { useForm } from 'react-hook-form';
import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-toastify';
import TransferSuccessMessage from '../../../../components/TransferSuccessMessage';

interface FormValues {
  phoneNumber: string;
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

const AirtimeData = () => {
  const { user, updateUser } = useAuth();
  const { handleAirtime, loading } = useAirtime();
  const [successTransaction, setSuccessTransaction] =
    useState<Transaction | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showCreatePinDialog, setShowCreatePinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isPinCreationStep, setIsPinCreationStep] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<FormValues>({
    defaultValues: {
      phoneNumber: '',
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
    const data = getValues(); // Get form data

    try {
      const result = await handleAirtime(
        data.phoneNumber,
        user?.bankAccount[0]?.accountNumber as string,
        data.amount,
        pin
      );

      if (result.success) {
        setSuccessTransaction(result.transaction as Transaction);
        reset(); // Reset the form
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

  return (
    <>
      <Tabs defaultValue="account" className="mt-20 mx-auto w-[400px]">
        <TabsList className="grid w-full grid-cols-2 bg-[#8592ad]">
          <TabsTrigger className="text-white" value="account">
            Airtime
          </TabsTrigger>
          <TabsTrigger className="text-white" value="password">
            Data
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <form onSubmit={handleSubmit(onSubmit)}>
            {' '}
            {/* Integrating react-hook-form */}
            <Card>
              <CardHeader>
                <CardTitle>Airtime</CardTitle>
                <CardDescription>
                  Buy airtime and earn amazing rewards and stuff
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    {...register('phoneNumber', {
                      required: 'Phone number is required',
                    })}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="amount">Airtime Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    {...register('amount', { required: 'Amount is required' })}
                    placeholder="Enter amount"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="group space-y-8 hover:bg-[#2467e3] relative w-full h-12 flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-bg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Processing...' : 'Buy Airtime'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Data</CardTitle>
              <CardDescription>
                Come back later data has finished 🥹
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
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
    </>
  );
};

export default AirtimeData;
