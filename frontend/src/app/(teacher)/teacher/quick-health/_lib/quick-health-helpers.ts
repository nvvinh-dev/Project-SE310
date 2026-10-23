// Các hàm tiện ích upload ảnh và format dung lượng cho SCR-TCH-03 (D39 mục 5)

export {
  VIETNAM_TIME_ZONE,
  getNowVietnamDateTimeLocal,
  toVietnamIsoString,
  isFutureVietnamDateTime,
} from "@/lib/datetime";

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
