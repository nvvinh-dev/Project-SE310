"use client";

import React from "react";
import {
  Pagination,
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
import type { AttendanceResponse, AttendanceStatus } from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";
import {
  formatCheckInTime,
  formatVietnamDisplayDate,
} from "../../attendance/_lib/attendance-helpers";

interface AttendanceHistoryTableProps {
  items: AttendanceResponse[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  onRetry: () => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function AttendanceHistoryTable({
  items,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: AttendanceHistoryTableProps) {
  const TABLE_COLUMNS = 5;

  const renderStatusBadge = (status: AttendanceStatus) => {
    if (status === "Present") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          {ATTENDANCE_STATUS_LABELS.Present}
        </span>
      );
    }

    if (status === "AbsentExcused") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          {ATTENDANCE_STATUS_LABELS.AbsentExcused}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
        {ATTENDANCE_STATUS_LABELS.AbsentUnexcused}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 text-center">STT</TableHead>
            <TableHead className="w-48">Ngày điểm danh</TableHead>
            <TableHead className="min-w-[200px]">Học sinh</TableHead>
            <TableHead className="w-36 text-center">Giờ ghi nhận</TableHead>
            <TableHead className="w-48 text-right pr-6">Trạng thái điểm danh</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableLoading colSpan={TABLE_COLUMNS} rowCount={5} />
          ) : isError ? (
            <TableError
              colSpan={TABLE_COLUMNS}
              message={
                errorMessage ||
                "Không thể tải lịch sử điểm danh. Vui lòng kiểm tra kết nối và thử lại."
              }
              onRetry={onRetry}
            />
          ) : items.length === 0 ? (
            <TableEmpty
              colSpan={TABLE_COLUMNS}
              title="Không có bản ghi điểm danh"
              message="Không tìm thấy bản ghi điểm danh nào trong ngày hoặc học sinh đã chọn. (BR-ATTENDANCE-04: Giáo viên chỉ xem bản ghi đã tạo của lớp mình)."
            />
          ) : (
            items.map((item, index) => {
              const rowNumber = (currentPage - 1) * pageSize + index + 1;

              return (
                <TableRow key={item.id} className="hover:bg-slate-50/80">
                  {/* STT */}
                  <TableCell className="text-center font-medium text-slate-500 text-xs">
                    {rowNumber}
                  </TableCell>

                  {/* Ngày điểm danh */}
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-xs">
                      {formatVietnamDisplayDate(item.attendanceDate)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {item.attendanceDate}
                    </div>
                  </TableCell>

                  {/* Tên học sinh */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {item.childFullName?.trim().charAt(0) || "B"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-snug">
                          {item.childFullName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          ID: {item.childId.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Giờ ghi nhận */}
                  <TableCell className="text-center font-mono text-xs text-slate-600">
                    {item.checkInTimeUtc ? (
                      formatCheckInTime(item.checkInTimeUtc)
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>

                  {/* Trạng thái điểm danh (Chỉ xem) */}
                  <TableCell className="text-right pr-6">
                    {renderStatusBadge(item.status)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Phân trang */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
}
