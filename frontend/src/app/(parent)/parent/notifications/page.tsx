"use client";

import { useState } from "react";
import {
  EmptyState,
  ErrorAlert,
  Icons,
  LoadingSpinner,
  NoticeBanner,
  Pagination,
} from "@/components";
import { toApiError } from "@/lib/axios";
import { NotificationItem } from "./_components/NotificationItem";
import { useMyNotifications } from "./_lib/parent-notifications-api";

const PAGE_SIZE = 20;

export default function ParentNotificationsPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Lấy danh sách thông báo in-app của phụ huynh (FR-NOTI-01, UC-NOTI-01, AC-NOTI-01)
  const notificationsQuery = useMyNotifications({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const pageData = notificationsQuery.data;
  const notificationsList = pageData?.items ?? [];
  const totalCount = pageData?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Cuộn nhẹ lên đầu trang danh sách thông báo trên màn hình nhỏ
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4 Trạng thái giao diện
  const hasData = pageData !== undefined;
  const isInitialLoading = notificationsQuery.isPending && !hasData;
  const isInitialError = notificationsQuery.isError && !hasData;
  const isBackgroundError = notificationsQuery.isError && hasData;
  const errorMessage = notificationsQuery.error
    ? toApiError(notificationsQuery.error).message ?? "Không thể tải danh sách thông báo."
    : null;

  return (
    <div className="py-8 space-y-6 min-w-0 max-w-7xl">
      {/* Tiêu đề & Giới thiệu */}
      <div className="space-y-1 min-w-0">
        <h1 className="text-2xl font-bold text-on-surface wrap-anywhere">
          Thông báo
        </h1>
        <p className="text-sm text-on-surface-variant wrap-anywhere">
          Xem thông báo nhà trường gửi về học phí, sự cố, sức khỏe, ảnh hoạt động, lịch nghỉ học và kết quả phản ánh.
        </p>
      </div>

      {/* Dải báo lỗi tải lại nền */}
      {isBackgroundError && errorMessage && (
        <NoticeBanner
          message={errorMessage}
          onClose={() => void notificationsQuery.refetch()}
          role="alert"
        />
      )}

      {/* 4 Trạng thái nội dung */}
      {isInitialLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner label="Đang tải danh sách thông báo..." />
        </div>
      ) : isInitialError ? (
        <ErrorAlert
          message={errorMessage || "Không thể tải danh sách thông báo."}
          onRetry={() => void notificationsQuery.refetch()}
        />
      ) : notificationsList.length === 0 ? (
        <EmptyState
          title="Chưa có thông báo nào"
          message="Bạn chưa có thông báo nào từ nhà trường."
          icon={<Icons.Clipboard />}
        />
      ) : (
        <div className="space-y-4 min-w-0">
          {/* Danh sách thông báo */}
          <div className="space-y-3 min-w-0">
            {notificationsList.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>

          {/* Phân trang server (ui-screens.md SCR-PAR-08 Vùng 2) */}
          {totalPages > 1 && (
            <div className="pt-4 flex justify-center min-w-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
