export type UserRole = 'admin' | 'security' | 'host' | 'visitor';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  pin?: string;
  gate?: string;
  department_id?: number | null;
  department_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Department {
  id: number;
  name: string;
  created_at?: string;
}

export type VisitStatus = 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out';

export interface Visit {
  id: number;
  visitor_id: number;
  visitor_name?: string;
  visitor_phone?: string;
  visitor_email?: string;
  visitor_org?: string;
  id_type?: string;
  id_number?: string;
  host_id: number | null;
  host_name?: string;
  host_email?: string;
  department_name?: string;
  purpose: string;
  expected_date: string;
  expected_time: string;
  duration: string;
  accompanying_count: number;
  vehicle_number?: string;
  notes?: string;
  status: VisitStatus;
  qr_token: string;
  qr_image?: string;
  check_in_at?: string | null;
  check_out_at?: string | null;
  created_at: string;
}

export interface Visitor {
  id: number;
  name: string;
  phone: string;
  email: string;
  organization: string;
  id_type: string;
  id_number: string;
  id_proof_url?: string;
  created_at: string;
  visits?: Visit[];
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: string;
  timestamp: string;
}
