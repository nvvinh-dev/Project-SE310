"use client";

import { Button, Icons } from "@/components";

interface ExpiredPhotosBannerProps {
  failedCount: number;
  isReloading: boolean;
  onReload: () => void;
}

// SCR-PAR-05: một dải chung khi ảnh của trang đang xem tải lỗi (URL ký hết hạn, D53), thay cho nút "Thử lại"
// ở từng ô ảnh. Cùng giao diện với ErrorAlert nhưng nút cao 44px và có trạng thái đang tải (design-system §7)
export function ExpiredPhotosBanner({
  failedCount,
  isReloading,
  onReload,
}: ExpiredPhotosBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-error/30 bg-error-container/40 p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between text-on-error-container min-w-0"
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="text-error mt-0.5 shrink-0" aria-hidden="true">
          <Icons.Alert />
        </span>
        <div className="min-w-0">
          {/* h2 ngang hàng tiêu đề ngày của lưới ảnh, để thứ tự tiêu đề sau h1 không nhảy cấp (a11y heading-order) */}
          <h2 className="text-sm font-bold text-on-error-container">
            Không tải được {failedCount} ảnh
          </h2>
          <p className="text-xs text-error font-medium mt-0.5 leading-relaxed wrap-anywhere">
            Ảnh có thể đã hết hạn hiển thị. Bấm Thử lại để tải lại ảnh của trang này.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 shrink-0 self-start bg-surface-container-lowest"
        isLoading={isReloading}
        icon={<Icons.Refresh />}
        onClick={onReload}
      >
        {isReloading ? "Đang tải lại..." : "Thử lại"}
      </Button>
    </div>
  );
}
