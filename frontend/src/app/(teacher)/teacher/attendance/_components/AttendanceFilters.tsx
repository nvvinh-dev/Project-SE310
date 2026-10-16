"use client";

import React from "react";
import { Button, Input } from "@/components";

interface AttendanceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  hasFilters: boolean;
}

// Chỉ có ô tìm trẻ: lọc theo trạng thái nằm ở hàng ô đếm phía trên, lưu ý sức khỏe của cả lớp xem ở
// SCR-TCH-05 (ui-screens.md SCR-TCH-01 vùng [2], [3], Hành vi 8)
export function AttendanceFilters({
  search,
  onSearchChange,
  onReset,
  hasFilters,
}: AttendanceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
      <div className="flex-1 sm:max-w-md">
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
