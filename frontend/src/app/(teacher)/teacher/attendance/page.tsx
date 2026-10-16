"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, ErrorAlert, Icons } from "@/components";
import { toApiError } from "@/lib/axios";
import type {
  AttendanceResponse,
  AttendanceStatus,
  HomeroomChildResponse,
} from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";
import {
  useAttendances,
  useCheckInMutation,
  useHomeroomChildren,
} from "./_lib/attendance-api";
import {
  calculateAttendanceStats,
  formatVietnamDisplayDate,
  getTodayVietnamDateString,
  normalizeForSearch,
  readApiError,
} from "./_lib/attendance-helpers";
import { AttendanceFilters } from "./_components/AttendanceFilters";
import { AttendanceStatsCards } from "./_components/AttendanceStatsCards";
import { AttendanceList, type SubmittingCheckIn } from "./_components/AttendanceList";
import {
  AbsenceConfirmDialog,
  type PendingAbsence,
  type WriteError,
} from "./_components/AbsenceConfirmDialog";
import { HealthNoteModal } from "./_components/HealthNoteModal";

export default function TeacherAttendancePage() {
  const [todayStr, setTodayStr] = useState(() => getTodayVietnamDateString());
  const formattedDisplayDate = useMemo(() => formatVietnamDisplayDate(todayStr), [todayStr]);

  // Queries
  const childrenQuery = useHomeroomChildren();
  const attendancesQuery = useAttendances({ date: todayStr });
  const checkInMutation = useCheckInMutation();

  // Component states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedChildHealthNote, setSelectedChildHealthNote] =
    useState<HomeroomChildResponse | null>(null);
  const [submitting, setSubmitting] = useState<SubmittingCheckIn | null>(null);
  const [pendingAbsence, setPendingAbsence] = useState<PendingAbsence | null>(null);

  // Notification banners (onboarding-guide §4.0.2)
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  // Lỗi không tự ẩn: chỉ mất khi bấm đóng hoặc bắt đầu lần ghi khác (ui-screens.md §4.2)
  const [writeError, setWriteError] = useState<WriteError | null>(null);

  // Dải thành công tự ẩn sau 6 giây
  useEffect(() => {
    if (!successNotice) return;
    const timer = setTimeout(() => setSuccessNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [successNotice]);

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

        return true;
      });
  }, [children, attendanceMap, search, statusFilter]);

  // Ghi điểm danh; trả true khi thành công
  const checkIn = async (childId: string, status: AttendanceStatus): Promise<boolean> => {
    const targetChild = children.find((c) => c.id === childId);
    setSubmitting({ childId, status });
    setWriteError(null);

    try {
      await checkInMutation.mutateAsync({ childId, status });
      const statusLabel = ATTENDANCE_STATUS_LABELS[status];
      const childName = targetChild ? targetChild.fullName : "trẻ";
      setSuccessNotice(`Đã ghi nhận điểm danh "${statusLabel}" cho ${childName}.`);
      return true;
    } catch (err) {
      // Tuân thủ onboarding-guide §4.0.2: luôn dùng toApiError(), không if/else theo từng status.
      // Có errors thì hiển thị danh sách từng dòng, không có thì hiện apiErr.message từ backend.
      const apiErr = toApiError(err);
      setWriteError({
        message: apiErr.message,
        errors: apiErr.errors && apiErr.errors.length > 0 ? apiErr.errors : null,
      });
      return false;
    } finally {
      setSubmitting(null);
    }
  };

  // "Có mặt" bấm một lần là ghi; điểm danh vắng phải xác nhận (SCR-TCH-01 Hành vi 2, 3)
  const handleCheckInClick = (childId: string, status: AttendanceStatus) => {
    if (status === "Present") {
      void checkIn(childId, status);
      return;
    }
    const child = children.find((c) => c.id === childId);
    if (!child) return;
    setWriteError(null);
    setPendingAbsence({ child, status });
  };

  const handleConfirmAbsence = async () => {
    if (!pendingAbsence) return;
    const ok = await checkIn(pendingAbsence.child.id, pendingAbsence.status);
    if (ok) setPendingAbsence(null);
  };

  const handleCloseAbsence = () => {
    setPendingAbsence(null);
    setWriteError(null);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const hasFilters = Boolean(search.trim() !== "" || statusFilter !== "all");

  const handleRefreshAll = () => {
    setTodayStr(getTodayVietnamDateString());
    childrenQuery.refetch();
    attendancesQuery.refetch();
  };

  // Lỗi khi chưa có dữ liệu thì thay cả danh sách; lỗi lúc tải lại thì giữ danh sách cũ và báo ở
  // trên (ui-screens.md §4.2, khuôn SCR-ADM-02)
  const hasData = childrenQuery.data !== undefined && attendancesQuery.data !== undefined;
  const loadError = childrenQuery.error ?? attendancesQuery.error;
  const loadErrorMessage = loadError ? readApiError(loadError) : null;
  const recordedCount = stats.total - stats.unrecorded;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
          <p className="hidden sm:block text-sm text-on-surface-variant mt-1">
            Ghi nhận trạng thái điểm danh khi trẻ đến lớp buổi sáng.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Tiến độ: số trẻ đã điểm danh trên tổng số trẻ (SCR-TCH-01 vùng [1]) */}
          {hasData && stats.total > 0 && (
            <p className="text-sm font-semibold text-on-surface">
              Đã điểm danh {recordedCount}/{stats.total}
            </p>
          )}
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
      {writeError && !pendingAbsence && (
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
              {writeError.errors ? (
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs font-medium text-error">
                  {writeError.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-medium text-error mt-0.5">{writeError.message}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWriteError(null)}
            aria-label="Đóng thông báo"
            className="shrink-0 p-1 rounded-full text-outline hover:bg-error-container hover:text-error transition-colors cursor-pointer"
          >
            <Icons.Close />
          </button>
        </div>
      )}

      {/* Tải lại lỗi khi đã có danh sách: giữ danh sách cũ, cảnh báo ở đây */}
      {loadErrorMessage && hasData && (
        <ErrorAlert
          title="Không tải lại được danh sách"
          message={loadErrorMessage}
          onRetry={handleRefreshAll}
        />
      )}

      {hasData && children.length > 0 && (
        <>
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
            onReset={handleResetFilters}
            hasFilters={hasFilters}
          />
        </>
      )}

      {/* Danh sách trẻ */}
      <AttendanceList
        items={filteredItems}
        submitting={submitting}
        onCheckIn={handleCheckInClick}
        onOpenHealthNote={(ch) => setSelectedChildHealthNote(ch)}
        isLoading={!hasData && !loadError}
        errorMessage={hasData ? null : loadErrorMessage}
        onRetry={handleRefreshAll}
        isClassEmpty={children.length === 0}
        onClearFilters={handleResetFilters}
      />

      {/* Xác nhận điểm danh vắng */}
      <AbsenceConfirmDialog
        pending={pendingAbsence}
        error={writeError}
        isLoading={submitting !== null}
        onConfirm={handleConfirmAbsence}
        onClose={handleCloseAbsence}
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
