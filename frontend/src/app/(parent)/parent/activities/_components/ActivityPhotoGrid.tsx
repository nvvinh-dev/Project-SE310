"use client";

import { useMemo } from "react";
import { Icons } from "@/components";
import { formatVietnamDateFromUtc } from "@/lib/datetime";
import type { ActivityPhotoResponse } from "@/types/media";

interface ActivityPhotoGridProps {
  photos: ActivityPhotoResponse[];
  failedPhotoUrls: Record<string, boolean>;
  onPhotoError: (url: string) => void;
  onOpenPhoto: (photoId: string) => void;
}

interface PhotoDateGroup {
  dateLabel: string;
  photos: ActivityPhotoResponse[];
}

// Gom ảnh theo ngày của uploadedAtUtc theo giờ Việt Nam. Backend trả mới nhất trước nên giữ nguyên thứ tự,
// ngày nào gặp trước thì đứng trước (ui-screens.md SCR-PAR-05 Vùng 2)
function groupPhotosByDate(photos: ActivityPhotoResponse[]): PhotoDateGroup[] {
  const groups: PhotoDateGroup[] = [];
  for (const photo of photos) {
    const dateLabel = formatVietnamDateFromUtc(photo.uploadedAtUtc);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dateLabel === dateLabel) {
      lastGroup.photos.push(photo);
    } else {
      groups.push({ dateLabel, photos: [photo] });
    }
  }
  return groups;
}

// SCR-PAR-05 Vùng [2]: ảnh của lớp con đang học, gom theo ngày, bấm ảnh để xem lớn (AC-MEDIA-02)
export function ActivityPhotoGrid({
  photos,
  failedPhotoUrls,
  onPhotoError,
  onOpenPhoto,
}: ActivityPhotoGridProps) {
  const groups = useMemo(() => groupPhotosByDate(photos), [photos]);

  // Số thứ tự ảnh trong trang, dùng cho alt để trình đọc màn hình phân biệt được các ảnh
  const photoIndexById = useMemo(
    () => new Map(photos.map((photo, idx) => [photo.id, idx + 1])),
    [photos]
  );

  return (
    <div className="space-y-6 min-w-0">
      {groups.map((group) => (
        <section
          key={group.dateLabel}
          aria-labelledby={`activity-date-${group.dateLabel}`}
          className="space-y-3 min-w-0"
        >
          <h2
            id={`activity-date-${group.dateLabel}`}
            className="text-sm font-bold text-on-surface"
          >
            {group.dateLabel}
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 min-w-0">
            {group.photos.map((photo) => {
              const photoNumber = photoIndexById.get(photo.id) ?? 0;
              const altText = `Ảnh hoạt động ngày ${group.dateLabel} (ảnh ${photoNumber})`;
              return (
                <li key={photo.id} className="min-w-0">
                  {failedPhotoUrls[photo.url] ? (
                    // URL ký hết hạn hoặc ảnh tải lỗi: chỉ đánh dấu ô này; nút "Thử lại" gom một chỗ ở dải
                    // thông báo phía trên lưới (page.tsx), gọi lại API trang đang xem để nhận URL mới (D53)
                    <div className="aspect-square rounded-2xl border border-slate-200 bg-slate-100 flex flex-col items-center justify-center gap-2 p-3 text-center">
                      <span className="text-error" aria-hidden="true">
                        <Icons.Alert />
                      </span>
                      <p className="text-xs text-error font-medium wrap-anywhere">
                        Không tải được ảnh.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenPhoto(photo.id)}
                      aria-label={`Xem lớn ${altText.charAt(0).toLowerCase()}${altText.slice(1)}`}
                      className="block w-full aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={photo.url}
                        src={photo.url}
                        alt={altText}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={() => onPhotoError(photo.url)}
                      />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
