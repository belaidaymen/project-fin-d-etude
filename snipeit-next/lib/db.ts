import { Pool } from "pg";

const globalForPool = globalThis as unknown as { pgPool: Pool | undefined };

export const db =
  globalForPool.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") globalForPool.pgPool = db;

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await db.query(text, params);
  return res.rows as T[];
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const res = await db.query(text, params);
  return (res.rows[0] as T) ?? null;
}

export async function queryCount(text: string, params?: any[]): Promise<number> {
  const res = await db.query(text, params);
  return parseInt(res.rows[0]?.count ?? "0", 10);
}
