// FR-NOTI-01, FR-NOTI-02: Module thông báo in-app (D25, D39 mục 6, D40 mục 3)
// Không có trạng thái đã đọc và không trỏ tới bản ghi gây ra thông báo (D25)
export interface NotificationResponse {
  id: string;
  message: string;
  createdAtUtc: string;
}

// TotalCount là tổng số thông báo của người dùng để phân trang ở server (frontend-conventions.md §3.4)
export interface NotificationPageResponse {
  items: NotificationResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// FR-NOTI-03: Kế toán phát thông báo nghỉ học. Chỉ gửi phần nội dung; backend ghép tiền tố
// "Nhà trường thông báo nghỉ học: " và gửi tới mọi phụ huynh đang hoạt động (D25, D39 mục 6)
export interface SchoolClosureRequest {
  content: string;
}

// Số phụ huynh đã nhận thông báo
export interface SchoolClosureResponse {
  recipientCount: number;
}
