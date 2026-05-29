export type AttendanceStatus = 'Unmarked' | 'Present' | 'Absent' | 'Late';

export interface StudentMarks {
  pronunciation: number; // 0-6
  vocabulary: number; // 0-6
  ideas: number; // 0-6
  communication: number; // 0-6
  individualResponse: number; // 0-6
  total: number; // sum or calculated
  remarks: string;
  marked: boolean; // whether marks are submitted
}

export interface Student {
  id: number;
  class: string;
  no: number;
  ename: string;
  seq: number;
  session: string;
  group: number;
  reportTime: string; // e.g. "08:10"
  date: string; // e.g. "2026-06-11"
  attendance: AttendanceStatus;
  marks: StudentMarks;
}

export interface ExamSessionInfo {
  session: string;
  prepTime: string; // e.g. "08:20-08:30"
  examTime: string; // e.g. "08:35-08:50"
  groups: number[];
}

export interface HistoryAction {
  id: string; // unique ID of the state change
  studentId: number;
  studentName: string;
  type: 'attendance' | 'marks';
  description: string;
  prevAttendance?: AttendanceStatus;
  newAttendance?: AttendanceStatus;
  prevMarks?: StudentMarks;
  newMarks?: StudentMarks;
  timestamp: number;
}
