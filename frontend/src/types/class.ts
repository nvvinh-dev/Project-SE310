// Phản chiếu DTO của module lớp (NhaTre.Application/DTOs/Classes). Ba lớp cố định Mầm, Chồi, Lá do
// backend seed sẵn, không tạo hay xóa lớp (D39 mục 3)

// userId là id tài khoản giáo viên, cùng giá trị gửi lên khi gán giáo viên chủ nhiệm hay giáo viên phụ
export interface ClassTeacherResponse {
  userId: string;
  fullName: string;
}

// Khoảng tuổi tính theo tháng, nửa mở: minAgeMonths <= tuổi < maxAgeMonths (BR-CLASS-03)
export interface ClassResponse {
  id: string;
  name: string;
  minAgeMonths: number | null;
  maxAgeMonths: number | null;
  homeroomTeacher: ClassTeacherResponse | null;
  // Theo thứ tự backend trả; lớp chưa có giáo viên phụ thì là mảng rỗng (FR-CLASS-02)
  assistantTeachers: ClassTeacherResponse[];
}

// Admin xếp lớp chỉ nhận họ tên, ngày sinh (yyyy-MM-dd) và lớp hiện tại của trẻ (D45, AC-CLASS-04).
// Khóa của trẻ là childId, không phải id
export interface ClassPlacementResponse {
  childId: string;
  fullName: string;
  dateOfBirth: string;
  classId: string | null;
  className: string | null;
}

// null là bỏ giáo viên chủ nhiệm. Trường bắt buộc có mặt trong body ([JsonRequired]): thiếu thì 400
export interface AssignHomeroomTeacherRequest {
  teacherUserId: string | null;
}

// Toàn bộ danh sách giáo viên phụ của lớp sau khi sửa, không phải phần thay đổi; [] là gỡ hết. Id trùng
// nhau hoặc thiếu trường thì 400
export interface AssignAssistantTeachersRequest {
  teacherUserIds: string[];
}

// null là gỡ trẻ khỏi lớp. Trường bắt buộc có mặt trong body ([JsonRequired]): thiếu thì 400
export interface AssignClassRequest {
  classId: string | null;
}
