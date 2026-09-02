import { pool, isPostgresActive, memoryDb } from '../database/db';
import { User } from '../types';

export class UserRepository {
  static async findAll(): Promise<User[]> {
    if (isPostgresActive) {
      const res = await pool.query(`
        SELECT u.id, u.name, u.email, u.role, u.department_id, u.phone, u.avatar_url, u.pin, u.gate, u.created_at, u.updated_at, d.name as department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        ORDER BY u.id ASC
      `);
      return res.rows;
    }
    return memoryDb.users.map((u) => {
      const dept = memoryDb.departments.find((d) => d.id === u.department_id);
      return { ...u, department_name: dept?.name };
    });
  }

  static async findByEmail(email: string): Promise<User | null> {
    const clean = String(email).trim().toLowerCase();
    if (isPostgresActive) {
      const res = await pool.query(`
        SELECT u.*, d.name as department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE LOWER(u.email) = $1
           OR (LOWER($1) = 'suresh.nair@campus.edu' AND LOWER(u.email) = 'security@campus.edu')
           OR (LOWER($1) = 'security@campus.edu' AND LOWER(u.email) = 'suresh.nair@campus.edu')
      `, [clean]);
      return res.rows[0] || null;
    }
    const user = memoryDb.users.find((u) => {
      const uEmail = u.email.toLowerCase();
      return uEmail === clean ||
        (clean === 'suresh.nair@campus.edu' && uEmail === 'security@campus.edu') ||
        (clean === 'security@campus.edu' && uEmail === 'suresh.nair@campus.edu');
    });
    if (!user) return null;
    const dept = memoryDb.departments.find((d) => d.id === user.department_id);
    return { ...user, department_name: dept?.name };
  }

  static async findById(id: number): Promise<User | null> {
    if (isPostgresActive) {
      const res = await pool.query(`
        SELECT u.*, d.name as department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.id = $1
      `, [id]);
      return res.rows[0] || null;
    }
    const user = memoryDb.users.find((u) => u.id === id);
    if (!user) return null;
    const dept = memoryDb.departments.find((d) => d.id === user.department_id);
    return { ...user, department_name: dept?.name };
  }

  static async create(userData: Partial<User>): Promise<User> {
    if (isPostgresActive) {
      const res = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, department_id, phone, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          userData.name,
          userData.email,
          userData.password_hash,
          userData.role || 'host',
          userData.department_id || null,
          userData.phone || '',
          userData.avatar_url || ''
        ]
      );
      return res.rows[0];
    }
    const newUser: User = {
      id: memoryDb.users.length + 1,
      name: userData.name || '',
      email: userData.email || '',
      password_hash: userData.password_hash || '',
      role: userData.role || 'host',
      department_id: userData.department_id || null,
      phone: userData.phone || '',
      avatar_url: userData.avatar_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryDb.users.push(newUser);
    return newUser;
  }
}
