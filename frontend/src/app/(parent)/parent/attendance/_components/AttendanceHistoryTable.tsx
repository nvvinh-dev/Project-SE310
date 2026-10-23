"use client";

import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
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
import type { ChildAttendanceResponse } from "@/types/attendance";
import { formatVietnamShortDate, formatVietnamTime } from "@/lib/datetime";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";

// SCR-PAR-02: Bố cục 3 cột (Ngày | Trạng thái | Giờ ghi nhận)
const TABLE_COLUMNS = 3;
const EMPTY_MESSAGE = "Chưa có bản ghi điểm danh nào của con.";

interface AttendanceHistoryTableProps {
  items: ChildAttendanceResponse[];
  isLoading: boolean;
  errorMessage: string | null;
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
  errorMessage,
  onRetry,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: AttendanceHistoryTableProps) {
  return (
    <div className="space-y-4">
      {/* 1. Giao diện Desktop (Bảng Table) từ màn hình xl trở lên (design-system.md §6, khuôn SCR-ADM-02) */}
      <div className="hidden xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Ngày</TableHead>
              <TableHead className="min-w-[180px]">Trạng thái</TableHead>
              {/* SCR-PAR-02: Cột ghi 'Giờ ghi nhận', không ghi 'Giờ đến' (D23) */}
              <TableHead className="min-w-[140px] text-center">Giờ ghi nhận</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={TABLE_COLUMNS} rowCount={5} />
            ) : errorMessage && items.length === 0 ? (
              <TableError colSpan={TABLE_COLUMNS} message={errorMessage} onRetry={onRetry} />
            ) : items.length === 0 ? (
              <TableEmpty
                colSpan={TABLE_COLUMNS}
                title="Chưa có dữ liệu điểm danh"
                message={EMPTY_MESSAGE}
              />
            ) : (
              items.map((item) => {
                // SCR-PAR-02: Dòng vắng hiện '—' thay vì giờ (D23)
                const recordedTimeDisplay =
                  item.status === "Present" ? formatVietnamTime(item.checkInTimeUtc) : "—";

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-semibold text-on-surface text-sm">
                        {formatVietnamShortDate(item.attendanceDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-center text-sm tabular-nums text-on-surface">
                      {recordedTimeDisplay}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 2. Giao diện Mobile & Tablet (Danh sách thẻ Card) dưới màn hình xl (design-system.md §6) */}
      <div className="xl:hidden">
        {isLoading ? (
          <LoadingSpinner label="Đang tải lịch sử điểm danh..." />
        ) : errorMessage && items.length === 0 ? (
          <ErrorAlert
            title="Không thể tải lịch sử điểm danh"
            message={errorMessage}
            onRetry={onRetry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu điểm danh"
            message={EMPTY_MESSAGE}
          />
        ) : (
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
            {items.map((item) => {
              const recordedTimeDisplay =
                item.status === "Present" ? formatVietnamTime(item.checkInTimeUtc) : "—";

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-on-surface">
                      {formatVietnamShortDate(item.attendanceDate)}
                    </span>
                    <AttendanceStatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-slate-100">
                    <span>Giờ ghi nhận</span>
                    <span className="font-semibold text-on-surface tabular-nums">
                      {recordedTimeDisplay}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Phân trang: chỉ hiển thị khi có hơn 1 trang và không đang tải lần đầu/lỗi */}
      {!isLoading && !errorMessage && totalPages > 1 && (
        <div className="pt-2">
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
