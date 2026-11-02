"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Textarea } from "@/components";
import type { SchoolChildResponse } from "@/types/health";
import { useUpdateHealthNotes } from "../_lib/health-notes-api";
import {
  type HealthNotesFormValues,
  validateHealthNotes,
} from "../_lib/health-notes-rules";

interface HealthNotesFormProps {
  selectedChild: SchoolChildResponse | null;
  onSuccess: (updatedChild: SchoolChildResponse) => void;
  onError: (err: unknown) => void;
  onStartSubmit: () => void;
  className?: string;
}

export function HealthNotesForm({
  selectedChild,
  onSuccess,
  onError,
  onStartSubmit,
  className = "",
}: HealthNotesFormProps) {
  const updateMutation = useUpdateHealthNotes(selectedChild?.id ?? null);
  const prevChildIdRef = useRef<string | undefined>(selectedChild?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<HealthNotesFormValues>({
    defaultValues: {
      healthNotes: selectedChild?.healthNotes ?? "",
    },
    mode: "onTouched",
  });

  // Đồng bộ giá trị textarea khi người dùng chọn trẻ khác trong danh sách
  useEffect(() => {
    // Khi chuyển sang trẻ khác: xóa trạng thái lỗi cũ và nạp dữ liệu lưu ý của trẻ mới
    if (prevChildIdRef.current !== selectedChild?.id) {
      prevChildIdRef.current = selectedChild?.id;
      updateMutation.reset();
      reset({ healthNotes: selectedChild?.healthNotes ?? "" });
      return;
    }

    // Nếu cùng 1 trẻ và vừa gặp lỗi submit: giữ nguyên chữ người dùng đang gõ
    if (updateMutation.isError) {
      return;
    }

    reset({ healthNotes: selectedChild?.healthNotes ?? "" });
  }, [selectedChild?.id, selectedChild?.healthNotes, reset, updateMutation]);

  const currentNotes = useWatch({
    control,
    name: "healthNotes",
    defaultValue: selectedChild?.healthNotes ?? "",
  });
  const trimmedLength = currentNotes?.trim().length ?? 0;
  const isLengthExceeded = trimmedLength > 1000;
  const isFormDisabled = !selectedChild || updateMutation.isPending;

  const onSubmit = (data: HealthNotesFormValues) => {
    onStartSubmit();

    // Bỏ khoảng trắng hai đầu theo frontend-conventions.md §4 & D39 mục 14; rỗng thì gửi ""
    const cleanNotes = data.healthNotes?.trim() ?? "";

    updateMutation.mutate(
      { healthNotes: cleanNotes },
      {
        onSuccess: (updatedChild) => {
          if (updatedChild) {
            reset({ healthNotes: updatedChild.healthNotes ?? "" });
            onSuccess(updatedChild);
          }
        },
        onError: (err) => {
          onError(err);
        },
      }
    );
  };

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs ${className}`}
    >
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-on-surface">Lưu ý sức khỏe</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {selectedChild
              ? `Cập nhật lưu ý sức khỏe cho trẻ: ${selectedChild.fullName}`
              : "Vui lòng chọn một trẻ ở trên để xem và cập nhật lưu ý sức khỏe"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Textarea
          id="healthNotes"
          label="Lưu ý sức khỏe — dị ứng (thức ăn, thuốc), bệnh nền, điều cần chú ý khi chăm sóc"
          placeholder={
            selectedChild
              ? "Nhập dị ứng (thức ăn, thuốc), bệnh nền, điều cần chú ý khi chăm sóc trẻ..."
              : "Chưa chọn trẻ..."
          }
          disabled={isFormDisabled}
          helperText="Để trống nếu trẻ không có lưu ý (sẽ xóa lưu ý hiện tại của trẻ). Tối đa 1000 ký tự."
          rows={5}
          error={errors.healthNotes?.message}
          {...register("healthNotes", {
            validate: {
              maxLength: validateHealthNotes,
            },
          })}
        />

        {/* Đếm ký tự hiển thị ở góc phải theo chuỗi đã trim (ui-screens.md wireframe: 245/1000, D39 mục 14) */}
        <div className="flex justify-end -mt-2">
          <span
            className={`text-xs font-medium ${
              isLengthExceeded ? "text-error font-bold" : "text-outline"
            }`}
          >
            {trimmedLength}/1000
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={updateMutation.isPending}
            disabled={isFormDisabled || isLengthExceeded}
          >
            Lưu
          </Button>
        </div>
      </form>
    </div>
  );
}
