"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input } from "@/components";
import type { GrowthMeasurementFormValues, SchoolChildResponse } from "@/types/health";
import { useCreateGrowthMeasurement } from "../_lib/health-api";
import {
  parseMeasurementValue,
  validateHeight,
  validateWeight,
} from "../_lib/health-rules";
import { ApiErrorAlert } from "./ApiErrorAlert";

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
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<GrowthMeasurementFormValues>({
    defaultValues: {
      heightCm: "",
      weightKg: "",
    },
    mode: "onTouched",
  });

  const [heightVal, weightVal] = useWatch({
    control,
    name: ["heightCm", "weightKg"],
  });

  const onSubmit = (data: GrowthMeasurementFormValues) => {
    setApiError(null);

    const trimmedHeight = data.heightCm.trim();
    const trimmedWeight = data.weightKg.trim();

    // AC-HEALTH-07: Cả hai ô trống -> báo lỗi ngay ở client, không gửi
    if (!trimmedHeight && !trimmedWeight) {
      setError("heightCm", {
        type: "manual",
        message: "Cần nhập ít nhất chiều cao hoặc cân nặng.",
      });
      return;
    }

    const heightCheck = validateHeight(trimmedHeight, trimmedWeight);
    if (heightCheck !== true) {
      setError("heightCm", { type: "manual", message: heightCheck });
      return;
    }

    const weightCheck = validateWeight(trimmedWeight, trimmedHeight);
    if (weightCheck !== true) {
      setError("weightKg", { type: "manual", message: weightCheck });
      return;
    }

    const heightNum = parseMeasurementValue(trimmedHeight);
    const weightNum = parseMeasurementValue(trimmedWeight);

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
      className={`rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-5 sm:p-6 shadow-xs ${className}`}
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
              validate: (val) => validateHeight(val, weightVal),
              onChange: () => {
                if (
                  errors.heightCm?.message ===
                  "Cần nhập ít nhất chiều cao hoặc cân nặng."
                ) {
                  clearErrors("heightCm");
                }
              },
            })}
          />

          <Input
            id="weightKg"
            label="Cân nặng"
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
              validate: (val) => validateWeight(val, heightVal),
              onChange: () => {
                if (
                  errors.heightCm?.message ===
                  "Cần nhập ít nhất chiều cao hoặc cân nặng."
                ) {
                  clearErrors("heightCm");
                }
              },
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
            className="w-full sm:w-auto min-w-[120px]"
          >
            Lưu
          </Button>
        </div>
      </form>
    </div>
  );
}
