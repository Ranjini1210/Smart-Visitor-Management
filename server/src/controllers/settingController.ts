import { Request, Response } from 'express';
import { DepartmentRepository } from '../repositories/departmentRepository';
import { UserRepository } from '../repositories/userRepository';
import { AuditLogRepository } from '../repositories/auditLogRepository';
import { AuthRequest } from '../middleware/auth';

export class SettingController {
  static async getDepartments(req: Request, res: Response) {
    try {
      const depts = await DepartmentRepository.findAll();
      return res.json({ success: true, data: depts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createDepartment(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Department name required' });
      const dept = await DepartmentRepository.create(name);
      return res.status(201).json({ success: true, data: dept });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getHosts(req: Request, res: Response) {
    try {
      const users = await UserRepository.findAll();
      const hosts = users
        .filter((u) => u.role === 'host' || u.role === 'admin')
        .map(({ password_hash, ...u }) => u);
      return res.json({ success: true, data: hosts });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await AuditLogRepository.findAll(100);
      return res.json({ success: true, data: logs });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
