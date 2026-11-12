import type { SchoolClosureRequest } from "@/types/notification";

export interface SchoolClosureFormValues {
  content: string;
}

export const MAX_SCHOOL_CLOSURE_LENGTH = 500;

// Tiền tố backend ghép vào trước nội dung (NotificationService.BroadcastSchoolClosureAsync). Frontend chỉ dùng để
// xem trước; backend mới là nơi ghép (SCR-ACC-07, Vùng 2)
export const SCHOOL_CLOSURE_PREFIX = "Nhà trường thông báo nghỉ học: ";

// Khớp SchoolClosureRequestValidator: cùng giới hạn, cùng câu thông báo, đo sau khi trim vì backend ghép bản đã trim.
// 500 ký tự không tính tiền tố
export const contentRules = {
  validate: {
    notEmpty: (value: string) => value.trim().length > 0 || "Nội dung thông báo không được để trống.",
    maxLength: (value: string) =>
      value.trim().length <= MAX_SCHOOL_CLOSURE_LENGTH ||
      `Nội dung thông báo không được dài quá ${MAX_SCHOOL_CLOSURE_LENGTH} ký tự.`,
  },
};

export function toSchoolClosureRequest(values: SchoolClosureFormValues): SchoolClosureRequest {
  return { content: values.content.trim() };
}

// Câu phụ huynh sẽ nhận, để xem trước
export function previewMessage(content: string): string {
  return `${SCHOOL_CLOSURE_PREFIX}${content.trim()}`;
}
