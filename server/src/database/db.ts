import { Pool } from 'pg';
import { config } from '../config';
import fs from 'fs';
import path from 'path';
import { User, Visitor, Visit, Department, Approval, Notification, AuditLog } from '../types';

export const pool = new Pool({
  connectionString: config.postgres.connectionString,
  connectionTimeoutMillis: 1000
});

// Suppress unhandled pool background error events when PG is not connected
pool.on('error', () => {
  isPostgresActive = false;
});

export let isPostgresActive = false;

// Fallback in-memory state store for instant dev/offline execution
export const memoryDb = {
  departments: [] as Department[],
  users: [] as User[],
  visitors: [] as Visitor[],
  visits: [] as Visit[],
  approvals: [] as Approval[],
  notifications: [] as Notification[],
  auditLogs: [] as AuditLog[]
};

export async function initializeDatabase() {
  // Only attempt PostgreSQL connection if explicitly configured with remote database
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_HOST) {
    isPostgresActive = false;
    return;
  }

  try {
    const connectPromise = pool.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), 1000)
    );
    const client = (await Promise.race([connectPromise, timeoutPromise])) as any;
    console.log('✅ PostgreSQL connected successfully.');
    isPostgresActive = true;
    
    // Execute init.sql schema
    const initPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(initPath)) {
      const schemaSql = fs.readFileSync(initPath, 'utf-8');
      await client.query(schemaSql);
    }
    client.release();
    console.log('✅ PostgreSQL schema initialized.');
  } catch (err: any) {
    isPostgresActive = false;
    console.log('ℹ️ PostgreSQL not reachable. Running on resilient in-memory database mode.');
  }
}

