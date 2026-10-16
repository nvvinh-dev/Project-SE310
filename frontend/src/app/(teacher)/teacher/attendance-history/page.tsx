"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Button, EmptyState, ErrorAlert, Icons } from "@/components";
import {
  getTodayVietnamDateString,
  normalizeForSearch,
  readApiError,
} from "../attendance/_lib/attendance-helpers";
import {
  type AttendanceQuery,
  useAttendances,
  useHomeroomChildren,
} from "../attendance/_lib/attendance-api";
import {
  AttendanceHistoryFilters,
  type HistoryViewMode,
} from "./_components/AttendanceHistoryFilters";
import { AttendanceHistoryStats } from "./_components/AttendanceHistoryStats";
import { AttendanceHistoryTable } from "./_components/AttendanceHistoryTable";

// Xem theo trẻ: 20 bản ghi một trang, khoảng một tháng đi học. Xem theo ngày: cả lớp trên một
// trang (ui-screens.md SCR-TCH-02 vùng [5])
const CHILD_VIEW_PAGE_SIZE = 20;

export default function TeacherAttendanceHistoryPage() {
  const todayStr = useMemo(() => getTodayVietnamDateString(), []);

  // Filter states
  const [mode, setMode] = useState<HistoryViewMode>("date");
  const [date, setDate] = useState<string>(todayStr);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Queries
  const childrenQuery = useHomeroomChildren();
  const childrenList = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);

  // Gửi đúng một trong hai tham số theo cách xem đang chọn (SCR-TCH-02 Hành vi 1). Xem theo trẻ
  // mà chưa chọn trẻ thì chưa gọi API.
  const query: AttendanceQuery | null =
    mode === "date"
      ? date
        ? { date }
        : null
      : selectedChildId
        ? { childId: selectedChildId }
        : null;

  const historyQuery = useAttendances(query, { retry: false });
  const rawAttendances = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);

  // Lỗi khi chưa có dữ liệu thì thay cả bảng; lỗi lúc tải lại thì giữ bảng cũ và báo ở trên
  // (ui-screens.md §4.2)
  const errorMessage = historyQuery.error ? readApiError(historyQuery.error) : null;
  const hasHistoryData = historyQuery.data !== undefined;

  const childrenErrorMessage = useMemo(() => {
    if (!childrenQuery.error) return null;
    return readApiError(childrenQuery.error);
  }, [childrenQuery.error]);

  // Reset page when any filter changes
  const handleModeChange = (newMode: HistoryViewMode) => {
    setMode(newMode);
    if (newMode === "date" && !date) {
      setDate(todayStr);
    }
    if (newMode === "child") {
      setSearch("");
    }
    setPage(1);
  };

  const handleDateChange = (newDate: string) => {
    setMode("date");
    setDate(newDate);
    setPage(1);
  };

  const handleChildChange = (newChildId: string) => {
    setMode("child");
    setSelectedChildId(newChildId);
    // Ô tìm chỉ có khi xem theo ngày; bỏ từ khóa cũ để không lọc ngầm kết quả của trẻ
    setSearch("");
    setPage(1);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleResetFilters = () => {
    setMode("date");
    setDate(todayStr);
    setSelectedChildId("");
    setStatusFilter("all");
    setSearch("");
    setPage(1);
  };

  const handleClearResultFilters = () => {
    setStatusFilter("all");
    setSearch("");
    setPage(1);
  };

  const hasFilters = Boolean(
    mode !== "date" ||
      date !== todayStr ||
      selectedChildId !== "" ||
      statusFilter !== "all" ||
      search !== ""
  );

  // Filter client-side by status and name
  const filteredAttendances = useMemo(() => {
    const keyword = normalizeForSearch(search);

    return rawAttendances.filter((item) => {
      // Filter status
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Filter name
      if (keyword) {
        const name = item.childFullName || "";
        if (!normalizeForSearch(name).includes(keyword)) {
          return false;
        }
      }

      return true;
    });
  }, [rawAttendances, statusFilter, search]);

  // Pagination calculation
  const totalItems = filteredAttendances.length;
  const pageSize = mode === "child" ? CHILD_VIEW_PAGE_SIZE : Math.max(1, totalItems);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAttendances.slice(startIndex, startIndex + pageSize);
  }, [filteredAttendances, currentPage, pageSize]);

  const emptyState =
    query === null
      ? mode === "child"
        ? {
            title: "Chưa chọn trẻ",
            message: "Chọn một trẻ trong lớp để xem lịch sử điểm danh của trẻ đó.",
          }
        : {
            title: "Chưa chọn ngày",
            message: "Chọn một ngày để xem điểm danh của cả lớp trong ngày đó.",
          }
      : rawAttendances.length === 0
        ? {
            title: "Không có bản ghi điểm danh",
            message: "Không có bản ghi điểm danh nào cho lựa chọn này.",
          }
        : {
            title: "Không tìm thấy bản ghi",
            message: "Không có bản ghi nào khớp với bộ lọc đang chọn.",
            actionText: "Xóa bộ lọc",
            onAction: handleClearResultFilters,
          };

  const handleRefresh = () => {
    // refetch() chạy cả khi query đang tắt; chưa đủ tham số thì đừng gọi để khỏi nhận 400
    if (query !== null) historyQuery.refetch();
    childrenQuery.refetch();
  };

  // Lớp chủ nhiệm chưa có trẻ: câu rỗng chung của mọi màn hình giáo viên (ui-screens.md §2.3)
  const isClassEmpty = childrenQuery.isSuccess && childrenList.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">
              Lịch sử điểm danh lớp
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
              Chế độ chỉ xem
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Tra cứu lịch sử điểm danh theo ngày hoặc theo trẻ trong lớp chủ nhiệm.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/teacher/attendance">
            <Button variant="outline" size="sm" className="bg-surface-container-lowest">
              Điểm danh hôm nay
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={historyQuery.isFetching || childrenQuery.isFetching}
            icon={<Icons.Refresh />}
            className="bg-surface-container-lowest"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Cảnh báo nếu tải danh sách trẻ lớp chủ nhiệm bị lỗi */}
      {childrenErrorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900"
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-600 shrink-0">
              <Icons.Alert />
            </span>
            <span>{childrenErrorMessage}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => childrenQuery.refetch()}>
            Tải lại danh sách
          </Button>
        </div>
      )}

      {isClassEmpty ? (
        <EmptyState
          title="Chưa có trẻ trong lớp"
          message="Chưa có trẻ nào trong lớp chủ nhiệm của bạn. Nếu bạn chưa được phân công lớp, liên hệ Ban giám hiệu."
        />
      ) : (
        <>
          {/* Thống kê nhanh kết quả */}
          <AttendanceHistoryStats
            attendances={rawAttendances}
            activeStatusFilter={statusFilter}
            onSelectStatus={handleStatusFilterChange}
          />

          {/* Bộ lọc tra cứu */}
          <AttendanceHistoryFilters
            mode={mode}
            onModeChange={handleModeChange}
            date={date}
            onDateChange={handleDateChange}
            selectedChildId={selectedChildId}
            onChildChange={handleChildChange}
            search={search}
            onSearchChange={handleSearchChange}
            childrenList={childrenList}
            onReset={handleResetFilters}
            hasFilters={hasFilters}
          />

          {/* Tải lại lỗi khi đã có kết quả: giữ bảng cũ, cảnh báo ở đây */}
          {errorMessage && hasHistoryData && (
            <ErrorAlert
              title="Không tải lại được lịch sử điểm danh"
              message={errorMessage}
              onRetry={() => historyQuery.refetch()}
            />
          )}

          {/* Bảng kết quả lịch sử */}
          <AttendanceHistoryTable
            items={paginatedItems}
            isLoading={historyQuery.isLoading}
            errorMessage={hasHistoryData ? null : errorMessage}
            onRetry={() => historyQuery.refetch()}
            empty={emptyState}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
