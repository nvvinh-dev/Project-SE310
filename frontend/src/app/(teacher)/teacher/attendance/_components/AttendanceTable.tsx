"use client";

import React from "react";
import {
  Button,
  Icons,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableError,
  TableHead,
  TableHeader,
  TableLoading,
  TableRow,
} from "@/components";
import type {
  AttendanceResponse,
  AttendanceStatus,
  HomeroomChildResponse,
} from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";
import { formatCheckInTime } from "../_lib/attendance-helpers";

export interface AttendanceRowItem {
  child: HomeroomChildResponse;
  attendance?: AttendanceResponse;
}

interface AttendanceTableProps {
  items: AttendanceRowItem[];
  submittingChildId: string | null;
  onCheckIn: (childId: string, status: AttendanceStatus) => void;
  onOpenHealthNote: (child: HomeroomChildResponse) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  onRetry: () => void;
}

export function AttendanceTable({
  items,
  submittingChildId,
  onCheckIn,
  onOpenHealthNote,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: AttendanceTableProps) {
  const TABLE_COLUMNS = 6;

  const renderStatusBadge = (status?: AttendanceStatus) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          Chưa điểm danh
        </span>
      );
    }

    if (status === "Present") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          {ATTENDANCE_STATUS_LABELS.Present}
        </span>
      );
    }

    if (status === "AbsentExcused") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          {ATTENDANCE_STATUS_LABELS.AbsentExcused}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
        {ATTENDANCE_STATUS_LABELS.AbsentUnexcused}
      </span>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14 text-center">STT</TableHead>
          <TableHead className="min-w-[180px]">Học sinh</TableHead>
          <TableHead className="w-44">Lưu ý sức khỏe</TableHead>
          <TableHead className="w-40">Trạng thái hôm nay</TableHead>
          <TableHead className="w-32 text-center">Giờ ghi nhận</TableHead>
          <TableHead className="w-72 text-right pr-6">Thao tác điểm danh</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          <TableLoading colSpan={TABLE_COLUMNS} />
        ) : isError ? (
          <TableError
            colSpan={TABLE_COLUMNS}
            message={errorMessage || "Không thể tải danh sách học sinh của lớp. Vui lòng thử lại."}
            onRetry={onRetry}
          />
        ) : items.length === 0 ? (
          <TableEmpty
            colSpan={TABLE_COLUMNS}
            title="Không tìm thấy học sinh"
            message="Không có học sinh nào phù hợp với bộ lọc hiện tại hoặc giáo viên chưa được gán lớp chủ nhiệm."
          />
        ) : (
          items.map((item, index) => {
            const { child, attendance } = item;
            const isSubmitting = submittingChildId === child.id;
            const hasRecorded = Boolean(attendance);

            return (
              <TableRow key={child.id} className="hover:bg-slate-50/80">
                {/* STT */}
                <TableCell className="text-center font-medium text-slate-500 text-xs">
                  {index + 1}
                </TableCell>

                {/* Tên học sinh */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {child.fullName.trim().charAt(0) || "B"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 leading-snug">
                        {child.fullName}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Lưu ý sức khỏe (FR-HEALTH-07) */}
                <TableCell>
                  {child.healthNotes ? (
                    <button
                      type="button"
                      onClick={() => onOpenHealthNote(child)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors shadow-2xs group"
                      title="Bấm để xem chi tiết lưu ý sức khỏe"
                    >
                      <span className="text-amber-600 shrink-0">
                        <Icons.Alert />
                      </span>
                      <span className="truncate max-w-[120px]">
                        {child.healthNotes}
                      </span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Bình thường</span>
                  )}
                </TableCell>

                {/* Trạng thái hôm nay */}
                <TableCell>{renderStatusBadge(attendance?.status)}</TableCell>

                {/* Giờ ghi nhận */}
                <TableCell className="text-center font-mono text-xs text-slate-600">
                  {attendance?.checkInTimeUtc ? (
                    formatCheckInTime(attendance.checkInTimeUtc)
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </TableCell>

                {/* Thao tác điểm danh */}
                <TableCell className="text-right pr-6">
                  {hasRecorded ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80">
                      <span className="text-emerald-600 shrink-0">
                        <Icons.Check />
                      </span>
                      <span>Đã chốt điểm danh</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5">
                      {/* Nút Có mặt */}
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={Boolean(submittingChildId)}
                        isLoading={isSubmitting}
                        onClick={() => onCheckIn(child.id, "Present")}
                        className="px-3 py-1 font-semibold text-xs"
                      >
                        Có mặt
                      </Button>

                      {/* Nút Vắng có phép */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={Boolean(submittingChildId)}
                        onClick={() => onCheckIn(child.id, "AbsentExcused")}
                        className="px-2.5 py-1 text-xs font-semibold border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      >
                        Có phép
                      </Button>

                      {/* Nút Vắng không phép */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={Boolean(submittingChildId)}
                        onClick={() => onCheckIn(child.id, "AbsentUnexcused")}
                        className="px-2.5 py-1 text-xs font-semibold border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
                      >
                        Không phép
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
