import { Db } from 'mongodb';
import { User } from './models/User';
import clientPromise from './lib/mongodb';

let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    const client = await clientPromise;
    db = client.db(process.env['MONGODB_DB_NAME']);
    return db;
  } catch (error) {
    console.error('Failed to connect to the database', error);
    throw new Error('Failed to connect to the database');
  }
}

export async function getUserByAccountNumber(accountNumber: string) {
  const db = await getDb();
  const user = await db
    .collection('users')
    .findOne({ 'bankAccount.accountNumber': accountNumber });
  return user as User | null;
}

export async function updateUserBalance(
  accountNumber: string,
  newBalance: number
) {
  const db = await getDb();
  await db
    .collection('users')
    .updateOne(
      { 'bankAccount.accountNumber': accountNumber },
      { $set: { 'bankAccount.$.balance': newBalance } }
    );
}

export * from './models/User';
