"use client";

import {
  Button,
  EmptyState,
  ErrorAlert,
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
import { toApiError } from "@/lib/axios";
import { formatMeasurementDateTime } from "@/lib/datetime";
import { formatHeight, formatWeight } from "@/lib/format";
import type { SchoolChildResponse } from "@/types/health";
import { useGrowthMeasurements } from "../_lib/health-api";

interface GrowthMeasurementHistoryProps {
  selectedChild: SchoolChildResponse | null;
  className?: string;
}

export function GrowthMeasurementHistory({
  selectedChild,
  className = "",
}: GrowthMeasurementHistoryProps) {
  const childId = selectedChild?.id ?? null;
  const {
    data: measurements,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGrowthMeasurements(childId);

  // Chưa chọn trẻ -> hiện trạng thái chờ
  if (!selectedChild) {
    return (
      <div
        className={`rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs ${className}`}
      >
        <div className="border-b border-slate-100 pb-3 mb-6">
          <h2 className="text-base font-bold text-on-surface">Lịch sử số đo</h2>
        </div>
        <EmptyState
          title="Chưa chọn trẻ"
          message="Vui lòng chọn một trẻ ở danh sách phía trên để xem lịch sử số đo tăng trưởng."
        />
      </div>
    );
  }

  const errorMessage = isError ? toApiError(error).message : null;
  const showFullError = isError && measurements === undefined;
  const showStaleErrorBanner = isError && measurements !== undefined;

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs ${className}`}
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-on-surface">Lịch sử số đo</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Dữ liệu tăng trưởng của: <strong className="text-on-surface">{selectedChild.fullName}</strong>
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          icon={<Icons.Refresh />}
          onClick={() => refetch()}
          isLoading={isFetching}
          disabled={isFetching}
        >
          Làm mới
        </Button>
      </div>

      {showStaleErrorBanner && errorMessage && (
        <div className="mb-4">
          <ErrorAlert
            title="Lỗi tải lại dữ liệu"
            message={`${errorMessage} Đang hiển thị bản ghi cũ.`}
            onRetry={() => refetch()}
          />
        </div>
      )}

      {/* Giao diện Desktop (Bảng 3 cột từ xl theo design-system.md §6) */}
      <div className="hidden xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5">Thời điểm đo</TableHead>
              <TableHead className="w-[30%]">Chiều cao</TableHead>
              <TableHead className="w-[30%]">Cân nặng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={3} rowCount={3} />
            ) : showFullError ? (
              <TableError
                colSpan={3}
                message={errorMessage ?? "Không thể tải lịch sử số đo."}
                onRetry={() => refetch()}
              />
            ) : measurements && measurements.length === 0 ? (
              <TableEmpty
                colSpan={3}
                title="Chưa có dữ liệu"
                message="Chưa có lần đo chiều cao hoặc cân nặng nào được ghi nhận cho trẻ này."
              />
            ) : (
              measurements?.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-on-surface">
                    {formatMeasurementDateTime(m.measuredAtUtc)}
                  </TableCell>
                  <TableCell className="text-on-surface">
                    {formatHeight(m.heightCm)}
                  </TableCell>
                  <TableCell className="text-on-surface">
                    {formatWeight(m.weightKg)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Giao diện Màn hình hẹp (Card List dưới xl theo design-system.md §6 - AC-NFR-03) */}
      <div className="block xl:hidden">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border border-slate-200/80 p-4 space-y-2 bg-surface-container-low/30"
              >
                <div className="h-4 bg-slate-200 rounded-full w-1/2"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-slate-200 rounded-full w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded-full w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : showFullError ? (
          <div className="py-6 text-center">
            <ErrorAlert
              title="Đã có lỗi xảy ra"
              message={errorMessage ?? "Không thể tải lịch sử số đo."}
              onRetry={() => refetch()}
            />
          </div>
        ) : measurements && measurements.length === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu"
            message="Chưa có lần đo chiều cao hoặc cân nặng nào được ghi nhận cho trẻ này."
          />
        ) : (
          <div className="space-y-3">
            {measurements?.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-200/80 bg-surface-container-lowest p-4 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                  <span className="text-xs font-semibold text-outline">
                    Thời điểm đo
                  </span>
                  <span className="text-xs font-bold text-on-surface">
                    {formatMeasurementDateTime(m.measuredAtUtc)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="block text-xs text-outline font-medium">
                      Chiều cao
                    </span>
                    <span className="font-semibold text-on-surface">
                      {formatHeight(m.heightCm)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-outline font-medium">
                      Cân nặng
                    </span>
                    <span className="font-semibold text-on-surface">
                      {formatWeight(m.weightKg)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
