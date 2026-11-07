"use client";

import { EmptyState } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import type { ChildGrowthMeasurementResponse } from "@/types/health";

interface GrowthMeasurementTabProps {
  items: ChildGrowthMeasurementResponse[];
}

// SCR-PAR-03 Vùng [3]: Tab Chiều cao, cân nặng
export function GrowthMeasurementTab({ items }: GrowthMeasurementTabProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Chưa có số đo"
        message="Chưa có dữ liệu số đo chiều cao, cân nặng nào của con."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const hasHeight = item.heightCm !== null && item.heightCm !== undefined;
        const hasWeight = item.weightKg !== null && item.weightKg !== undefined;

        if (!hasHeight && !hasWeight) {
          return null;
        }

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs"
          >
            <div className="flex flex-wrap items-baseline gap-2 text-sm text-on-surface">
              <time
                dateTime={item.measuredAtUtc}
                className="text-xs font-medium text-on-surface-variant shrink-0 mr-1"
              >
                {formatMeasurementDateTime(item.measuredAtUtc)}
              </time>

              {hasHeight && (
                <span className="font-semibold text-on-surface">
                  {item.heightCm!.toLocaleString("vi-VN")} cm
                </span>
              )}

              {hasHeight && hasWeight && (
                <span className="text-slate-400" aria-hidden="true">
                  ·
                </span>
              )}

              {hasWeight && (
                <span className="font-semibold text-on-surface">
                  {item.weightKg!.toLocaleString("vi-VN")} kg
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
