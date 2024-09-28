import { getDb } from '@ibiri/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

interface JwtPayload {
  userId: string;
  email: string;
}

export async function POST(request: NextRequest) {
  const db = await getDb();

  try {
    const { pin } = await request.json();

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decodedToken: JwtPayload;
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      decodedToken = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(decodedToken.userId) },
      { $set: { pin: hashedPin, hasPin: true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'PIN set successfully' }, { status: 200 });
  } catch (error) {
    console.error('Set PIN error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}