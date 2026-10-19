// Định dạng ngày giờ, tiền tệ và số đo theo quy chuẩn tiếng Việt (frontend-conventions.md §6)

// Định dạng thời điểm đo theo giờ Việt Nam: dd/MM/yyyy HH:mm (ui-screens.md §4.4)
export function formatMeasurementDateTime(utcDateStr: string): string {
  try {
    const date = new Date(utcDateStr);
    const parts = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
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

// Định dạng ngày sinh dd/MM/yyyy không đổi múi giờ (frontend-conventions.md §6)
export function formatDateOfBirth(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Định dạng số đo với dấu phẩy kiểu Việt Nam, null hiện "—"
export function formatHeight(height: number | null): string {
  if (height === null || height === undefined) return "—";
  const str = height.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${str} cm`;
}

export function formatWeight(weight: number | null): string {
  if (weight === null || weight === undefined) return "—";
  const str = weight.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${str} kg`;
}
