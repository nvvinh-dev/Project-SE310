"use client";

import { Button, Icons } from "@/components";
import { formatWeekRangeDisplay } from "@/lib/datetime";

interface WeeklyMenuHeaderProps {
  weekStartDate: string;
  isLoading?: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export const WeeklyMenuHeader = ({
  weekStartDate,
  isLoading = false,
  onPreviousWeek,
  onNextWeek,
}: WeeklyMenuHeaderProps) => {
  const weekLabel = formatWeekRangeDisplay(weekStartDate);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-on-surface">Thực đơn tuần</h1>

      {/* Vùng [1]: Điều hướng tuần */}
      <div className="flex items-center gap-2">
        <span className="text-base font-bold text-on-surface mr-2 sm:text-lg">
          {weekLabel}
        </span>

        <Button
          size="sm"
          variant="outline"
          onClick={onPreviousWeek}
          disabled={isLoading}
          icon={<Icons.ChevronLeft />}
          aria-label="Xem tuần trước"
        >
          Tuần trước
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onNextWeek}
          disabled={isLoading}
          aria-label="Xem tuần sau"
        >
          <span>Tuần sau</span>
          <span className="shrink-0 ml-1.5" aria-hidden="true">
            <Icons.ChevronRight />
          </span>
        </Button>
      </div>
    </div>
  );
};
