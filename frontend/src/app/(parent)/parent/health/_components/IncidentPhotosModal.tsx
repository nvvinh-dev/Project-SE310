"use client";

import { useState } from "react";
import { Button, Icons, LoadingSpinner, Modal } from "@/components";
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

  const detailQuery = useChildIncidentDetail(childId, incidentId);
  const detail = detailQuery.data;
  const photos = detail?.photos ?? [];

  if (!incidentId) return null;

  const handleImageError = (photoId: string) => {
    setFailedPhotoIds((prev) => ({ ...prev, [photoId]: true }));
  };

  const handleRetryPhoto = (photoId: string) => {
    setFailedPhotoIds((prev) => {
      const next = { ...prev };
      delete next[photoId];
      return next;
    });
    void detailQuery.refetch();
  };

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

        {detailQuery.isLoading ? (
          <div className="py-8">
            <LoadingSpinner label="Đang tải ảnh sự cố..." />
          </div>
        ) : detailQuery.isError ? (
          <div className="p-4 text-center space-y-2 bg-error-container/30 rounded-2xl">
            <p className="text-xs text-error font-medium">
              Không thể tải chi tiết ảnh sự cố.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Icons.Refresh />}
              onClick={() => void detailQuery.refetch()}
            >
              Thử lại
            </Button>
          </div>
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
                      icon={<Icons.Refresh />}
                      onClick={() => handleRetryPhoto(photo.id)}
                    >
                      Thử lại
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
