"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Icons } from "@/components";
import type { PickupPersonResponse } from "@/types/pickup";

interface PickupPersonCardProps {
  priority: 1 | 2;
  person: PickupPersonResponse | null;
  hasPrimary: boolean;
  onEdit: (person: PickupPersonResponse) => void;
  onAdd: (priority: 1 | 2) => void;
  onDelete: (person: PickupPersonResponse) => void;
  onImageError?: () => void;
}

export function PickupPersonCard({
  priority,
  person,
  hasPrimary,
  onEdit,
  onAdd,
  onDelete,
  onImageError,
}: PickupPersonCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const isPrimary = priority === 1;
  const title = isPrimary
    ? "Người đón chính (bắt buộc)"
    : "Người đón dự phòng (không bắt buộc)";

  const handleImageError = () => {
    setImageFailed(true);
    if (onImageError) {
      onImageError();
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-surface-container-lowest p-5 sm:p-6 shadow-xs min-w-0 transition-all">
      {/* Tiêu đề & Nhãn vị trí */}
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-on-surface wrap-anywhere">
            {title}
          </h2>
          <span
            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${
              isPrimary
                ? "bg-primary/10 text-primary"
                : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            {isPrimary ? "Ưu tiên 1" : "Ưu tiên 2"}
          </span>
        </div>

        {/* Nội dung thông tin hoặc Trạng thái trống */}
        {person ? (
          <div className="mt-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start min-w-0">
            {/* Ảnh khuôn mặt (URL ký 60 phút, D53) */}
            <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 self-center sm:self-start">
              {person.facePhotoUrl && !imageFailed ? (
                <Image
                  src={person.facePhotoUrl}
                  alt={person.fullName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 112px"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400">
                  <Icons.User />
                  <span className="text-[11px] mt-1 text-on-surface-variant">
                    {imageFailed ? "Đang tải lại ảnh..." : "Ảnh người đón"}
                  </span>
                </div>
              )}
            </div>

            {/* Chi tiết thông tin */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="min-w-0">
                <p className="text-lg font-bold text-on-surface wrap-anywhere">
                  {person.fullName}
                </p>
                <p className="text-sm font-medium text-primary wrap-anywhere">
                  Mối liên hệ: {person.relationship}
                </p>
              </div>

              <div className="space-y-1 text-sm text-on-surface-variant min-w-0 pt-1">
                <p className="wrap-anywhere flex items-center gap-2">
                  <span className="font-medium text-slate-600">SĐT:</span>
                  <span className="font-mono text-on-surface font-semibold">{person.phoneNumber}</span>
                </p>
                <p className="wrap-anywhere flex items-center gap-2">
                  <span className="font-medium text-slate-600">Số CCCD:</span>
                  <span className="font-mono text-on-surface font-semibold">{person.citizenIdNumber}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center min-w-0">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Icons.User />
            </div>
            <p className="text-sm font-medium text-on-surface-variant wrap-anywhere">
              {isPrimary
                ? "Chưa đăng ký người đón chính cho con."
                : "Chưa có người đón dự phòng."}
            </p>
            {!isPrimary && !hasPrimary && (
              <p className="text-xs text-amber-700 mt-1 wrap-anywhere">
                (Cần đăng ký người đón chính trước khi thêm người dự phòng)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Hành động (Nút Sửa, Thêm, Xóa) */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
        {person ? (
          <>
            <Button
              variant="outline"
              size="md"
              className="min-h-11 flex-1 sm:flex-initial"
              onClick={() => onEdit(person)}
            >
              Sửa thông tin
            </Button>
            {/* Người đón chính không có nút xóa (AC-PICKUP-08); người dự phòng mới có nút xóa */}
            {!isPrimary && (
              <Button
                variant="danger"
                size="md"
                className="min-h-11 flex-1 sm:flex-initial"
                onClick={() => onDelete(person)}
              >
                Xóa người dự phòng
              </Button>
            )}
          </>
        ) : (
          <Button
            variant={isPrimary ? "primary" : "secondary"}
            size="md"
            className="w-full min-h-11"
            disabled={!isPrimary && !hasPrimary}
            onClick={() => onAdd(priority)}
          >
            {isPrimary ? "+ Đăng ký người đón chính" : "+ Thêm người dự phòng"}
          </Button>
        )}
      </div>
    </div>
  );
}
