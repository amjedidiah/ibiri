import { getDb } from '@ibiri/db';
import { NextRequest, NextResponse } from 'next/server';

// Define transfer request body
interface TransferRequest {
  senderAccountNumber: string;
  recipientAccountNumber: string;
  amount: number;
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    // Parse the request body
    const {
      senderAccountNumber,
      recipientAccountNumber,
      amount,
    }: TransferRequest = await request.json();

    // Validate input
    if (!senderAccountNumber || !recipientAccountNumber || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Fetch sender and recipient users
    const senderUser = await db.collection('users').findOne({
      'bankAccount.accountNumber': senderAccountNumber,
    });

    const recipientUser = await db.collection('users').findOne({
      'bankAccount.accountNumber': recipientAccountNumber,
    });

    if (!senderUser) {
      return NextResponse.json(
        { error: 'Sender account not found' },
        { status: 404 }
      );
    }

    if (!recipientUser) {
      return NextResponse.json(
        { error: 'Recipient account not found' },
        { status: 404 }
      );
    }

    // Locate the specific bank accounts
    const senderAccount = senderUser.bankAccount.find(
      (account: { accountNumber: string }) =>
        account.accountNumber === senderAccountNumber
    );
    const recipientAccount = recipientUser.bankAccount.find(
      (account: { accountNumber: string }) =>
        account.accountNumber === recipientAccountNumber
    );

    if (!senderAccount || !recipientAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if the sender has enough balance
    if (senderAccount.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      );
    }

    // Update balances (deduct from sender, add to recipient)
    const updatedSenderBalance = senderAccount.balance - amount;
    const updatedRecipientBalance = recipientAccount.balance + amount;

    // Update the sender's account balance in the database
    await db
      .collection('users')
      .updateOne(
        { 'bankAccount.accountNumber': senderAccountNumber },
        { $set: { 'bankAccount.$.balance': updatedSenderBalance } }
      );

    // Update the recipient's account balance in the database
    await db
      .collection('users')
      .updateOne(
        { 'bankAccount.accountNumber': recipientAccountNumber },
        { $set: { 'bankAccount.$.balance': updatedRecipientBalance } }
      );

    return NextResponse.json(
      { message: 'Transfer successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
