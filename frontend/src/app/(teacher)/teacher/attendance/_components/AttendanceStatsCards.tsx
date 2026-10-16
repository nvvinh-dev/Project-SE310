"use client";

import React from "react";
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
    {
      id: "all",
      label: "Tổng sĩ số",
      value: stats.total,
      colorClass: "text-slate-800",
      bgClass: "bg-surface-container-lowest",
      borderClass: "border-slate-200/80",
      accentBar: "bg-slate-400",
    },
    {
      id: "Present",
      label: "Có mặt",
      value: stats.present,
      colorClass: "text-emerald-700",
      bgClass: "bg-emerald-50/40",
      borderClass: "border-emerald-200/80",
      accentBar: "bg-emerald-500",
    },
    {
      id: "AbsentExcused",
      label: "Vắng có phép",
      value: stats.absentExcused,
      colorClass: "text-amber-700",
      bgClass: "bg-amber-50/40",
      borderClass: "border-amber-200/80",
      accentBar: "bg-amber-500",
    },
    {
      id: "AbsentUnexcused",
      label: "Vắng không phép",
      value: stats.absentUnexcused,
      colorClass: "text-rose-700",
      bgClass: "bg-rose-50/40",
      borderClass: "border-rose-200/80",
      accentBar: "bg-rose-500",
    },
    {
      id: "Unrecorded",
      label: "Chưa điểm danh",
      value: stats.unrecorded,
      colorClass: "text-sky-700",
      bgClass: "bg-sky-50/40",
      borderClass: "border-sky-200/80",
      accentBar: "bg-sky-500",
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
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 sm:block sm:rounded-2xl sm:p-4 border text-left transition-all relative overflow-hidden shadow-xs hover:shadow-sm cursor-pointer ${
              card.bgClass
            } ${card.borderClass} ${
              isSelected ? "ring-2 ring-primary ring-offset-1" : ""
            }`}
          >
            <div
              className={`hidden sm:block absolute top-0 left-0 right-0 h-1 ${card.accentBar}`}
            />
            <p className="text-xs font-medium text-on-surface-variant truncate">
              {card.label}
            </p>
            <div className="sm:mt-1 flex items-baseline justify-between">
              <span className={`text-sm sm:text-2xl font-bold tracking-tight ${card.colorClass}`}>
                {card.value}
              </span>
              <span className="hidden sm:inline text-[11px] font-medium text-slate-400">trẻ</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
