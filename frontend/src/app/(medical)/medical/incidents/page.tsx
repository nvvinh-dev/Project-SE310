"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  EmptyState,
  ErrorAlert,
  Icons,
  LoadingSpinner,
  Pagination,
} from "@/components";
import { toApiError } from "@/lib/axios";
import { IncidentNotificationCard } from "./_components/IncidentNotificationCard";
import { useIncidentNotifications } from "./_lib/incidents-api";

const PAGE_SIZE = 20;

// SCR-MED-04 — Thông báo sự cố (ui-screens.md §8)
// Vai trò: Y tế (Medical) · Thông báo in-app không đánh dấu đã đọc và không xóa (D25, D39 mục 6)
export default function MedicalIncidentsPage() {
  const [page, setPage] = useState(1);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useIncidentNotifications(page, PAGE_SIZE);

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  // Trang đang xem lớn hơn số trang thì hiện trang cuối (frontend-conventions.md §3.4)
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const items = data?.items ?? [];
  const isEmpty = !isPending && !isError && data != null && data.totalCount === 0;

  return (
    <div className="space-y-6 py-8">
      {/* Tiêu đề trang (design-system.md §2) */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Thông báo sự cố</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Danh sách thông báo khi giáo viên ghi nhận sự cố đối với trẻ trong trường.
        </p>
      </div>

      {/* Trạng thái lỗi khi đã có dữ liệu cũ (frontend-conventions.md §3.3) */}
      {isError && data && (
        <ErrorAlert
          title="Không tải lại được dữ liệu mới nhất"
          message={toApiError(error).message}
          onRetry={() => refetch()}
        />
      )}

      {/* Trạng thái đang tải lần đầu */}
      {isPending && !data && (
        <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-12 shadow-xs">
          <LoadingSpinner label="Đang tải danh sách thông báo..." />
        </div>
      )}

      {/* Trạng thái lỗi lần đầu */}
      {isError && !data && (
        <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-6 shadow-xs">
          <ErrorAlert
            title="Không tải được danh sách thông báo"
            message={toApiError(error).message}
            onRetry={() => refetch()}
          />
        </div>
      )}

      {/* Trạng thái rỗng (ui-screens.md: "Chưa có thông báo sự cố nào.", không có nút trong EmptyState) */}
      {isEmpty && (
        <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-8 shadow-xs">
          <EmptyState
            title="Chưa có thông báo sự cố nào."
            icon={<Icons.Empty />}
          />
        </div>
      )}

      {/* Vùng [1]: Danh sách thông báo */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((notification) => (
            <IncidentNotificationCard
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}

      {/* Vùng [2]: Phân trang ở server và điều hướng sang SCR-MED-02 (ui-screens.md SCR-MED-04 Bố cục & Vùng 2) */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="w-full sm:w-auto">
          {!isPending && !isError && totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={data?.totalCount ?? 0}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </div>

        {!isPending && (
          <Link
            href="/medical/history"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low shrink-0 self-end sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
          >
            Mở lịch sử sức khỏe
            <span className="text-outline">
              <Icons.ChevronRight />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
