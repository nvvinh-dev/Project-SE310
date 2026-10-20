"use client";

import React from "react";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";
import type { AttendanceStats } from "../_lib/attendance-helpers";

interface AttendanceStatsCardsProps {
  stats: AttendanceStats;
  onFilterStatus?: (status: string) => void;
  activeFilter?: string;
}

export function AttendanceStatsCards({
  stats,
  onFilterStatus,
  activeFilter,
}: AttendanceStatsCardsProps) {
  const cards = [
    // Màu theo tông trạng thái của design-system.md §3.2: con số theo màu chữ của tông, vạch trên
    // theo màu chấm của tông
    {
      id: "all",
      label: "Tổng sĩ số",
      value: stats.total,
      colorClass: "text-on-surface",
      accentBar: "bg-on-surface-variant",
    },
    {
      id: "Present",
      label: ATTENDANCE_STATUS_LABELS.Present,
      value: stats.present,
      colorClass: "text-primary",
      accentBar: "bg-primary",
    },
    {
      id: "AbsentExcused",
      label: ATTENDANCE_STATUS_LABELS.AbsentExcused,
      value: stats.absentExcused,
      colorClass: "text-amber-800",
      accentBar: "bg-amber-600",
    },
    {
      id: "AbsentUnexcused",
      label: ATTENDANCE_STATUS_LABELS.AbsentUnexcused,
      value: stats.absentUnexcused,
      colorClass: "text-on-error-container",
      accentBar: "bg-error",
    },
    {
      id: "Unrecorded",
      label: "Chưa điểm danh",
      value: stats.unrecorded,
      colorClass: "text-outline",
      accentBar: "bg-outline",
    },
  ];

  // Dưới sm thu thành hàng nhãn nhỏ để danh sách trẻ hiện ngay trên màn hình điện thoại
  // (ui-screens.md §4.5); từ sm trở lên là thẻ
  return (
    <div className="flex flex-wrap gap-2 sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-3.5">
      {cards.map((card) => {
        const isSelected = activeFilter === card.id;
        return (
          <button
            type="button"
            key={card.id}
            aria-pressed={isSelected}
            onClick={() => onFilterStatus?.(card.id)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 sm:block sm:rounded-3xl sm:p-4 border border-slate-200/90 bg-surface-container-lowest text-left transition-colors relative overflow-hidden shadow-sm hover:bg-surface-container-low cursor-pointer ${
              isSelected ? "ring-2 ring-primary ring-offset-1" : ""
            }`}
          >
            <div
              className={`hidden sm:block absolute top-0 left-0 right-0 h-1 ${card.accentBar}`}
              aria-hidden="true"
            />
            <p className="text-xs font-medium text-on-surface-variant truncate">
              {card.label}
            </p>
            <div className="sm:mt-1 flex items-baseline justify-between">
              <span className={`text-sm sm:text-2xl font-bold tracking-tight ${card.colorClass}`}>
                {card.value}
              </span>
              <span className="hidden sm:inline text-xs font-medium text-outline">trẻ</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
