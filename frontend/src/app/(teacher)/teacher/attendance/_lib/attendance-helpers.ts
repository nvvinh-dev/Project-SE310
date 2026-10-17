import { toApiError } from "@/lib/axios";
import type { AttendanceStatus } from "@/types/attendance";

// Đọc lỗi qua toApiError (ui-screens.md §4.2): có errors thì liệt kê từng dòng, không có thì lấy
// message của backend
export function readApiError(err: unknown): string {
  const apiErr = toApiError(err);
  return apiErr.errors && apiErr.errors.length > 0 ? apiErr.errors.join("\n") : apiErr.message;
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
