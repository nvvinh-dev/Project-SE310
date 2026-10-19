// Quy tắc kiểm tra ô nhập khớp GrowthMeasurementRequestValidator của backend
// Miền giá trị: Chiều cao > 0 và <= 200 cm; Cân nặng > 0 và <= 100 kg (BR-HEALTH-05, D51).
// Tối đa 2 chữ số thập phân. Trống cả hai ô -> Cần nhập ít nhất chiều cao hoặc cân nặng (AC-HEALTH-07).

export function validateHeight(value: string, weightValue?: string): true | string {
  const trimmed = value.trim();
  const trimmedWeight = weightValue?.trim();

  if (!trimmed) {
    if (!trimmedWeight) {
      return "Cần nhập ít nhất chiều cao hoặc cân nặng.";
    }
    return true;
  }

  const normalized = trimmed.replace(",", ".");
  const num = Number(normalized);

  if (isNaN(num)) {
    return "Chiều cao không đúng định dạng số.";
  }
  if (num <= 0) {
    return "Chiều cao phải lớn hơn 0 cm.";
  }
  if (num > 200) {
    return "Chiều cao không được quá 200 cm.";
  }

  const parts = normalized.split(".");
  if (parts.length > 1 && parts[1].length > 2) {
    return "Chiều cao chỉ được tối đa 2 chữ số thập phân.";
  }

  return true;
}

export function validateWeight(value: string, heightValue?: string): true | string {
  const trimmed = value.trim();
  const trimmedHeight = heightValue?.trim();

  if (!trimmed) {
    if (!trimmedHeight) {
      return "Cần nhập ít nhất chiều cao hoặc cân nặng.";
    }
    return true;
  }

  const normalized = trimmed.replace(",", ".");
  const num = Number(normalized);

  if (isNaN(num)) {
    return "Cân nặng không đúng định dạng số.";
  }
  if (num <= 0) {
    return "Cân nặng phải lớn hơn 0 kg.";
  }
  if (num > 100) {
    return "Cân nặng không được quá 100 kg.";
  }

  const parts = normalized.split(".");
  if (parts.length > 1 && parts[1].length > 2) {
    return "Cân nặng chỉ được tối đa 2 chữ số thập phân.";
  }

  return true;
}

// So sánh không phân biệt hoa thường và dấu tiếng Việt (frontend-conventions.md §1)
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

// Chuyển chuỗi nhập (có thể dùng dấu phẩy hoặc chấm) thành number hoặc null để gửi API
export function parseMeasurementValue(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed.replace(",", "."));
  return isNaN(num) ? null : num;
}
