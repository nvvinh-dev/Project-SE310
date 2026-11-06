"use client";

import { LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import { useAttendanceStatistics } from "../_lib/dashboard-api";
import { StatisticsErrorAlert } from "./StatisticsErrorAlert";

// Cắt bớt thay vì làm tròn, để còn một lượt vắng thì không hiện 100%
const RATE_FORMAT = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  maximumFractionDigits: 1,
  roundingMode: "trunc",
});

// Chưa có bản ghi điểm danh thì không có tỷ lệ: hiện "—", không hiện 0% (ui-screens.md SCR-ADM-01)
function formatRate(rate: number | null) {
  return rate === null ? "—" : RATE_FORMAT.format(rate);
}

// Vùng 2 của SCR-ADM-01 (FR-DASH-03): tỷ lệ có mặt của tháng hiện tại, toàn trường và từng lớp. Tháng lấy
// từ year/month của API, không tự tính theo đồng hồ máy người xem
export function AttendanceStatisticsCard() {
  const statisticsQuery = useAttendanceStatistics();
  const statistics = statisticsQuery.data;
  const loadError = statisticsQuery.isError ? toApiError(statisticsQuery.error).message : null;
  const retry = () => void statisticsQuery.refetch();

  return (
    <section
      aria-labelledby="attendance-statistics-heading"
      className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3"
    >
      <h2 id="attendance-statistics-heading" className="text-base font-bold text-on-surface">
        Điểm danh
        {statistics && ` tháng ${String(statistics.month).padStart(2, "0")}/${statistics.year}`}
      </h2>

      {statisticsQuery.isPending ? (
        <LoadingSpinner label="Đang tải thống kê điểm danh..." />
      ) : !statistics ? (
        // Lỗi khi chưa có dữ liệu thì thay cả vùng; lỗi lúc tải lại thì giữ số cũ và báo ở trên
        <StatisticsErrorAlert title="Không tải được thống kê điểm danh" message={loadError ?? ""} onRetry={retry} />
      ) : (
        <>
          {loadError && (
            <StatisticsErrorAlert title="Không tải lại được thống kê điểm danh" message={loadError} onRetry={retry} />
          )}

          <div>
            <p className="text-on-surface">
              <span className="text-2xl font-bold">{formatRate(statistics.presentRate)}</span>{" "}
              <span className="text-sm text-on-surface-variant">có mặt toàn trường</span>
            </p>
            {statistics.recordCount === 0 && (
              <p className="text-sm text-on-surface-variant">Tháng này chưa có lượt điểm danh nào.</p>
            )}
          </div>

          {statistics.classes.length > 0 && (
            <dl className="divide-y divide-slate-100 border-t border-slate-100">
              {statistics.classes.map((cls) => (
                <div key={cls.className} className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-sm text-on-surface-variant break-words">{cls.className}</dt>
                  <dd className="text-sm font-semibold text-on-surface">{formatRate(cls.presentRate)}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </section>
  );
}
