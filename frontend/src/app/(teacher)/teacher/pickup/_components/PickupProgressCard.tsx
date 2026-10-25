"use client";

import React from "react";
import { Button, Icons } from "@/components";
import type { PickupStats } from "../_lib/pickup-helpers";
import { formatVietnamShortDate } from "@/lib/datetime";

interface PickupProgressCardProps {
  todayStr: string;
  stats: PickupStats;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function PickupProgressCard({
  todayStr,
  stats,
  onRefresh,
  isRefreshing = false,
}: PickupProgressCardProps) {
  const shortDate = formatVietnamShortDate(todayStr);

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Tiêu đề & ngày: Đón về — dd/MM/yyyy */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
          Đón về — {shortDate}
        </h1>
      </div>

      {/* Vùng [1]: Đã đón X/Y trẻ có mặt & nút Làm mới */}
      <div className="flex items-center justify-between sm:justify-end gap-3">
        <span className="text-sm sm:text-base font-bold text-on-surface">
          Đã đón {stats.totalPickedUp}/{stats.totalPresent} trẻ có mặt
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-1.5 shrink-0"
        >
          <span className={isRefreshing ? "animate-spin" : ""}>
            <Icons.Refresh />
          </span>
          <span>Làm mới</span>
        </Button>
      </div>
    </div>
  );
}
