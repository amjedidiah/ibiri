import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  type BankAccount,
  type CreditScore,
  getDb,
  type User,
  validateUser,
} from '@ibiri/db';
import { generateUniqueAccountNumber } from '@ibiri/utils';

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

    // Create default bank account
    const defaultBankAccount: BankAccount = {
      accountNumber: generateUniqueAccountNumber(),
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

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
