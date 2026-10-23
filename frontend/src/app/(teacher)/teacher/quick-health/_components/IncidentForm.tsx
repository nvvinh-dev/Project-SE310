"use client";

import React, { useRef, useState } from "react";
import { Button, Input, Textarea, Icons } from "@/components";
import {
  formatFileSize,
  getNowVietnamDateTimeLocal,
  isFutureVietnamDateTime,
  toVietnamIsoString,
  validateIncidentPhotos,
} from "../_lib/quick-health-helpers";

interface IncidentFormProps {
  selectedChildId: string;
  isSubmitting: boolean;
  submittingStepText?: string;
  onSubmit: (values: {
    occurredAtUtc: string;
    description: string;
    photos: File[];
  }) => Promise<boolean>;
}

export function IncidentForm({
  selectedChildId,
  isSubmitting,
  submittingStepText,
  onSubmit,
}: IncidentFormProps) {
  const [occurredAt, setOccurredAt] = useState<string>(() =>
    getNowVietnamDateTimeLocal()
  );
  const [description, setDescription] = useState<string>("");
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation errors
  const [errors, setErrors] = useState<{
    child?: string;
    occurredAt?: string;
    description?: string;
    photos?: string;
  }>({});

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!selectedChildId) {
      nextErrors.child = "Vui lòng chọn trẻ trước khi ghi sự cố.";
    }

    if (!occurredAt) {
      nextErrors.occurredAt = "Thời điểm xảy ra không được để trống.";
    } else if (isFutureVietnamDateTime(occurredAt)) {
      nextErrors.occurredAt = "Thời điểm xảy ra không được sau thời điểm hiện tại.";
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      nextErrors.description = "Mô tả sự cố không được để trống.";
    } else if (trimmedDesc.length > 1000) {
      nextErrors.description = "Mô tả sự cố không được dài quá 1000 ký tự.";
    }

    if (photos.length > 0) {
      const photoError = validateIncidentPhotos(photos);
      if (photoError) {
        nextErrors.photos = photoError;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const combinedFiles = [...photos, ...selectedFiles];

    // Kiểm tra tính hợp lệ của toàn bộ danh sách mới theo §4.4
    const photoError = validateIncidentPhotos(combinedFiles);
    if (photoError) {
      setErrors((prev) => ({ ...prev, photos: photoError }));
      // Xóa giá trị input để người dùng có thể chọn lại file khác
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setPhotos(combinedFiles);
    setErrors((prev) => ({ ...prev, photos: undefined }));

    // Reset input để cho phép chọn tiếp nếu chưa đủ 5 ảnh
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    setPhotos(updated);
    const photoError = validateIncidentPhotos(updated);
    setErrors((prev) => ({ ...prev, photos: photoError ?? undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Chuyển đổi thành ISO có múi giờ +07:00 theo D39 mục 17
    const occurredAtUtc = toVietnamIsoString(occurredAt);

    const success = await onSubmit({
      occurredAtUtc,
      description: description.trim(),
      photos,
    });

    if (success) {
      // Xóa form, giữ nguyên trẻ đang chọn theo đặc tả SCR-TCH-03 Hành vi 2
      setOccurredAt(getNowVietnamDateTimeLocal());
      setDescription("");
      setPhotos([]);
      setErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const nowLocal = getNowVietnamDateTimeLocal();

  return (
    <form
      id="panel-incident"
      role="tabpanel"
      aria-labelledby="tab-incident"
      onSubmit={handleSubmit}
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

      {/* Lời nhắc quy trình khẩn cấp của nhà trường */}
      <div
        role="note"
        className="rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-3 shadow-xs"
      >
        <span className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true">
          <Icons.Alert />
        </span>
        <div className="space-y-1">
          <p className="font-bold text-amber-950">Quy trình xử lý khẩn cấp</p>
          <p>
            Sơ cứu, gọi cấp cứu và gọi phụ huynh làm theo quy trình của trường trước khi ghi.
          </p>
        </div>
      </div>

      {errors.child && (
        <div
          role="alert"
          className="rounded-2xl border border-error/30 bg-error-container/30 p-3.5 text-xs text-on-error-container font-medium"
        >
          {errors.child}
        </div>
      )}

      {/* Thời điểm xảy ra */}
      <div className="w-full sm:max-w-md">
        <Input
          id="incident-occurred-at"
          label="Thời điểm xảy ra"
          type="datetime-local"
          required
          max={nowLocal}
          value={occurredAt}
          onChange={(e) => {
            setOccurredAt(e.target.value);
            if (errors.occurredAt)
              setErrors((prev) => ({ ...prev, occurredAt: undefined }));
          }}
          helperText="Theo giờ Việt Nam, không được sau thời điểm hiện tại"
          error={errors.occurredAt}
          disabled={isSubmitting}
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
          currentValue={description}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description)
              setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          error={errors.description}
          disabled={isSubmitting}
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

        {/* Nút chọn ảnh và input ẩn */}
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

        {errors.photos && (
          <p className="text-xs text-error font-medium" role="alert">
            {errors.photos}
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

      {/* Nút hành động */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full sm:w-auto min-w-[140px]"
        >
          {isSubmitting
            ? submittingStepText || "Đang lưu sự cố..."
            : "Lưu sự cố"}
        </Button>
      </div>
    </form>
  );
}
