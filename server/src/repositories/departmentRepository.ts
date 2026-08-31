import { pool, isPostgresActive, memoryDb } from '../database/db';
import { Department } from '../types';

export class DepartmentRepository {
  static async findAll(): Promise<Department[]> {
    if (isPostgresActive) {
      const res = await pool.query('SELECT * FROM departments ORDER BY name ASC');
      return res.rows;
    }
    return [...memoryDb.departments].sort((a, b) => a.name.localeCompare(b.name));
  }

  static async findById(id: number): Promise<Department | null> {
    if (isPostgresActive) {
      const res = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    return memoryDb.departments.find((d) => d.id === id) || null;
  }

  static async create(name: string): Promise<Department> {
    if (isPostgresActive) {
      const res = await pool.query(
        'INSERT INTO departments (name) VALUES ($1) RETURNING *',
        [name]
      );
      return res.rows[0];
    }
    const newDept: Department = {
      id: memoryDb.departments.length + 1,
      name,
      created_at: new Date().toISOString()
    };
    memoryDb.departments.push(newDept);
    return newDept;
  }
}
