"use client";

import React, { useEffect, useState } from "react";
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
import { validateActivityPhotos } from "./_lib/class-activities-rules";
import { ClassSelector } from "./_components/ClassSelector";
import { PhotoUploader } from "./_components/PhotoUploader";

// SCR-TCH-06: giáo viên chia sẻ ảnh hoạt động cho lớp mình phụ trách (FR-MEDIA-01)
export default function ClassActivitiesPage() {
  const [userSelectedClassId, setUserSelectedClassId] = useState("");
  const [classSelectError, setClassSelectError] = useState<string>();

  const [photos, setPhotos] = useState<File[]>([]);
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
      : classes?.some((c) => c.id === userSelectedClassId)
        ? userSelectedClassId
        : "";

  // Lỗi thay cả trang chỉ khi chưa có dữ liệu; đã có thì giữ dữ liệu cũ và cảnh báo (conventions §3.3)
  const showFullError = classesQuery.isError && classes === undefined;
  const showRefetchError = classesQuery.isError && classes !== undefined;

  const handleSharePhotos = async () => {
    if (!selectedClassId) {
      setClassSelectError("Vui lòng chọn lớp.");
      return;
    }

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

  const isSubmitDisabled =
    !selectedClassId ||
    photos.length === 0 ||
    Boolean(photoValidationError) ||
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
          <ApiErrorAlert error={shareError} className="flex-1" />
          <button
            type="button"
            onClick={() => setShareError(null)}
            aria-label="Đóng thông báo"
            className="shrink-0 mt-2 p-1 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
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
          message="Bạn chưa được phân công lớp nào. Liên hệ Ban giám hiệu."
          icon={<Icons.School />}
          actionText="Làm mới"
          onAction={() => classesQuery.refetch()}
        />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <ClassSelector
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={(id) => {
              setUserSelectedClassId(id);
              setClassSelectError(undefined);
            }}
            disabled={sharePhotosMutation.isPending}
            error={classSelectError}
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
              type="button"
              variant="primary"
              icon={<Icons.Camera />}
              disabled={isSubmitDisabled}
              isLoading={sharePhotosMutation.isPending}
              onClick={handleSharePhotos}
              className="min-h-11 w-full sm:w-auto"
            >
              Chia sẻ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
