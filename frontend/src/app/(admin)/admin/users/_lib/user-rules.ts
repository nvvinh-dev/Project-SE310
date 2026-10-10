import { ROLE_VIETNAMESE_LABELS } from "@/components/DashboardLayout";
import type { Role } from "@/types/auth";

// 5 vai trò cố định (D40 mục 1), lấy từ bảng tên tiếng Việt dùng chung để không khai báo lại lần nữa
export const ROLES = Object.keys(ROLE_VIETNAMESE_LABELS) as Role[];

export function isRole(value: string): value is Role {
  return (ROLES as string[]).includes(value);
}

// Quy tắc kiểm tra ô nhập, khớp UserRuleExtensions của backend (cùng giới hạn, cùng câu thông báo).
// Họ tên và email đo sau khi trim vì backend lưu bản đã trim; mật khẩu không trim
type FieldRules = { validate: Record<string, (value: string) => true | string> };

export const fullNameRules: FieldRules = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Họ tên không được để trống.",
    maxLength: (value) => value.trim().length <= 100 || "Họ tên không được dài quá 100 ký tự.",
  },
};

export const emailRules: FieldRules = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Email không được để trống.",
    format: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Email không đúng định dạng.",
    maxLength: (value) => value.trim().length <= 254 || "Email không được dài quá 254 ký tự.",
  },
};

export const passwordRules: FieldRules = {
  validate: {
    notEmpty: (value) => value.length > 0 || "Mật khẩu không được để trống.",
    length: (value) => (value.length >= 8 && value.length <= 128) || "Mật khẩu phải từ 8 đến 128 ký tự.",
  },
};

// Không có vai trò mặc định: ô chọn bắt đầu rỗng, chưa chọn thì không gửi (D43 mục 5)
export const roleRules: FieldRules = {
  validate: {
    required: (value) => isRole(value) || "Vai trò không được để trống.",
  },
};

// So sánh không phân biệt hoa thường và dấu tiếng Việt, để gõ "nguyen" vẫn tìm ra "Nguyễn"
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
