import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRepository } from '../repositories/userRepository';
import { AuthRequest } from '../middleware/auth';
import { AuditLogRepository } from '../repositories/auditLogRepository';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
      }

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash || '');
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const tokenPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

      await AuditLogRepository.log({
        user_id: user.id,
        action: 'USER_LOGIN',
        entity_type: 'USER',
        entity_id: user.id,
        details: `User ${user.email} logged in as ${user.role}`
      });

      const { password_hash, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      const user = await UserRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const { password_hash, ...userWithoutPassword } = user;
      return res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    if (req.user) {
      await AuditLogRepository.log({
        user_id: req.user.id,
        action: 'USER_LOGOUT',
        entity_type: 'USER',
        entity_id: req.user.id,
        details: `User ${req.user.email} logged out`
      });
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  }
}
