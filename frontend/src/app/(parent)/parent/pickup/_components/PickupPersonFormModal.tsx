"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ApiErrorAlert, Button, Checkbox, Input, Modal } from "@/components";
import type { PickupPersonResponse } from "@/types/pickup";
import { useCreatePickupPerson, useUpdatePickupPerson } from "../_lib/parent-pickup-api";
import {
  CONSENT_CONFIRMATION_TEXT,
  FACE_PHOTO_ACCEPT,
  citizenIdNumberRules,
  consentConfirmedRules,
  facePhotoRules,
  phoneNumberRules,
  pickupFullNameRules,
  relationshipRules,
} from "../_lib/pickup-person-rules";

interface PickupPersonFormValues {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  citizenIdNumber: string;
  facePhoto: FileList | null;
  consentConfirmed: boolean;
}

interface PickupPersonFormModalProps {
  childId: string;
  priority: 1 | 2;
  // null: thêm mới; có giá trị: sửa người này
  person: PickupPersonResponse | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

// SCR-PAR-04 vùng 4. Page chỉ render khi mở, nên mỗi lần mở là một form mới và ô đồng ý luôn
// chưa đánh dấu (AC-PICKUP-15, D24)
export function PickupPersonFormModal({
  childId,
  priority,
  person,
  onClose,
  onSuccess,
}: PickupPersonFormModalProps) {
  const isEditing = person !== null;
  const priorityLabel = priority === 1 ? "người đón chính" : "người đón dự phòng";

  const createPickupPerson = useCreatePickupPerson();
  const updatePickupPerson = useUpdatePickupPerson();
  const mutation = isEditing ? updatePickupPerson : createPickupPerson;
  const isPending = mutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PickupPersonFormValues>({
    defaultValues: {
      fullName: person?.fullName ?? "",
      relationship: person?.relationship ?? "",
      phoneNumber: person?.phoneNumber ?? "",
      citizenIdNumber: person?.citizenIdNumber ?? "",
      facePhoto: null,
      consentConfirmed: false,
    },
    mode: "onTouched",
  });

  // Nút Lưu chỉ bấm được khi đã đánh dấu ô đồng ý (SCR-PAR-04 Hành vi 2)
  const consentConfirmed = useWatch({ control, name: "consentConfirmed" });

  // Ảnh xem trước: object URL của file vừa chọn, thu hồi khi chọn file khác hay khi đóng form
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [existingPhotoFailed, setExistingPhotoFailed] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const facePhotoField = register("facePhoto", facePhotoRules(!isEditing));
  const facePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const facePhotoInputId = useId();
  const facePhotoMessageId = `${facePhotoInputId}-message`;

  const handleFacePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void facePhotoField.onChange(event);

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const file = event.target.files?.[0];
    const nextUrl =
      file && FACE_PHOTO_ACCEPT.split(",").includes(file.type) ? URL.createObjectURL(file) : null;
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  };

  // Chưa chọn ảnh mới thì khi sửa hiện ảnh hiện tại (URL ký, D53)
  const displayedPhotoUrl =
    previewUrl ?? (person && !existingPhotoFailed ? person.facePhotoUrl : null);

  function onSubmit(values: PickupPersonFormValues) {
    const body = {
      fullName: values.fullName.trim(),
      relationship: values.relationship.trim(),
      phoneNumber: values.phoneNumber.trim(),
      citizenIdNumber: values.citizenIdNumber.trim(),
      consentConfirmed: values.consentConfirmed,
    };
    const facePhoto = values.facePhoto?.[0] ?? null;

    if (person) {
      updatePickupPerson.mutate(
        { childId, personId: person.id, body, facePhoto },
        { onSuccess: () => onSuccess(`Đã lưu thông tin ${priorityLabel}.`) }
      );
      return;
    }

    // facePhotoRules(true) đã chặn khi chưa chọn ảnh
    if (!facePhoto) return;
    createPickupPerson.mutate(
      { childId, body: { ...body, priority }, facePhoto },
      { onSuccess: () => onSuccess(`Đã đăng ký ${priorityLabel}.`) }
    );
  }

