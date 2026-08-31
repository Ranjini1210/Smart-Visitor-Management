import { pool, isPostgresActive, memoryDb } from '../database/db';
import { Notification } from '../types';

export class NotificationRepository {
  static async findByUserId(userId: number): Promise<Notification[]> {
    if (isPostgresActive) {
      const res = await pool.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY id DESC LIMIT 50',
        [userId]
      );
      return res.rows;
    }
    return memoryDb.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => b.id - a.id);
  }

  static async create(data: {
    user_id: number;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'alert';
  }): Promise<Notification> {
    if (isPostgresActive) {
      const res = await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.user_id, data.title, data.message, data.type || 'info']
      );
      return res.rows[0];
    }
    const newNotif: Notification = {
      id: memoryDb.notifications.length + 1,
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      is_read: false,
      created_at: new Date().toISOString()
    };
    memoryDb.notifications.push(newNotif);
    return newNotif;
  }

  static async markAsRead(id: number): Promise<boolean> {
    if (isPostgresActive) {
      const res = await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = $1',
        [id]
      );
      return (res.rowCount || 0) > 0;
    }
    const notif = memoryDb.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  }
}
