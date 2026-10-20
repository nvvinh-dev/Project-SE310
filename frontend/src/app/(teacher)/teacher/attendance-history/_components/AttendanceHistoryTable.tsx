"use client";

import React from "react";
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
import type { AttendanceResponse } from "@/types/attendance";
import { formatVietnamShortDate, formatVietnamTime } from "@/lib/datetime";
import { AttendanceStatusBadge } from "../../attendance/_components/AttendanceStatusBadge";

interface AttendanceHistoryTableProps {
  items: AttendanceResponse[];
  isLoading: boolean;
  // Chỉ truyền khi chưa có dữ liệu: lỗi lúc tải lại thì trang giữ bảng cũ (ui-screens.md §4.2)
  errorMessage: string | null;
  onRetry: () => void;
  empty: {
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
  };
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
  empty,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: AttendanceHistoryTableProps) {
  const TABLE_COLUMNS = 5;

  return (
    <div className="space-y-4">
      {/* Từ xl (1280px) là bảng; nhỏ hơn thì mỗi bản ghi một thẻ, không phải cuộn ngang
          (ui-screens.md §4.5, khuôn SCR-ADM-02) */}
      <div className="hidden xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 text-center">STT</TableHead>
              <TableHead className="w-48">Ngày điểm danh</TableHead>
              <TableHead className="min-w-[200px]">Trẻ</TableHead>
              <TableHead className="w-36 text-center">Giờ ghi nhận</TableHead>
              <TableHead className="w-48 text-right pr-6">Trạng thái điểm danh</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={TABLE_COLUMNS} rowCount={5} />
            ) : errorMessage ? (
              <TableError colSpan={TABLE_COLUMNS} message={errorMessage} onRetry={onRetry} />
            ) : items.length === 0 ? (
              <TableEmpty
                colSpan={TABLE_COLUMNS}
                title={empty.title}
                message={empty.message}
                actionText={empty.actionText}
                onAction={empty.onAction}
              />
            ) : (
              items.map((item, index) => {
                const rowNumber = (currentPage - 1) * pageSize + index + 1;

                return (
                  <TableRow key={item.id}>
                    {/* STT */}
                    <TableCell className="text-center font-medium text-outline text-xs tabular-nums">
                      {rowNumber}
                    </TableCell>

                    {/* Ngày điểm danh */}
                    <TableCell>
                      <div className="font-semibold text-on-surface text-xs">
                        {formatVietnamShortDate(item.attendanceDate)}
                      </div>
                    </TableCell>

                    {/* Tên trẻ */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {item.childFullName?.trim().charAt(0) || "B"}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface leading-snug">
                            {item.childFullName}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Giờ ghi nhận */}
                    <TableCell className="text-center text-xs text-on-surface-variant tabular-nums">
                      {item.checkInTimeUtc ? (
                        formatVietnamTime(item.checkInTimeUtc)
                      ) : (
                        <span className="text-outline">—</span>
                      )}
                    </TableCell>

                    {/* Trạng thái điểm danh (Chỉ xem) */}
                    <TableCell className="text-right pr-6">
                      <AttendanceStatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="xl:hidden">
        {isLoading ? (
          <LoadingSpinner label="Đang tải lịch sử điểm danh..." />
        ) : errorMessage ? (
          <ErrorAlert
            title="Không tải được lịch sử điểm danh"
            message={errorMessage}
            onRetry={onRetry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={empty.title}
            message={empty.message}
            actionText={empty.actionText}
            onAction={empty.onAction}
          />
        ) : (
          <ul className="grid gap-2.5 md:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-3 shadow-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-on-surface leading-snug min-w-0 break-words">
                    {item.childFullName}
                  </p>
                  <span className="shrink-0">
                    <AttendanceStatusBadge status={item.status} />
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  {formatVietnamShortDate(item.attendanceDate)}
                  {item.checkInTimeUtc && <> · ghi nhận lúc {formatVietnamTime(item.checkInTimeUtc)}</>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Phân trang */}
      {!isLoading && !errorMessage && totalPages > 1 && (
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