  const handleClose = () => {
    if (!isPending) onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="lg"
      title={isEditing ? `Sửa ${priorityLabel}` : `Thêm ${priorityLabel}`}
      description={
        isEditing
          ? "Không chọn ảnh mới thì giữ ảnh hiện tại. Mỗi lần lưu đều phải đánh dấu lại ô xác nhận đồng ý."
          : "Nhập đủ thông tin và ảnh khuôn mặt để giáo viên xác minh khi đón trẻ."
      }
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Lỗi API hiện trong form, phía trên các ô (frontend-conventions.md §4) */}
        <ApiErrorAlert error={mutation.error} />

        <fieldset disabled={isPending} className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Họ tên"
              required
              autoComplete="off"
              placeholder="Nguyễn Thị C"
              error={errors.fullName?.message}
              {...register("fullName", pickupFullNameRules)}
            />

            <Input
              label="Mối liên hệ với trẻ"
              required
              autoComplete="off"
              placeholder="Mẹ, Bố, Bà ngoại..."
              error={errors.relationship?.message}
              {...register("relationship", relationshipRules)}
            />

            <Input
              label="Số điện thoại"
              required
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0901234567"
              helperText="10 chữ số, bắt đầu bằng 0."
              error={errors.phoneNumber?.message}
              {...register("phoneNumber", phoneNumberRules)}
            />

            <Input
              label="Số CCCD"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder="079123456789"
              helperText="12 chữ số."
              error={errors.citizenIdNumber?.message}
              {...register("citizenIdNumber", citizenIdNumberRules)}
            />
          </div>

          {/* Ảnh khuôn mặt: đúng 1 ảnh JPEG/PNG ≤ 5 MB (D39 mục 5) */}
          <div className="space-y-1.5 text-left">
            <span className="block text-sm font-semibold text-on-surface">
              Ảnh khuôn mặt
              {!isEditing && <span className="ml-1 text-error">*</span>}
            </span>
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 shrink-0 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 flex items-center justify-center">
                {displayedPhotoUrl ? (
                  /* URL ký của Supabase Storage và blob: không đi qua next/image (khuôn PickupVerificationModal) */
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={displayedPhotoUrl}
                    alt="Ảnh khuôn mặt người đón"
                    className="w-full h-full object-cover"
                    onError={() => {
                      if (!previewUrl) setExistingPhotoFailed(true);
                    }}
                  />
                ) : (
                  <span className="text-xs text-outline text-center px-1">Chưa có ảnh</span>
                )}
              </div>

              <div className="min-w-0 space-y-1.5">
                <input
                  id={facePhotoInputId}
                  type="file"
                  accept={FACE_PHOTO_ACCEPT}
                  className="sr-only"
                  tabIndex={-1}
                  aria-invalid={errors.facePhoto ? "true" : "false"}
                  aria-describedby={facePhotoMessageId}
                  {...facePhotoField}
                  ref={(element) => {
                    facePhotoField.ref(element);
                    facePhotoInputRef.current = element;
                  }}
                  onChange={handleFacePhotoChange}
                />
                <Button
                  variant="outline"
                  className="min-h-11"
                  aria-describedby={facePhotoMessageId}
                  onClick={() => facePhotoInputRef.current?.click()}
                >
                  {displayedPhotoUrl ? "Chọn ảnh khác" : "Chọn ảnh"}
                </Button>
                <p
                  id={facePhotoMessageId}
                  className={`text-xs ${errors.facePhoto ? "text-error font-medium" : "text-on-surface-variant"}`}
                >
                  {errors.facePhoto?.message ??
                    (isEditing
                      ? "1 ảnh JPEG/PNG, tối đa 5 MB. Không chọn ảnh mới thì giữ ảnh hiện tại."
                      : "1 ảnh JPEG/PNG, tối đa 5 MB.")}
                </p>
              </div>
            </div>
          </div>

          {/* Ô xác nhận đồng ý, nguyên văn D24, chưa đánh dấu sẵn (AC-PICKUP-15) */}
          <Checkbox
            label={CONSENT_CONFIRMATION_TEXT}
            error={errors.consentConfirmed?.message}
            {...register("consentConfirmed", consentConfirmedRules)}
          />
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="flex-1">
            Hủy
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={!consentConfirmed}
            className="flex-1"
          >
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
