import { toApiError } from "@/lib/axios";
import type { AttendanceStatus } from "@/types/attendance";

// Đọc lỗi qua toApiError (ui-screens.md §4.2): có errors thì liệt kê từng dòng, không có thì lấy
// message của backend
export function readApiError(err: unknown): string {
  const apiErr = toApiError(err);
  return apiErr.errors && apiErr.errors.length > 0 ? apiErr.errors.join("\n") : apiErr.message;
}

export function getTodayVietnamDateString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

export function formatVietnamDisplayDate(dateStr?: string): string {
  const date = dateStr ? new Date(`${dateStr}T00:00:00+07:00`) : new Date();
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatCheckInTime(isoTimeStr: string): string {
  try {
    const date = new Date(isoTimeStr);
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return "";
  }
}

export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

export interface AttendanceStats {
  total: number;
  present: number;
  absentExcused: number;
  absentUnexcused: number;
  unrecorded: number;
}

export function calculateAttendanceStats(
  totalChildren: number,
  recordedStatuses: (AttendanceStatus | undefined)[]
): AttendanceStats {
  let present = 0;
  let absentExcused = 0;
  let absentUnexcused = 0;

  for (const status of recordedStatuses) {
    if (status === "Present") present++;
    else if (status === "AbsentExcused") absentExcused++;
    else if (status === "AbsentUnexcused") absentUnexcused++;
  }

  const unrecorded = Math.max(0, totalChildren - (present + absentExcused + absentUnexcused));

  return {
    total: totalChildren,
    present,
    absentExcused,
    absentUnexcused,
    unrecorded,
  };
}
