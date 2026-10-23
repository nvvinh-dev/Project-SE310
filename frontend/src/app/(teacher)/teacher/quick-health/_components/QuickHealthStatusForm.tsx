"use client";

import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input, Select, Textarea } from "@/components";
import type { HealthMood } from "@/types/health";
import { HEALTH_MOOD_OPTIONS, isHealthMood } from "@/types/health";
import {
  moodRules,
  temperatureRules,
  notesRules,
  parseTemperatureValue,
} from "../_lib/quick-health-rules";

export interface QuickHealthFormValues {
  mood: string;
  temperatureCelsius: string;
  notes: string;
}

interface QuickHealthStatusFormProps {
  isSubmitting: boolean;
  onValidateChild: () => boolean;
  onSubmit: (values: {
    mood: HealthMood;
    temperatureCelsius: number | null;
    notes: string;
  }) => Promise<boolean>;
}

export function QuickHealthStatusForm({
  isSubmitting,
  onValidateChild,
  onSubmit,
}: QuickHealthStatusFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<QuickHealthFormValues>({
    defaultValues: {
      mood: "",
      temperatureCelsius: "",
      notes: "",
    },
    mode: "onTouched",
  });

  const watchedNotes = useWatch({ control, name: "notes" }) ?? "";

  const onFormSubmit = async (values: QuickHealthFormValues) => {
    if (!onValidateChild()) return;
    if (!isHealthMood(values.mood)) return;

    const parsedTemp = parseTemperatureValue(values.temperatureCelsius);
    const success = await onSubmit({
      mood: values.mood,
      temperatureCelsius: parsedTemp,
      notes: values.notes.trim(),
    });

    if (success) {
      // Xóa form, giữ nguyên trẻ đang chọn theo đặc tả SCR-TCH-03 Hành vi 1
      reset({
        mood: "",
        temperatureCelsius: "",
        notes: "",
      });
    }
  };

  return (
    <form
      id="panel-health"
      role="tabpanel"
      aria-labelledby="tab-health"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onFormSubmit)(e);
      }}
      noValidate
      className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-5 sm:p-6 shadow-sm space-y-6"
    >
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-on-surface">
          Ghi nhận tình trạng sức khỏe nhanh
        </h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Cập nhật nhanh tâm trạng, nhiệt độ và ghi chú trong ngày của trẻ để phụ huynh nắm bắt.
        </p>
      </div>

      {/* Hàng 1: Tâm trạng và Nhiệt độ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="quick-health-mood"
          label="Tâm trạng"
          required
          placeholder="-- Chọn tâm trạng --"
          options={HEALTH_MOOD_OPTIONS}
          {...register("mood", moodRules)}
          error={errors.mood?.message}
          disabled={isSubmitting}
        />

        <Input
          id="quick-health-temperature"
          label="Nhiệt độ"
          type="text"
          inputMode="decimal"
          placeholder="Ví dụ: 36.8 hoặc 36,8"
          suffixIcon={<span className="text-xs font-semibold text-outline">°C</span>}
          {...register("temperatureCelsius", temperatureRules)}
          helperText="Không bắt buộc (30–45 °C, tối đa 1 số thập phân)"
          error={errors.temperatureCelsius?.message}
          disabled={isSubmitting}
        />
      </div>

      {/* Hàng 2: Ghi chú */}
      <div>
        <Textarea
          id="quick-health-notes"
          label="Ghi chú"
          required
          placeholder="Nhập chi tiết ăn uống, giấc ngủ hoặc biểu hiện trong ngày của trẻ..."
          maxLength={1000}
          showCount
          currentValue={watchedNotes}
          {...register("notes", notesRules)}
          error={errors.notes?.message}
          disabled={isSubmitting}
          className="min-h-[110px]"
        />
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full sm:w-auto min-w-[120px]"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  );
}
