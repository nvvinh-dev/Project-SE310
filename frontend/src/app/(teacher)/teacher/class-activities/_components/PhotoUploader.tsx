"use client";

import React, { useMemo, useRef } from "react";
import { Button, Icons } from "@/components";
import { formatFileSize } from "../../quick-health/_lib/quick-health-helpers";
import {
  MAX_PHOTOS_PER_UPLOAD,
  validateActivityPhotos,
} from "../_lib/class-activities-rules";

interface PhotoUploaderProps {
  photos: File[];
  onPhotosChange: (files: File[]) => void;
  validationError: string | null;
  onValidationErrorChange: (error: string | null) => void;
  disabled?: boolean;
}

// Ảnh xem trước bằng object URL. Thu hồi URL ngay khi ảnh đã hiện (ảnh đã giải mã vẫn hiển thị),
// để không giữ file trong bộ nhớ; không thu hồi trong cleanup của effect vì Strict Mode chạy
// cleanup hai lần làm hỏng ảnh
function PhotoPreviewThumbnail({ file }: { file: File }) {
  const previewSrc = useMemo(() => URL.createObjectURL(file), [file]);

  return (
    // Ảnh cục bộ của người dùng, không qua tối ưu ảnh của Next
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={previewSrc}
      alt={`Ảnh xem trước ${file.name}`}
      onLoad={() => URL.revokeObjectURL(previewSrc)}
      onError={() => URL.revokeObjectURL(previewSrc)}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

export function PhotoUploader({
  photos,
  onPhotosChange,
  validationError,
  onValidationErrorChange,
  disabled = false,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    resetInput();
    if (selectedFiles.length === 0) return;

    const combined = [...photos, ...selectedFiles];

    // Chặn ngay phía client: quá 5 ảnh, ảnh > 5 MB, không phải JPEG/PNG (ui-screens §4.4)
    const err = validateActivityPhotos(combined);
    if (err) {
      onValidationErrorChange(err);
      return;
    }

    onPhotosChange(combined);
    onValidationErrorChange(null);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onPhotosChange(updated);
    onValidationErrorChange(
      updated.length > 0 ? validateActivityPhotos(updated) : null
    );
  };

  const isMaxReached = photos.length >= MAX_PHOTOS_PER_UPLOAD;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm space-y-4">
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-on-surface">Ảnh hoạt động</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              id="class-activity-photos-input"
              type="file"
              accept="image/jpeg,image/png"
              multiple
              disabled={disabled || isMaxReached}
              onChange={handleFileChange}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
            <Button
              type="button"
              variant="outline"
              icon={<Icons.Camera />}
              disabled={disabled || isMaxReached}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-11"
            >
              Chọn ảnh
            </Button>
            <span className="text-xs font-medium text-on-surface-variant">
              Đã chọn{" "}
              <strong className="text-on-surface">{photos.length}</strong>/
              {MAX_PHOTOS_PER_UPLOAD} ảnh
            </span>
          </div>

          <p className="text-xs text-on-surface-variant">
            Tối đa 5 ảnh một lần, mỗi ảnh ≤ 5 MB, JPEG/PNG
          </p>
        </div>
      </div>

      {validationError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-error/30 bg-error-container/40 p-3 text-xs font-semibold text-on-error-container"
        >
          <span className="shrink-0 text-error" aria-hidden="true">
            <Icons.Alert />
          </span>
          <span className="break-words">{validationError}</span>
        </p>
      )}

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {photos.map((file, idx) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}-${idx}`}
              className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200/90 bg-surface-container-low flex flex-col justify-between p-1.5"
            >
              <PhotoPreviewThumbnail file={file} />

              <div className="relative z-10 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  disabled={disabled}
                  className="min-h-11 min-w-11 -mr-2 -mt-2 flex items-center justify-center rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Bỏ ảnh thứ ${idx + 1}: ${file.name}`}
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-on-surface/60 text-on-primary hover:bg-on-surface/80 transition-colors">
                    <Icons.Close />
                  </span>
                </button>
              </div>

              <div className="relative z-10 mt-auto rounded-xl bg-on-surface/60 px-2 py-1 text-[11px] leading-tight text-on-primary">
                <p className="font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[10px] opacity-80">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
