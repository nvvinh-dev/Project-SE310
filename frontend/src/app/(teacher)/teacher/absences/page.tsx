"use client";

import { useState } from "react";
import { EmptyState, ErrorAlert, LoadingSpinner, NoticeBanner } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatVietnamDateFromUtc } from "@/lib/datetime";
import { ABSENCE_FOLLOW_UP_OUTCOME_LABELS, type AbsenceFollowUpOutcome, type AbsenceTodayResponse } from "@/types/absence";
import { AbsenceCard } from "./_components/AbsenceCard";
import { FollowUpModal } from "./_components/FollowUpModal";
import { sortNotContactedFirst } from "./_lib/absence-rules";
import { useAbsencesToday, useCreateAbsenceFollowUp } from "./_lib/absences-api";

interface FollowUpTarget {
  attendanceId: string;
  childFullName: string;
  outcome: AbsenceFollowUpOutcome;
}

// SCR-TCH-07 — Vắng không phép cần liên hệ (FR-ATT-04, D39 mục 20). Giáo viên gọi người đón của trẻ vắng
// không phép hôm nay và ghi kết quả từng lần gọi. Không liên lạc được thì Ban giám hiệu nhận thông báo
// (BR-ATTENDANCE-08); lần đã ghi không sửa, không xóa (BR-ATTENDANCE-07)
export default function TeacherAbsencesPage() {
  const absencesQuery = useAbsencesToday();
  const createFollowUp = useCreateAbsenceFollowUp();
  const [target, setTarget] = useState<FollowUpTarget | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const data = absencesQuery.data;
  const loadError = absencesQuery.isError ? toApiError(absencesQuery.error).message : null;
  const retry = () => void absencesQuery.refetch();
  // Server tính "hôm nay" lúc trả danh sách và không trả kèm ngày, nên lấy ngày theo lúc tải xong dữ liệu
  const today = data ? formatVietnamDateFromUtc(new Date(absencesQuery.dataUpdatedAt).toISOString()) : null;

  // Ghi lỗi (ví dụ 409 khi bản điểm danh không còn là vắng không phép hôm nay) thì danh sách được tải lại.
  // Trẻ không còn trong danh sách thì đóng hộp thoại và báo message ở đầu trang, không rẽ nhánh theo mã lỗi
  const targetGone = target !== null && data !== undefined && !data.some((a) => a.attendanceId === target.attendanceId);
  const orphanError = targetGone && createFollowUp.isError ? toApiError(createFollowUp.error).message : null;

  const openModal = (absence: AbsenceTodayResponse, outcome: AbsenceFollowUpOutcome) => {
    createFollowUp.reset();
    setSuccessMessage(null);
    setTarget({ attendanceId: absence.attendanceId, childFullName: absence.childFullName, outcome });
  };

  const closeModal = () => {
    if (createFollowUp.isPending) return;
    createFollowUp.reset();
    setTarget(null);
  };

  const submitFollowUp = (note: string | null) => {
    if (!target) return;
    const { attendanceId, childFullName, outcome } = target;
    createFollowUp.mutate(
      { attendanceId, request: { outcome, note } },
      {
        onSuccess: () => {
          setTarget(null);
          setSuccessMessage(
            outcome === "Unreachable"
              ? `Đã ghi "${ABSENCE_FOLLOW_UP_OUTCOME_LABELS[outcome]}" cho ${childFullName}. Ban giám hiệu đã được báo.`
              : `Đã ghi "${ABSENCE_FOLLOW_UP_OUTCOME_LABELS[outcome]}" cho ${childFullName}.`
          );
        },
      }
    );
  };

  const dismissOrphanError = () => {
    createFollowUp.reset();
    setTarget(null);
  };

  const sorted = data ? sortNotContactedFirst(data) : [];

  return (
    <div className="py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-on-surface">
          Vắng không phép hôm nay
          {data && data.length > 0 && <span className="font-medium text-on-surface-variant"> · {data.length} trẻ</span>}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {today ? `Ngày ${today}. ` : ""}Gọi người đón của trẻ và ghi kết quả từng lần gọi. Không liên lạc được
          thì Ban giám hiệu nhận thông báo. Kết quả đã ghi không sửa được.
        </p>
      </div>

      {successMessage && <NoticeBanner message={successMessage} onClose={() => setSuccessMessage(null)} />}

      {orphanError && (
        <NoticeBanner role="alert" message={orphanError} onClose={dismissOrphanError} />
      )}

      {/* Lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên */}
      {loadError && data && (
        <ErrorAlert title="Không tải lại được danh sách" message={loadError} onRetry={retry} />
      )}

      {absencesQuery.isPending ? (
        <LoadingSpinner label="Đang tải danh sách..." />
      ) : !data ? (
        <ErrorAlert title="Không tải được danh sách" message={loadError ?? ""} onRetry={retry} />
      ) : data.length === 0 ? (
        <EmptyState title="Không có trẻ vắng không phép" message="Hôm nay không có trẻ nào vắng không phép." />
      ) : (
        <ul className="space-y-3">
          {sorted.map((absence) => (
            <li key={absence.attendanceId}>
              <AbsenceCard absence={absence} disabled={createFollowUp.isPending} onRecord={openModal} />
            </li>
          ))}
        </ul>
      )}

      {target && !targetGone && (
        <FollowUpModal
          childFullName={target.childFullName}
          outcome={target.outcome}
          isSubmitting={createFollowUp.isPending}
          error={createFollowUp.error}
          onClose={closeModal}
          onSubmit={submitFollowUp}
        />
      )}
    </div>
  );
}
