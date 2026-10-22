import { getTodayVietnamDateString } from "@/lib/datetime";

// Giá trị form hồ sơ trẻ: ô ngày trả chuỗi yyyy-MM-dd, chưa chọn thì là chuỗi rỗng
export interface ChildFormValues {
  fullName: string;
  dateOfBirth: string;
  enrollmentDate: string;
}

// Quy tắc kiểm tra ô nhập, khớp ChildProfileRequestValidator của backend (cùng giới hạn, cùng câu thông
// báo). Họ tên đo sau khi trim vì backend lưu bản đã trim. Ngày yyyy-MM-dd so sánh được bằng chuỗi
type FieldRules = { validate: Record<string, (value: string, formValues: ChildFormValues) => true | string> };

export const childFullNameRules: FieldRules = {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Họ tên trẻ không được để trống.",
    maxLength: (value) => value.trim().length <= 100 || "Họ tên trẻ không được dài quá 100 ký tự.",
  },
};

// "Hôm nay" theo giờ Việt Nam (frontend-conventions.md §6)
export const dateOfBirthRules: FieldRules = {
  validate: {
    required: (value) => value !== "" || "Ngày sinh không được để trống.",
    notInFuture: (value) => value <= getTodayVietnamDateString() || "Ngày sinh không được sau ngày hôm nay.",
  },
};

// Chưa chọn ngày sinh thì chỉ báo lỗi ở ô ngày sinh, không báo so sánh ngày gây hiểu nhầm
export const enrollmentDateRules: FieldRules = {
  validate: {
    required: (value) => value !== "" || "Ngày nhập học không được để trống.",
    notBeforeBirth: (value, formValues) =>
      formValues.dateOfBirth === "" ||
      value >= formValues.dateOfBirth ||
      "Ngày nhập học không được trước ngày sinh.",
  },
};
