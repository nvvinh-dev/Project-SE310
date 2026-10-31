"use client";

import { Button, Icons, Input } from "@/components";
import { addDaysToDateString, formatWeekRange, getMondayOfWeek } from "@/lib/datetime";

interface WeekPickerProps {
  weekStartDate: string;
  onChange: (weekStartDate: string) => void;
  disabled?: boolean;
}

// Chọn tuần bằng hai nút lùi, tiến một tuần hoặc chọn một ngày bất kỳ; client tự đưa về ngày thứ Hai của tuần
// đó vì backend chỉ nhận weekStartDate là thứ Hai (SCR-ACC-06, Hành vi 1)
export function WeekPicker({ weekStartDate, onChange, disabled = false }: WeekPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <Button
          variant="outline"
          icon={<Icons.ChevronLeft />}
          aria-label="Tuần trước"
          disabled={disabled}
          onClick={() => onChange(addDaysToDateString(weekStartDate, -7))}
          className="min-h-11 shrink-0"
        />
        <div className="w-44">
          <Input
            type="date"
            label="Tuần bắt đầu"
            value={weekStartDate}
            disabled={disabled}
            // Đang gõ dở ngày thì value rỗng: giữ tuần đang xem
            onChange={(event) => {
              if (event.target.value) onChange(getMondayOfWeek(event.target.value));
            }}
          />
        </div>
        <Button
          variant="outline"
          icon={<Icons.ChevronRight />}
          aria-label="Tuần sau"
          disabled={disabled}
          onClick={() => onChange(addDaysToDateString(weekStartDate, 7))}
          className="min-h-11 shrink-0"
        />
      </div>
      <p className="text-sm font-semibold text-on-surface">Tuần {formatWeekRange(weekStartDate)}</p>
    </div>
  );
}
