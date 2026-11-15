"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState, ErrorAlert, Icons, LoadingSpinner, Pagination } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatMeasurementDateTime } from "@/lib/datetime";
import { useAdminNotifications } from "./_lib/admin-notifications-api";

const PAGE_SIZE = 20;

// SCR-ADM-05 — Thông báo (FR-NOTI-04). Admin chỉ nhận thông báo phản ánh mới, nội dung do backend soạn
// (họ tên phụ huynh, họ tên trẻ), hiện nguyên văn. Không có đã đọc/chưa đọc, không xóa (D25). Thông báo
// không có id phản ánh nên nút chỉ mở danh sách phản ánh (ui-screens.md §11 mục 2)
export default function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const notificationsQuery = useAdminNotifications(page, PAGE_SIZE);
  const data = notificationsQuery.data;

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE)) : 1;
  // Tổng số giảm làm trang đang xem không còn: lùi về trang cuối, đặt lại ngay trong lúc render như
  // trang phản ánh
  if (data && !notificationsQuery.isPlaceholderData && page > totalPages) {
    setPage(totalPages);
  }
  const loadError = notificationsQuery.isError ? toApiError(notificationsQuery.error).message : null;
  const retry = () => void notificationsQuery.refetch();
  const items = data?.items ?? [];

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-on-surface">Thông báo</h1>
          <p className="text-sm text-on-surface-variant">Thông báo khi phụ huynh gửi phản ánh mới tới Ban giám hiệu.</p>
        </div>
        <Link
          href="/admin/complaints"
          className="inline-flex min-h-11 sm:min-h-0 items-center justify-center gap-1 self-start sm:self-auto shrink-0 rounded-full border border-slate-300 bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Mở danh sách phản ánh
          <Icons.ChevronRight />
        </Link>
      </div>

      {loadError && data && (
        <ErrorAlert title="Không tải lại được danh sách" message={loadError} onRetry={retry} />
      )}

      {notificationsQuery.isPending ? (
        <LoadingSpinner label="Đang tải thông báo..." />
      ) : !data ? (
        <ErrorAlert title="Không tải được thông báo" message={loadError ?? ""} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState title="Không có thông báo" message="Chưa có thông báo nào." />
      ) : (
        <div className="space-y-4">
          <ul className={`space-y-3 transition-opacity ${notificationsQuery.isPlaceholderData ? "opacity-60" : ""}`}>
            {items.map((notification) => (
              <li
                key={notification.id}
                className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs space-y-2 min-w-0"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <span className="text-outline" aria-hidden="true">
                    <Icons.Clock />
                  </span>
                  <time dateTime={notification.createdAtUtc} className="font-semibold text-on-surface">
                    {formatMeasurementDateTime(notification.createdAtUtc)}
                  </time>
                </div>
                <p className="whitespace-pre-wrap break-words wrap-anywhere text-sm leading-relaxed text-on-surface">
                  {notification.message}
                </p>
              </li>
            ))}
          </ul>

          {/* Chỉ hiện khi có hơn một trang (frontend-conventions.md §3.4) */}
          {totalPages > 1 && (
            <Pagination
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={data.totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
