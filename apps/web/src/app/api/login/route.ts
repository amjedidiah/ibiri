// Login API
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, User } from '@ibiri/db';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    const body = await request.json();
    const { email, password } = body;

    const user = await db.collection<User>('users').findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT Secret is not defined');
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        jwtSecret,
        { expiresIn: '1h' }
      );

      return NextResponse.json(
        {
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            creditScore: user.creditScore,
            bankAccount: user.bankAccount,
            hasPin: user.hasPin,
            pin: user.pin,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Incorrect Password' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
