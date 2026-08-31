import { Pool } from 'pg';
import { config } from '../config';
import fs from 'fs';
import path from 'path';
import { User, Visitor, Visit, Department, Approval, Notification, AuditLog } from '../types';

export const pool = new Pool({
  connectionString: config.postgres.connectionString,
  connectionTimeoutMillis: 2000
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
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully.');
    isPostgresActive = true;
    
    // Execute init.sql schema
    const schemaSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    await client.query(schemaSql);
    client.release();
    console.log('✅ PostgreSQL schema initialized.');
  } catch (err: any) {
    isPostgresActive = false;
    console.log('ℹ️ PostgreSQL not reachable. Running on resilient in-memory database mode.');
  }
}
