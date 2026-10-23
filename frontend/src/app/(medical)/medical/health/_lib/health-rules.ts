// Quy tắc kiểm tra ô nhập khớp GrowthMeasurementRequestValidator của backend (BR-HEALTH-05, D51).
// Chiều cao > 0 và <= 200 cm; Cân nặng > 0 và <= 100 kg; tối đa 2 chữ số thập phân (numeric(5,2)).
// Chỉ HeightCm trả câu "Cần nhập ít nhất chiều cao hoặc cân nặng." khi cả hai cùng trống (AC-HEALTH-07).

export interface GrowthMeasurementFormValues {
  heightCm: string;
  weightKg: string;
}

const DECIMAL_REGEX = /^\d+([.,]\d{1,2})?$/;

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

  if (isNaN(num) || num <= 0) {
    return "Chiều cao phải lớn hơn 0 cm.";
  }
  if (num > 200) {
    return "Chiều cao không được quá 200 cm.";
  }
  if (!DECIMAL_REGEX.test(trimmed)) {
    return "Chiều cao chỉ được tối đa 2 chữ số thập phân.";
  }

  return true;
}

export function validateWeight(value: string): true | string {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  const normalized = trimmed.replace(",", ".");
  const num = Number(normalized);

  if (isNaN(num) || num <= 0) {
    return "Cân nặng phải lớn hơn 0 kg.";
  }
  if (num > 100) {
    return "Cân nặng không được quá 100 kg.";
  }
  if (!DECIMAL_REGEX.test(trimmed)) {
    return "Cân nặng chỉ được tối đa 2 chữ số thập phân.";
  }

  return true;
}

// Chuyển chuỗi nhập (có thể dùng dấu phẩy hoặc chấm) thành number hoặc null để gửi API
export function parseMeasurementValue(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed.replace(",", "."));
  return isNaN(num) ? null : num;
}
