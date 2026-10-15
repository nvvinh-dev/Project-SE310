"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Icons } from "@/components";
import { toApiError } from "@/lib/axios";
import type {
  AttendanceResponse,
  AttendanceStatus,
  HomeroomChildResponse,
} from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";
import {
  useCheckInMutation,
  useHomeroomChildren,
  useTodayAttendances,
} from "./_lib/attendance-api";
import {
  calculateAttendanceStats,
  formatVietnamDisplayDate,
  getTodayVietnamDateString,
  normalizeForSearch,
} from "./_lib/attendance-helpers";
import { AttendanceFilters } from "./_components/AttendanceFilters";
import { AttendanceStatsCards } from "./_components/AttendanceStatsCards";
import { AttendanceTable } from "./_components/AttendanceTable";
import { HealthNoteModal } from "./_components/HealthNoteModal";

export default function TeacherAttendancePage() {
  const [todayStr, setTodayStr] = useState(() => getTodayVietnamDateString());
  const formattedDisplayDate = useMemo(() => formatVietnamDisplayDate(todayStr), [todayStr]);

  // Queries
  const childrenQuery = useHomeroomChildren();
  const attendancesQuery = useTodayAttendances(todayStr);
  const checkInMutation = useCheckInMutation(todayStr);

  // Component states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyHealthNotes, setOnlyHealthNotes] = useState(false);
  const [selectedChildHealthNote, setSelectedChildHealthNote] =
    useState<HomeroomChildResponse | null>(null);
  const [submittingChildId, setSubmittingChildId] = useState<string | null>(null);

  // Notification banners (onboarding-guide §4.0.2)
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [errorErrors, setErrorErrors] = useState<string[] | null>(null);

  // Auto-dismiss notices after 6 seconds
  useEffect(() => {
    if (!successNotice) return;
    const timer = setTimeout(() => setSuccessNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [successNotice]);

  useEffect(() => {
    if (!errorNotice && (!errorErrors || errorErrors.length === 0)) return;
    const timer = setTimeout(() => {
      setErrorNotice(null);
      setErrorErrors(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [errorNotice, errorErrors]);

  const children = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);
  const attendances = useMemo(() => attendancesQuery.data ?? [], [attendancesQuery.data]);

  // Map attendance by childId for fast lookup
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceResponse>();
    for (const att of attendances) {
      map.set(att.childId, att);
    }
    return map;
  }, [attendances]);

  // Compute statistics
  const stats = useMemo(() => {
    const recordedStatuses = children.map((c) => attendanceMap.get(c.id)?.status);
    return calculateAttendanceStats(children.length, recordedStatuses);
  }, [children, attendanceMap]);

  // Combine & filter children rows
  const filteredItems = useMemo(() => {
    const normalizedKeyword = normalizeForSearch(search);

    return children
      .map((child) => ({
        child,
        attendance: attendanceMap.get(child.id),
      }))
      .filter(({ child, attendance }) => {
        // Name filter
        if (
          normalizedKeyword &&
          !normalizeForSearch(child.fullName).includes(normalizedKeyword)
        ) {
          return false;
        }

        // Status filter
        if (statusFilter === "Unrecorded" && attendance) {
          return false;
        }
        if (
          statusFilter !== "all" &&
          statusFilter !== "Unrecorded" &&
          attendance?.status !== statusFilter
        ) {
          return false;
        }

        // Health notes filter
        if (onlyHealthNotes && (!child.healthNotes || !child.healthNotes.trim())) {
          return false;
        }

        return true;
      });
  }, [children, attendanceMap, search, statusFilter, onlyHealthNotes]);

  // Check-in action handler
  const handleCheckIn = async (childId: string, status: AttendanceStatus) => {
    const targetChild = children.find((c) => c.id === childId);
    setSubmittingChildId(childId);
    setErrorNotice(null);
    setErrorErrors(null);

    try {
      await checkInMutation.mutateAsync({ childId, status });
      const statusLabel = ATTENDANCE_STATUS_LABELS[status];
      const childName = targetChild ? targetChild.fullName : "trẻ";
      setSuccessNotice(`Đã ghi nhận điểm danh: "${statusLabel}" cho bé ${childName}.`);
    } catch (err) {
      // Tuân thủ onboarding-guide §4.0.2: luôn dùng toApiError(), không if/else theo từng status.
      // Có errors thì hiển thị danh sách từng dòng, không có thì hiện apiErr.message từ backend.
      const apiErr = toApiError(err);
      if (apiErr.errors && apiErr.errors.length > 0) {
        setErrorErrors(apiErr.errors);
        setErrorNotice(null);
      } else {
        setErrorNotice(apiErr.message || "Không thể ghi nhận điểm danh. Vui lòng thử lại.");
        setErrorErrors(null);
      }
    } finally {
      setSubmittingChildId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setOnlyHealthNotes(false);
  };

  const hasFilters = Boolean(
    search.trim() !== "" || statusFilter !== "all" || onlyHealthNotes
  );

  const handleRefreshAll = () => {
    setTodayStr(getTodayVietnamDateString());
    childrenQuery.refetch();
    attendancesQuery.refetch();
  };

  // Lấy lỗi từ query qua toApiError để truyền thông báo chính xác vào TableError
  const tableError = childrenQuery.error || attendancesQuery.error;
  const tableErrorMessage = useMemo(() => {
    if (!tableError) return null;
    const apiErr = toApiError(tableError);
    if (apiErr.errors && apiErr.errors.length > 0) {
      return apiErr.errors.join("; ");
    }
    return apiErr.message || "Không thể tải danh sách học sinh của lớp. Vui lòng thử lại.";
  }, [tableError]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">
              Điểm danh vào lớp
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-fixed/40 text-on-primary-fixed border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {formattedDisplayDate}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Ghi nhận trạng thái điểm danh học sinh khi đến lớp buổi sáng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={childrenQuery.isFetching || attendancesQuery.isFetching}
            icon={<Icons.Refresh />}
            className="bg-surface-container-lowest"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      {successNotice && (
        <div
          role="status"
          className="rounded-2xl border border-primary/20 bg-primary-fixed/30 p-4 flex items-start justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-start gap-3">
            <span className="text-primary mt-0.5 shrink-0">
              <Icons.Check />
            </span>
            <p className="text-sm font-semibold text-on-surface">{successNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            aria-label="Đóng thông báo"
            className="shrink-0 p-1 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
          >
            <Icons.Close />
          </button>
        </div>
      )}

      {/* Error Banner (hiển thị danh sách errors nếu có, hoặc message từ backend) */}
      {(errorNotice || (errorErrors && errorErrors.length > 0)) && (
        <div
          role="alert"
          className="rounded-2xl border border-error/30 bg-error-container/40 p-4 flex items-start justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-start gap-3">
            <span className="text-error mt-0.5 shrink-0">
              <Icons.Alert />
            </span>
            <div>
              <p className="text-sm font-bold text-on-error-container">Lỗi điểm danh</p>
              {errorErrors && errorErrors.length > 0 ? (
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs font-medium text-error">
                  {errorErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-medium text-error mt-0.5">{errorNotice}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setErrorNotice(null);
              setErrorErrors(null);
            }}
            aria-label="Đóng thông báo"
            className="shrink-0 p-1 rounded-full text-outline hover:bg-error-container hover:text-error transition-colors cursor-pointer"
          >
            <Icons.Close />
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <AttendanceStatsCards
        stats={stats}
        activeFilter={statusFilter}
        onFilterStatus={(st) => setStatusFilter(st)}
      />

      {/* Search & Filters */}
      <AttendanceFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onlyHealthNotes={onlyHealthNotes}
        onOnlyHealthNotesChange={setOnlyHealthNotes}
        onReset={handleResetFilters}
        hasFilters={hasFilters}
      />

      {/* Main Attendance Table */}
      <AttendanceTable
        items={filteredItems}
        submittingChildId={submittingChildId}
        onCheckIn={handleCheckIn}
        onOpenHealthNote={(ch) => setSelectedChildHealthNote(ch)}
        isLoading={childrenQuery.isLoading || attendancesQuery.isLoading}
        isError={childrenQuery.isError || attendancesQuery.isError}
        errorMessage={tableErrorMessage}
        onRetry={handleRefreshAll}
      />

      {/* Health Note Details Modal */}
      <HealthNoteModal
        child={selectedChildHealthNote}
        isOpen={Boolean(selectedChildHealthNote)}
        onClose={() => setSelectedChildHealthNote(null)}
      />
    </div>
  );
}