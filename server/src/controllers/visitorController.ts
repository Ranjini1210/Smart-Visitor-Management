import { Request, Response } from 'express';
import { VisitorRepository } from '../repositories/visitorRepository';
import { VisitRepository } from '../repositories/visitRepository';
import { AuthRequest } from '../middleware/auth';

export class VisitorController {
  static async getAll(req: Request, res: Response) {
    try {
      const visitors = await VisitorRepository.findAll();
      return res.json({ success: true, data: visitors });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const visitor = await VisitorRepository.findById(id);
      if (!visitor) {
        return res.status(404).json({ success: false, message: 'Visitor not found' });
      }

      // Fetch visit history for this visitor
      const allVisits = await VisitRepository.findAll();
      const visitorVisits = allVisits.filter((v) => v.visitor_id === id);

      return res.json({
        success: true,
        data: {
          ...visitor,
          visits: visitorVisits
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, phone, email, organization, id_type, id_number, id_proof_url } = req.body;
      if (!name || !phone || !email) {
        return res.status(400).json({ success: false, message: 'Name, phone, and email required' });
      }

      let visitor = await VisitorRepository.findByPhoneOrEmail(phone, email);
      if (!visitor) {
        visitor = await VisitorRepository.create({
          name,
          phone,
          email,
          organization: organization || 'Guest',
          id_type: id_type || 'Aadhaar / Govt ID',
          id_number: id_number || 'N/A',
          id_proof_url: id_proof_url || ''
        });
      }

      return res.status(201).json({ success: true, data: visitor });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await VisitorRepository.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Visitor not found' });
      }
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
