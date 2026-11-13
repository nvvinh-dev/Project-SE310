"use client";

import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
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
import { formatVietnamDateFromUtc } from "@/lib/datetime";
import { formatMoney } from "@/lib/format";
import type { ChildInvoiceResponse } from "@/types/tuition";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

const TABLE_COLUMNS = 4;
const EMPTY_MESSAGE = "Chưa có hóa đơn học phí nào của con.";

interface InvoiceHistoryTableProps {
  items: ChildInvoiceResponse[];
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

export function InvoiceHistoryTable({
  items,
  isLoading,
  errorMessage,
  onRetry,
}: InvoiceHistoryTableProps) {
  return (
    <div className="space-y-4 min-w-0">
      {/* 1. Giao diện Desktop (Bảng Table) từ màn hình xl trở lên (design-system.md §6, khuôn SCR-ADM-02) */}
      <div className="hidden xl:block min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[130px]">Ngày lập</TableHead>
              <TableHead className="min-w-[280px]">Mô tả</TableHead>
              <TableHead className="min-w-[160px] text-right">Số tiền</TableHead>
              <TableHead className="min-w-[160px] text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={TABLE_COLUMNS} rowCount={4} />
            ) : errorMessage && items.length === 0 ? (
              <TableError colSpan={TABLE_COLUMNS} message={errorMessage} onRetry={onRetry} />
            ) : items.length === 0 ? (
              <TableEmpty
                colSpan={TABLE_COLUMNS}
                title="Chưa có dữ liệu hóa đơn"
                message={EMPTY_MESSAGE}
              />
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-on-surface text-sm whitespace-nowrap">
                    {formatVietnamDateFromUtc(item.issuedAtUtc)}
                  </TableCell>
                  <TableCell className="text-sm text-on-surface wrap-anywhere whitespace-pre-wrap">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold tabular-nums text-on-surface whitespace-nowrap">
                    {formatMoney(item.amount)}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <InvoiceStatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 2. Giao diện Mobile & Tablet (Danh sách thẻ Card) dưới màn hình xl (design-system.md §6) */}
      <div className="xl:hidden min-w-0">
        {isLoading ? (
          <LoadingSpinner label="Đang tải danh sách hóa đơn..." />
        ) : errorMessage && items.length === 0 ? (
          <ErrorAlert
            title="Không thể tải danh sách hóa đơn"
            message={errorMessage}
            onRetry={onRetry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu hóa đơn"
            message={EMPTY_MESSAGE}
          />
        ) : (
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 min-w-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-3 shadow-xs space-y-2 min-w-0"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Ngày lập:{" "}
                    <strong className="text-sm font-bold text-on-surface">
                      {formatVietnamDateFromUtc(item.issuedAtUtc)}
                    </strong>
                  </span>
                  <InvoiceStatusBadge status={item.status} />
                </div>

                <div className="space-y-1 min-w-0">
                  <span className="text-xs text-on-surface-variant">Mô tả</span>
                  <p className="text-sm font-medium text-on-surface wrap-anywhere whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-slate-100 min-w-0">
                  <span>Số tiền</span>
                  <span className="text-base font-bold text-primary tabular-nums">
                    {formatMoney(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
