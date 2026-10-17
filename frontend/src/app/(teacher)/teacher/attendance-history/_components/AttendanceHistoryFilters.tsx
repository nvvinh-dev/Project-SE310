"use client";

import React from "react";
import { Button, Input, Select } from "@/components";
import type { HomeroomChildResponse } from "@/types/attendance";
import { addDaysToDateString, getTodayVietnamDateString } from "@/lib/datetime";

export type HistoryViewMode = "date" | "child";

interface AttendanceHistoryFiltersProps {
  mode: HistoryViewMode;
  onModeChange: (mode: HistoryViewMode) => void;
  date: string;
  onDateChange: (date: string) => void;
  selectedChildId: string;
  onChildChange: (childId: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  childrenList: HomeroomChildResponse[];
  onReset: () => void;
  hasFilters: boolean;
}

// Xem theo một ngày hoặc theo một trẻ, không gộp hai cách (ui-screens.md SCR-TCH-02 vùng [1]).
// Đổi ô ngày hay ô trẻ thì tự chuyển sang cách xem tương ứng. Lọc theo trạng thái nằm ở các ô
// đếm phía trên; ô tìm trẻ chỉ có khi xem theo ngày (vùng [2], [3]). "Xóa bộ lọc" chỉ bỏ trạng
// thái và từ khóa, không đổi cách xem.
export function AttendanceHistoryFilters({
  mode,
  onModeChange,
  date,
  onDateChange,
  selectedChildId,
  onChildChange,
  search,
  onSearchChange,
  childrenList,
  onReset,
  hasFilters,
}: AttendanceHistoryFiltersProps) {
  const todayStr = getTodayVietnamDateString();
  const yesterdayStr = addDaysToDateString(todayStr, -1);

  // Child options for select dropdown
  const childOptions = childrenList.map((ch) => ({
    value: ch.id,
    label: ch.fullName,
  }));

  const panelClass = (active: boolean) =>
    `rounded-2xl border p-3 space-y-2.5 transition-colors ${
      active ? "border-primary/40 bg-primary-fixed/20" : "border-slate-200/90"
    }`;

  return (
    <div className="p-4 rounded-3xl bg-surface-container-lowest border border-slate-200/90 shadow-sm space-y-3.5">
      <fieldset>
        <legend className="text-sm font-semibold text-on-surface mb-2">Xem theo</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Theo ngày */}
          <div className={panelClass(mode === "date")}>
            <label className="flex items-center gap-2 text-sm font-medium text-on-surface cursor-pointer">
              <input
                type="radio"
                name="attendance-history-mode"
                value="date"
                checked={mode === "date"}
                onChange={() => onModeChange("date")}
                className="w-4 h-4 accent-primary"
              />
              Ngày
            </label>
            <Input
              type="date"
              aria-label="Ngày cần xem"
              value={date}
              max={todayStr}
              onChange={(e) => onDateChange(e.target.value)}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={mode === "date" && date === todayStr ? "primary" : "outline"}
                aria-pressed={mode === "date" && date === todayStr}
                onClick={() => onDateChange(todayStr)}
              >
                Hôm nay
              </Button>
              <Button
                size="sm"
                variant={mode === "date" && date === yesterdayStr ? "primary" : "outline"}
                aria-pressed={mode === "date" && date === yesterdayStr}
                onClick={() => onDateChange(yesterdayStr)}
              >
                Hôm qua
              </Button>
            </div>
          </div>

          {/* 2. Theo trẻ: xem mọi ngày của một trẻ */}
          <div className={panelClass(mode === "child")}>
            <label className="flex items-center gap-2 text-sm font-medium text-on-surface cursor-pointer">
              <input
                type="radio"
                name="attendance-history-mode"
                value="child"
                checked={mode === "child"}
                onChange={() => onModeChange("child")}
                className="w-4 h-4 accent-primary"
              />
              Trẻ
            </label>
            <Select
              aria-label="Trẻ cần xem"
              placeholder="Chọn trẻ"
              options={childOptions}
              value={selectedChildId}
              onChange={(e) => onChildChange(e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      {/* 3. Tìm theo tên trẻ: chỉ khi xem theo ngày */}
      {mode === "date" && (
        <div className="pt-3.5 border-t border-slate-100 sm:max-w-md">
          <Input
            type="search"
            label="Tìm theo tên trẻ"
            placeholder="Gõ tên để tìm nhanh..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

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
