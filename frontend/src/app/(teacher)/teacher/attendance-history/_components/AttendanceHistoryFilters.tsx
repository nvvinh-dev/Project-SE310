"use client";

import React from "react";
import { Button, Input, Select } from "@/components";
import type { HomeroomChildResponse } from "@/types/attendance";
import { getTodayVietnamDateString } from "../../attendance/_lib/attendance-helpers";

interface AttendanceHistoryFiltersProps {
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

export function AttendanceHistoryFilters({
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
  const childOptions = [
    { value: "", label: "— Tất cả học sinh trong lớp —" },
    ...childrenList.map((ch) => ({
      value: ch.id,
      label: ch.fullName,
    })),
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "Present", label: "Có mặt" },
    { value: "AbsentExcused", label: "Vắng có phép" },
    { value: "AbsentUnexcused", label: "Vắng không phép" },
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

  return (
    <div className="p-4 rounded-3xl bg-surface-container-lowest border border-slate-200/90 shadow-xs space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Chọn ngày (dùng Input component có label) */}
        <div>
          <Input
            type="date"
            label="Ngày tra cứu"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>

        {/* 2. Chọn học sinh (dùng Select component có label) */}
        <div>
          <Select
            label="Học sinh trong lớp"
            options={childOptions}
            value={selectedChildId}
            onChange={(e) => onChildChange(e.target.value)}
          />
        </div>

        {/* 3. Lọc theo trạng thái điểm danh (dùng Select component có label) */}
        <div>
          <Select
            label="Trạng thái điểm danh"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          />
        </div>

        {/* 4. Tìm theo tên học sinh (dùng Input component có label) */}
        <div>
          <Input
            label="Tìm theo tên học sinh"
            placeholder="Gõ tên để tìm nhanh..."
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
      </div>

      {/* Quick shortcuts & Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium mr-1">Chọn nhanh ngày:</span>
          <button
            type="button"
            onClick={() => onDateChange(todayStr)}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              date === todayStr
                ? "bg-primary text-white border-primary"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={handleSetYesterday}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Hôm qua
          </button>

          {/* Khóa nút 'Tất cả ngày' khi chưa chọn học sinh để tránh lỗi 400 Bad Request */}
          <button
            type="button"
            disabled={!selectedChildId}
            onClick={() => onDateChange("")}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              date === ""
                ? "bg-secondary text-white border-secondary"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            } ${
              !selectedChildId
                ? "opacity-50 cursor-not-allowed hover:bg-slate-50"
                : ""
            }`}
            title={
              !selectedChildId
                ? "Cần chọn học sinh cụ thể trước khi xem tất cả ngày"
                : "Xem tất cả các ngày của học sinh này"
            }
          >
            Tất cả ngày
          </button>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Đặt lại bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
