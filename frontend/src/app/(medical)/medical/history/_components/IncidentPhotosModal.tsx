"use client";

import { useRef, useState } from "react";
import { Button, ErrorAlert, Icons, LoadingSpinner, Modal } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatMeasurementDateTime } from "@/lib/datetime";
import { useIncident } from "../_lib/history-api";

interface IncidentPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string | null;
}

// SCR-MED-02 Vùng 4: Ảnh của sự cố (ui-screens.md Vùng 4 & Hành vi, AC-HEALTH-18, D53)
// Y tế mở sự cố để xem ảnh đã đính kèm. Ảnh có URL ký hạn 60 phút; ảnh tải lỗi thì gọi lại để nhận URL mới.
export function IncidentPhotosModal({
  isOpen,
  onClose,
  incidentId,
}: IncidentPhotosModalProps) {
  const { data: incident, isLoading, isError, error, refetch } = useIncident(incidentId);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const retriedPhotosRef = useRef<Set<string>>(new Set());

  // Khi ảnh tải lỗi (URL ký hết hạn - D53): tự động gọi lại API để nhận URL mới
  const handleImageError = (photoId: string) => {
    if (!retriedPhotosRef.current.has(photoId)) {
      retriedPhotosRef.current.add(photoId);
      void refetch();
    } else {
      setImageErrors((prev) => ({ ...prev, [photoId]: true }));
    }
  };

  const handleRetryPhoto = (photoId: string) => {
    setImageErrors((prev) => {
      const next = { ...prev };
      delete next[photoId];
      return next;
    });
    retriedPhotosRef.current.delete(photoId);
    void refetch();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Ảnh của sự cố"
      description={
        incident
          ? `Ghi nhận lúc ${formatMeasurementDateTime(incident.occurredAtUtc)}`
          : undefined
      }
    >
      <div className="space-y-4">
        {/* Đang tải thông tin sự cố và ảnh */}
        {isLoading && (
          <div className="py-8">
            <LoadingSpinner label="Đang tải ảnh sự cố..." />
          </div>
        )}

        {/* Lỗi tải sự cố */}
        {isError && (
          <ErrorAlert
            title="Không thể tải ảnh sự cố"
            message={toApiError(error).message}
            onRetry={refetch}
          />
        )}

        {/* Đã nạp dữ liệu */}
        {incident && (
          <>
            {/* Mô tả sự cố */}
            <div className="rounded-2xl border border-slate-200/90 bg-surface-container-low p-3.5 text-sm text-on-surface">
              <p className="font-semibold text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Mô tả sự cố
              </p>
              <p className="whitespace-pre-wrap break-words">{incident.description}</p>
            </div>

            {/* Danh sách ảnh */}
            {incident.photos.length === 0 ? (
              <p className="text-center text-sm text-outline py-6">
                Sự cố này chưa có ảnh đính kèm.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-on-surface-variant">
                  Ảnh đính kèm ({incident.photos.length} ảnh):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {incident.photos.map((photo, index) => {
                    const isPhotoBroken = Boolean(imageErrors[photo.id]);

                    return (
                      <div
                        key={photo.id}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 flex items-center justify-center shadow-xs"
                      >
                        {isPhotoBroken ? (
                          <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 text-outline">
                            <span className="p-2.5 rounded-full bg-slate-200 text-slate-500">
                              <Icons.Alert />
                            </span>
                            <span className="text-xs text-error font-medium">
                              Không thể tải ảnh
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetryPhoto(photo.id)}
                            >
                              Thử lại
                            </Button>
                          </div>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={photo.url}
                            alt={`Ảnh sự cố ${index + 1}`}
                            onError={() => handleImageError(photo.id)}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
