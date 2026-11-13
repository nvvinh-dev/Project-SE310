// FR-COMPLAINT-02: Ban giám hiệu (Admin) xem và xử lý phản ánh của phụ huynh (D39 mục 18)

// Ba trạng thái khớp hằng số ComplaintStatuses của backend. Phản ánh mới luôn New do server đặt
export type ComplaintStatus = "New" | "InProgress" | "Resolved";

// Admin chỉ chuyển được sang hai trạng thái này; New không gửi lên được
export type ComplaintHandlingStatus = Exclude<ComplaintStatus, "New">;

// Phản ánh Admin xem: kèm họ tên trẻ, lớp hiện tại (null khi chưa xếp lớp) và họ tên phụ huynh gửi.
// Không kèm người xử lý, điểm danh, sức khỏe, sự cố hay học phí của trẻ (D40 mục 3, D45)
export interface ComplaintResponse {
  id: string;
  childId: string;
  childFullName: string;
  className: string | null;
  submittedByFullName: string;
  content: string;
  status: ComplaintStatus;
  resolution: string | null;
  createdAtUtc: string;
  resolvedAtUtc: string | null;
}

// totalCount là tổng số phản ánh khớp bộ lọc, để tính số trang (api-conventions.md §2.1)
export interface ComplaintPageResponse {
  items: ComplaintResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// resolution bắt buộc khi Resolved, gửi null khi InProgress
export interface HandleComplaintRequest {
  status: ComplaintHandlingStatus;
  resolution: string | null;
}
