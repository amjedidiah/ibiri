import { Db } from 'mongodb';
import clientPromise from './mongodb';
import { User } from '../app/models/User';

let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    const client = await clientPromise;
    db = client.db(process.env.NEXT_PUBLIC_MONGODB_DB_NAME);
    return db;
  } catch (error) {
    console.error('Failed to connect to the database', error);
    throw new Error('Failed to connect to the database');
  }
}

export async function getUserByAccountNumber(accountNumber: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ 'bankAccount.accountNumber': accountNumber }) as User | null;
  return user;
}

export async function updateUserBalance(accountNumber: string, newBalance: number): Promise<void> {
  const db = await getDb();
  await db.collection('users').updateOne(
    { 'bankAccount.accountNumber': accountNumber },
    { $set: { 'bankAccount.$.balance': newBalance } }
  );
}
