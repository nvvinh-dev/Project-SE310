"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  ApiErrorAlert,
  Button,
  ErrorAlert,
  Icons,
  Input,
  LoadingSpinner,
  Modal,
  Select,
} from "@/components";
import type { HomeroomChildResponse } from "@/types/attendance";
import type { PickupPersonResponse } from "@/types/pickup";
import { usePickupPersons } from "../_lib/pickup-api";
import { phoneConfirmedPickupRules } from "../_lib/pickup-rules";
import { toApiError } from "@/lib/axios";

interface PhoneConfirmedFormValues {
  pickerFullName: string;
  pickupPersonId: string;
}

interface PickupVerificationModalProps {
  child: HomeroomChildResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onPickupDirect: (person: PickupPersonResponse) => Promise<void>;
  onPickupPhoneConfirmed: (
    pickerFullName: string,
    pickupPersonId: string
  ) => Promise<void>;
}

interface PickupPersonCardProps {
  person: PickupPersonResponse;
  roleLabel: string;
  isPrimary?: boolean;
  imageError: boolean;
  onImageError: (personId: string) => void;
  onSelect: () => void;
  isSubmitting: boolean;
  isLoadingAction: boolean;
}

/**
 * Thẻ hiển thị thông tin và ảnh khuôn mặt người đón (Người đón chính / Người dự phòng)
 */
