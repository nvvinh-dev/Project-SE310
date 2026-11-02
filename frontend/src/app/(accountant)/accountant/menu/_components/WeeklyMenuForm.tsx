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

// 7 ô thứ Hai tới Chủ nhật. Trang gắn key theo tuần và id thực đơn: đổi tuần, hay thực đơn vừa được tạo, thì form
// nạp lại từ đầu. Nút Lưu nằm trên thanh chọn tuần, nối vào form bằng formId
export function WeeklyMenuForm({
  formId,
  weekStartDate,
  menu,
  isSaving,
  onSave,
  onDirtyChange,
}: WeeklyMenuFormProps) {
  // Tải lại được nội dung mới của cùng thực đơn (Kế toán khác vừa sửa, trang tự tải lại khi quay về tab hay quay
  // lại tuần đã xem) thì điền theo bản mới (SCR-ACC-06, Hành vi 1). Ô đang sửa giữ phần đang gõ, ô chưa đụng nhận
  // giá trị mới, để lần Lưu sau không gửi lại bản cũ của những ngày Kế toán không sửa
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    control,
    formState: { errors, isDirty },
  } = useForm<WeeklyMenuFormValues>({
    values: toWeeklyMenuFormValues(menu),
    resetOptions: { keepDirtyValues: true },
  });

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
      // Hiện đúng bản backend đã lưu (mô tả đã trim) và coi đó là mốc chưa thay đổi mới. reset() tự gộp
      // resetOptions nên phải tắt keepDirtyValues, nếu không ô vừa lưu vẫn giữ bản chưa trim và còn "thay đổi"
      reset(toWeeklyMenuFormValues(saved), { keepDirtyValues: false });
    } catch {
      // Lỗi API hiện ở ApiErrorAlert phía trên form. 400 giữ phần đang gõ để sửa rồi lưu lại; 409 thì trang tải
      // lại thực đơn đã có, key của form đổi từ "new" sang id nên form nạp lại thực đơn đó (Hành vi 2)
    }
  });

  // Lỗi "phải có ít nhất một ngày" là lỗi của cả form, không tự mất như lỗi từng ô: gõ vào ô nào thì ẩn đi
  const clearEmptyMenuError = () => {
    if (errors.root) clearErrors("root");
  };

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
          {...register(`descriptions.${index}`, {
            ...menuDescriptionRules(dayOfWeek),
            onChange: clearEmptyMenuError,
          })}
        />
      ))}
    </form>
  );
}
