import type { ClassResponse } from "@/types/class";

// Hai ô chọn bắt đầu rỗng (ui-screens.md §4.3). Bỏ giáo viên chủ nhiệm và gỡ lớp đi bằng nút riêng
// gửi null, nên ở hai form này bắt buộc phải chọn
type FieldRules = { validate: Record<string, (value: string) => true | string> };

export const teacherUserIdRules: FieldRules = {
  validate: {
    required: (value) => value !== "" || "Giáo viên chủ nhiệm không được để trống.",
  },
};

export const classIdRules: FieldRules = {
  validate: {
    required: (value) => value !== "" || "Lớp không được để trống.",
  },
};

// "36–48 tháng". Ba lớp seed luôn có đủ hai cận; thiếu cận nào thì không ghi khoảng tuổi
export function formatAgeRange({ minAgeMonths, maxAgeMonths }: ClassResponse): string | null {
  if (minAgeMonths === null || maxAgeMonths === null) return null;
  return `${minAgeMonths}–${maxAgeMonths} tháng`;
}

// Trường chỉ có ngày yyyy-MM-dd → dd/MM/yyyy bằng cách tách chuỗi, không đổi múi giờ (ui-screens.md
// §4.4, frontend-conventions.md §6). Tạm đặt ở đây vì develop chưa có hàm ngày dùng chung; khi
// src/lib/ có hàm dd/MM/yyyy thì chuyển sang dùng hàm đó (frontend-conventions.md §1)
export function formatDateOnly(date: string): string {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}
