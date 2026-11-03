"use client";

import type { DailyMenuDisplayItem } from "../_lib/menu-helpers";

interface WeeklyMenuDisplayProps {
  items: DailyMenuDisplayItem[];
}

export const WeeklyMenuDisplay = ({ items }: WeeklyMenuDisplayProps) => {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest shadow-sm divide-y divide-slate-100 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.dayOfWeek}
          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6"
        >
          {/* Cột Thứ */}
          <div className="sm:w-32 shrink-0">
            <span className="font-bold text-base text-on-surface">
              {item.dayLabel}
            </span>
          </div>

          {/* Cột mô tả món ăn */}
          <div className="flex-1 min-w-0 pt-0.5">
            {item.hasMenu && item.description ? (
              <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
                {item.description}
              </p>
            ) : (
              <p className="text-sm text-outline italic">
                Chưa có thực đơn
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
