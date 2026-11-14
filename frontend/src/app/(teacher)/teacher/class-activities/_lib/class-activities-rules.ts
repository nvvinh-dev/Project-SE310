// Quy tắc kiểm tra ảnh hoạt động trước khi chia sẻ, cùng giới hạn và cùng câu với
// ShareActivityPhotosRequestValidator (D39 mục 5, AC-MEDIA-05). Backend vẫn kiểm lại

export const MAX_PHOTOS_PER_UPLOAD = 5;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png"];

/**
 * Kiểm tra tính hợp lệ của danh sách ảnh hoạt động theo AC-MEDIA-05 & backend validator:
 * - 1–5 ảnh
 * - Định dạng: JPEG hoặc PNG (cả Content-Type và đuôi .jpg, .jpeg, .png)
 * - Không rỗng (> 0 bytes) và mỗi ảnh ≤ 5 MB
 * Trả về chuỗi lỗi tiếng Việt khớp với backend hoặc null nếu hợp lệ.
 */
export function validateActivityPhotos(files: File[]): string | null {
  if (files.length === 0) {
    return "Cần ít nhất 1 ảnh hoạt động.";
  }

  if (files.length > MAX_PHOTOS_PER_UPLOAD) {
    return `Mỗi lần chỉ gửi tối đa ${MAX_PHOTOS_PER_UPLOAD} ảnh hoạt động.`;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const number = i + 1;
    const lowerName = file.name.toLowerCase();

    const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const validMime = ACCEPTED_MIME_TYPES.includes(file.type);

    if (!validMime) {
      return `Ảnh thứ ${number} chỉ nhận định dạng JPEG hoặc PNG.`;
    }

    if (!hasValidExt) {
      return `Tên file ảnh thứ ${number} phải có đuôi .jpg, .jpeg hoặc .png.`;
    }

    if (file.size <= 0) {
      return `Ảnh thứ ${number} không được rỗng.`;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Ảnh thứ ${number} không được lớn hơn 5 MB.`;
    }
  }

  return null;
}
