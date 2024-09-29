import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  type BankAccount,
  type CreditScore,
  getDb,
  type User,
  validateUser,
} from '@ibiri/db';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

// Create default credit score
const defaultCreditScore: CreditScore = {
  score: 300,
  date: new Date(),
  range: { min: 300, max: 850 },
  factors: [],
  source: 'Experian',
};

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate user input
    const validationError = validateUser({
      email,
      password,
      firstName,
      lastName,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.collection<User>('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const raw = JSON.stringify({
      account_name: `${firstName} ${lastName}`,
      account_reference: `IBR-${randomBytes(16).toString('hex')}`,
      permanent: true,
      bank_code: '000',
      customer: {
        name: `${firstName} ${lastName}`,
      },
      kyc: {
        bvn: '11111111111',
      },
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`,
      },
      body: raw,
      redirect: 'follow' as RequestRedirect,
    };

    const accountResponse = await fetch(
      'https://api.korapay.com/merchant/api/v1/virtual-bank-account',
      requestOptions
    );
    const accountData = await accountResponse.json();

    if (!accountResponse.ok) {
      console.error('Failed to create virtual bank account:', accountData);
      throw new Error(
        accountData.error || 'Failed to create virtual bank account'
      );
    }

    const accountNumber = accountData.data.account_number;

    // Create default bank account
    const defaultBankAccount: BankAccount = {
      accountNumber: accountNumber,
      name: `${firstName} ${lastName}`,
      type: 'checking',
      balance: 0,
    };

    // Create user object
    const newUser: User = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
      creditScore: [defaultCreditScore],
      bankAccount: [defaultBankAccount],
    };

    // Insert user into database
    const result = await db.collection<User>('users').insertOne(newUser);

    // Safe user object - No password exposure
    const safeUser = {
      id: result.insertedId.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      creditScore: newUser.creditScore,
      bankAccount: newUser.bankAccount,
    };

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { userId: safeUser.id, email: safeUser.email },
      jwtSecret,
      { expiresIn: '1h' }
    );

    // Set HttpOnly cookie for the token
    const response = NextResponse.json({
      message: 'User registered successfully',
      user: safeUser,
    });
    response.cookies.set('token', token, {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
