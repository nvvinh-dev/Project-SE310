"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button, Checkbox, Input, Modal } from "@/components";
import type { PickupPersonResponse } from "@/types/pickup";
import {
  CONSENT_CONFIRMATION_TEXT,
  MAX_FULL_NAME_LENGTH,
  MAX_RELATIONSHIP_LENGTH,
  PickupPersonFormErrors,
  PickupPersonFormValues,
  validatePickupPersonForm,
} from "../_lib/pickup-person-rules";

interface PickupPersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  priority: 1 | 2;
  person: PickupPersonResponse | null;
  otherPersonCitizenId?: string;
  isSubmitting: boolean;
  onSubmit: (values: PickupPersonFormValues) => Promise<void>;
}

interface InnerFormProps {
  priority: 1 | 2;
  person: PickupPersonResponse | null;
  otherPersonCitizenId?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: PickupPersonFormValues) => Promise<void>;
}

function PickupPersonForm({
  person,
  otherPersonCitizenId,
  isSubmitting,
  onClose,
  onSubmit,
}: InnerFormProps) {
  const isEditing = Boolean(person);

  const [fullName, setFullName] = useState(person?.fullName ?? "");
  const [relationship, setRelationship] = useState(person?.relationship ?? "");
  const [phoneNumber, setPhoneNumber] = useState(person?.phoneNumber ?? "");
  const [citizenIdNumber, setCitizenIdNumber] = useState(person?.citizenIdNumber ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(
    person?.facePhotoUrl ?? null
  );
  // Mỗi lần mở form cam kết đồng ý bắt buộc chưa đánh dấu sẵn (AC-PICKUP-15, D24)
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [errors, setErrors] = useState<PickupPersonFormErrors>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Giải phóng object URL xem trước khi unmount
  useEffect(() => {
    return () => {
      if (photoPreviewUrl && photoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setPhotoFile(file);
      if (photoPreviewUrl && photoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
      const newUrl = URL.createObjectURL(file);
      setPhotoPreviewUrl(newUrl);
      setErrors((prev) => ({ ...prev, photoFile: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formValues: PickupPersonFormValues = {
      fullName,
      relationship,
      phoneNumber,
      citizenIdNumber,
      photoFile,
      consentConfirmed,
    };

    const validationErrors = validatePickupPersonForm(
      formValues,
      isEditing,
      otherPersonCitizenId
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    await onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left min-w-0">
      {/* Họ tên & Mối liên hệ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <Input
          label="Họ tên người đón"
          required
          value={fullName}
          maxLength={MAX_FULL_NAME_LENGTH}
          placeholder="Ví dụ: Nguyễn Thị C"
          error={errors.fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
        />

        <Input
          label="Mối liên hệ với trẻ"
          required
          value={relationship}
          maxLength={MAX_RELATIONSHIP_LENGTH}
          placeholder="Ví dụ: Mẹ, Bố, Ông, Bà..."
          error={errors.relationship}
          onChange={(e) => {
            setRelationship(e.target.value);
            if (errors.relationship)
              setErrors((prev) => ({ ...prev, relationship: undefined }));
          }}
        />
      </div>

      {/* Số điện thoại & Số CCCD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <Input
          label="Số điện thoại"
          required
          type="tel"
          maxLength={10}
          value={phoneNumber}
          placeholder="0901234567 (10 chữ số)"
          error={errors.phoneNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setPhoneNumber(val);
            if (errors.phoneNumber)
              setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
          }}
        />

        <Input
          label="Số CCCD"
          required
          maxLength={12}
          value={citizenIdNumber}
          placeholder="079123456789 (12 chữ số)"
          error={errors.citizenIdNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setCitizenIdNumber(val);
            if (errors.citizenIdNumber)
              setErrors((prev) => ({ ...prev, citizenIdNumber: undefined }));
          }}
        />
      </div>

      {/* Ảnh khuôn mặt */}
      <div className="space-y-2 min-w-0">
        <label className="block text-sm font-semibold text-on-surface">
          Ảnh khuôn mặt
          {!isEditing && <span className="ml-1 text-error">*</span>}
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
          <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
            {photoPreviewUrl ? (
              <Image
                src={photoPreviewUrl}
                alt="Xem trước ảnh khuôn mặt"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, 96px"
              />
            ) : (
              <span className="text-xs text-on-surface-variant text-center px-1">
                Chưa chọn ảnh
              </span>
            )}
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              className="min-h-11"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreviewUrl ? "Chọn ảnh khác" : "Tải ảnh lên"}
            </Button>
            <p className="text-xs text-on-surface-variant wrap-anywhere">
              1 ảnh rõ nét định dạng JPEG hoặc PNG, dung lượng tối đa 5 MB.
            </p>
            {isEditing && (
              <p className="text-xs text-slate-500 italic wrap-anywhere">
                Không chọn ảnh mới nghĩa là giữ nguyên ảnh hiện tại của người đón.
              </p>
            )}
            {errors.photoFile && (
              <p className="text-xs text-error font-medium">{errors.photoFile}</p>
            )}
          </div>
        </div>
      </div>

      {/* Ô xác nhận cam kết đồng ý (D24, AC-PICKUP-15) */}
      <div className="pt-2 border-t border-slate-100 min-w-0">
        <Checkbox
          checked={consentConfirmed}
          onChange={(e) => {
            setConsentConfirmed(e.target.checked);
            if (errors.consentConfirmed)
              setErrors((prev) => ({ ...prev, consentConfirmed: undefined }));
          }}
          error={errors.consentConfirmed}
          label={
            <span className="text-xs sm:text-sm text-on-surface leading-relaxed wrap-anywhere block">
              {CONSENT_CONFIRMATION_TEXT}
            </span>
          }
        />
      </div>

      {/* Nút hành động */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="ghost"
          size="md"
          className="w-full sm:w-auto min-h-11"
          disabled={isSubmitting}
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full sm:w-auto min-h-11 font-semibold"
          isLoading={isSubmitting}
          disabled={!consentConfirmed || isSubmitting}
        >
          {isEditing ? "Lưu thay đổi" : "Lưu người đón"}
        </Button>
      </div>
    </form>
  );
}

export function PickupPersonFormModal({
  isOpen,
  onClose,
  priority,
  person,
  otherPersonCitizenId,
  isSubmitting,
  onSubmit,
}: PickupPersonFormModalProps) {
  const isEditing = Boolean(person);
  const priorityLabel = priority === 1 ? "người đón chính" : "người đón dự phòng";
  const title = isEditing
    ? `Sửa thông tin ${priorityLabel}`
    : `Đăng ký ${priorityLabel}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={
        isEditing
          ? "Cập nhật các thông tin xác minh của người đón. Mỗi lần cập nhật cần đánh dấu lại ô xác nhận đồng ý."
          : "Nhập đầy đủ thông tin và ảnh khuôn mặt để giáo viên xác minh khi đón con."
      }
      size="lg"
    >
      {isOpen && (
        <PickupPersonForm
          key={`${person?.id ?? "new"}-${priority}`}
          priority={priority}
          person={person}
          otherPersonCitizenId={otherPersonCitizenId}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}
