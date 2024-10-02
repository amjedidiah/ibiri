import bcrypt from 'bcryptjs';
import { getDb } from '@ibiri/db';
import { NextRequest, NextResponse } from 'next/server';

interface BillPaymentRequest {
  billType: string;
  accountNumber: string;
  amount: number;
  pin: string;
}

const billsValues: Record<string, number> = {
  Electricity: 5000,
  Insurance: 3000,
  'Cable TV': 2500,
  Taxes: 10000,
  Utility: 1500,
  Rent: 20000,
};

export async function POST(request: NextRequest) {
  const db = await getDb();
  let transaction;

  try {
    const { billType, accountNumber, pin }: BillPaymentRequest =
      await request.json();

    // Validate input
    if (!billType || !accountNumber || !pin) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Check if the bill type is valid
    if (!billsValues[billType]) {
      return NextResponse.json({ error: 'Invalid bill type' }, { status: 400 });
    }

    const amount = billsValues[billType];

    // Fetch the user making the bill payment
    const user = await db
      .collection('users')
      .findOne({ 'bankAccount.accountNumber': accountNumber });

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    // Verify PIN
    if (!user.hasPin || !user.pin) {
      return NextResponse.json({ error: 'PIN not set' }, { status: 400 });
    }

    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    // Locate the specific bank account
    const userAccount = user.bankAccount.find(
      (account: { accountNumber: string }) =>
        account.accountNumber === accountNumber
    );

    if (!userAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Ensure the amount is correct for the bill type
    if (amount !== billsValues[billType]) {
      return NextResponse.json(
        {
          error: `The amount for ${billType} must be exactly ${billsValues[billType]} NGN`,
        },
        { status: 400 }
      );
    }

    // Check if the user has enough balance
    if (userAccount.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      );
    }

    // Create transaction object
    transaction = {
      transaction_id: generateTransactionId(),
      amount: amount,
      currency: 'NGN',
      status: 'pending',
      payment_method: 'bill_payment',
      created_at: new Date().toISOString(),
      payer: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        payer_id: accountNumber,
      },
      merchant: {
        recipient_id: billType,
        recipient_name: billType,
      },
      fee: 0,
      type: 'bill_payment',
      processor: 'Ibiri',
      summary: `Bill payment of ${amount} NGN by ${user.firstName} ${user.lastName} for ${billType}`,
    };

    // Perform the bill payment (deduct from the user's balance)
    const updatedUserBalance = userAccount.balance - amount;

    await db
      .collection('users')
      .updateOne(
        { 'bankAccount.accountNumber': accountNumber },
        { $set: { 'bankAccount.$.balance': updatedUserBalance } }
      );

    transaction.status = 'completed';
    await db.collection('transactions').insertOne(transaction);

    return NextResponse.json(
      { message: `${billType} bill payment successful`, transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bill payment error:', error);
    if (transaction) {
      transaction.status = 'failed';
      await db.collection('transactions').insertOne(transaction);
    }
    return NextResponse.json(
      { error: 'Internal Server Error', transaction },
      { status: 500 }
    );
  }
}

function generateTransactionId(): string {
  return 'TRX' + Date.now() + Math.random().toString(36).slice(2, 11);
}