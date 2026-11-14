"use client";

import { useState } from "react";
import { Button, Icons } from "@/components";
import type { PickupPersonResponse } from "@/types/pickup";

interface PickupPersonCardProps {
  priority: 1 | 2;
  person: PickupPersonResponse | null;
  hasPrimary: boolean;
  // Đang gọi lại API danh sách người đón (để lấy URL ảnh mới)
  isRefreshingPhoto: boolean;
  onAdd: (priority: 1 | 2) => void;
  onEdit: (person: PickupPersonResponse) => void;
  onDelete?: (person: PickupPersonResponse) => void;
  onRefreshPhoto: () => void;
}

// SCR-PAR-04 vùng 2 và 3
export function PickupPersonCard({
  priority,
  person,
  hasPrimary,
  isRefreshingPhoto,
  onAdd,
  onEdit,
  onDelete,
  onRefreshPhoto,
}: PickupPersonCardProps) {
  const isPrimary = priority === 1;

  // Ghi theo URL: refetch trả URL ký mới thì ảnh tự hiện lại, không kẹt ở trạng thái lỗi (D53)
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  // Chỉ tự gọi lại API một lần cho mỗi lần lỗi liên tiếp, để ảnh hỏng thật không gây vòng gọi API
  const [autoRefreshUsed, setAutoRefreshUsed] = useState(false);

  const photoFailed = person !== null && failedPhotoUrl === person.facePhotoUrl;

  const handlePhotoError = () => {
    if (!person) return;
    setFailedPhotoUrl(person.facePhotoUrl);
    if (!autoRefreshUsed) {
      setAutoRefreshUsed(true);
      onRefreshPhoto();
    }
  };

  return (
    <section className="flex flex-col rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm min-w-0">
      <h2 className="text-base font-bold text-on-surface">
        {isPrimary ? "Người đón chính (bắt buộc)" : "Người đón dự phòng (không bắt buộc)"}
      </h2>

      {person ? (
        <div className="mt-4 flex flex-1 items-start gap-4 min-w-0">
          <div className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 flex items-center justify-center">
            {photoFailed ? (
              <div className="flex flex-col items-center gap-1 px-1 text-center text-outline">
                <Icons.User />
                {isRefreshingPhoto ? (
                  <span className="text-xs">Đang tải lại ảnh...</span>
                ) : (
                  <Button variant="ghost" size="sm" onClick={onRefreshPhoto}>
                    Thử lại
                  </Button>
                )}
              </div>
            ) : (
              /* URL ký của Supabase Storage không đi qua next/image (khuôn PickupVerificationModal) */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={person.facePhotoUrl}
                alt={`Ảnh khuôn mặt ${person.fullName}`}
                className="w-full h-full object-cover"
                onLoad={() => setAutoRefreshUsed(false)}
                onError={handlePhotoError}
              />
            )}
          </div>

          <div className="min-w-0 space-y-1 text-sm">
            <p className="text-base font-bold text-on-surface wrap-anywhere">
              {person.fullName}
              <span className="font-normal text-on-surface-variant"> · {person.relationship}</span>
            </p>
            <p className="text-on-surface-variant">
              SĐT <span className="font-semibold text-on-surface">{person.phoneNumber}</span>
            </p>
            <p className="text-on-surface-variant">
              CCCD <span className="font-semibold text-on-surface">{person.citizenIdNumber}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex-1 space-y-1">
          <p className="text-sm text-on-surface-variant">Chưa có</p>
          {!isPrimary && !hasPrimary && (
            <p className="text-xs text-on-surface-variant">
              Cần đăng ký người đón chính trước khi thêm người đón dự phòng.
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {person ? (
          <>
            <Button variant="outline" className="min-h-11" onClick={() => onEdit(person)}>
              Sửa
            </Button>
            {/* Người đón chính không có nút xóa, chỉ sửa hoặc thay người (SCR-PAR-04 Hành vi 5) */}
            {!isPrimary && onDelete && (
              <Button variant="danger" className="min-h-11" onClick={() => onDelete(person)}>
                Xóa
              </Button>
            )}
          </>
        ) : (
          <Button
            variant={isPrimary ? "primary" : "outline"}
            className="min-h-11"
            disabled={!isPrimary && !hasPrimary}
            onClick={() => onAdd(priority)}
          >
            {isPrimary ? "+ Thêm người đón chính" : "+ Thêm người dự phòng"}
          </Button>
        )}
      </div>
    </section>
  );
}
