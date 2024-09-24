import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, User, validateUser } from '@ibiri/db';

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

    // Create user object
    const newUser: User = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
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
