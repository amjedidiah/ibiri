import { Db } from 'mongodb';
import clientPromise from './mongodb';

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