function PickupPersonCard({
  person,
  roleLabel,
  isPrimary = false,
  imageError,
  onImageError,
  onSelect,
  isSubmitting,
  isLoadingAction,
}: PickupPersonCardProps) {
  return (
    <div
      className={`rounded-2xl ${
        isPrimary
          ? "border-2 border-primary/30 bg-surface-container-lowest"
          : "border border-slate-200 bg-surface-container-lowest"
      } p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4`}
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isPrimary ? "text-primary" : "text-outline"
            }`}
          >
            {roleLabel}
          </span>
        </div>

        {/* Ảnh khuôn mặt */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs flex items-center justify-center">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center text-outline">
              <span className="p-3 rounded-full bg-slate-200 text-slate-500">
                <Icons.User />
              </span>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={person.facePhotoUrl}
              alt={`Ảnh khuôn mặt ${person.fullName}`}
              onError={() => onImageError(person.id)}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Thông tin người đón */}
        <div className="space-y-1.5 text-center sm:text-left">
          <p className="text-base font-bold text-on-surface">
            {person.fullName}
            <span className="font-normal text-on-surface-variant ml-1.5 text-sm">
              · {person.relationship}
            </span>
          </p>

          <div className="text-xs space-y-1 text-on-surface-variant">
            <p className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="font-semibold text-outline">SĐT:</span>
              <span className="font-medium text-on-surface">
                {person.phoneNumber}
              </span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="font-semibold text-outline">CCCD:</span>
              <span className="font-mono text-on-surface">
                {person.citizenIdNumber}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Nút giao cho người này */}
      <div className="pt-2">
        <Button
          variant={isPrimary ? "primary" : "outline"}
          onClick={onSelect}
          isLoading={isLoadingAction}
          disabled={isSubmitting}
          aria-label={`Giao trẻ cho ${person.fullName} (${roleLabel})`}
          className="w-full justify-center min-h-11 text-sm font-semibold"
        >
          Giao cho người này
        </Button>
      </div>
    </div>
  );
}

export function PickupVerificationModal({
  child,
  isOpen,
  onClose,
  onPickupDirect,
  onPickupPhoneConfirmed,
}: PickupVerificationModalProps) {
  const childId = child?.id ?? null;
  const {
    data: pickupPersonsData,
    isLoading,
    isError,
    error,
    refetch,
  } = usePickupPersons(isOpen ? childId : null);

  const pickupPersons = pickupPersonsData ?? [];
  const hasPickupPersonsData = pickupPersonsData !== undefined;

  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<"primary" | "backup" | "phone" | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [directError, setDirectError] = useState<unknown | null>(null);
  const [phoneFormError, setPhoneFormError] = useState<unknown | null>(null);
  const retriedPersonsRef = useRef<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PhoneConfirmedFormValues>({
    defaultValues: {
      pickerFullName: "",
      pickupPersonId: "",
    },
  });

  if (!child) return null;

  const isSubmitting = submittingAction !== null;

  // Lấy người đón chính (priority 1) và người dự phòng (priority 2)
  const primaryPerson = pickupPersons.find((p) => p.priority === 1);
  const backupPerson = pickupPersons.find((p) => p.priority === 2);

  // Xử lý khi ảnh tải lỗi (URL ký hết hạn sau 60 phút - ui-screens.md SCR-TCH-04 Hành vi 8, D53)
  // Tự động gọi lại GET để nhận URL mới; nếu đã thử tự động một lần mà vẫn lỗi thì hiện fallback
  const handleImageError = (personId: string) => {
    if (!retriedPersonsRef.current.has(personId)) {
      retriedPersonsRef.current.add(personId);
      void refetch();
    } else {
      setImageErrors((prev) => ({ ...prev, [personId]: true }));
    }
  };

  // Giao cho người đón chính hoặc người dự phòng đã đăng ký
  const handleDirectClick = async (
    person: PickupPersonResponse,
    action: "primary" | "backup"
  ) => {
    setDirectError(null);
    setSubmittingAction(action);
    try {
      await onPickupDirect(person);
      onClose();
    } catch (err) {
      // Giữ hộp thoại và hiện lỗi bên trong bằng ApiErrorAlert (ui-screens §4.3, frontend-conventions §4)
      setDirectError(err);
    } finally {
      setSubmittingAction(null);
    }
  };

  // Submit form người khác đến đón (đã gọi xác nhận)
  const onPhoneSubmit = async (values: PhoneConfirmedFormValues) => {
    setPhoneFormError(null);
    setSubmittingAction("phone");
    try {
      await onPickupPhoneConfirmed(
        values.pickerFullName.trim(),
        values.pickupPersonId
      );
      onClose();
    } catch (err) {
      // Giữ modal và hiển thị lỗi qua ApiErrorAlert trên form để giáo viên chỉnh sửa (ui-screens.md §4.3)
      setPhoneFormError(err);
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      showCloseButton={!isSubmitting}
      title={`Xác minh người đón — ${child.fullName}`}
      description="Đối chiếu thông tin và ảnh khuôn mặt người đến đón với người phụ huynh đã đăng ký."
    >
      <div className="space-y-5">
        {/* Trạng thái tải lần đầu khi chưa có dữ liệu */}
        {isLoading && !hasPickupPersonsData && (
          <div className="py-8">
            <LoadingSpinner label="Đang tải thông tin người đón đã đăng ký..." />
          </div>
        )}

        {/* Lỗi tải lần đầu khi chưa có dữ liệu (thay thế toàn bộ nội dung - ui-screens §4.2) */}
        {isError && !hasPickupPersonsData && (
          <ErrorAlert
            title="Không tải được thông tin người đón"
            message={toApiError(error).message}
            onRetry={refetch}
          />
        )}

        {/* Đã có dữ liệu (kể cả khi lần làm mới ngầm bị lỗi - giữ nguyên dữ liệu cũ, chỉ hiện ErrorAlert phía trên) */}
        {hasPickupPersonsData && (
          <>
            {isError && (
              <ErrorAlert
                title="Không tải lại được thông tin người đón"
                message={toApiError(error).message}
                onRetry={refetch}
              />
            )}

            {/* Lỗi khi bấm Giao cho người này trực tiếp (ui-screens §4.3, frontend-conventions §4) */}
            {directError ? (
              <ApiErrorAlert error={directError} />
            ) : null}

            {/* Trường hợp trẻ chưa có người đón chính (AC-PICKUP-14, SCR-TCH-04 Hành vi 6) */}
            {!primaryPerson ? (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-800">
                  <Icons.Alert />
                </div>
                <h4 className="text-base font-bold text-amber-900">
                  Phụ huynh chưa đăng ký người đón chính
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 max-w-md mx-auto">
                  Trẻ chưa có người đón chính nên chưa thể ghi nhận đón về.
                  Vui lòng liên hệ phụ huynh để đăng ký người đón cho trẻ.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Đóng
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Khung người đón chính và người dự phòng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Người đón chính */}
                  <PickupPersonCard
                    person={primaryPerson}
                    roleLabel="Người đón chính"
                    isPrimary
                    imageError={Boolean(imageErrors[primaryPerson.id])}
                    onImageError={handleImageError}
                    onSelect={() => handleDirectClick(primaryPerson, "primary")}
                    isSubmitting={isSubmitting}
                    isLoadingAction={submittingAction === "primary"}
                  />

                  {/* Người dự phòng */}
                  {backupPerson ? (
                    <PickupPersonCard
                      person={backupPerson}
                      roleLabel="Người dự phòng"
                      imageError={Boolean(imageErrors[backupPerson.id])}
                      onImageError={handleImageError}
                      onSelect={() => handleDirectClick(backupPerson, "backup")}
                      isSubmitting={isSubmitting}
                      isLoadingAction={submittingAction === "backup"}
                    />
                  ) : (
                    /* Chưa đăng ký người đón dự phòng */
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 flex flex-col items-center justify-center text-center space-y-2">
                      <div className="p-3 rounded-full bg-slate-100 text-outline">
                        <Icons.User />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-outline">
                        Người dự phòng
                      </span>
                      <p className="text-sm font-semibold text-outline">
                        Chưa đăng ký người đón dự phòng
                      </p>
                      <p className="text-xs text-outline/80 max-w-xs">
                        Phụ huynh chưa đăng ký người đón dự phòng.
                      </p>
                    </div>
                  )}
                </div>

                {/* Người khác đến đón — đã gọi xác nhận */}
                <div className="pt-2">
                  {!showPhoneForm ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPhoneForm(true);
                        setPhoneFormError(null);
                        setDirectError(null);
                      }}
                      disabled={isSubmitting}
                      className="w-full justify-center min-h-11 text-sm font-semibold"
                    >
                      Người khác đến đón — đã gọi xác nhận
                    </Button>
                  ) : (
                    /* Form xác nhận qua điện thoại */
                    <form
                      onSubmit={handleSubmit(onPhoneSubmit)}
                      noValidate
                      className="rounded-2xl border border-slate-200 bg-surface-container-low/40 p-4 sm:p-5 space-y-4"
                    >
                      <div className="border-b border-slate-200/80 pb-2.5">
                        <h4 className="font-bold text-sm text-on-surface">
                          Xác nhận qua điện thoại
                        </h4>
                      </div>

                      {/* Khung lỗi API phía trên form (ui-screens.md §4.2 & §4.3) */}
                      {phoneFormError ? (
                        <ApiErrorAlert error={phoneFormError} />
                      ) : null}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Ô nhập họ tên người đến đón (autoFocus theo design-system §7) */}
                        <Input
                          label="Họ tên người đến đón"
                          required
                          autoFocus
                          placeholder="Nhập họ tên người đến đón..."
                          disabled={isSubmitting}
                          error={errors.pickerFullName?.message}
                          helperText="Tối đa 100 ký tự"
                          {...register(
                            "pickerFullName",
                            phoneConfirmedPickupRules.pickerFullName
                          )}
                        />

                        {/* Ô chọn người đã xác nhận */}
                        <Select
                          label="Người đã đồng ý qua điện thoại"
                          required
                          placeholder="-- Chọn người đã xác nhận --"
                          disabled={isSubmitting}
                          error={errors.pickupPersonId?.message}
                          options={[
                            {
                              value: primaryPerson.id,
                              label: `${primaryPerson.fullName} (${primaryPerson.relationship} - Người đón chính)`,
                            },
                            ...(backupPerson
                              ? [
                                  {
                                    value: backupPerson.id,
                                    label: `${backupPerson.fullName} (${backupPerson.relationship} - Người dự phòng)`,
                                  },
                                ]
                              : []),
                          ]}
                          {...register(
                            "pickupPersonId",
                            phoneConfirmedPickupRules.pickupPersonId
                          )}
                        />
                      </div>

                      {/* Nút hành động của form xác nhận */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => {
                            setShowPhoneForm(false);
                            setPhoneFormError(null);
                            reset();
                          }}
                          disabled={isSubmitting}
                          className="min-h-11"
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          isLoading={submittingAction === "phone"}
                          disabled={isSubmitting}
                          className="min-w-36 min-h-11"
                        >
                          Xác nhận và giao trẻ
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
