import React from 'react';
import { Card, CardContent, CardHeader, Button } from '@ibiri/components';

interface TransferSuccessMessageProps {
  transaction: {
    transaction_id: string;
    amount: number;
    currency: string;
    merchant: {
      recipient_name: string;
    };
    created_at: string;
  };
  onClose: () => void;
}

const TransferSuccessMessage: React.FC<TransferSuccessMessageProps> = ({
  transaction,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="font-bold text-2xl text-center text-green-600">
          Transfer Successful!
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Transaction ID:</strong> {transaction.transaction_id}
          </p>
          <p>
            <strong>Amount:</strong> {transaction.currency}{' '}
            {transaction.amount.toFixed(2)}
          </p>
          <p>
            <strong>Recipient:</strong> {transaction.merchant.recipient_name}
          </p>
          <p>
            <strong>Date:</strong>{' '}
            {new Date(transaction.created_at).toLocaleString()}
          </p>
          <Button
            onClick={onClose}
            className="group space-y-8 hover:bg-[#2467e3] relative w-full h-12 flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-bg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferSuccessMessage;
