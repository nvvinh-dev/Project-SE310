"use client";

import { EmptyState } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import {
  HEALTH_MOOD_LABELS,
  isHealthMood,
  type ChildQuickHealthStatusResponse,
} from "@/types/health";

interface QuickHealthTabProps {
  items: ChildQuickHealthStatusResponse[];
}

// SCR-PAR-03 Vùng [3]: Tab Sức khỏe hằng ngày
export function QuickHealthTab({ items }: QuickHealthTabProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Chưa có bản ghi sức khỏe"
        message="Chưa có bản ghi sức khỏe hằng ngày nào của con."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const moodText = isHealthMood(item.mood)
          ? HEALTH_MOOD_LABELS[item.mood]
          : item.mood;
        const tempText =
          item.temperatureCelsius !== null && item.temperatureCelsius !== undefined
            ? `${item.temperatureCelsius.toLocaleString("vi-VN")} °C`
            : null;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs"
          >
            <div className="flex flex-wrap items-baseline gap-2 text-sm text-on-surface">
              <time
                dateTime={item.recordedAtUtc}
                className="text-xs font-medium text-on-surface-variant shrink-0 mr-1"
              >
                {formatMeasurementDateTime(item.recordedAtUtc)}
              </time>

              <span className="font-semibold text-on-surface">{moodText}</span>

              {tempText && (
                <>
                  <span className="text-slate-400" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-medium text-on-surface">{tempText}</span>
                </>
              )}

              {item.notes && (
                <>
                  <span className="text-slate-400" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-on-surface-variant whitespace-pre-wrap break-words">
                    {item.notes}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
