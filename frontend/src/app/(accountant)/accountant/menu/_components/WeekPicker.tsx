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
            max="9999-12-31"
            // Đang gõ dở ngày thì value rỗng; năm quá 4 chữ số (ô ngày cho gõ tới 6 chữ số) thì Date của JS
            // không đọc được và cộng ngày sẽ ném RangeError. Cả hai trường hợp giữ tuần đang xem
            onChange={(event) => {
              const value = event.target.value;
              if (/^\d{4}-\d{2}-\d{2}$/.test(value)) onChange(getMondayOfWeek(value));
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
