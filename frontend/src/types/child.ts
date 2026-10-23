// Phản chiếu DTO hồ sơ trẻ và liên kết phụ huynh–trẻ (NhaTre.Application/DTOs/Children)

// Hồ sơ trẻ phía Kế toán không kèm lưu ý sức khỏe hay lớp (D45, AC-STU-02). Ngày dạng yyyy-MM-dd
export interface ChildResponse {
  id: string;
  fullName: string;
  dateOfBirth: string;
  enrollmentDate: string;
}

// Kế toán chỉ gửi 3 trường này khi tạo và sửa hồ sơ (D39 mục 2)
export interface ChildProfileRequest {
  fullName: string;
  dateOfBirth: string;
  enrollmentDate: string;
}

// Chỉ id, họ tên và email tài khoản, không kèm vai trò hay trạng thái (D45). Dùng chung cho danh sách
// phụ huynh đã liên kết và kết quả tìm tài khoản Phụ huynh để liên kết
export interface GuardianResponse {
  userId: string;
  fullName: string;
  email: string;
}

// Trường bắt buộc có mặt trong body ([JsonRequired]): thiếu thì 400
export interface LinkGuardianRequest {
  guardianUserId: string;
}

// D45: phụ huynh chọn con chỉ cần id và họ tên, không kèm ngày sinh, lớp hay health_notes
export interface MyChildResponse {
  id: string;
  fullName: string;
}
