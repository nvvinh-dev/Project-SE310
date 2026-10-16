"use client";

import React from "react";
import { Button, Input, Select } from "@/components";
import type { HomeroomChildResponse } from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";
import { getTodayVietnamDateString } from "../../attendance/_lib/attendance-helpers";

export type HistoryViewMode = "date" | "child";

interface AttendanceHistoryFiltersProps {
  mode: HistoryViewMode;
  onModeChange: (mode: HistoryViewMode) => void;
  date: string;
  onDateChange: (date: string) => void;
  selectedChildId: string;
  onChildChange: (childId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  childrenList: HomeroomChildResponse[];
  onReset: () => void;
  hasFilters: boolean;
}

// Xem theo một ngày hoặc theo một trẻ, không gộp hai cách (ui-screens.md SCR-TCH-02 vùng [1]).
// Đổi ô ngày hay ô trẻ thì tự chuyển sang cách xem tương ứng.
export function AttendanceHistoryFilters({
  mode,
  onModeChange,
  date,
  onDateChange,
  selectedChildId,
  onChildChange,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  childrenList,
  onReset,
  hasFilters,
}: AttendanceHistoryFiltersProps) {
  const todayStr = getTodayVietnamDateString();

  // Child options for select dropdown
  const childOptions = childrenList.map((ch) => ({
    value: ch.id,
    label: ch.fullName,
  }));

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Present", label: ATTENDANCE_STATUS_LABELS.Present },
    { value: "AbsentExcused", label: ATTENDANCE_STATUS_LABELS.AbsentExcused },
    { value: "AbsentUnexcused", label: ATTENDANCE_STATUS_LABELS.AbsentUnexcused },
  ];

  // Set to yesterday
  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    onDateChange(formatter.format(d));
  };

  const panelClass = (active: boolean) =>
    `rounded-2xl border p-3 space-y-2.5 transition-colors ${
      active ? "border-primary/40 bg-primary-fixed/20" : "border-slate-200/90"
    }`;

  return (
    <div className="p-4 rounded-3xl bg-surface-container-lowest border border-slate-200/90 shadow-xs space-y-3.5">
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
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => onDateChange(todayStr)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                  mode === "date" && date === todayStr
                    ? "bg-primary text-white border-primary"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={handleSetYesterday}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
              >
                Hôm qua
              </button>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5 border-t border-slate-100">
        {/* 3. Lọc theo trạng thái điểm danh */}
        <Select
          label="Trạng thái điểm danh"
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        />

        {/* 4. Tìm theo tên trẻ */}
        <Input
          type="search"
          label="Tìm theo tên trẻ"
          placeholder="Gõ tên để tìm nhanh..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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
