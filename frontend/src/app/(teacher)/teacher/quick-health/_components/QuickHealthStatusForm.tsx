"use client";

import React, { useState } from "react";
import { Button, Input, Select, Textarea } from "@/components";
import type { HealthMood } from "@/types/health";
import { HEALTH_MOOD_OPTIONS } from "@/types/health";

export interface QuickHealthFormValues {
  mood: HealthMood | "";
  temperatureCelsius: number | null;
  notes: string;
}

interface QuickHealthStatusFormProps {
  selectedChildId: string;
  isSubmitting: boolean;
  onSubmit: (values: {
    mood: HealthMood;
    temperatureCelsius: number | null;
    notes: string;
  }) => Promise<boolean>;
}

export function QuickHealthStatusForm({
  selectedChildId,
  isSubmitting,
  onSubmit,
}: QuickHealthStatusFormProps) {
  const [mood, setMood] = useState<HealthMood | "">("");
  const [temperatureStr, setTemperatureStr] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Validation errors
  const [errors, setErrors] = useState<{
    child?: string;
    mood?: string;
    temperature?: string;
    notes?: string;
  }>({});

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!selectedChildId) {
      nextErrors.child = "Vui lòng chọn trẻ trước khi lưu sức khỏe.";
    }

    if (!mood) {
      nextErrors.mood = "Tâm trạng không được để trống.";
    }

    if (temperatureStr.trim() !== "") {
      const trimmed = temperatureStr.trim();
      const num = Number(trimmed);
      const parts = trimmed.split(".");

      if (Number.isNaN(num) || num < 30 || num > 45) {
        nextErrors.temperature = "Nhiệt độ phải từ 30 đến 45 °C.";
      } else if (parts.length > 2 || (parts[1] && parts[1].length > 1)) {
        nextErrors.temperature = "Nhiệt độ chỉ được tối đa 1 chữ số thập phân.";
      }
    }

    const trimmedNotes = notes.trim();
    if (!trimmedNotes) {
      nextErrors.notes = "Ghi chú không được để trống.";
    } else if (trimmedNotes.length > 1000) {
      nextErrors.notes = "Ghi chú không được dài quá 1000 ký tự.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedTemp =
      temperatureStr.trim() !== "" ? Number(Number(temperatureStr).toFixed(1)) : null;

    const success = await onSubmit({
      mood: mood as HealthMood,
      temperatureCelsius: parsedTemp,
      notes: notes.trim(),
    });

    if (success) {
      // Xóa form, giữ nguyên trẻ đang chọn theo đặc tả SCR-TCH-03 Hành vi 1
      setMood("");
      setTemperatureStr("");
      setNotes("");
      setErrors({});
    }
  };

  return (
    <form
      id="panel-health"
      role="tabpanel"
      aria-labelledby="tab-health"
      onSubmit={handleSubmit}
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

      {errors.child && (
        <div
          role="alert"
          className="rounded-2xl border border-error/30 bg-error-container/30 p-3.5 text-xs text-on-error-container font-medium"
        >
          {errors.child}
        </div>
      )}

      {/* Hàng 1: Tâm trạng và Nhiệt độ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="quick-health-mood"
          label="Tâm trạng"
          required
          placeholder="-- Chọn tâm trạng --"
          options={HEALTH_MOOD_OPTIONS}
          value={mood}
          onChange={(e) => {
            setMood(e.target.value as HealthMood);
            if (errors.mood) setErrors((prev) => ({ ...prev, mood: undefined }));
          }}
          error={errors.mood}
          disabled={isSubmitting}
        />

        <Input
          id="quick-health-temperature"
          label="Nhiệt độ"
          type="number"
          step="0.1"
          min="30"
          max="45"
          placeholder="Ví dụ: 36.8"
          suffixIcon={<span className="text-xs font-semibold text-outline">°C</span>}
          value={temperatureStr}
          onChange={(e) => {
            setTemperatureStr(e.target.value);
            if (errors.temperature)
              setErrors((prev) => ({ ...prev, temperature: undefined }));
          }}
          helperText="Không bắt buộc (30–45 °C, tối đa 1 số thập phân)"
          error={errors.temperature}
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
          currentValue={notes}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (errors.notes) setErrors((prev) => ({ ...prev, notes: undefined }));
          }}
          error={errors.notes}
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
