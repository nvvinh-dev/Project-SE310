"use client";

import { useEffect, useRef } from "react";
import { Button, Icons, Modal } from "@/components";
import { formatVietnamDateTime } from "@/lib/datetime";
import type { ActivityPhotoResponse } from "@/types/media";

interface ActivityPhotoViewerModalProps {
  photo: ActivityPhotoResponse | null;
  isPhotoFailed: boolean;
  isReloadingUrls: boolean;
  onPhotoError: (url: string) => void;
  onReloadUrls: () => void;
  onClose: () => void;
}

// SCR-PAR-05: xem lớn một ảnh hoạt động. Modal dùng chung đóng bằng Esc nhưng không tự đưa focus vào hộp thoại,
// nên mở ảnh thì focus vào nút "Đóng" để người dùng bàn phím ở trong hộp thoại; trang tự trả focus về ảnh khi đóng
export function ActivityPhotoViewerModal({
  photo,
  isPhotoFailed,
  isReloadingUrls,
  onPhotoError,
  onReloadUrls,
  onClose,
}: ActivityPhotoViewerModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const photoId = photo?.id;

  useEffect(() => {
    if (photoId) closeButtonRef.current?.focus();
  }, [photoId]);

  if (!photo) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="xl"
      title="Ảnh hoạt động"
      description={`Chia sẻ lúc ${formatVietnamDateTime(photo.uploadedAtUtc)}`}
    >
      <div className="space-y-4">
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[200px]">
          {isPhotoFailed ? (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs text-error font-medium wrap-anywhere">
                Không tải được ảnh (ảnh có thể đã hết hạn hiển thị).
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                isLoading={isReloadingUrls}
                icon={<Icons.Refresh />}
                onClick={onReloadUrls}
              >
                {isReloadingUrls ? "Đang tải lại..." : "Thử lại"}
              </Button>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={photo.url}
              src={photo.url}
              alt={`Ảnh hoạt động chia sẻ lúc ${formatVietnamDateTime(photo.uploadedAtUtc)}`}
              className="w-full max-h-[70vh] object-contain"
              onError={() => onPhotoError(photo.url)}
            />
          )}
        </div>

        <div className="flex justify-end">
          <Button
            ref={closeButtonRef}
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
