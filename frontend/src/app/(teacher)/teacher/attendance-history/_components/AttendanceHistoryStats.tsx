"use client";

import React from "react";
import type { AttendanceResponse } from "@/types/attendance";

interface AttendanceHistoryStatsProps {
  attendances: AttendanceResponse[];
  activeStatusFilter?: string;
  onSelectStatus?: (status: string) => void;
}

export function AttendanceHistoryStats({
  attendances,
  activeStatusFilter,
  onSelectStatus,
}: AttendanceHistoryStatsProps) {
  const total = attendances.length;
  let present = 0;
  let absentExcused = 0;
  let absentUnexcused = 0;

  for (const item of attendances) {
    if (item.status === "Present") present++;
    else if (item.status === "AbsentExcused") absentExcused++;
    else if (item.status === "AbsentUnexcused") absentUnexcused++;
  }

  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  const cards = [
    {
      id: "all",
      label: "Tổng bản ghi",
      value: total,
      unit: "lượt",
      colorClass: "text-slate-800",
      bgClass: "bg-surface-container-lowest",
      borderClass: "border-slate-200/80",
      accentBar: "bg-slate-400",
    },
    {
      id: "Present",
      label: "Có mặt",
      value: present,
      unit: "lượt",
      colorClass: "text-emerald-700",
      bgClass: "bg-emerald-50/40",
      borderClass: "border-emerald-200/80",
      accentBar: "bg-emerald-500",
    },
    {
      id: "AbsentExcused",
      label: "Vắng có phép",
      value: absentExcused,
      unit: "lượt",
      colorClass: "text-amber-700",
      bgClass: "bg-amber-50/40",
      borderClass: "border-amber-200/80",
      accentBar: "bg-amber-500",
    },
    {
      id: "AbsentUnexcused",
      label: "Vắng không phép",
      value: absentUnexcused,
      unit: "lượt",
      colorClass: "text-rose-700",
      bgClass: "bg-rose-50/40",
      borderClass: "border-rose-200/80",
      accentBar: "bg-rose-500",
    },
    {
      id: "rate",
      label: "Tỷ lệ có mặt",
      value: `${attendanceRate}%`,
      unit: "tổng số",
      colorClass: "text-primary",
      bgClass: "bg-primary-fixed/20",
      borderClass: "border-primary/20",
      accentBar: "bg-primary",
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const isSelected = activeStatusFilter === card.id;
        const isClickable = card.clickable !== false && Boolean(onSelectStatus);

        return (
          <button
            type="button"
            key={card.id}
            disabled={!isClickable}
            onClick={() => isClickable && onSelectStatus?.(card.id)}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden shadow-xs ${
              card.bgClass
            } ${card.borderClass} ${
              isSelected ? "ring-2 ring-primary ring-offset-1" : ""
            } ${isClickable ? "hover:shadow-sm cursor-pointer" : "cursor-default"}`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${card.accentBar}`}
            />
            <p className="text-xs font-medium text-on-surface-variant truncate">
              {card.label}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className={`text-2xl font-bold tracking-tight ${card.colorClass}`}>
                {card.value}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {card.unit}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
