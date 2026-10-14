"use client";

import React from "react";
import { Button, Input, Select } from "@/components";

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
    { value: "Present", label: "Có mặt" },
    { value: "AbsentExcused", label: "Vắng có phép" },
    { value: "AbsentUnexcused", label: "Vắng không phép" },
  ];

  return (
    <div className="p-4 rounded-2xl bg-surface-container-lowest border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-end justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1 items-stretch sm:items-end">
        {/* Search by name */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Tìm theo tên học sinh..."
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

        {/* Filter by attendance status */}
        <div className="w-full sm:w-56">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          />
        </div>

        {/* Quick toggle: Trẻ có lưu ý sức khỏe */}
        <div className="flex items-center h-10">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-on-surface-variant hover:text-on-surface">
            <input
              type="checkbox"
              checked={onlyHealthNotes}
              onChange={(e) => onOnlyHealthNotesChange(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
            />
            <span className="flex items-center gap-1">
              <span className="text-amber-600">⚠️</span>
              Chỉ trẻ có lưu ý sức khỏe
            </span>
          </label>
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
