import { pool, isPostgresActive, memoryDb } from '../database/db';
import { AuditLog } from '../types';

export class AuditLogRepository {
  static async findAll(limit = 50): Promise<AuditLog[]> {
    if (isPostgresActive) {
      const res = await pool.query(`
        SELECT a.*, u.name as user_name
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.id DESC LIMIT $1
      `, [limit]);
      return res.rows;
    }
    return memoryDb.auditLogs
      .map((log) => {
        const u = memoryDb.users.find((usr) => usr.id === log.user_id);
        return { ...log, user_name: u?.name };
      })
      .sort((a, b) => b.id - a.id)
      .slice(0, limit);
  }

  static async log(data: {
    user_id?: number;
    action: string;
    entity_type: string;
    entity_id?: number;
    details?: string;
  }): Promise<AuditLog> {
    if (isPostgresActive) {
      const res = await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [data.user_id || null, data.action, data.entity_type, data.entity_id || null, data.details || null]
      );
      return res.rows[0];
    }
    const newLog: AuditLog = {
      id: memoryDb.auditLogs.length + 1,
      user_id: data.user_id,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      details: data.details,
      timestamp: new Date().toISOString()
    };
    memoryDb.auditLogs.push(newLog);
    return newLog;
  }
}
