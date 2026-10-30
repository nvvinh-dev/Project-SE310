"use client";

import { LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import { useChildStatistics } from "../_lib/dashboard-api";
import { StatisticsErrorAlert } from "./StatisticsErrorAlert";

const COUNT_FORMAT = new Intl.NumberFormat("vi-VN");

// Vùng 1 của SCR-ADM-01 (FR-DASH-02): tổng số trẻ và số trẻ của từng lớp. Chưa có trẻ thì hiện số 0,
// không dùng EmptyState (ui-screens.md SCR-ADM-01, mục Trạng thái)
export function ChildStatisticsCard() {
  const statisticsQuery = useChildStatistics();
  const statistics = statisticsQuery.data;
  const loadError = statisticsQuery.isError ? toApiError(statisticsQuery.error).message : null;
  const retry = () => void statisticsQuery.refetch();

  return (
    <section
      aria-labelledby="child-statistics-heading"
      className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3"
    >
      <h2 id="child-statistics-heading" className="text-base font-bold text-on-surface">
        Số trẻ
      </h2>

      {statisticsQuery.isPending ? (
        <LoadingSpinner label="Đang tải số trẻ..." />
      ) : !statistics ? (
        // Lỗi khi chưa có dữ liệu thì thay cả vùng; lỗi lúc tải lại thì giữ số cũ và báo ở trên
        <StatisticsErrorAlert title="Không tải được số trẻ" message={loadError ?? ""} onRetry={retry} />
      ) : (
        <>
          {loadError && <StatisticsErrorAlert title="Không tải lại được số trẻ" message={loadError} onRetry={retry} />}

          <p className="text-on-surface">
            <span className="text-2xl font-bold">{COUNT_FORMAT.format(statistics.totalChildren)}</span>{" "}
            <span className="text-sm text-on-surface-variant">trẻ</span>
          </p>

          {statistics.classes.length > 0 && (
            <dl className="divide-y divide-slate-100 border-t border-slate-100">
              {statistics.classes.map((cls) => (
                <div key={cls.className} className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-sm text-on-surface-variant break-words">{cls.className}</dt>
                  <dd className="text-sm font-semibold text-on-surface">{COUNT_FORMAT.format(cls.childCount)}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </section>
  );
}
