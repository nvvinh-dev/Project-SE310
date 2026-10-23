"use client";

import React, { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input, Textarea, Icons } from "@/components";
import {
  formatFileSize,
  getNowVietnamDateTimeLocal,
  toVietnamIsoString,
  validateIncidentPhotos,
} from "../_lib/quick-health-helpers";
import { descriptionRules, occurredAtRules } from "../_lib/quick-health-rules";

export interface IncidentFormValues {
  occurredAt: string;
  description: string;
}

interface IncidentFormProps {
  isSubmitting: boolean;
  submittingStepText?: string;
  pendingIncidentId: string | null;
  onValidateChild: () => boolean;
  onSubmit: (values: {
    occurredAtUtc: string;
    description: string;
    photos: File[];
  }) => Promise<boolean>;
  onRetryPhotosOnly: (files: File[]) => Promise<boolean>;
  onSkipPhotos: () => void;
}

export function IncidentForm({
  isSubmitting,
  submittingStepText,
  pendingIncidentId,
  onValidateChild,
  onSubmit,
  onRetryPhotosOnly,
  onSkipPhotos,
}: IncidentFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    defaultValues: {
      occurredAt: getNowVietnamDateTimeLocal(0),
      description: "",
    },
    mode: "onTouched",
  });

  const watchedDescription = useWatch({ control, name: "description" }) ?? "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const combinedFiles = [...photos, ...selectedFiles];

    // Kiểm tra tính hợp lệ của toàn bộ danh sách mới theo §4.4
    const err = validateIncidentPhotos(combinedFiles);
    if (err) {
      setPhotoError(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setPhotos(combinedFiles);
    setPhotoError(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    setPhotos(updated);
    const err = validateIncidentPhotos(updated);
    setPhotoError(err);
  };

  const onFormSubmit = async (values: IncidentFormValues) => {
    // Nếu đang trong trạng thái thử lại tải ảnh cho sự cố đã tạo (tránh nhân bản sự cố)
    if (pendingIncidentId) {
      if (photos.length === 0) {
        setPhotoError("Vui lòng chọn ít nhất 1 ảnh để thử lại tải ảnh, hoặc bấm Bỏ qua ảnh.");
        return;
      }
      const err = validateIncidentPhotos(photos);
      if (err) {
        setPhotoError(err);
        return;
      }

      const success = await onRetryPhotosOnly(photos);
      if (success) {
        reset({
          occurredAt: getNowVietnamDateTimeLocal(0),
          description: "",
        });
        setPhotos([]);
        setPhotoError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      return;
    }

    if (!onValidateChild()) return;

    if (photos.length > 0) {
      const err = validateIncidentPhotos(photos);
      if (err) {
        setPhotoError(err);
        return;
      }
    }

    const occurredAtUtc = toVietnamIsoString(values.occurredAt);

    const success = await onSubmit({
      occurredAtUtc,
      description: values.description.trim(),
      photos,
    });

    if (success) {
      // Xóa form, giữ nguyên trẻ đang chọn theo đặc tả SCR-TCH-03 Hành vi 2
      reset({
        occurredAt: getNowVietnamDateTimeLocal(0),
        description: "",
      });
      setPhotos([]);
      setPhotoError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSkipPhotosClick = () => {
    onSkipPhotos();
    reset({
      occurredAt: getNowVietnamDateTimeLocal(0),
      description: "",
    });
    setPhotos([]);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // max được tính động với 5 phút dung sai đồng hồ khớp backend (D39 mục 17)
  const maxLocalTime = getNowVietnamDateTimeLocal(5);

  return (
    <form
      id="panel-incident"
      role="tabpanel"
      aria-labelledby="tab-incident"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onFormSubmit)(e);
      }}
      noValidate
      className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-5 sm:p-6 shadow-sm space-y-6"
    >
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-on-surface">
          Ghi nhận sự cố / tai nạn của trẻ
        </h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Hệ thống sẽ gửi thông báo ngay lập tức tới phụ huynh của trẻ và toàn bộ nhân viên Y tế đang hoạt động.
        </p>
      </div>

      {/* Trạng thái lỗi tải ảnh sau khi sự cố đã được lưu thành công (Chống nhân bản sự cố) */}
      {pendingIncidentId && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-400 bg-amber-50 p-4 text-xs text-amber-950 space-y-2 shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true">
              <Icons.Alert />
            </span>
            <div>
              <p className="font-bold text-sm text-amber-900">
                Sự cố đã được ghi nhận vào hệ thống
              </p>
              <p className="mt-0.5 leading-relaxed">
                Hệ thống đã lưu thông tin sự cố và gửi thông báo, nhưng việc tải ảnh bị gián đoạn.
                Bạn có thể thử tải lại ảnh cho sự cố này hoặc bấm hoàn tất bỏ qua ảnh.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thời điểm xảy ra */}
      <div className="w-full sm:max-w-md">
        <Input
          id="incident-occurred-at"
          label="Thời điểm xảy ra"
          type="datetime-local"
          required
          max={maxLocalTime}
          {...register("occurredAt", occurredAtRules)}
          helperText="Theo giờ Việt Nam, không được sau thời điểm hiện tại"
          error={errors.occurredAt?.message}
          disabled={isSubmitting || Boolean(pendingIncidentId)}
        />
      </div>

      {/* Mô tả sự cố */}
      <div>
        <Textarea
          id="incident-description"
          label="Mô tả sự cố"
          required
          placeholder="Mô tả chi tiết nguyên nhân, vị trí, biểu hiện và các biện pháp sơ cứu đã thực hiện..."
          maxLength={1000}
          showCount
          currentValue={watchedDescription}
          {...register("description", descriptionRules)}
          error={errors.description?.message}
          disabled={isSubmitting || Boolean(pendingIncidentId)}
          className="min-h-[120px]"
        />
      </div>

      {/* Đính kèm ảnh sự cố */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-semibold text-on-surface">
              Ảnh sự cố (không bắt buộc)
            </label>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Tối đa 5 ảnh, mỗi ảnh ≤ 5 MB, định dạng JPEG hoặc PNG.
            </p>
          </div>
          <span className="text-xs font-semibold text-outline">
            {photos.length}/5 ảnh
          </span>
        </div>

        {/* Input file ẩn */}
        <input
          ref={fileInputRef}
          id="incident-photos-file-input"
          type="file"
          accept="image/jpeg,image/png"
          multiple
          disabled={isSubmitting || photos.length >= 5}
          onChange={handleFileChange}
          className="hidden"
        />

        {photos.length < 5 && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary/70 bg-surface-container-low/40 hover:bg-surface-container-low/80 transition-colors text-sm text-on-surface-variant font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="text-outline">
              <Icons.Camera />
            </span>
            <span>Chọn ảnh từ thiết bị</span>
          </button>
        )}

        {photoError && (
          <p className="text-xs text-error font-medium" role="alert">
            {photoError}
          </p>
        )}

        {/* Danh sách ảnh đã chọn */}
        {photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {photos.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-slate-200 bg-surface-container-lowest shadow-xs text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant shrink-0">
                    <Icons.Camera />
                  </span>
                  <div className="truncate">
                    <p className="font-semibold text-on-surface truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[11px] text-outline">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleRemovePhoto(idx)}
                  className="p-1 rounded-full text-outline hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  aria-label={`Xóa ảnh ${file.name}`}
                >
                  <Icons.Close />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lời nhắc quy trình khẩn cấp của nhà trường (đặt ngay trên nút bấm theo bố cục [4] ui-screens.md) */}
      <div
        role="note"
        className="rounded-2xl border border-amber-300/80 bg-amber-50/80 p-3.5 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5 shadow-xs"
      >
        <span className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true">
          <Icons.Alert />
        </span>
        <p className="font-medium">
          Sơ cứu, gọi cấp cứu và gọi phụ huynh làm theo quy trình của trường trước khi ghi.
        </p>
      </div>

      {/* Nút hành động */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
        {pendingIncidentId && (
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isSubmitting}
            onClick={handleSkipPhotosClick}
            className="w-full sm:w-auto"
          >
            Bỏ qua ảnh và hoàn tất
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full sm:w-auto min-w-[140px]"
        >
          {isSubmitting
            ? submittingStepText || "Đang lưu..."
            : pendingIncidentId
            ? "Thử lại tải ảnh"
            : "Lưu sự cố"}
        </Button>
      </div>
    </form>
  );
}
