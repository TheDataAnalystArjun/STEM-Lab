export type Status = 'Active' | 'Completed';
export type Tab = 'check-in' | 'dashboard';

export interface AttendanceRecord {
  id: string;
  studentName: string;
  systemNumber: string;
  date: string; // ISO Date string YYYY-MM-DD
  checkInTime: string; // HH:mm
  checkOutTime?: string; // HH:mm
  durationMinutes?: number;
  status: Status;
  timestamp: number; // Unix timestamp for sorting
}

export interface Stats {
  totalSessions: number;
  activeNow: number;
  avgDuration: number;
  uniqueStudents: number;
}
