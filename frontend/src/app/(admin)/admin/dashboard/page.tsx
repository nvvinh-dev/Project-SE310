import { AttendanceStatisticsCard } from "./_components/AttendanceStatisticsCard";
import { ChildStatisticsCard } from "./_components/ChildStatisticsCard";

// SCR-ADM-01 (FR-DASH-01): chỉ xem số liệu tổng hợp toàn trường. Không có bộ lọc khoảng ngày, nút xuất
// file hay liên kết vào từng trẻ (BR-DASHBOARD-03, AC-DASH-06). Vùng 3 (doanh thu) thêm vào lưới này ở
// thẻ FR-DASH-04. Lưới chia 3 cột từ xl, vì từ lg menu đã chiếm 288px (design-system.md §6)
export default function AdminDashboardPage() {
  return (
    <div className="py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-on-surface">Tổng quan</h1>
        <p className="text-sm text-on-surface-variant">Số liệu tổng hợp của toàn trường.</p>
      </div>

      <div className="grid gap-3 xl:grid-cols-3 items-start">
        <ChildStatisticsCard />
        <AttendanceStatisticsCard />
      </div>
    </div>
  );
}
