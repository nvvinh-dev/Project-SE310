// Phản chiếu DTO của module lớp (NhaTre.Application/DTOs/Classes). Ba lớp cố định Mầm, Chồi, Lá do
// backend seed sẵn, không tạo hay xóa lớp (D39 mục 3)

// userId là id tài khoản giáo viên, cùng giá trị gửi lên khi gán giáo viên chủ nhiệm
export interface HomeroomTeacherResponse {
  userId: string;
  fullName: string;
}

// Khoảng tuổi tính theo tháng, nửa mở: minAgeMonths <= tuổi < maxAgeMonths (BR-CLASS-03)
export interface ClassResponse {
  id: string;
  name: string;
  minAgeMonths: number | null;
  maxAgeMonths: number | null;
  homeroomTeacher: HomeroomTeacherResponse | null;
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

// null là gỡ trẻ khỏi lớp. Trường bắt buộc có mặt trong body ([JsonRequired]): thiếu thì 400
export interface AssignClassRequest {
  classId: string | null;
}
