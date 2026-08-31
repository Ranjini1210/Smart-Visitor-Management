-- Seed Data for Smart Visitor Management System

-- Departments
INSERT INTO departments (id, name, code) VALUES
('dept-cs', 'Computer Science & Engineering', 'CSE'),
('dept-hr', 'Human Resources & Talent', 'HR'),
('dept-admin', 'Campus Administration', 'ADMIN'),
('dept-rnd', 'Research & Development', 'RND')
ON CONFLICT (id) DO NOTHING;

-- Users (Password for all demo users: admin123 / password123)
-- Hashes below are for 'password123'
INSERT INTO users (id, name, email, password_hash, role, department_id, phone, avatar_url) VALUES
('user-admin-1', 'Dr. Rajesh Sharma', 'admin@campus.edu', '$2a$10$wO3kI.4FzZ9.yS9gSj1xX.2n3P2WlK1r3gV7w3l2a1S1W2X3Y4Z5', 'ADMIN', 'dept-admin', '+91 98765 43210', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('user-guard-1', 'Inspector Suresh Kumar', 'security@campus.edu', '$2a$10$wO3kI.4FzZ9.yS9gSj1xX.2n3P2WlK1r3gV7w3l2a1S1W2X3Y4Z5', 'SECURITY_GUARD', 'dept-admin', '+91 98765 43211', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('user-host-1', 'Prof. Ananya Verma', 'ananya.verma@campus.edu', '$2a$10$wO3kI.4FzZ9.yS9gSj1xX.2n3P2WlK1r3gV7w3l2a1S1W2X3Y4Z5', 'HOST', 'dept-cs', '+91 98765 43212', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('user-host-2', 'Dr. Vikram Rao', 'vikram.rao@campus.edu', '$2a$10$wO3kI.4FzZ9.yS9gSj1xX.2n3P2WlK1r3gV7w3l2a1S1W2X3Y4Z5', 'HOST', 'dept-rnd', '+91 98765 43213', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('user-host-3', 'Sunita Nair', 'sunita.nair@campus.edu', '$2a$10$wO3kI.4FzZ9.yS9gSj1xX.2n3P2WlK1r3gV7w3l2a1S1W2X3Y4Z5', 'HOST', 'dept-hr', '+91 98765 43214', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('user-visitor-1', 'Rahul Mehta', 'rahul.mehta@techcorp.com', '$2a$10$wO3kI.4FzZ9.yS9gSj1xX.2n3P2WlK1r3gV7w3l2a1S1W2X3Y4Z5', 'VISITOR', NULL, '+91 98123 45678', NULL)
ON CONFLICT (id) DO NOTHING;

-- Visitors
INSERT INTO visitors (id, name, phone, email, organization, id_type, id_number) VALUES
('vis-1', 'Rahul Mehta', '+91 98123 45678', 'rahul.mehta@techcorp.com', 'TechCorp Solutions', 'Aadhaar Card', '4321 8765 1098'),
('vis-2', 'Priya Patel', '+91 97234 56789', 'priya.p@innovate.in', 'Innovate Labs', 'PAN Card', 'ABCDE1234F'),
('vis-3', 'Arun Kumar', '+91 96345 67890', 'arun.k@logistics.com', 'Express Logistics', 'Driving License', 'DL-1420110012345'),
('vis-4', 'Sneha Reddy', '+91 95456 78901', 'sneha.r@designstudio.io', 'Creative Studio', 'Passport', 'Z9876543'),
('vis-5', 'Amit Joshi', '+91 94567 89012', 'amit.j@buildtech.com', 'BuildTech Engineering', 'Aadhaar Card', '9876 5432 1012'),
('vis-6', 'Meera Nair', '+91 93678 90123', 'meera.nair@university.edu', 'Delhi University', 'Voter ID', 'VT1234567')
ON CONFLICT (id) DO NOTHING;

-- Visits
INSERT INTO visits (id, visitor_id, host_id, purpose, expected_date, expected_time, duration, accompanying_count, vehicle_number, status, qr_token, check_in_at, check_out_at, created_at) VALUES
('visit-101', 'vis-1', 'user-host-1', 'Campus Placement Interview', CURRENT_DATE, '10:00 AM', 90, 1, 'KA-01-MJ-4321', 'CHECKED_IN', 'QR-TOKEN-VIS-101-RAHUL', CURRENT_TIMESTAMP - INTERVAL '45 minutes', NULL, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('visit-102', 'vis-2', 'user-host-2', 'Research Collaboration Meeting', CURRENT_DATE, '11:30 AM', 120, 0, 'MH-02-CB-1234', 'APPROVED', 'QR-TOKEN-VIS-102-PRIYA', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('visit-103', 'vis-3', 'user-host-3', 'Equipment Delivery & Inspection', CURRENT_DATE, '09:15 AM', 45, 2, 'DL-03-XX-9999', 'CHECKED_OUT', 'QR-TOKEN-VIS-103-ARUN', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('visit-104', 'vis-4', 'user-host-1', 'Guest Lecture & Workshop', CURRENT_DATE, '02:00 PM', 180, 0, NULL, 'PENDING', 'QR-TOKEN-VIS-104-SNEHA', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
('visit-105', 'vis-5', 'user-host-2', 'Facility Maintenance Audit', CURRENT_DATE - INTERVAL '1 day', '10:00 AM', 60, 1, 'KA-05-AA-5555', 'CHECKED_OUT', 'QR-TOKEN-VIS-105-AMIT', CURRENT_TIMESTAMP - INTERVAL '26 hours', CURRENT_TIMESTAMP - INTERVAL '25 hours', CURRENT_TIMESTAMP - INTERVAL '28 hours'),
('visit-106', 'vis-6', 'user-host-3', 'Personal Visit', CURRENT_DATE, '03:00 PM', 60, 0, NULL, 'REJECTED', 'QR-TOKEN-VIS-106-MEERA', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- Approvals
INSERT INTO approvals (id, visit_id, approved_by, status, reason) VALUES
('app-1', 'visit-101', 'user-host-1', 'APPROVED', 'Approved for Placement Interview in CSE Block Room 302'),
('app-2', 'visit-102', 'user-host-2', 'APPROVED', 'Approved for R&D project discussion'),
('app-3', 'visit-103', 'user-host-3', 'APPROVED', 'Verified equipment delivery vendor pass'),
('app-4', 'visit-106', 'user-host-3', 'REJECTED', 'Host unavailable during requested time window')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
('notif-1', 'user-admin-1', 'High Visitor Density', '5 new visitor registrations approved today.', 'INFO', false, CURRENT_TIMESTAMP - INTERVAL '10 minutes'),
('notif-2', 'user-host-1', 'Visitor Arrived', 'Rahul Mehta has checked in at Main Gate Security.', 'SUCCESS', false, CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
('notif-3', 'user-guard-1', 'Upcoming Expected Visitor', 'Priya Patel is expected at 11:30 AM for R&D Dept.', 'WARNING', true, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('notif-4', 'user-host-1', 'New Visitor Request', 'Sneha Reddy requested a visit for Guest Lecture at 02:00 PM.', 'INFO', false, CURRENT_TIMESTAMP - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;
