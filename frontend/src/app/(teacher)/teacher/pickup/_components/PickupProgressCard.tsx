"use client";

import React from "react";
import type { PickupStats } from "../_lib/pickup-helpers";
import { formatVietnamShortDate } from "@/lib/datetime";

interface PickupProgressCardProps {
  todayStr: string;
  stats: PickupStats;
  hasData?: boolean;
}

export function PickupProgressCard({
  todayStr,
  stats,
  hasData = true,
}: PickupProgressCardProps) {
  const shortDate = formatVietnamShortDate(todayStr);

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Tiêu đề & ngày: Đón về — dd/MM/yyyy */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">
          Đón về — {shortDate}
        </h1>
      </div>

      {/* Vùng [1]: Đã đón X/Y trẻ có mặt (chỉ hiện khi có đủ dữ liệu) */}
      {hasData && (
        <div>
          <span className="text-sm sm:text-base font-bold text-on-surface">
            Đã đón {stats.totalPickedUp}/{stats.totalPresent} trẻ có mặt
          </span>
        </div>
      )}
    </div>
  );
}
