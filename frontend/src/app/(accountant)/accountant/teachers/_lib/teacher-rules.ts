// Ô chọn tài khoản bắt đầu rỗng (ui-screens.md §4.3) và bắt buộc phải chọn. Backend chỉ kiểm id rỗng
// bằng câu dành cho mã, không có câu cho ô chưa chọn, nên câu ở đây viết theo khuôn teacherUserIdRules
// của SCR-ADM-03
type FieldRules = { validate: Record<string, (value: string) => true | string> };

export interface CreateTeacherFormValues {
  userId: string;
}

export const teacherAccountRules: FieldRules = {
  validate: {
    required: (value) => value !== "" || "Tài khoản giáo viên không được để trống.",
  },
};
