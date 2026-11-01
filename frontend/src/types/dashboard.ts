// Phản chiếu DTO của dashboard Admin (NhaTre.Application/DTOs/Dashboard). Chỉ có số liệu tổng hợp,
// không id hay tên trẻ (D45, AC-DASH-06)

// Ba lớp luôn có mặt, xếp theo nhóm tuổi Mầm, Chồi, Lá; lớp chưa có trẻ thì childCount = 0
export interface ClassChildCountResponse {
  className: string;
  childCount: number;
}

// totalChildren là tổng số trẻ của ba lớp; trẻ chưa xếp lớp hay đã nghỉ học không tính (D39 mục 2)
export interface ChildStatisticsResponse {
  totalChildren: number;
  classes: ClassChildCountResponse[];
}
