// Phản chiếu DTO hồ sơ giáo viên (NhaTre.Application/DTOs/Teachers)

// Hồ sơ chỉ kèm họ tên và email của tài khoản, không kèm vai trò hay trạng thái tài khoản (D45). Gồm cả
// hồ sơ của tài khoản đã bị vô hiệu hóa hay đổi vai trò
export interface TeacherResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  createdAtUtc: string;
}

// Tài khoản Giáo viên đang hoạt động, chưa có hồ sơ: chỉ id, họ tên và email (D45)
export interface TeacherAccountResponse {
  userId: string;
  fullName: string;
  email: string;
}

// Trường bắt buộc có mặt trong body ([JsonRequired]): thiếu thì 400
export interface CreateTeacherRequest {
  userId: string;
}
