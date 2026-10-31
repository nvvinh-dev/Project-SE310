// Ngày giờ hiển thị theo giờ Việt Nam, không theo múi giờ của máy (ui-screens.md §4.4,
// frontend-conventions.md §6). Dùng chung cho mọi vai trò.

export const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

// "Hôm nay" theo giờ Việt Nam, dạng yyyy-MM-dd để gửi tham số date. Không dùng toISOString():
// đó là ngày theo UTC, trước 7 giờ sáng giờ Việt Nam sẽ ra ngày hôm qua
export function getTodayVietnamDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Lấy thời điểm hiện tại theo giờ Việt Nam dạng YYYY-MM-DDTHH:mm
 * dùng cho input datetime-local.
 * @param bufferMinutes Số phút đệm thêm (mặc định 0).
 */
export function getNowVietnamDateTimeLocal(bufferMinutes: number = 0): string {
  const targetDate = new Date(Date.now() + bufferMinutes * 60 * 1000);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(targetDate);
  const find = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${find("year")}-${find("month")}-${find("day")}T${find("hour")}:${find("minute")}`;
}

/**
 * Đổi chuỗi YYYY-MM-DDTHH:mm (giờ Việt Nam) sang chuỗi ISO có múi giờ +07:00
 * theo yêu cầu backend D39 mục 17: ví dụ 2026-10-16T10:15:00+07:00.
 */
export function toVietnamIsoString(localValue: string): string {
  if (!localValue) return "";
  if (localValue.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(localValue)) {
    return localValue;
  }
  if (localValue.length === 16) {
    return `${localValue}:00+07:00`;
  }
  return `${localValue}+07:00`;
}

/**
 * Kiểm tra xem thời điểm đã chọn có sau thời điểm hiện tại không (chặn tương lai theo SCR-TCH-03).
 * Mặc định toleranceMinutes = 0 để chặn ngay ở client.
 */
export function isFutureVietnamDateTime(localValue: string, toleranceMinutes: number = 0): boolean {
  if (!localValue) return false;
  const isoStr = toVietnamIsoString(localValue);
  const targetTime = new Date(isoStr).getTime();
  if (Number.isNaN(targetTime)) return false;
  return targetTime > Date.now() + toleranceMinutes * 60 * 1000;
}

// Cộng trừ ngày trên chuỗi yyyy-MM-dd, ví dụ hôm qua = addDaysToDateString(hôm nay, -1). Tính
// trên mốc UTC của chính ngày đó nên toISOString() ở đây không lệch ngày
export function addDaysToDateString(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Ngày thứ Hai của tuần chứa dateStr (yyyy-MM-dd). Tuần tính từ thứ Hai tới Chủ nhật, khớp weekStartDate
// của thực đơn tuần. getUTCDay(): 0 = Chủ nhật ... 6 = thứ Bảy
export function getMondayOfWeek(dateStr: string): string {
  const day = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return addDaysToDateString(dateStr, -((day + 6) % 7));
}

// Tuần từ thứ Hai weekStartDate tới Chủ nhật → "12/10 – 18/10/2026". Tuần vắt qua năm mới thì ghi năm ở cả
// hai đầu: "29/12/2025 – 04/01/2026"
export function formatWeekRange(weekStartDate: string): string {
  const weekEndDate = addDaysToDateString(weekStartDate, 6);
  const start =
    weekStartDate.slice(0, 4) === weekEndDate.slice(0, 4)
      ? formatVietnamShortDate(weekStartDate).slice(0, 5)
      : formatVietnamShortDate(weekStartDate);
  return `${start} – ${formatVietnamShortDate(weekEndDate)}`;
}

// Trường chỉ có ngày (yyyy-MM-dd) → "Thứ Sáu, 16/10/2026". Gắn +07:00 để không lệch ngày
export function formatVietnamDisplayDate(dateStr: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${dateStr}T00:00:00+07:00`));
}

// Trường chỉ có ngày (yyyy-MM-dd) → "16/10/2026" (dd/MM/yyyy theo ui-screens.md §4.4)
export function formatVietnamShortDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

// Trường kết thúc bằng Utc → giờ phút theo giờ Việt Nam, ví dụ "07:42"
export function formatVietnamTime(utcIso: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(utcIso));
}

// Định dạng thời điểm đo theo giờ Việt Nam: dd/MM/yyyy HH:mm (ui-screens.md §4.4, frontend-conventions.md §6)
export function formatMeasurementDateTime(utcDateStr: string): string {
  try {
    const date = new Date(utcDateStr);
    const parts = new Intl.DateTimeFormat("vi-VN", {
      timeZone: VIETNAM_TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const find = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "";
    return `${find("day")}/${find("month")}/${find("year")} ${find("hour")}:${find("minute")}`;
  } catch {
    return utcDateStr;
  }
}
