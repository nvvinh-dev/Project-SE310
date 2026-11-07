"use client";

import { useState } from "react";
import { Button, ErrorAlert, Icons, LoadingSpinner, Modal } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatMeasurementDateTime } from "@/lib/datetime";
import { useChildIncidentDetail } from "../_lib/parent-health-api";

interface IncidentPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  incidentId: string | null;
  occurredAtUtc?: string;
  description?: string;
}

// SCR-PAR-03: Hộp thoại xem ảnh chi tiết sự cố của con (AC-INCIDENT-07, D39 mục 10, D53)
export function IncidentPhotosModal({
  isOpen,
  onClose,
  childId,
  incidentId,
  occurredAtUtc,
  description,
}: IncidentPhotosModalProps) {
  const [failedPhotoIds, setFailedPhotoIds] = useState<Record<string, boolean>>({});
  const [retryingPhotoId, setRetryingPhotoId] = useState<string | null>(null);

  const detailQuery = useChildIncidentDetail(childId, incidentId);
  const detail = detailQuery.data;
  const photos = detail?.photos ?? [];

  if (!incidentId) return null;

  const handleImageError = (photoId: string) => {
    setFailedPhotoIds((prev) => ({ ...prev, [photoId]: true }));
  };

  // [BUG-01]: Tránh Race Condition, reset toàn bộ failedPhotoIds khi refetch thành công URL ký mới cho mọi ảnh
  const handleRetryPhoto = async (photoId: string) => {
    setRetryingPhotoId(photoId);
    try {
      const res = await detailQuery.refetch();
      if (res.isSuccess) {
        setFailedPhotoIds({});
      }
    } finally {
      setRetryingPhotoId(null);
    }
  };

  const errorMessage = detailQuery.error
    ? toApiError(detailQuery.error).message
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Ảnh sự cố"
      description={
        occurredAtUtc
          ? `Xảy ra lúc ${formatMeasurementDateTime(occurredAtUtc)}`
          : undefined
      }
    >
      <div className="space-y-4">
        {description && (
          <p className="text-sm text-on-surface whitespace-pre-wrap break-words">
            {description}
          </p>
        )}

        {/* Quy ước TanStack Query v5: isPending cho lần nạp đầu (frontend-conventions.md §3.3) */}
        {detailQuery.isPending ? (
          <div className="py-8">
            <LoadingSpinner label="Đang tải ảnh sự cố..." />
          </div>
        ) : detailQuery.isError ? (
          /* [BUG-03] & [UI]: Dùng ErrorAlert chuẩn đọc lỗi qua toApiError (ui-screens.md §4.2) */
          <ErrorAlert
            title="Không thể tải ảnh sự cố"
            message={errorMessage ?? ""}
            onRetry={() => void detailQuery.refetch()}
          />
        ) : photos.length === 0 ? (
          <p className="text-sm text-outline italic">Sự cố không có ảnh đính kèm.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[180px]"
              >
                {failedPhotoIds[photo.id] ? (
                  <div className="p-4 text-center space-y-2">
                    <p className="text-xs text-error font-medium">
                      Không tải được ảnh (có thể do URL hết hạn).
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={retryingPhotoId === photo.id}
                      icon={
                        retryingPhotoId === photo.id ? (
                          <Icons.Spinner />
                        ) : (
                          <Icons.Refresh />
                        )
                      }
                      onClick={() => void handleRetryPhoto(photo.id)}
                    >
                      {retryingPhotoId === photo.id ? "Đang tải lại..." : "Thử lại"}
                    </Button>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photo.url}
                    alt={`Ảnh sự cố ${idx + 1}`}
                    className="w-full h-full max-h-[300px] object-contain"
                    onError={() => handleImageError(photo.id)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
