"use client";

import React, { useState } from "react";
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
  isSubmitting: boolean;
}

export function PickupVerificationModal({
  child,
  isOpen,
  onClose,
  onPickupDirect,
  onPickupPhoneConfirmed,
  isSubmitting,
}: PickupVerificationModalProps) {
  const childId = child?.id ?? null;
  const {
    data: pickupPersons = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePickupPersons(isOpen ? childId : null);

  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [modalError, setModalError] = useState<unknown | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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

  // Lấy người đón chính (priority 1) và người dự phòng (priority 2)
  const primaryPerson = pickupPersons.find((p) => p.priority === 1);
  const backupPerson = pickupPersons.find((p) => p.priority === 2);

  // Xử lý khi ảnh tải lỗi (URL ký hết hạn sau 60 phút - ui-screens.md SCR-TCH-04 Hành vi 8, D53)
  const handleImageError = (personId: string) => {
    setImageErrors((prev) => ({ ...prev, [personId]: true }));
  };

  const handleRetryImage = async (personId: string) => {
    setImageErrors((prev) => ({ ...prev, [personId]: false }));
    await refetch();
  };

  // Giao cho người đón chính hoặc người dự phòng đã đăng ký
  const handleDirectClick = async (person: PickupPersonResponse) => {
    setModalError(null);
    try {
      await onPickupDirect(person);
      onClose();
    } catch (err) {
      const apiErr = toApiError(err);
      // 409 hoặc 404: đóng modal để trang chính hiện thông báo và cập nhật dữ liệu mới nhất
      if (apiErr.status === 409 || apiErr.status === 404) {
        onClose();
      } else {
        setModalError(err);
      }
    }
  };

  // Submit form người khác đến đón (đã gọi xác nhận)
  const onPhoneSubmit = async (values: PhoneConfirmedFormValues) => {
    setModalError(null);
    try {
      await onPickupPhoneConfirmed(
        values.pickerFullName.trim(),
        values.pickupPersonId
      );
      onClose();
    } catch (err) {
      const apiErr = toApiError(err);
      // 409 hoặc 404: đóng modal để trang chính hiện thông báo và cập nhật dữ liệu mới nhất
      if (apiErr.status === 409 || apiErr.status === 404) {
        onClose();
      } else {
        setModalError(err);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={`Xác minh người đón — ${child.fullName}`}
      description="Đối chiếu thông tin và ảnh khuôn mặt người đến đón với người phụ huynh đã đăng ký."
      className="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Thông báo lỗi phía trong modal khi validate hoặc lỗi khác */}
        {modalError != null && <ApiErrorAlert error={modalError} />}

        {/* Trạng thái tải thông tin người đón */}
        {isLoading && (
          <div className="py-8">
            <LoadingSpinner label="Đang tải thông tin người đón đã đăng ký..." />
          </div>
        )}

        {/* Lỗi khi tải thông tin người đón */}
        {isError && (
          <ErrorAlert
            title="Không tải được thông tin người đón"
            message={toApiError(error).message}
            onRetry={refetch}
          />
        )}

        {/* Dữ liệu người đón đã nạp xong */}
        {!isLoading && !isError && (
          <>
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
                {/* Khung người đón chính [3] và người dự phòng [4] */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* [3] Người đón chính */}
                  <div className="rounded-2xl border-2 border-primary/30 bg-surface-container-lowest p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          [3] Người đón chính
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed/40 text-primary">
                          Ưu tiên 1
                        </span>
                      </div>

                      {/* Ảnh khuôn mặt */}
                      <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs flex items-center justify-center">
                        {imageErrors[primaryPerson.id] ? (
                          <button
                            type="button"
                            onClick={() => void handleRetryImage(primaryPerson.id)}
                            title="Bấm để tải lại ảnh"
                            className="w-full h-full flex flex-col items-center justify-center text-outline hover:text-on-surface hover:bg-slate-200/50 transition-colors p-2 cursor-pointer"
                          >
                            <span className="p-2 rounded-full bg-slate-200 text-slate-500">
                              <Icons.User />
                            </span>
                            <span className="text-[11px] mt-1 inline-flex items-center gap-1 font-medium">
                              <Icons.Refresh /> Tải lại ảnh
                            </span>
                          </button>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={primaryPerson.facePhotoUrl}
                            alt={`Ảnh khuôn mặt ${primaryPerson.fullName}`}
                            onError={() => handleImageError(primaryPerson.id)}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Thông tin người đón chính */}
                      <div className="space-y-1.5 text-center sm:text-left">
                        <p className="text-base font-bold text-on-surface">
                          {primaryPerson.fullName}
                          <span className="font-normal text-on-surface-variant ml-1.5 text-sm">
                            · {primaryPerson.relationship}
                          </span>
                        </p>

                        <div className="text-xs space-y-1 text-on-surface-variant">
                          <p className="flex items-center justify-center sm:justify-start gap-1.5">
                            <span className="font-semibold text-outline">SĐT:</span>
                            <a
                              href={`tel:${primaryPerson.phoneNumber}`}
                              className="font-medium text-secondary hover:underline"
                            >
                              {primaryPerson.phoneNumber}
                            </a>
                          </p>
                          <p className="flex items-center justify-center sm:justify-start gap-1.5">
                            <span className="font-semibold text-outline">CCCD:</span>
                            <span className="font-mono text-on-surface">
                              {primaryPerson.citizenIdNumber}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nút giao cho người này */}
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        onClick={() => handleDirectClick(primaryPerson)}
                        disabled={isSubmitting}
                        className="w-full justify-center min-h-11 text-sm font-semibold"
                      >
                        Giao cho người này
                      </Button>
                    </div>
                  </div>

                  {/* [4] Người dự phòng */}
                  {backupPerson ? (
                    <div className="rounded-2xl border border-slate-200 bg-surface-container-lowest p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-outline">
                            [4] Người dự phòng
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-outline">
                            Ưu tiên 2
                          </span>
                        </div>

                        {/* Ảnh khuôn mặt */}
                        <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs flex items-center justify-center">
                          {imageErrors[backupPerson.id] ? (
                            <button
                              type="button"
                              onClick={() => void handleRetryImage(backupPerson.id)}
                              title="Bấm để tải lại ảnh"
                              className="w-full h-full flex flex-col items-center justify-center text-outline hover:text-on-surface hover:bg-slate-200/50 transition-colors p-2 cursor-pointer"
                            >
                              <span className="p-2 rounded-full bg-slate-200 text-slate-500">
                                <Icons.User />
                              </span>
                              <span className="text-[11px] mt-1 inline-flex items-center gap-1 font-medium">
                                <Icons.Refresh /> Tải lại ảnh
                              </span>
                            </button>
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={backupPerson.facePhotoUrl}
                              alt={`Ảnh khuôn mặt ${backupPerson.fullName}`}
                              onError={() => handleImageError(backupPerson.id)}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Thông tin người dự phòng */}
                        <div className="space-y-1.5 text-center sm:text-left">
                          <p className="text-base font-bold text-on-surface">
                            {backupPerson.fullName}
                            <span className="font-normal text-on-surface-variant ml-1.5 text-sm">
                              · {backupPerson.relationship}
                            </span>
                          </p>

                          <div className="text-xs space-y-1 text-on-surface-variant">
                            <p className="flex items-center justify-center sm:justify-start gap-1.5">
                              <span className="font-semibold text-outline">SĐT:</span>
                              <a
                                href={`tel:${backupPerson.phoneNumber}`}
                                className="font-medium text-secondary hover:underline"
                              >
                                {backupPerson.phoneNumber}
                              </a>
                            </p>
                            <p className="flex items-center justify-center sm:justify-start gap-1.5">
                              <span className="font-semibold text-outline">CCCD:</span>
                              <span className="font-mono text-on-surface">
                                {backupPerson.citizenIdNumber}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Nút giao cho người này */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          onClick={() => handleDirectClick(backupPerson)}
                          disabled={isSubmitting}
                          className="w-full justify-center min-h-11 text-sm font-semibold"
                        >
                          Giao cho người này
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Chưa đăng ký người đón dự phòng */
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 flex flex-col items-center justify-center text-center space-y-2">
                      <div className="p-3 rounded-full bg-slate-100 text-outline">
                        <Icons.User />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-outline">
                        [4] Người dự phòng
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

                {/* [5] Người khác đến đón — đã gọi xác nhận */}
                <div className="pt-2">
                  {!showPhoneForm ? (
                    <div className="p-4 rounded-2xl border border-amber-300/80 bg-amber-50/50 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-amber-950">
                            Người đến đón không khớp ảnh hay thông tin trên?
                          </p>
                          <p className="text-xs text-amber-900 mt-0.5">
                            Giáo viên tự gọi cho người đón chính hoặc người dự phòng bằng số điện thoại trên để xác minh.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowPhoneForm(true)}
                          disabled={isSubmitting}
                          className="border-amber-400 bg-white hover:bg-amber-100/70 text-amber-950 font-semibold shrink-0"
                        >
                          Người khác đến đón — đã gọi xác nhận
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Form xác nhận qua điện thoại */
                    <form
                      onSubmit={handleSubmit(onPhoneSubmit)}
                      className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4 sm:p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-800 font-bold text-xs uppercase tracking-wider">
                            [5] Xác nhận qua điện thoại
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPhoneForm(false);
                            reset();
                          }}
                          className="text-xs text-outline hover:text-on-surface underline cursor-pointer"
                        >
                          Thu gọn
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Ô nhập họ tên người đến đón */}
                        <Input
                          label="Họ tên người đến đón"
                          required
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
                            reset();
                          }}
                          disabled={isSubmitting}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSubmitting}
                          className="min-w-32"
                        >
                          {isSubmitting ? "Đang ghi..." : "Xác nhận và giao trẻ"}
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
