"use client";

import React from "react";
import { Button, Icons, Input } from "@/components";

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
          prefixIcon={<Icons.Search />}
        />
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
