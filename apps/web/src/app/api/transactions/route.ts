import { getDb } from '@ibiri/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const db = await getDb();

  try {
    const { searchParams } = new URL(request.url);
    const accountNumber = searchParams.get('accountNumber');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (!accountNumber) {
      return NextResponse.json({ error: 'Account number is required' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const transactions = await db.collection('transactions')
      .find({
        $or: [
          { 'payer.payer_id': accountNumber },
          { 'merchant.recipient_id': accountNumber }
        ]
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalTransactions = await db.collection('transactions')
      .countDocuments({
        $or: [
          { 'payer.payer_id': accountNumber },
          { 'merchant.recipient_id': accountNumber }
        ]
      });

    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        limit
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}