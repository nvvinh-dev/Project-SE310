"use client";

import { useEffect, useState } from "react";
import { EmptyState, ErrorAlert, LoadingSpinner, NoticeBanner, Pagination } from "@/components";
import { toApiError } from "@/lib/axios";
import type { ComplaintResponse, ComplaintStatus } from "@/types/complaint";
import { ComplaintCard } from "./_components/ComplaintCard";
import { ResolveComplaintModal } from "./_components/ResolveComplaintModal";
import { COMPLAINT_STATUS_FILTERS } from "./_lib/complaint-rules";
import { useComplaints, useHandleComplaint } from "./_lib/complaints-api";

const PAGE_SIZE = 20;

type Notice = { message: string; role: "status" | "alert" };

// SCR-ADM-04 — Phản ánh của phụ huynh (FR-COMPLAINT-02, D39 mục 18). Lọc và phân trang ở server,
// mới nhất trước. Việc xử lý thật làm ngoài hệ thống; ở đây chỉ ghi trạng thái và kết quả (BR-COMPLAINT-04)
export default function ComplaintsPage() {
  const [status, setStatus] = useState<ComplaintStatus | "">("");
  const [page, setPage] = useState(1);
  const [resolving, setResolving] = useState<ComplaintResponse | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const complaintsQuery = useComplaints(status, page, PAGE_SIZE);
  const startProgress = useHandleComplaint();
  const data = complaintsQuery.data;

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE)) : 1;
  // Sau khi xử lý, phản ánh có thể rời bộ lọc và trang cuối hết dữ liệu: lùi về trang cuối còn dữ liệu.
  // Đặt lại ngay trong lúc render như bộ lọc của trang tài khoản
  if (data && !complaintsQuery.isPlaceholderData && page > totalPages) {
    setPage(totalPages);
  }

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Đổi bộ lọc thì về trang 1 (SCR-ADM-04 vùng 1)
  const changeFilter = (value: ComplaintStatus | "") => {
    setStatus(value);
    setPage(1);
  };

  // Chuyển sang đang xử lý: bấm một lần là gửi, không qua hộp thoại xác nhận (hành vi 1)
  const handleStartProgress = (complaint: ComplaintResponse) => {
    setNotice(null);
    startProgress.mutate(
      { id: complaint.id, body: { status: "InProgress", resolution: null } },
      {
        onSuccess: () =>
          setNotice({ role: "status", message: `Đã chuyển phản ánh về ${complaint.childFullName} sang đang xử lý.` }),
        onError: (error) => setNotice({ role: "alert", message: toApiError(error).message }),
      }
    );
  };

  const isInitialLoading = complaintsQuery.isPending;
  const loadError = complaintsQuery.isError ? toApiError(complaintsQuery.error).message : null;
  const retry = () => void complaintsQuery.refetch();
  const items = data?.items ?? [];

  return (
    <div className="py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-on-surface">Phản ánh của phụ huynh</h1>
        <p className="text-sm text-on-surface-variant">
          Xem phản ánh phụ huynh gửi tới Ban giám hiệu, chuyển sang đang xử lý và ghi kết quả xử lý.
        </p>
      </div>

      {notice && <NoticeBanner message={notice.message} role={notice.role} onClose={() => setNotice(null)} />}

      <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
        {COMPLAINT_STATUS_FILTERS.map((filter) => {
          const isActive = filter.value === status;
          return (
            <button
              key={filter.value || "all"}
              type="button"
              aria-pressed={isActive}
              onClick={() => changeFilter(filter.value)}
              className={`min-h-11 sm:min-h-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "border border-slate-200 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên */}
      {loadError && data && (
        <ErrorAlert title="Không tải lại được danh sách" message={loadError} onRetry={retry} />
      )}

      {isInitialLoading ? (
        <LoadingSpinner label="Đang tải danh sách phản ánh..." />
      ) : !data ? (
        <ErrorAlert title="Không tải được danh sách phản ánh" message={loadError ?? ""} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Không có phản ánh"
          message={status === "" ? "Chưa có phản ánh nào của phụ huynh." : "Không có phản ánh nào ở trạng thái này."}
        />
      ) : (
        <div className="space-y-4">
          <ul className={`space-y-3 transition-opacity ${complaintsQuery.isPlaceholderData ? "opacity-60" : ""}`}>
            {items.map((complaint) => (
              <li key={complaint.id}>
                <ComplaintCard
                  complaint={complaint}
                  isStarting={startProgress.isPending && startProgress.variables?.id === complaint.id}
                  isBusy={startProgress.isPending}
                  onStartProgress={handleStartProgress}
                  onResolve={(selected) => {
                    setNotice(null);
                    setResolving(selected);
                  }}
                />
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={Math.min(page, totalPages)}
            totalPages={totalPages}
            totalItems={data.totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {resolving && (
        <ResolveComplaintModal
          complaint={resolving}
          onClose={() => setResolving(null)}
          onSuccess={(updated) => {
            setResolving(null);
            setNotice({ role: "status", message: `Đã ghi kết quả xử lý phản ánh về ${updated.childFullName}.` });
          }}
          onStale={(message) => {
            setResolving(null);
            setNotice({ role: "alert", message });
          }}
        />
      )}
    </div>
  );
}
