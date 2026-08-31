import { pool, isPostgresActive, memoryDb } from '../database/db';
import { Visitor } from '../types';

export class VisitorRepository {
  static async findAll(): Promise<Visitor[]> {
    if (isPostgresActive) {
      const res = await pool.query('SELECT * FROM visitors ORDER BY id DESC');
      return res.rows;
    }
    return [...memoryDb.visitors].sort((a, b) => b.id - a.id);
  }

  static async findById(id: number): Promise<Visitor | null> {
    if (isPostgresActive) {
      const res = await pool.query('SELECT * FROM visitors WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    return memoryDb.visitors.find((v) => v.id === id) || null;
  }

  static async findByPhoneOrEmail(phone: string, email: string): Promise<Visitor | null> {
    if (isPostgresActive) {
      const res = await pool.query(
        'SELECT * FROM visitors WHERE phone = $1 OR LOWER(email) = LOWER($2)',
        [phone, email]
      );
      return res.rows[0] || null;
    }
    return (
      memoryDb.visitors.find(
        (v) => v.phone === phone || v.email.toLowerCase() === email.toLowerCase()
      ) || null
    );
  }

  static async create(data: Partial<Visitor>): Promise<Visitor> {
    if (isPostgresActive) {
      const res = await pool.query(
        `INSERT INTO visitors (name, phone, email, organization, id_type, id_number, id_proof_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          data.name,
          data.phone,
          data.email,
          data.organization,
          data.id_type,
          data.id_number,
          data.id_proof_url || null
        ]
      );
      return res.rows[0];
    }
    const newVisitor: Visitor = {
      id: memoryDb.visitors.length + 1,
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      organization: data.organization || '',
      id_type: data.id_type || 'Aadhaar / Govt ID',
      id_number: data.id_number || '',
      id_proof_url: data.id_proof_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryDb.visitors.push(newVisitor);
    return newVisitor;
  }

  static async update(id: number, data: Partial<Visitor>): Promise<Visitor | null> {
    if (isPostgresActive) {
      const res = await pool.query(
        `UPDATE visitors
         SET name = COALESCE($1, name),
             phone = COALESCE($2, phone),
             email = COALESCE($3, email),
             organization = COALESCE($4, organization),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 RETURNING *`,
        [data.name, data.phone, data.email, data.organization, id]
      );
      return res.rows[0] || null;
    }
    const index = memoryDb.visitors.findIndex((v) => v.id === id);
    if (index === -1) return null;
    memoryDb.visitors[index] = {
      ...memoryDb.visitors[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    return memoryDb.visitors[index];
  }
}
