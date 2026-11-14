// Phản chiếu DTO của module ảnh hoạt động (NhaTre.Application/DTOs/Media)

// Một lớp giáo viên đang đăng nhập phụ trách (chủ nhiệm hoặc giáo viên phụ), chỉ id và tên (D45).
// GET /api/homeroom-classes
export interface HomeroomClassResponse {
  id: string;
  name: string;
}

// Ảnh vừa chia sẻ hoặc ảnh phụ huynh xem. url là URL ký hạn 60 phút, không lưu lâu dài (D53)
export interface ActivityPhotoResponse {
  id: string;
  uploadedAtUtc: string;
  url: string;
}

// GET /api/children/{childId}/activity-photos (FR-MEDIA-02). Số trang tính từ totalCount
export interface ActivityPhotoPageResponse {
  items: ActivityPhotoResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
}
