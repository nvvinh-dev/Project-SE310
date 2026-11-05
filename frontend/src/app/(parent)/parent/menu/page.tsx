"use client";

import { useMemo, useState } from "react";
import { EmptyState, ErrorAlert, Icons, LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import {
  addDaysToDateString,
  getMondayOfWeek,
  getTodayVietnamDateString,
} from "@/lib/datetime";
import { useWeeklyMenu } from "./_lib/parent-menu-api";
import { buildWeeklySchedule } from "./_lib/menu-helpers";
import { WeeklyMenuHeader } from "./_components/WeeklyMenuHeader";
import { WeeklyMenuDisplay } from "./_components/WeeklyMenuDisplay";

export default function ParentWeeklyMenuPage() {
  // Tuần hiện tại: lấy ngày thứ Hai theo giờ Việt Nam (ui-screens.md §4.4)
  const currentWeekMonday = useMemo(() => {
    return getMondayOfWeek(getTodayVietnamDateString());
  }, []);

  const [weekStartDate, setWeekStartDate] = useState<string>(currentWeekMonday);

  // Điều hướng tuần: luôn cộng/trừ 7 ngày từ thứ Hai (SCR-PAR-07)
  const handlePreviousWeek = () => {
    setWeekStartDate((prev) => addDaysToDateString(prev, -7));
  };

  const handleNextWeek = () => {
    setWeekStartDate((prev) => addDaysToDateString(prev, 7));
  };

  // Tải thực đơn tuần từ API: GET /api/weekly-menus?weekStartDate=
  const menuQuery = useWeeklyMenu(weekStartDate);
  const menuData = menuQuery.data;

  // Lắp ghép thực đơn 7 ngày trong tuần từ entries nhận được
  const scheduleItems = useMemo(() => {
    return buildWeeklySchedule(menuData?.entries ?? []);
  }, [menuData]);

  // Đọc lỗi thống nhất từ backend qua toApiError (ui-screens.md §4.2, frontend-conventions.md §5)
  const errorMessage = useMemo(() => {
    if (!menuQuery.error) return null;
    const apiError = toApiError(menuQuery.error);
    if (apiError.errors && apiError.errors.length > 0) {
      return apiError.errors.join("\n");
    }
    return apiError.message;
  }, [menuQuery.error]);

  // Trạng thái theo frontend-conventions.md §3.3 và ui-screens.md §4.2:
  // - isInitialLoading: chưa có dữ liệu và đang tải lần đầu
  // - isInitialError: chưa có dữ liệu nào trong cache (undefined) và gặp lỗi
  // - hasStaleData: đã có dữ liệu trong cache (kể cả tuần rỗng null), khi tải lại lỗi thì giữ nguyên và cảnh báo phía trên
  const isInitialLoading = menuQuery.isPending;
  const isInitialError = menuQuery.isError && menuData === undefined;
  const hasStaleData = menuData !== undefined;

  return (
    <div className="py-8 space-y-6">
      {/* Vùng [1]: Tiêu đề trang & Thanh chọn tuần */}
      <WeeklyMenuHeader
        weekStartDate={weekStartDate}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
      />

      {/* Cảnh báo lỗi làm mới khi đã có dữ liệu cũ trong cache (ui-screens.md §4.2) */}
      {hasStaleData && menuQuery.isError && errorMessage && (
        <ErrorAlert
          title="Không thể làm mới thực đơn"
          message={errorMessage}
          onRetry={() => menuQuery.refetch()}
        />
      )}

      {/* Vùng [2]: Nội dung thực đơn theo các trạng thái */}
      {isInitialLoading ? (
        <LoadingSpinner label="Đang tải thực đơn tuần..." />
      ) : isInitialError ? (
        <ErrorAlert
          title="Không thể tải thực đơn"
          message={errorMessage ?? ""}
          onRetry={() => menuQuery.refetch()}
        />
      ) : menuData === null ? (
        /* Trạng thái rỗng: backend trả 404 "Chưa có thực đơn cho tuần này." (SCR-PAR-07) */
        <EmptyState
          title="Chưa có thực đơn"
          message="Nhà trường chưa đăng thực đơn cho tuần này."
          icon={<Icons.Empty />}
        />
      ) : (
        /* Đã có thực đơn tuần: hiển thị 7 ngày */
        <WeeklyMenuDisplay items={scheduleItems} />
      )}
    </div>
  );
}
