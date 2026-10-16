"use client";

import React from "react";
import { Button, Checkbox, Icons, Input, Select } from "@/components";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";

interface AttendanceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onlyHealthNotes: boolean;
  onOnlyHealthNotesChange: (value: boolean) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export function AttendanceFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onlyHealthNotes,
  onOnlyHealthNotesChange,
  onReset,
  hasFilters,
}: AttendanceFiltersProps) {
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Unrecorded", label: "Chưa điểm danh" },
    { value: "Present", label: ATTENDANCE_STATUS_LABELS.Present },
    { value: "AbsentExcused", label: ATTENDANCE_STATUS_LABELS.AbsentExcused },
    { value: "AbsentUnexcused", label: ATTENDANCE_STATUS_LABELS.AbsentUnexcused },
  ];

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-surface-container-lowest border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-end justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1 items-stretch sm:items-end">
        {/* Search by name */}
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            aria-label="Tìm theo tên trẻ"
            placeholder="Tìm theo tên trẻ..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            prefixIcon={
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
        </div>

        {/* Filter by attendance status. Dưới sm ẩn đi vì hàng nhãn thống kê phía trên lọc được
            đúng các trạng thái này, nhường chỗ cho danh sách trẻ trên điện thoại */}
        <div className="hidden sm:block sm:w-56">
          <Select
            aria-label="Lọc theo trạng thái điểm danh"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          />
        </div>

        {/* Quick toggle: Trẻ có lưu ý sức khỏe */}
        <div className="flex items-center pb-2">
          <Checkbox
            checked={onlyHealthNotes}
            onChange={(e) => onOnlyHealthNotesChange(e.target.checked)}
            label={
              <span className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                <span className="text-amber-600 inline-flex items-center shrink-0">
                  <Icons.Alert />
                </span>
                Chỉ trẻ có lưu ý sức khỏe
              </span>
            }
          />
        </div>
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
