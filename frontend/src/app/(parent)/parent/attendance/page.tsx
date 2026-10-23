"use client";

import { useMemo, useState } from "react";
import { EmptyState, ErrorAlert, LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import { useMyChildren, useChildAttendances } from "./_lib/parent-attendance-api";
import { ChildSelectHeader } from "./_components/ChildSelectHeader";
import { AttendanceHistoryTable } from "./_components/AttendanceHistoryTable";

// Cỡ trang mặc định là 20 bản ghi theo quy ước frontend-conventions.md §3.4
const PAGE_SIZE = 20;

export default function ParentAttendancePage() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // 1. Tải danh sách con của phụ huynh đang đăng nhập (FR-ATT-02, D45)
  const childrenQuery = useMyChildren();
  const childrenList = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);

  // Tự động chọn con đầu tiên khi nạp danh sách thành công
  const activeChildId = useMemo(() => {
    if (selectedChildId && childrenList.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return childrenList[0]?.id ?? "";
  }, [selectedChildId, childrenList]);

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setPage(1);
  };

  // 2. Tải lịch sử điểm danh của con đang chọn (FR-ATT-02, UC-ATT-02, AC-ATT-03, AC-ATT-04)
  const attendancesQuery = useChildAttendances(activeChildId);
  const rawAttendances = useMemo(
    () => attendancesQuery.data ?? [],
    [attendancesQuery.data]
  );

  // Dùng cho "Thử lại": tải lại danh sách trẻ trước (ui-screens.md §4.2, §10: 404 thì tải lại danh sách con).
  // Trẻ đang xem vừa bị gỡ liên kết thì chuyển sang trẻ khác hoặc về rỗng, thay vì gửi lại đúng request sẽ lại 404.
  // Không rẽ nhánh theo mã lỗi.
  const handleRefresh = async () => {
    const childrenResult = await childrenQuery.refetch();
    const latestChildren = childrenResult.data ?? [];
    if (
      activeChildId &&
      !latestChildren.some((c) => c.id === activeChildId)
    ) {
      setSelectedChildId(latestChildren[0]?.id ?? "");
      setPage(1);
      return;
    }
    if (activeChildId) {
      void attendancesQuery.refetch();
    }
  };

  // Phân trang phía client (frontend-conventions.md §3.4)
  const totalItems = rawAttendances.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAttendances = useMemo(() => {
    return rawAttendances.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [rawAttendances, currentPage]);

  // Xử lý lỗi theo ui-screens.md §4.2 & frontend-conventions.md §3.3:
  // - Chỉ hiện lỗi thay cả màn hình khi chưa có dữ liệu (data === undefined).
  // - Đã có dữ liệu mà lần tải lại bị lỗi thì giữ dữ liệu cũ và báo phía trên.
  const isChildrenInitialLoading = childrenQuery.isPending && childrenQuery.data === undefined;
  const isChildrenInitialError = childrenQuery.isError && childrenQuery.data === undefined;
  const childrenErrorMessage = childrenQuery.error
    ? toApiError(childrenQuery.error).message
    : null;

  const hasHistoryData = attendancesQuery.data !== undefined;
  const historyErrorMessage = attendancesQuery.error
    ? toApiError(attendancesQuery.error).message
    : null;

  return (
    <div className="py-8 space-y-6">
      {/* Tiêu đề trang và ô chọn con (nếu có nhiều hơn 1 con) */}
      <ChildSelectHeader
        childrenList={childrenList}
        selectedChildId={activeChildId}
        onSelectChild={handleSelectChild}
        isLoading={attendancesQuery.isPending}
      />

      {/* Cảnh báo lỗi tải lại danh sách con (khi đã có dữ liệu cũ trong cache) */}
      {!isChildrenInitialError && childrenErrorMessage && (
        <ErrorAlert
          title="Không thể làm mới danh sách con"
          message={childrenErrorMessage}
          onRetry={handleRefresh}
        />
      )}

      {/* Cảnh báo lỗi làm mới lịch sử điểm danh (khi bảng vẫn còn dữ liệu cũ) */}
      {hasHistoryData && rawAttendances.length > 0 && historyErrorMessage && (
        <ErrorAlert
          title="Không thể làm mới dữ liệu"
          message={historyErrorMessage}
          onRetry={handleRefresh}
        />
      )}

      {/* Nội dung trang theo từng trạng thái */}
      {isChildrenInitialLoading ? (
        <LoadingSpinner label="Đang tải danh sách con..." />
      ) : isChildrenInitialError ? (
        <ErrorAlert
          title="Không thể tải danh sách con"
          message={childrenErrorMessage!}
          onRetry={handleRefresh}
        />
      ) : childrenList.length === 0 ? (
        /* Tài khoản phụ huynh chưa được liên kết với trẻ nào (ui-screens.md Bảng 2.3) */
        <EmptyState
          title="Chưa liên kết trẻ"
          message="Tài khoản chưa được liên kết với trẻ nào. Liên hệ văn phòng nhà trường."
        />
      ) : (
        /* Vùng [2]: Bảng lịch sử điểm danh */
        <AttendanceHistoryTable
          items={pagedAttendances}
          isLoading={attendancesQuery.isPending}
          errorMessage={historyErrorMessage}
          onRetry={handleRefresh}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
