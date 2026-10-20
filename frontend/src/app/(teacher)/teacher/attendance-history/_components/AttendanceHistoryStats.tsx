"use client";

import React from "react";
import type { AttendanceResponse } from "@/types/attendance";
import { ATTENDANCE_STATUS_LABELS } from "@/types/attendance";

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

  // Màu theo tông trạng thái của design-system.md §3.2, giống ô đếm của SCR-TCH-01
  const cards = [
    {
      id: "all",
      label: "Tổng bản ghi",
      value: total,
      colorClass: "text-on-surface",
      accentBar: "bg-on-surface-variant",
    },
    {
      id: "Present",
      label: ATTENDANCE_STATUS_LABELS.Present,
      value: present,
      colorClass: "text-primary",
      accentBar: "bg-primary",
    },
    {
      id: "AbsentExcused",
      label: ATTENDANCE_STATUS_LABELS.AbsentExcused,
      value: absentExcused,
      colorClass: "text-amber-800",
      accentBar: "bg-amber-600",
    },
    {
      id: "AbsentUnexcused",
      label: ATTENDANCE_STATUS_LABELS.AbsentUnexcused,
      value: absentUnexcused,
      colorClass: "text-on-error-container",
      accentBar: "bg-error",
    },
  ];

  // Không có tỷ lệ có mặt: chia cho số bản ghi sẽ sai khi lớp chưa điểm danh hết; tỷ lệ có mặt là
  // chỉ số của SCR-ADM-01 (ui-screens.md SCR-TCH-02 Hành vi 5)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const isSelected = activeStatusFilter === card.id;
        const isClickable = Boolean(onSelectStatus);

        return (
          <button
            type="button"
            key={card.id}
            disabled={!isClickable}
            aria-pressed={isSelected}
            onClick={() => isClickable && onSelectStatus?.(card.id)}
            className={`p-4 rounded-3xl border border-slate-200/90 bg-surface-container-lowest text-left transition-colors relative overflow-hidden shadow-sm ${
              isSelected ? "ring-2 ring-primary ring-offset-1" : ""
            } ${isClickable ? "hover:bg-surface-container-low cursor-pointer" : "cursor-default"}`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${card.accentBar}`}
              aria-hidden="true"
            />
            <p className="text-xs font-medium text-on-surface-variant truncate">
              {card.label}
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className={`text-2xl font-bold tracking-tight ${card.colorClass}`}>
                {card.value}
              </span>
              <span className="text-xs font-medium text-outline">lượt</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
