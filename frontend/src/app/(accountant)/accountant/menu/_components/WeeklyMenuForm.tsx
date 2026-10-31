"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Textarea } from "@/components";
import { addDaysToDateString, formatVietnamShortDate } from "@/lib/datetime";
import { MENU_DAYS_OF_WEEK, MENU_DAY_LABELS, type MenuEntryRequest, type WeeklyMenuResponse } from "@/types/menu";
import {
  EMPTY_MENU_MESSAGE,
  MAX_MENU_DESCRIPTION_LENGTH,
  menuDescriptionRules,
  toMenuEntries,
  toWeeklyMenuFormValues,
  type WeeklyMenuFormValues,
} from "../_lib/weekly-menu-rules";

interface WeeklyMenuFormProps {
  formId: string;
  weekStartDate: string;
  menu: WeeklyMenuResponse | null;
  isSaving: boolean;
  // Trả thực đơn backend đã lưu; lỗi thì ném ra, trang tự hiện lỗi của mutation
  onSave: (entries: MenuEntryRequest[]) => Promise<WeeklyMenuResponse>;
  onDirtyChange: (isDirty: boolean) => void;
}

// 7 ô thứ Hai tới Chủ nhật. Trang gắn key theo tuần và id thực đơn nên form chỉ nạp giá trị ban đầu một lần;
// lần tải lại nền của cùng thực đơn không xóa phần Kế toán đang gõ. Nút Lưu nằm trên thanh chọn tuần, nối vào
// form bằng formId
export function WeeklyMenuForm({
  formId,
  weekStartDate,
  menu,
  isSaving,
  onSave,
  onDirtyChange,
}: WeeklyMenuFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<WeeklyMenuFormValues>({ defaultValues: toWeeklyMenuFormValues(menu) });

  const descriptions = useWatch({ control, name: "descriptions" });

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // Rời form (đổi tuần) thì không còn thay đổi chưa lưu
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const onSubmit = handleSubmit(async (values) => {
    const entries = toMenuEntries(values);
    if (entries.length === 0) {
      setError("root", { message: EMPTY_MENU_MESSAGE });
      return;
    }

    try {
      const saved = await onSave(entries);
      // Hiện đúng bản backend đã lưu (mô tả đã trim) và coi đó là mốc chưa thay đổi mới
      reset(toWeeklyMenuFormValues(saved));
    } catch {
      // Lỗi API hiện ở ApiErrorAlert phía trên form; giữ nguyên phần đang gõ để sửa rồi lưu lại
    }
  });

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="space-y-4">
      {errors.root?.message && (
        <p role="alert" className="text-sm font-medium text-error">
          {errors.root.message}
        </p>
      )}

      {MENU_DAYS_OF_WEEK.map((dayOfWeek, index) => (
        <Textarea
          key={dayOfWeek}
          label={`${MENU_DAY_LABELS[dayOfWeek]} · ${formatVietnamShortDate(
            addDaysToDateString(weekStartDate, index)
          ).slice(0, 5)}`}
          placeholder={menu ? "Để trống nếu ngày này không có thực đơn" : "Món ăn trong ngày"}
          maxLength={MAX_MENU_DESCRIPTION_LENGTH}
          showCount
          currentValue={descriptions?.[index] ?? ""}
          disabled={isSaving}
          error={errors.descriptions?.[index]?.message}
          {...register(`descriptions.${index}`, menuDescriptionRules(dayOfWeek))}
        />
      ))}
    </form>
  );
}
