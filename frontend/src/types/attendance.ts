export type AttendanceStatus = "Present" | "AbsentExcused" | "AbsentUnexcused";

export interface HomeroomChildResponse {
  id: string;
  fullName: string;
  healthNotes: string | null;
}

export interface CheckInRequest {
  childId: string;
  status: AttendanceStatus;
}

export interface AttendanceResponse {
  id: string;
  childId: string;
  childFullName: string;
  attendanceDate: string; // "YYYY-MM-DD"
  checkInTimeUtc: string; // ISO string
  status: AttendanceStatus;
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  Present: "Có mặt",
  AbsentExcused: "Vắng có phép",
  AbsentUnexcused: "Vắng không phép",
};
