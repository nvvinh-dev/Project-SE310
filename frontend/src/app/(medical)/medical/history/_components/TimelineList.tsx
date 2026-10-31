"use client";

import { EmptyState, ErrorAlert, Icons, LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import type { HealthHistoryItemResponse } from "@/types/health";
import { TimelineItem } from "./TimelineItem";

interface TimelineListProps {
  selectedChildId: string | null;
  items: HealthHistoryItemResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

// Vùng [3]: Trục thời gian hiển thị lịch sử gộp (ui-screens.md dòng 899-903, 911)
// Đảm bảo đủ 3 trạng thái: Đang tải / Lỗi / Rỗng theo AC-NFR-04 và §4.2
export function TimelineList({
  selectedChildId,
  items,
  isLoading,
  isError,
  error,
  refetch,
}: TimelineListProps) {
  // 1. Chưa chọn trẻ
  if (!selectedChildId) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-8 text-center shadow-xs">
        <EmptyState
          title="Chưa chọn trẻ"
          message="Vui lòng tìm và chọn một trẻ ở trên để xem lịch sử sức khỏe và sự cố."
          icon={<Icons.User />}
        />
      </div>
    );
  }

  // 2. Đang tải lần đầu (chưa có dữ liệu trong cache)
  if (isLoading && !items) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-8 shadow-xs">
        <LoadingSpinner label="Đang tải lịch sử sức khỏe và sự cố..." />
      </div>
    );
  }

  // 3. Lỗi tải lần đầu (không có dữ liệu cũ)
  if (isError && !items) {
    const apiError = toApiError(error);
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-6 shadow-xs">
        <ErrorAlert
          title="Không thể tải lịch sử sức khỏe"
          message={apiError.message || "Đã xảy ra lỗi khi kết nối tới máy chủ."}
          onRetry={refetch}
        />
      </div>
    );
  }

  // 4. Có dữ liệu nhưng danh sách rỗng
  if (items && items.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-8 text-center shadow-xs">
        <EmptyState
          title="Chưa có bản ghi nào"
          message="Chưa có bản ghi sức khỏe hay sự cố nào cho trẻ này."
          icon={<Icons.Clipboard />}
        />
      </div>
    );
  }

  // 5. Hiển thị danh sách dòng thời gian
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-6 shadow-xs space-y-4">
      {/* Tiêu đề vùng và cảnh báo lỗi khi tải lại (nếu có lỗi trong lúc dữ liệu cũ vẫn còn) */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-on-surface">Dòng thời gian</h2>
        <span className="text-xs text-on-surface-variant font-medium">
          Mới nhất trước ({items?.length ?? 0} bản ghi)
        </span>
      </div>

      {isError && (
        <ErrorAlert
          title="Lỗi khi làm mới"
          message={
            toApiError(error).message ||
            "Không thể cập nhật dữ liệu mới nhất. Đang hiển thị bản ghi đã lưu tạm."
          }
          onRetry={refetch}
          className="mb-4"
        />
      )}

      {/* Danh sách các item trên dòng thời gian */}
      <div className="pt-2">
        {items?.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            isLast={index === (items.length - 1)}
          />
        ))}
      </div>
    </div>
  );
}
