"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiErrorAlert, Button, Input } from "@/components";
import type { SchoolChildResponse } from "@/types/health";
import { useCreateGrowthMeasurement } from "../_lib/health-api";
import {
  type GrowthMeasurementFormValues,
  parseMeasurementValue,
  validateHeight,
  validateWeight,
} from "../_lib/health-rules";

interface GrowthMeasurementFormProps {
  selectedChild: SchoolChildResponse | null;
  onSuccessNotice: (msg: string) => void;
  className?: string;
}

export function GrowthMeasurementForm({
  selectedChild,
  onSuccessNotice,
  className = "",
}: GrowthMeasurementFormProps) {
  const [apiError, setApiError] = useState<unknown>(null);
  const createMutation = useCreateGrowthMeasurement(selectedChild?.id ?? null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GrowthMeasurementFormValues>({
    defaultValues: {
      heightCm: "",
      weightKg: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (data: GrowthMeasurementFormValues) => {
    setApiError(null);

    const heightNum = parseMeasurementValue(data.heightCm);
    const weightNum = parseMeasurementValue(data.weightKg);

    createMutation.mutate(
      { heightCm: heightNum, weightKg: weightNum },
      {
        onSuccess: () => {
          reset({ heightCm: "", weightKg: "" });
          onSuccessNotice(
            `Đã lưu số đo mới cho trẻ ${selectedChild?.fullName ?? ""}.`
          );
        },
        onError: (err) => {
          setApiError(err);
        },
      }
    );
  };

  const isFormDisabled = !selectedChild || createMutation.isPending;

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs ${className}`}
    >
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-on-surface">Số đo mới</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {selectedChild
              ? `Ghi nhận số đo cho trẻ: ${selectedChild.fullName}`
              : "Vui lòng chọn một trẻ ở trên để mở form ghi số đo"}
          </p>
        </div>
      </div>

      {apiError != null && (
        <div className="mb-4">
          <ApiErrorAlert error={apiError} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="heightCm"
            label="Chiều cao"
            inputMode="decimal"
            disabled={isFormDisabled}
            placeholder="Ví dụ: 102.5"
            suffixIcon={
              <span className="text-xs font-semibold text-outline select-none">
                cm
              </span>
            }
            error={errors.heightCm?.message}
            helperText="Lớn hơn 0 và tối đa 200 cm"
            {...register("heightCm", {
              validate: (val, formValues) =>
                validateHeight(val, formValues.weightKg),
            })}
          />

          <Input
            id="weightKg"
            label="Cân nặng"
            inputMode="decimal"
            disabled={isFormDisabled}
            placeholder="Ví dụ: 16.2"
            suffixIcon={
              <span className="text-xs font-semibold text-outline select-none">
                kg
              </span>
            }
            error={errors.weightKg?.message}
            helperText="Lớn hơn 0 và tối đa 100 kg"
            {...register("weightKg", {
              validate: (val) => validateWeight(val),
            })}
          />
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isFormDisabled}
            isLoading={createMutation.isPending}
            className="w-full sm:w-auto min-w-[120px] min-h-11"
          >
            Lưu
          </Button>
        </div>
      </form>
    </div>
  );
}
