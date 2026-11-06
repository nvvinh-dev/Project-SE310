"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Icons, Input } from "@/components";
import { addDaysToDateString, formatWeekRange, getMondayOfWeek } from "@/lib/datetime";

// Ngừng gõ chừng này thì đổi tuần; chọn ngày trên lịch bật lên cũng chờ chừng này
const COMMIT_DELAY_MS = 600;
const FULL_DATE_PATTERN = /^[1-9]\d{3}-\d{2}-\d{2}$/;

interface WeekPickerProps {
  weekStartDate: string;
  onChange: (weekStartDate: string) => void;
  disabled?: boolean;
}

// Chọn tuần bằng hai nút lùi, tiến một tuần hoặc chọn một ngày bất kỳ; client tự đưa về ngày thứ Hai của tuần
// đó vì backend chỉ nhận weekStartDate là thứ Hai (SCR-ACC-06, Hành vi 1)
export function WeekPicker({ weekStartDate, onChange, disabled = false }: WeekPickerProps) {
  // Giá trị đang gõ của ô ngày; null là không gõ, ô hiện weekStartDate
  const [typedDate, setTypedDate] = useState<string | null>(null);
  // Ngày đang chờ đổi tuần và hẹn giờ của nó
  const pendingRef = useRef<{ date: string; timer: ReturnType<typeof setTimeout> } | null>(null);

  // Hẹn giờ gọi onChange của lần render mới nhất, không phải của lúc bắt đầu gõ
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Rời trang khi còn hẹn giờ thì bỏ, không đổi tuần sau khi form đã mất
  useEffect(
    () => () => {
      if (pendingRef.current) clearTimeout(pendingRef.current.timer);
    },
    []
  );

  const cancelPending = () => {
    if (pendingRef.current) clearTimeout(pendingRef.current.timer);
    pendingRef.current = null;
  };

  const commitPending = () => {
    const pending = pendingRef.current;
    cancelPending();
    if (pending) onChangeRef.current(getMondayOfWeek(pending.date));
  };

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
            value={typedDate ?? weekStartDate}
            disabled={disabled}
            max="9999-12-31"
            // Ô hiện đúng phần đang gõ, không ép về thứ Hai giữa chừng: ép ngay thì trình duyệt mất phần gõ dở và
            // rơi vào sai tuần. Gõ đè lên ngày đã có thì mỗi phần ngày, tháng, năm gõ xong ô đã báo một ngày hợp lệ,
            // nên chỉ đổi tuần khi ngừng gõ một lúc, bấm Enter hay rời ô; không thì mỗi phần gõ dở là một lần tải
            // sai tuần, còn thay đổi chưa lưu thì hộp thoại bỏ thay đổi bật lên giữa lúc gõ. Gõ năm từng chữ số,
            // ô báo lần lượt 0002, 0020, 0203 rồi 2030, nên chỉ nhận năm đủ 4 chữ số khác 0 ở đầu. Năm quá 4 chữ
            // số thì Date của JS không đọc được và cộng ngày sẽ ném RangeError, cũng giữ tuần đang xem
            onChange={(event) => {
              const value = event.target.value;
              setTypedDate(value);
              cancelPending();
              if (!FULL_DATE_PATTERN.test(value)) return;
              pendingRef.current = { date: value, timer: setTimeout(commitPending, COMMIT_DELAY_MS) };
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitPending();
            }}
            // Rời ô thì đổi tuần ngay nếu còn ngày chờ, rồi hiện lại ngày thứ Hai của tuần đang xem
            onBlur={() => {
              commitPending();
              setTypedDate(null);
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
