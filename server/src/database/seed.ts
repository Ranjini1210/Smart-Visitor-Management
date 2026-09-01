import bcrypt from 'bcryptjs';
import { initializeDatabase, isPostgresActive, pool, memoryDb } from './db';
import { generateQRToken } from '../utils/qr';

export async function seedData() {
  console.log('🌱 Seeding Smart Visitor Management System demo data...');

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const securityHash = await bcrypt.hash('Security@123', 10);
  const hostHash = await bcrypt.hash('Host@123', 10);
  const visitorHash = await bcrypt.hash('Visitor@123', 10);

  const defaultDepts = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Administration & Dean Office',
    'Admissions & Human Resources',
    'Research & Innovation Cell',
    'Facilities & Maintenance'
  ];

  if (isPostgresActive) {
    try {
      // Seed Departments
      for (const deptName of defaultDepts) {
        await pool.query(
          'INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [deptName]
        );
      }

      // Seed Users
      const usersData = [
        { name: 'Dr. Rajesh Sharma', email: 'admin@campus.edu', password_hash: passwordHash, pin: '1234', role: 'admin' as const, department_id: 3, phone: '+91 98765 43210', gate: 'Administration HQ' },
        { name: 'Prof. Ananya Verma', email: 'ananya.verma@campus.edu', password_hash: hostHash, pin: '1111', role: 'host' as const, department_id: 1, phone: '+91 98765 43212', gate: 'Computer Science Dept' },
        { name: 'Dr. Vikramaditya Rao', email: 'vikram.rao@campus.edu', password_hash: hostHash, pin: '2222', role: 'host' as const, department_id: 5, phone: '+91 98765 43213', gate: 'Research & Innovation' },
        { name: 'Prof. Meera Nambiar', email: 'meera.nambiar@campus.edu', password_hash: hostHash, pin: '3333', role: 'host' as const, department_id: 2, phone: '+91 98765 43214', gate: 'ECE Department' },
        { name: 'Dr. Arjun Sengupta', email: 'arjun.sengupta@campus.edu', password_hash: hostHash, pin: '4444', role: 'host' as const, department_id: 4, phone: '+91 98765 43215', gate: 'Admissions & HR' },
        { name: 'Officer Suresh Nair', email: 'security@campus.edu', password_hash: securityHash, pin: '5555', role: 'security' as const, department_id: 6, phone: '+91 98765 43211', gate: 'Main Entrance (Gate 1)' },
        { name: 'Officer Kavita Deshmukh', email: 'kavita.deshmukh@campus.edu', password_hash: securityHash, pin: '6666', role: 'security' as const, department_id: 6, phone: '+91 98765 43216', gate: 'North Tower (Gate 2)' },
        { name: 'Guest Visitor', email: 'visitor@campus.edu', password_hash: visitorHash, pin: '0000', role: 'visitor' as const, department_id: null, phone: '+91 91234 56789', gate: 'Visitor Self-Service' }
      ];

      for (const u of usersData) {
        await pool.query(
          `INSERT INTO users (name, email, password_hash, role, department_id, phone)
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING`,
          [u.name, u.email, u.password_hash, u.role, u.department_id, u.phone]
        );
      }

      // Seed Visitors
      const visitorsData = [
        { name: 'Rahul Sharma', phone: '+91 91234 56789', email: 'visitor@campus.edu', organization: 'TechCorp Solutions', id_type: 'Aadhaar Card', id_number: '5489 1234 9876' },
        { name: 'Priya Patel', phone: '+91 98111 22233', email: 'priya.patel@innovate.org', organization: 'Innovate AI Labs', id_type: 'PAN Card', id_number: 'ABCDE1234F' },
        { name: 'Arun Kumar', phone: '+91 97222 33344', email: 'arun.k@logistics.com', organization: 'BlueDart Courier', id_type: 'Driving License', id_number: 'DL-1420110012345' },
        { name: 'Sunita Rao', phone: '+91 96333 44455', email: 'sunita.rao@eduforum.in', organization: 'National Education Council', id_type: 'Passport', id_number: 'Z9876543' },
        { name: 'Rohan Mehta', phone: '+91 95444 55566', email: 'rohan.mehta@vendor.co', organization: 'Siemens Engineering', id_type: 'Voter ID', id_number: 'XYZ9876543' }
      ];

      for (const vis of visitorsData) {
        await pool.query(
          `INSERT INTO visitors (name, phone, email, organization, id_type, id_number)
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
          [vis.name, vis.phone, vis.email, vis.organization, vis.id_type, vis.id_number]
        );
      }

      // Seed Visits
      const todayStr = new Date().toISOString().split('T')[0];
      const visitsData = [
        {
          visitor_id: 1, host_id: 3, purpose: 'Interview', expected_date: todayStr, expected_time: '10:30 AM',
          duration: '2 Hours', accompanying_count: 0, vehicle_number: 'KA-01-AB-1234', notes: 'Campus Placement Interview',
          status: 'checked_in', qr_token: generateQRToken(101), check_in_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          visitor_id: 2, host_id: 3, purpose: 'Meeting', expected_date: todayStr, expected_time: '11:45 AM',
          duration: '1 Hour', accompanying_count: 1, vehicle_number: 'KA-03-CD-5678', notes: 'Research Collaboration Proposal',
          status: 'approved', qr_token: generateQRToken(102)
        },
        {
          visitor_id: 3, host_id: 1, purpose: 'Delivery', expected_date: todayStr, expected_time: '02:00 PM',
          duration: '30 Mins', accompanying_count: 0, vehicle_number: 'KA-05-EF-9012', notes: 'Lab Hardware Components',
          status: 'pending', qr_token: generateQRToken(103)
        },
        {
          visitor_id: 4, host_id: 4, purpose: 'Guest Lecture', expected_date: todayStr, expected_time: '03:30 PM',
          duration: '3 Hours', accompanying_count: 2, vehicle_number: 'KA-02-GH-3456', notes: 'Keynote Speaker on Quantum Computing',
          status: 'approved', qr_token: generateQRToken(104)
        },
        {
          visitor_id: 5, host_id: 3, purpose: 'Maintenance', expected_date: todayStr, expected_time: '09:00 AM',
          duration: '1.5 Hours', accompanying_count: 1, vehicle_number: 'KA-04-IJ-7890', notes: 'AC Service in Server Room',
          status: 'checked_out', qr_token: generateQRToken(105), check_in_at: new Date(Date.now() - 7200000).toISOString(), check_out_at: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      for (const v of visitsData) {
        await pool.query(
          `INSERT INTO visits (visitor_id, host_id, purpose, expected_date, expected_time, duration, accompanying_count, vehicle_number, notes, status, qr_token, check_in_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (qr_token) DO NOTHING`,
          [v.visitor_id, v.host_id, v.purpose, v.expected_date, v.expected_time, v.duration, v.accompanying_count, v.vehicle_number, v.notes, v.status, v.qr_token, v.check_in_at || null]
        );
      }

      console.log('✅ PostgreSQL database seeded successfully.');
      return;
    } catch (err) {
      console.error('PostgreSQL seed error, falling back to memory seed:', err);
    }
  }

  // Populate memoryDb
  memoryDb.departments = defaultDepts.map((name, idx) => ({
    id: idx + 1,
    name,
    created_at: new Date().toISOString()
  }));

  memoryDb.users = [
    { id: 1, name: 'Dr. Rajesh Sharma', email: 'admin@campus.edu', password_hash: passwordHash, pin: '1234', role: 'admin', department_id: 3, phone: '+91 98765 43210', gate: 'Administration HQ', created_at: new Date().toISOString() },
    { id: 2, name: 'Prof. Ananya Verma', email: 'ananya.verma@campus.edu', password_hash: hostHash, pin: '1111', role: 'host', department_id: 1, phone: '+91 98765 43212', gate: 'Computer Science Dept', created_at: new Date().toISOString() },
    { id: 3, name: 'Dr. Vikramaditya Rao', email: 'vikram.rao@campus.edu', password_hash: hostHash, pin: '2222', role: 'host', department_id: 5, phone: '+91 98765 43213', gate: 'Research & Innovation', created_at: new Date().toISOString() },
    { id: 4, name: 'Prof. Meera Nambiar', email: 'meera.nambiar@campus.edu', password_hash: hostHash, pin: '3333', role: 'host', department_id: 2, phone: '+91 98765 43214', gate: 'ECE Department', created_at: new Date().toISOString() },
    { id: 5, name: 'Dr. Arjun Sengupta', email: 'arjun.sengupta@campus.edu', password_hash: hostHash, pin: '4444', role: 'host', department_id: 4, phone: '+91 98765 43215', gate: 'Admissions & HR', created_at: new Date().toISOString() },
    { id: 6, name: 'Officer Suresh Nair', email: 'security@campus.edu', password_hash: securityHash, pin: '5555', role: 'security', department_id: 6, phone: '+91 98765 43211', gate: 'Main Entrance (Gate 1)', created_at: new Date().toISOString() },
    { id: 7, name: 'Officer Kavita Deshmukh', email: 'kavita.deshmukh@campus.edu', password_hash: securityHash, pin: '6666', role: 'security', department_id: 6, phone: '+91 98765 43216', gate: 'North Tower (Gate 2)', created_at: new Date().toISOString() },
    { id: 8, name: 'Guest Visitor', email: 'visitor@campus.edu', password_hash: visitorHash, pin: '0000', role: 'visitor', department_id: null, phone: '+91 91234 56789', gate: 'Visitor Self-Service', created_at: new Date().toISOString() }
  ];

  memoryDb.visitors = [
    { id: 1, name: 'Rahul Sharma', phone: '+91 91234 56789', email: 'visitor@campus.edu', organization: 'TechCorp Solutions', id_type: 'Aadhaar Card', id_number: '5489 1234 9876', created_at: new Date().toISOString() },
    { id: 2, name: 'Priya Patel', phone: '+91 98111 22233', email: 'priya.patel@innovate.org', organization: 'Innovate AI Labs', id_type: 'PAN Card', id_number: 'ABCDE1234F', created_at: new Date().toISOString() },
    { id: 3, name: 'Arun Kumar', phone: '+91 97222 33344', email: 'arun.k@logistics.com', organization: 'BlueDart Courier', id_type: 'Driving License', id_number: 'DL-1420110012345', created_at: new Date().toISOString() },
    { id: 4, name: 'Sunita Rao', phone: '+91 96333 44455', email: 'sunita.rao@eduforum.in', organization: 'National Education Council', id_type: 'Passport', id_number: 'Z9876543', created_at: new Date().toISOString() },
    { id: 5, name: 'Rohan Mehta', phone: '+91 95444 55566', email: 'rohan.mehta@vendor.co', organization: 'Siemens Engineering', id_type: 'Voter ID', id_number: 'XYZ9876543', created_at: new Date().toISOString() }
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  memoryDb.visits = [
    {
      id: 1, visitor_id: 1, host_id: 3, purpose: 'Interview', expected_date: todayStr, expected_time: '10:30 AM',
      duration: '2 Hours', accompanying_count: 0, vehicle_number: 'KA-01-AB-1234', notes: 'Campus Placement Interview',
      status: 'checked_in', qr_token: generateQRToken(1), check_in_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString()
    },
    {
      id: 2, visitor_id: 2, host_id: 3, purpose: 'Meeting', expected_date: todayStr, expected_time: '11:45 AM',
      duration: '1 Hour', accompanying_count: 1, vehicle_number: 'KA-03-CD-5678', notes: 'Research Collaboration Proposal',
      status: 'approved', qr_token: generateQRToken(2), created_at: new Date().toISOString()
    },
    {
      id: 3, visitor_id: 3, host_id: 1, purpose: 'Delivery', expected_date: todayStr, expected_time: '02:00 PM',
      duration: '30 Mins', accompanying_count: 0, vehicle_number: 'KA-05-EF-9012', notes: 'Lab Hardware Components',
      status: 'pending', qr_token: generateQRToken(3), created_at: new Date().toISOString()
    },
    {
      id: 4, visitor_id: 4, host_id: 4, purpose: 'Guest Lecture', expected_date: todayStr, expected_time: '03:30 PM',
      duration: '3 Hours', accompanying_count: 2, vehicle_number: 'KA-02-GH-3456', notes: 'Keynote Speaker on Quantum Computing',
      status: 'approved', qr_token: generateQRToken(4), created_at: new Date().toISOString()
    },
    {
      id: 5, visitor_id: 5, host_id: 3, purpose: 'Maintenance', expected_date: todayStr, expected_time: '09:00 AM',
      duration: '1.5 Hours', accompanying_count: 1, vehicle_number: 'KA-04-IJ-7890', notes: 'AC Service in Server Room',
      status: 'checked_out', qr_token: generateQRToken(5), check_in_at: new Date(Date.now() - 7200000).toISOString(), check_out_at: new Date(Date.now() - 1800000).toISOString(), created_at: new Date().toISOString()
    }
  ];

  memoryDb.notifications = [
    { id: 1, user_id: 3, title: 'Visitor Checked In', message: 'Rahul Sharma (TechCorp Solutions) checked in at Gate 1.', type: 'success', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, user_id: 3, title: 'Visit Request Pending', message: 'Priya Patel requested a meeting for 11:45 AM today.', type: 'info', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, user_id: 1, title: 'New Registration Alert', message: 'Arun Kumar (BlueDart) registered for delivery visit.', type: 'info', is_read: false, created_at: new Date(Date.now() - 1800000).toISOString() }
  ];

  memoryDb.auditLogs = [
    { id: 1, user_id: 2, action: 'VISITOR_CHECKED_IN', entity_type: 'VISIT', entity_id: 1, details: 'Rahul Sharma checked in at Security Desk 1', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, user_id: 3, action: 'VISIT_APPROVED', entity_type: 'VISIT', entity_id: 2, details: 'Priya Patel visit approved by Prof. Ananya Verma', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, user_id: 1, action: 'SYSTEM_STARTUP', entity_type: 'SYSTEM', entity_id: 1, details: 'Smart Visitor Management System booted up cleanly', timestamp: new Date().toISOString() }
  ];

  console.log('✅ Resilient in-memory demo dataset populated successfully.');
}
