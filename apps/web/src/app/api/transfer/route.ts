import { getDb } from '@ibiri/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Define transfer request body
interface TransferRequest {
  senderAccountNumber: string;
  recipientAccountNumber: string;
  amount: number;
  pin: string;
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  let transaction;

  try {
    const { senderAccountNumber, recipientAccountNumber, amount, pin }: TransferRequest = await request.json();

    // Validate input
    if (!senderAccountNumber || !recipientAccountNumber || amount <= 0 || !pin) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Fetch sender and recipient users
    const senderUser = await db.collection('users').findOne({ 'bankAccount.accountNumber': senderAccountNumber });
    const recipientUser = await db.collection('users').findOne({ 'bankAccount.accountNumber': recipientAccountNumber });

    if (!senderUser) {
      return NextResponse.json({ error: 'Sender account not found' }, { status: 404 });
    }
    if (!recipientUser) {
      return NextResponse.json({ error: 'Recipient account not found' }, { status: 404 });
    }

    // Verify PIN
    if (!senderUser.hasPin || !senderUser.pin) {
      return NextResponse.json({ error: 'PIN not set' }, { status: 400 });
    }

    const isPinValid = await bcrypt.compare(pin, senderUser.pin);
    if (!isPinValid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    // Locate the specific bank accounts
    const senderAccount = senderUser.bankAccount.find((account: { accountNumber: string }) => account.accountNumber === senderAccountNumber);
    const recipientAccount = recipientUser.bankAccount.find((account: { accountNumber: string }) => account.accountNumber === recipientAccountNumber);

    if (!senderAccount || !recipientAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if the sender has enough balance
    if (senderAccount.balance < amount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Create transaction object
    transaction = {
      transaction_id: generateTransactionId(),
      amount: amount,
      currency: 'NGN',
      status: 'pending',
      payment_method: 'transfer',
      created_at: new Date().toISOString(),
      payer: {
        name: `${senderUser.firstName} ${senderUser.lastName}`,
        email: senderUser.email,
        payer_id: senderAccountNumber,
      },
      merchant: {
        recipient_id: recipientAccountNumber,
        recipient_name: `${recipientUser.firstName} ${recipientUser.lastName}`,
      },
      fee: 0,
      type: 'transfer',
      processor: 'Ibiri',
      summary: `Transfer of ${amount} NGN from ${senderUser.firstName} ${senderUser.lastName} to ${recipientUser.firstName} ${recipientUser.lastName}`,
    };

    // Perform the transfer
    const updatedSenderBalance = senderAccount.balance - amount;
    const updatedRecipientBalance = recipientAccount.balance + amount;

    await db.collection('users').updateOne(
      { 'bankAccount.accountNumber': senderAccountNumber },
      { $set: { 'bankAccount.$.balance': updatedSenderBalance } }
    );

    await db.collection('users').updateOne(
      { 'bankAccount.accountNumber': recipientAccountNumber },
      { $set: { 'bankAccount.$.balance': updatedRecipientBalance } }
    );

    transaction.status = 'completed';
    await db.collection('transactions').insertOne(transaction);

    return NextResponse.json({ message: 'Transfer successful', transaction }, { status: 200 });
  } catch (error) {
    console.error('Transfer error:', error);
    if (transaction) {
      transaction.status = 'failed';
      await db.collection('transactions').insertOne(transaction);
    }
    return NextResponse.json({ error: 'Internal Server Error', transaction }, { status: 500 });
  }
}

function generateTransactionId(): string {
  return 'TRX' + Date.now() + Math.random().toString(36).slice(2, 11);
}
