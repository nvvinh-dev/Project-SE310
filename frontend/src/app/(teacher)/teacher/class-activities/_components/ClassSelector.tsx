"use client";

import React from "react";
import { Controller, type Control } from "react-hook-form";
import { Select, Icons } from "@/components";
import type { HomeroomClassResponse } from "@/types/media";
import {
  classIdRules,
  type ShareActivityPhotosFormValues,
} from "../_lib/class-activities-rules";

interface ClassSelectorProps {
  classes: HomeroomClassResponse[];
  control: Control<ShareActivityPhotosFormValues>;
  disabled?: boolean;
}

export function ClassSelector({
  classes,
  control,
  disabled = false,
}: ClassSelectorProps) {
  // Chỉ một lớp thì chọn sẵn, hiện tên lớp thay ô chọn (ui-screens SCR-TCH-06)
  if (classes.length === 1) {
    const singleClass = classes[0];
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm">
        <span className="block text-sm font-semibold text-on-surface mb-2">
          Lớp phụ trách
        </span>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary shrink-0"
            aria-hidden="true"
          >
            <Icons.School />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">
              {singleClass.name}
            </p>
            <p className="text-xs text-on-surface-variant">
              Ảnh sẽ được chia sẻ cho lớp này
            </p>
          </div>
        </div>
      </div>
    );
  }

  const classIds = classes.map((c) => c.id);
  const options = classes.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm">
      <div className="w-full sm:max-w-md">
        {/* Giữ ô chọn ở dạng controlled: lớp đang chọn bị gỡ khỏi danh sách thì quay về "Chọn lớp",
            không để trình duyệt tự nhảy sang lớp đầu tiên */}
        <Controller
          name="classId"
          control={control}
          rules={classIdRules(classIds)}
          render={({ field, fieldState }) => (
            <Select
              id="teacher-class-activities-select"
              label="Lớp phụ trách"
              required
              placeholder="Chọn lớp"
              options={options}
              ref={field.ref}
              name={field.name}
              value={classIds.includes(field.value) ? field.value : ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              disabled={disabled}
              error={fieldState.error?.message}
              helperText="Chọn lớp bạn muốn chia sẻ ảnh hoạt động"
            />
          )}
        />
      </div>
    </div>
  );
}
