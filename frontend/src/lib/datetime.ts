// Ngày giờ hiển thị theo giờ Việt Nam, không theo múi giờ của máy (ui-screens.md §4.4,
// frontend-conventions.md §6). Dùng chung cho mọi vai trò.

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

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

// Cộng trừ ngày trên chuỗi yyyy-MM-dd, ví dụ hôm qua = addDaysToDateString(hôm nay, -1). Tính
// trên mốc UTC của chính ngày đó nên toISOString() ở đây không lệch ngày
export function addDaysToDateString(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
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
