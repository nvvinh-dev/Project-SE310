"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Icons } from "@/components";
import { toApiError } from "@/lib/axios";
import {
  getTodayVietnamDateString,
  normalizeForSearch,
} from "../attendance/_lib/attendance-helpers";
import {
  useAttendanceHistory,
  useHomeroomChildrenList,
} from "./_lib/attendance-history-api";
import { AttendanceHistoryFilters } from "./_components/AttendanceHistoryFilters";
import { AttendanceHistoryStats } from "./_components/AttendanceHistoryStats";
import { AttendanceHistoryTable } from "./_components/AttendanceHistoryTable";

const PAGE_SIZE = 10;

export default function TeacherAttendanceHistoryPage() {
  const todayStr = useMemo(() => getTodayVietnamDateString(), []);

  // Filter states
  const [date, setDate] = useState<string>(todayStr);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Queries
  const childrenQuery = useHomeroomChildrenList();
  const childrenList = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);

  // Fail-safe: Tự động đảm bảo có ít nhất ngày hoặc học sinh được chọn
  const queryParams = useMemo(() => {
    return {
      childId: selectedChildId || undefined,
      date: date || undefined,
    };
  }, [selectedChildId, date]);

  const historyQuery = useAttendanceHistory(queryParams);
  const rawAttendances = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);

  // Đọc lỗi theo onboarding-guide §4.0.2: có errors thì liệt kê đủ các dòng, không có thì hiện message
  const errorMessage = useMemo(() => {
    if (!historyQuery.error) return null;
    const apiErr = toApiError(historyQuery.error);
    if (apiErr.errors && apiErr.errors.length > 0) {
      return apiErr.errors.join("\n");
    }
    return apiErr.message || "Không thể tải lịch sử điểm danh. Vui lòng thử lại.";
  }, [historyQuery.error]);

  const childrenErrorMessage = useMemo(() => {
    if (!childrenQuery.error) return null;
    const apiErr = toApiError(childrenQuery.error);
    return apiErr.message || "Không thể tải danh sách học sinh của lớp.";
  }, [childrenQuery.error]);

  // Reset page when any filter changes
  const handleDateChange = (newDate: string) => {
    // Tránh tình trạng ngày trống khi chưa chọn học sinh
    if (!newDate && !selectedChildId) {
      return;
    }
    setDate(newDate);
    setPage(1);
  };

  const handleChildChange = (newChildId: string) => {
    setSelectedChildId(newChildId);
    // Khi bỏ chọn học sinh trong lúc ngày đang trống ("Tất cả ngày"), tự động phục hồi ngày hôm nay
    if (!newChildId && !date) {
      setDate(todayStr);
    }
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
    setDate(todayStr);
    setSelectedChildId("");
    setStatusFilter("all");
    setSearch("");
    setPage(1);
  };

  const hasFilters = Boolean(
    date !== todayStr || selectedChildId !== "" || statusFilter !== "all" || search !== ""
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
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredAttendances.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAttendances, currentPage]);

  const handleRefresh = () => {
    historyQuery.refetch();
    childrenQuery.refetch();
  };

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
            Tra cứu lịch sử điểm danh theo ngày hoặc theo học sinh trong lớp chủ nhiệm.
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

      {/* Thống kê nhanh kết quả */}
      <AttendanceHistoryStats
        attendances={rawAttendances}
        activeStatusFilter={statusFilter}
        onSelectStatus={handleStatusFilterChange}
      />

      {/* Bộ lọc tra cứu */}
      <AttendanceHistoryFilters
        date={date}
        onDateChange={handleDateChange}
        selectedChildId={selectedChildId}
        onChildChange={handleChildChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        search={search}
        onSearchChange={handleSearchChange}
        childrenList={childrenList}
        onReset={handleResetFilters}
        hasFilters={hasFilters}
      />

      {/* Bảng kết quả lịch sử */}
      <AttendanceHistoryTable
        items={paginatedItems}
        isLoading={historyQuery.isLoading}
        isError={historyQuery.isError}
        errorMessage={errorMessage}
        onRetry={() => historyQuery.refetch()}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        totalItems={totalItems}
        onPageChange={setPage}
      />
    </div>
  );
}