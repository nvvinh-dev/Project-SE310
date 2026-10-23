// Các hàm tiện ích phục vụ SCR-TCH-03 theo quy định ui-screens.md §4.4 và D39

export const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Lấy thời điểm hiện tại theo giờ Việt Nam dạng YYYY-MM-DDTHH:mm
 * dùng làm giá trị mặc định và thuộc tính `max` cho input datetime-local.
 */
export function getNowVietnamDateTimeLocal(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const find = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${find("year")}-${find("month")}-${find("day")}T${find("hour")}:${find("minute")}`;
}

/**
 * Đổi chuỗi YYYY-MM-DDTHH:mm (giờ Việt Nam) sang chuỗi ISO có múi giờ +07:00
 * theo yêu cầu của backend D39 mục 17: ví dụ 2026-10-16T10:15:00+07:00.
 */
export function toVietnamIsoString(localValue: string): string {
  if (!localValue) return "";
  // Nếu đã có múi giờ hoặc Z thì giữ nguyên
  if (localValue.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(localValue)) {
    return localValue;
  }
  // Nếu chưa có giây
  if (localValue.length === 16) {
    return `${localValue}:00+07:00`;
  }
  // Nếu đã có giây (YYYY-MM-DDTHH:mm:ss)
  if (localValue.length === 19) {
    return `${localValue}+07:00`;
  }
  return `${localValue}+07:00`;
}

/**
 * Kiểm tra xem thời điểm đã chọn có sau thời điểm hiện tại không (chặn tương lai).
 */
export function isFutureVietnamDateTime(localValue: string): boolean {
  if (!localValue) return false;
  const isoStr = toVietnamIsoString(localValue);
  const targetTime = new Date(isoStr).getTime();
  if (Number.isNaN(targetTime)) return false;
  return targetTime > Date.now();
}

/**
 * Kiểm tra tính hợp lệ của danh sách ảnh sự cố theo D39 mục 5 & AttachIncidentPhotosRequestValidator:
 * - Tối đa 5 ảnh
 * - Định dạng: JPEG hoặc PNG (MIME và extension .jpg, .jpeg, .png)
 * - Không rỗng và mỗi ảnh ≤ 5 MB
 */
export function validateIncidentPhotos(files: File[]): string | null {
  if (files.length > 5) {
    return "Mỗi lần chỉ gửi tối đa 5 ảnh sự cố.";
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const number = i + 1;
    const lowerName = file.name.toLowerCase();
    const hasValidExt =
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".png");

    const validMime = file.type === "image/jpeg" || file.type === "image/png";

    if (!validMime) {
      return `Ảnh thứ ${number} chỉ nhận định dạng JPEG hoặc PNG.`;
    }

    if (!hasValidExt) {
      return `Tên file ảnh thứ ${number} phải có đuôi .jpg, .jpeg hoặc .png.`;
    }

    if (file.size <= 0) {
      return `Ảnh thứ ${number} không được rỗng.`;
    }

    if (file.size > 5 * 1024 * 1024) {
      return `Ảnh thứ ${number} không được lớn hơn 5 MB.`;
    }
  }

  return null;
}

/**
 * Format dung lượng file để hiển thị cho người dùng
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
