import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');

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
      decodedToken = jwt.verify(tokenCookie, process.env.JWT_SECRET) as JwtPayload;
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

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Remove sensitive information before sending the response
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}