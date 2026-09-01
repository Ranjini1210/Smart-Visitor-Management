import { pool, isPostgresActive, memoryDb } from '../database/db';
import { Visit, VisitStatus } from '../types';

export class VisitRepository {
  static async findAll(filters?: {
    status?: VisitStatus;
    hostId?: number;
    search?: string;
    date?: string;
  }): Promise<Visit[]> {
    if (isPostgresActive) {
      let query = `
        SELECT v.*,
               vis.name as visitor_name, vis.phone as visitor_phone, vis.email as visitor_email, vis.organization as visitor_org, vis.id_type, vis.id_number,
               u.name as host_name, u.email as host_email, d.name as department_name
        FROM visits v
        JOIN visitors vis ON v.visitor_id = vis.id
        LEFT JOIN users u ON v.host_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE 1=1
      `;
      const values: any[] = [];
      let idx = 1;

      if (filters?.status) {
        query += ` AND v.status = $${idx++}`;
        values.push(filters.status);
      }
      if (filters?.hostId) {
        query += ` AND v.host_id = $${idx++}`;
        values.push(filters.hostId);
      }
      if (filters?.search) {
        query += ` AND (LOWER(vis.name) LIKE $${idx} OR LOWER(vis.email) LIKE $${idx} OR LOWER(v.purpose) LIKE $${idx} OR LOWER(vis.organization) LIKE $${idx})`;
        values.push(`%${filters.search.toLowerCase()}%`);
        idx++;
      }
      if (filters?.date) {
        query += ` AND v.expected_date = $${idx++}`;
        values.push(filters.date);
      }

      query += ` ORDER BY v.id DESC`;

      const res = await pool.query(query, values);
      return res.rows;
    }

    // Memory DB implementation
    let results = memoryDb.visits.map((v) => {
      const vis = memoryDb.visitors.find((vi) => vi.id === v.visitor_id);
      const host = memoryDb.users.find((u) => u.id === v.host_id);
      const dept = host ? memoryDb.departments.find((d) => d.id === host.department_id) : undefined;

      return {
        ...v,
        visitor_name: vis?.name,
        visitor_phone: vis?.phone,
        visitor_email: vis?.email,
        visitor_org: vis?.organization,
        id_type: vis?.id_type,
        id_number: vis?.id_number,
        host_name: host?.name,
        host_email: host?.email,
        department_name: dept?.name
      };
    });

    if (filters?.status) {
      results = results.filter((r) => r.status === filters.status);
    }
    if (filters?.hostId) {
      results = results.filter((r) => r.host_id === filters.hostId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.visitor_name?.toLowerCase().includes(q) ||
          r.visitor_email?.toLowerCase().includes(q) ||
          r.purpose?.toLowerCase().includes(q) ||
          r.visitor_org?.toLowerCase().includes(q)
      );
    }
    if (filters?.date) {
      results = results.filter((r) => r.expected_date === filters.date);
    }

    return results.sort((a, b) => b.id - a.id);
  }

  static async findById(id: number): Promise<Visit | null> {
    const visits = await this.findAll();
    return visits.find((v) => v.id === id) || null;
  }

  static async findByQRToken(token: string): Promise<Visit | null> {
    const visits = await this.findAll();
    const cleanToken = token.trim();
    return (
      visits.find((v) => {
        if (v.qr_token === cleanToken) return true;
        if (v.qr_token.toLowerCase() === cleanToken.toLowerCase()) return true;
        const partsA = v.qr_token.split('-');
        const partsB = cleanToken.split('-');
        if (
          partsA.length >= 2 &&
          partsB.length >= 2 &&
          partsA[0] === 'SVM' &&
          partsB[0] === 'SVM' &&
          partsA[1] === partsB[1]
        ) {
          return true;
        }
        return false;
      }) || null
    );
  }

  static async create(data: Partial<Visit>): Promise<Visit> {
    if (isPostgresActive) {
      const res = await pool.query(
        `INSERT INTO visits (visitor_id, host_id, purpose, expected_date, expected_time, duration, accompanying_count, vehicle_number, notes, status, qr_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          data.visitor_id,
          data.host_id || null,
          data.purpose,
          data.expected_date,
          data.expected_time,
          data.duration || '1 Hour',
          data.accompanying_count || 0,
          data.vehicle_number || null,
          data.notes || null,
          data.status || 'pending',
          data.qr_token
        ]
      );
      return res.rows[0];
    }
    const nextId = (memoryDb.visits.length > 0 ? Math.max(...memoryDb.visits.map((v) => v.id)) : 0) + 1;
    const newVisit: Visit = {
      id: nextId,
      visitor_id: data.visitor_id!,
      host_id: data.host_id || null,
      purpose: data.purpose || 'Meeting',
      expected_date: data.expected_date || new Date().toISOString().split('T')[0],
      expected_time: data.expected_time || '10:00 AM',
      duration: data.duration || '1 Hour',
      accompanying_count: data.accompanying_count || 0,
      vehicle_number: data.vehicle_number || '',
      notes: data.notes || '',
      status: data.status || 'pending',
      qr_token: data.qr_token || `SVM-${nextId}-DEFAULT`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryDb.visits.push(newVisit);
    return newVisit;
  }

  static async updateStatus(id: number, status: VisitStatus, extraData?: { check_in_at?: string; check_out_at?: string }): Promise<Visit | null> {
    if (isPostgresActive) {
      const res = await pool.query(
        `UPDATE visits
         SET status = $1,
             check_in_at = COALESCE($2, check_in_at),
             check_out_at = COALESCE($3, check_out_at),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [status, extraData?.check_in_at || null, extraData?.check_out_at || null, id]
      );
      return res.rows[0] || null;
    }

    const index = memoryDb.visits.findIndex((v) => v.id === id);
    if (index === -1) return null;

    memoryDb.visits[index] = {
      ...memoryDb.visits[index],
      status,
      ...(extraData?.check_in_at ? { check_in_at: extraData.check_in_at } : {}),
      ...(extraData?.check_out_at ? { check_out_at: extraData.check_out_at } : {}),
      updated_at: new Date().toISOString()
    };

    return (await this.findById(id))!;
  }
}
