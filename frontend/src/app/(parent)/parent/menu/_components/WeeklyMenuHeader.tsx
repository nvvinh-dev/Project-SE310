"use client";

import { Button, Icons } from "@/components";
import { formatWeekRange } from "@/lib/datetime";

interface WeeklyMenuHeaderProps {
  weekStartDate: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export const WeeklyMenuHeader = ({
  weekStartDate,
  onPreviousWeek,
  onNextWeek,
}: WeeklyMenuHeaderProps) => {
  const weekLabel = `Tuần ${formatWeekRange(weekStartDate)}`;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl font-bold text-on-surface">Thực đơn tuần</h1>

      {/* Vùng [1]: Điều hướng tuần */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="text-base font-bold text-on-surface whitespace-nowrap sm:text-lg sm:mr-2">
          {weekLabel}
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={onPreviousWeek}
            icon={<Icons.ChevronLeft />}
            aria-label="Xem tuần trước"
            className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
          >
            Tuần trước
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onNextWeek}
            aria-label="Xem tuần sau"
            className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
          >
            <span className="inline-flex items-center gap-1.5">
              <span>Tuần sau</span>
              <span className="shrink-0" aria-hidden="true">
                <Icons.ChevronRight />
              </span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
