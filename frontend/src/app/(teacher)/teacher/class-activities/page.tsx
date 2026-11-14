"use client";

import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  ApiErrorAlert,
  Button,
  EmptyState,
  ErrorAlert,
  Icons,
  LoadingSpinner,
  NoticeBanner,
} from "@/components";
import { toApiError } from "@/lib/axios";
import {
  useHomeroomClasses,
  useShareActivityPhotos,
} from "./_lib/class-activities-api";
import {
  validateActivityPhotos,
  type ShareActivityPhotosFormValues,
} from "./_lib/class-activities-rules";
import { ClassSelector } from "./_components/ClassSelector";
import { PhotoUploader } from "./_components/PhotoUploader";

// SCR-TCH-06: giáo viên chia sẻ ảnh hoạt động cho lớp mình phụ trách (FR-MEDIA-01)
export default function ClassActivitiesPage() {
  // Form dùng React Hook Form (D12, ui-screens §4.3); ảnh giữ ngoài form như IncidentForm
  const { control, handleSubmit } = useForm<ShareActivityPhotosFormValues>({
    defaultValues: { classId: "" },
    mode: "onTouched",
  });
  const watchedClassId = useWatch({ control, name: "classId" });

  const [photos, setPhotos] = useState<File[]>([]);
  // Lỗi của lần chọn ảnh bị từ chối; ảnh đang có vẫn hợp lệ nên lỗi này không khóa nút Chia sẻ
  const [photoValidationError, setPhotoValidationError] = useState<
    string | null
  >(null);

  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [shareError, setShareError] = useState<unknown>(null);

  // Dải thành công tự ẩn sau 6 giây; dải lỗi không tự ẩn (ui-screens §4.2)
  useEffect(() => {
    if (!successNotice) return;
    const timer = setTimeout(() => setSuccessNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [successNotice]);

  const classesQuery = useHomeroomClasses();
  const sharePhotosMutation = useShareActivityPhotos();

  const classes = classesQuery.data;

  // Một lớp thì chọn sẵn. Nhiều lớp thì để giáo viên tự chọn, tránh chia sẻ nhầm lớp. Lớp đã chọn
  // không còn trong danh sách (vừa bị gỡ phân công) thì coi như chưa chọn
  const selectedClassId =
    classes?.length === 1
      ? classes[0].id
      : classes?.some((c) => c.id === watchedClassId)
        ? watchedClassId
        : "";

  // Lỗi thay cả trang chỉ khi chưa có dữ liệu; đã có thì giữ dữ liệu cũ và cảnh báo (conventions §3.3)
  const showFullError = classesQuery.isError && classes === undefined;
  const showRefetchError = classesQuery.isError && classes !== undefined;

  // Lớp đã qua classIdRules (nhiều lớp) hoặc được chọn sẵn (một lớp)
  const handleSharePhotos = async () => {
    if (!selectedClassId) return;

    const validationErr = validateActivityPhotos(photos);
    if (validationErr) {
      setPhotoValidationError(validationErr);
      return;
    }

    setShareError(null);
    setSuccessNotice(null);

    try {
      const uploaded = await sharePhotosMutation.mutateAsync({
        classId: selectedClassId,
        files: photos,
      });
      const className =
        classes?.find((c) => c.id === selectedClassId)?.name ?? "lớp";

      // Thành công: xóa ảnh đã chọn, giữ lớp đã chọn
      setPhotos([]);
      setPhotoValidationError(null);
      setSuccessNotice(
        `Đã chia sẻ ${uploaded.length} ảnh hoạt động cho ${className}. Phụ huynh của các trẻ trong lớp sẽ nhận được thông báo.`
      );
    } catch (err) {
      // Thất bại: giữ ảnh và lớp để gửi lại; danh sách lớp được làm mới trong onSettled
      setShareError(err);
    }
  };

  // Tắt nút theo ảnh đang chọn (ui-screens SCR-TCH-06 Hành vi 1), không theo lỗi của lần chọn bị từ chối
  const isSubmitDisabled =
    !selectedClassId ||
    validateActivityPhotos(photos) !== null ||
    sharePhotosMutation.isPending;

  return (
    <div className="py-8 space-y-4 sm:space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
          Chia sẻ ảnh hoạt động cho lớp
        </h1>
        <p className="text-sm text-on-surface-variant">
          Ảnh được gửi tới phụ huynh của các trẻ trong lớp bạn chọn.
        </p>
      </div>

      {successNotice && (
        <NoticeBanner
          role="status"
          message={successNotice}
          onClose={() => setSuccessNotice(null)}
        />
      )}

      {Boolean(shareError) && (
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <ApiErrorAlert error={shareError} />
          </div>
          <button
            type="button"
            onClick={() => setShareError(null)}
            aria-label="Đóng thông báo"
            className="shrink-0 min-h-11 min-w-11 flex items-center justify-center rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icons.Close />
          </button>
        </div>
      )}

      {showRefetchError && (
        <ErrorAlert
          title="Không tải lại được danh sách lớp"
          message={toApiError(classesQuery.error).message}
          onRetry={() => classesQuery.refetch()}
        />
      )}

      {classesQuery.isPending ? (
        <LoadingSpinner label="Đang tải danh sách lớp..." />
      ) : showFullError ? (
        <ErrorAlert
          title="Không tải được danh sách lớp"
          message={toApiError(classesQuery.error).message}
          onRetry={() => classesQuery.refetch()}
        />
      ) : !classes || classes.length === 0 ? (
        <EmptyState
          title="Chưa có lớp phụ trách"
          message="Chưa có trẻ nào trong lớp bạn phụ trách. Nếu bạn chưa được phân công lớp, liên hệ Ban giám hiệu."
          icon={<Icons.School />}
          actionText="Làm mới"
          onAction={() => classesQuery.refetch()}
        />
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit(handleSharePhotos)}
          className="space-y-4 sm:space-y-6"
        >
          <ClassSelector
            classes={classes}
            control={control}
            disabled={sharePhotosMutation.isPending}
          />

          <PhotoUploader
            photos={photos}
            onPhotosChange={setPhotos}
            validationError={photoValidationError}
            onValidationErrorChange={setPhotoValidationError}
            disabled={sharePhotosMutation.isPending}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              icon={<Icons.Camera />}
              disabled={isSubmitDisabled}
              isLoading={sharePhotosMutation.isPending}
              className="min-h-11 w-full sm:w-auto"
            >
              Chia sẻ
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
