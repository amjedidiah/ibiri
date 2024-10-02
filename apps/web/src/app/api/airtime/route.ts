import bcrypt from 'bcryptjs';
import { getDb } from '@ibiri/db';
import { NextRequest, NextResponse } from 'next/server';

// Define airtime request body
interface AirtimeRequest {
  phoneNumber: string;
  accountNumber: string;
  amount: number;
  pin: string;
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  let transaction;

  try {
    const { phoneNumber, accountNumber, amount, pin }: AirtimeRequest =
      await request.json();

    // Validate input
    if (!phoneNumber || !accountNumber || amount <= 0 || !pin) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Fetch the user making the airtime purchase
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
      payment_method: 'airtime',
      created_at: new Date().toISOString(),
      payer: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        payer_id: accountNumber,
      },
      merchant: {
        recipient_id: phoneNumber,
        recipient_name: 'Airtime Provider',
      },
      fee: 0,
      type: 'airtime',
      processor: 'Ibiri',
      summary: `Airtime purchase of ${amount} NGN by ${user.firstName} ${user.lastName} for phone number ${phoneNumber}`,
    };

    // Perform the airtime purchase (deduct from the user's balance)
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
      { message: 'Airtime purchase successful', transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Airtime purchase error:', error);
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
