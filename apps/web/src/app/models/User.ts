import { ObjectId } from 'mongodb';

export interface BankAccount {
  accountNumber: string;
  name: string;
  type: 'checking' | 'savings';
  balance: number;
}

export interface CreditScore {
  score: number;
  date: Date;
  range: {
    min: 300;
    max: 850;
  };
  factors: string[];
  source: string;
}

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  creditScore: CreditScore[];
  bankAccount: BankAccount[];
  createdAt: Date;
  updatedAt: Date;
}

export function validateUser(user: Partial<User>): string | null {
  if (!user.email) {
    return 'Email is required';
  }
  if (!user.password) {
    return 'Password is required';
  }
  if (user.password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
}
