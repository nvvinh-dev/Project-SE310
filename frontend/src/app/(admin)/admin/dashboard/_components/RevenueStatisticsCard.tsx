"use client";

import { LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatMoney } from "@/lib/format";
import { useRevenueStatistics } from "../_lib/dashboard-api";
import { StatisticsErrorAlert } from "./StatisticsErrorAlert";

const COUNT_FORMAT = new Intl.NumberFormat("vi-VN");

// Vùng 3 của SCR-ADM-01 (FR-DASH-04): tổng thu của tháng hiện tại và số hóa đơn chưa thanh toán, cùng số
// liệu với báo cáo doanh thu của Kế toán (SCR-ACC-03). Tháng lấy từ year/month của API, không tự tính theo
// đồng hồ máy người xem. Chưa thu khoản nào thì hiện 0 ₫, không dùng EmptyState
export function RevenueStatisticsCard() {
  const statisticsQuery = useRevenueStatistics();
  const statistics = statisticsQuery.data;
  const loadError = statisticsQuery.isError ? toApiError(statisticsQuery.error).message : null;
  const retry = () => void statisticsQuery.refetch();

  return (
    <section
      aria-labelledby="revenue-statistics-heading"
      className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3"
    >
      <h2 id="revenue-statistics-heading" className="text-base font-bold text-on-surface">
        Doanh thu
        {statistics && ` tháng ${String(statistics.month).padStart(2, "0")}/${statistics.year}`}
      </h2>

      {statisticsQuery.isPending ? (
        <LoadingSpinner label="Đang tải thống kê doanh thu..." />
      ) : !statistics ? (
        // Lỗi khi chưa có dữ liệu thì thay cả vùng; lỗi lúc tải lại thì giữ số cũ và báo ở trên
        <StatisticsErrorAlert title="Không tải được thống kê doanh thu" message={loadError ?? ""} onRetry={retry} />
      ) : (
        <>
          {loadError && (
            <StatisticsErrorAlert title="Không tải lại được thống kê doanh thu" message={loadError} onRetry={retry} />
          )}

          <p className="text-on-surface">
            <span className="text-sm text-on-surface-variant">Đã thu</span>{" "}
            <span className="text-2xl font-bold break-words">{formatMoney(statistics.totalCollected)}</span>
          </p>

          {/* Số hóa đơn đếm mọi kỳ, không riêng tháng này: nhãn phải nói rõ để không đọc nhầm (D39 mục 12) */}
          <dl className="border-t border-slate-100">
            <div className="flex items-center justify-between gap-3 py-2">
              <dt className="text-sm text-on-surface-variant">Hóa đơn chưa thanh toán (tất cả các kỳ)</dt>
              <dd className="text-sm font-semibold text-on-surface">
                {COUNT_FORMAT.format(statistics.unpaidInvoiceCount)}
              </dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
