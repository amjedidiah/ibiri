import { NextRequest, NextResponse } from 'next/server';
import { getDb, type User } from '@ibiri/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface JwtPayload {
  userId: string;
  email: string;
}

interface CreditScore {
  score: number;
  lastScore: number;
  date: Date;
  range: { min: 300; max: 850 };
  factors: string[];
  source: string;
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { score, factors } = body;

    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('token')?.value;

    if (!tokenCookie) {
      return NextResponse.json(
        { message: 'Authentication token not found' },
        { status: 401 }
      );
    }

    let decodedToken: JwtPayload;
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      decodedToken = jwt.verify(
        tokenCookie,
        process.env.JWT_SECRET
      ) as JwtPayload;
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 300 || score > 850) {
      return NextResponse.json(
        { error: 'Invalid credit score' },
        { status: 400 }
      );
    }

    const user = await db
      .collection<User>('users')
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedCreditScore: CreditScore = {
      score,
      lastScore: user.creditScore[0]?.score || 300,
      date: new Date(),
      range: { min: 300, max: 850 },
      factors: factors || [],
      source: 'Experian',
    };

    await db.collection<User>('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { 'creditScore.0': updatedCreditScore, updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      message: 'Credit score updated successfully',
      creditScore: updatedCreditScore,
    });
  } catch (error) {
    console.error('Update credit score error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
