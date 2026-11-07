"use client";

import { useState } from "react";
import { Button, Icons, Modal } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import type { IncidentResponse } from "@/types/incident";

interface IncidentPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentResponse | null;
  onRefreshPhotos?: () => void;
}

// SCR-PAR-03: Hộp thoại xem ảnh chi tiết của sự cố (AC-INCIDENT-07, D53)
export function IncidentPhotosModal({
  isOpen,
  onClose,
  incident,
  onRefreshPhotos,
}: IncidentPhotosModalProps) {
  const [failedPhotoIds, setFailedPhotoIds] = useState<Record<string, boolean>>({});

  if (!incident) return null;

  const handleImageError = (photoId: string) => {
    setFailedPhotoIds((prev) => ({ ...prev, [photoId]: true }));
  };

  const handleRetry = (photoId: string) => {
    setFailedPhotoIds((prev) => {
      const next = { ...prev };
      delete next[photoId];
      return next;
    });
    onRefreshPhotos?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Ảnh sự cố"
      description={`Xảy ra lúc ${formatMeasurementDateTime(incident.occurredAtUtc)}`}
    >
      <div className="space-y-4">
        <p className="text-sm text-on-surface whitespace-pre-wrap break-words">
          {incident.description}
        </p>

        {incident.photos.length === 0 ? (
          <p className="text-sm text-outline italic">Sự cố không có ảnh đính kèm.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {incident.photos.map((photo, idx) => (
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
                      onClick={() => handleRetry(photo.id)}
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
