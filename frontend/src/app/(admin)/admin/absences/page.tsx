"use client";

import { EmptyState, ErrorAlert, LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatVietnamShortDate, getTodayVietnamDateString } from "@/lib/datetime";
import { EscalationCard } from "./_components/EscalationCard";
import { useAbsenceEscalations } from "./_lib/absences-api";

// SCR-ADM-06 — Vắng không phép cần xử lý (FR-ATT-04, D39 mục 20). Trẻ vắng không phép hôm nay mà lần liên
// hệ sau cùng là không liên lạc được, và từ 10:00 thêm trẻ chưa liên hệ lần nào (BR-ATTENDANCE-08). Backend
// lọc và giữ thứ tự; Admin chỉ xem, việc xử lý tiếp làm ngoài hệ thống (D39 mục 15)
export default function AbsenceEscalationsPage() {
  const escalationsQuery = useAbsenceEscalations();
  const data = escalationsQuery.data;
  const loadError = escalationsQuery.isError ? toApiError(escalationsQuery.error).message : null;
  const retry = () => void escalationsQuery.refetch();
  const today = formatVietnamShortDate(getTodayVietnamDateString());

  return (
    <div className="py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-on-surface">
          Vắng không phép cần xử lý
          <span className="font-medium text-on-surface-variant"> · hôm nay {today}</span>
        </h1>
        <p className="text-sm text-on-surface-variant">
          Trẻ vắng không phép mà giáo viên không liên lạc được với người đón. Từ 10:00, danh sách có thêm trẻ
          chưa được liên hệ lần nào.
        </p>
      </div>

      {/* Lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên */}
      {loadError && data && (
        <ErrorAlert title="Không tải lại được danh sách" message={loadError} onRetry={retry} />
      )}

      {escalationsQuery.isPending ? (
        <LoadingSpinner label="Đang tải danh sách..." />
      ) : !data ? (
        <ErrorAlert title="Không tải được danh sách" message={loadError ?? ""} onRetry={retry} />
      ) : data.length === 0 ? (
        <EmptyState title="Không có trẻ cần xử lý" message="Không có trẻ vắng không phép nào cần xử lý." />
      ) : (
        <ul className="space-y-3">
          {/* Dòng không có id (D40 mục 3): ghép lớp, họ tên và vị trí làm key */}
          {data.map((escalation, index) => (
            <li key={`${escalation.className}-${escalation.childFullName}-${index}`}>
              <EscalationCard escalation={escalation} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
