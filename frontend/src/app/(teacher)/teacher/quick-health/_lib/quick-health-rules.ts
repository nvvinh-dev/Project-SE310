import { isFutureVietnamDateTime } from "@/lib/datetime";
import { isHealthMood } from "@/types/health";

type FieldRules = { validate: Record<string, (value: string) => true | string> };

export const moodRules: FieldRules = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Tâm trạng không được để trống.",
    validMood: (value) =>
      isHealthMood(value) ||
      "Tâm trạng chỉ nhận 'Happy', 'Normal', 'Tired' hoặc 'Fussy'.",
  },
};

const TEMPERATURE_DECIMAL_REGEX = /^\d+([.,]\d)?$/;

export const temperatureRules: FieldRules = {
  validate: {
    rangeAndPrecision: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return true; // Không bắt buộc

      const normalized = trimmed.replace(",", ".");
      const num = Number(normalized);

      if (Number.isNaN(num) || num < 30 || num > 45) {
        return "Nhiệt độ phải từ 30 đến 45 °C.";
      }

      if (!TEMPERATURE_DECIMAL_REGEX.test(trimmed)) {
        return "Nhiệt độ chỉ được tối đa 1 chữ số thập phân.";
      }

      return true;
    },
  },
};

/**
 * Chuyển đổi giá trị nhiệt độ (hỗ trợ cả dấu . và ,) thành number với 1 chữ số thập phân
 * hoặc null nếu để trống.
 */
export function parseTemperatureValue(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed.replace(",", "."));
  return Number.isNaN(num) ? null : Number(num.toFixed(1));
}

export const notesRules: FieldRules = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Ghi chú không được để trống.",
    maxLength: (value) =>
      value.trim().length <= 1000 || "Ghi chú không được dài quá 1000 ký tự.",
  },
};

export const occurredAtRules: FieldRules = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Thời điểm xảy ra không được để trống.",
    notFuture: (value) =>
      !isFutureVietnamDateTime(value) || "Thời điểm xảy ra không được sau thời điểm hiện tại.",
  },
};

export const descriptionRules: FieldRules = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Mô tả sự cố không được để trống.",
    maxLength: (value) =>
      value.trim().length <= 1000 || "Mô tả sự cố không được dài quá 1000 ký tự.",
  },
};
