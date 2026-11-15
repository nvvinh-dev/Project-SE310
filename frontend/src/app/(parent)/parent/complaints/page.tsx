"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmptyState, ErrorAlert, Icons, LoadingSpinner, NoticeBanner } from "@/components";
import { toApiError } from "@/lib/axios";
import { ChildSelectHeader } from "../attendance/_components/ChildSelectHeader";
import { ChildComplaintCard } from "./_components/ChildComplaintCard";
import { ComplaintSubmitForm } from "./_components/ComplaintSubmitForm";
import { useChildComplaints, useMyChildren } from "./_lib/parent-complaints-api";

// SCR-PAR-09 — Phản ánh tới Ban giám hiệu (FR-COMPLAINT-01, UC-COMPLAINT-01, AC-COMPLAINT-01, AC-COMPLAINT-02)
export default function ParentComplaintsPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childErrorMessage, setChildErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Dải thành công tự ẩn sau 6 giây (ui-screens.md §4.2)
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Vùng 1: con liên kết với phụ huynh đang đăng nhập (D45)
  const childrenQuery = useMyChildren();
  const childrenList = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);

  // Một con thì chọn sẵn; con đang chọn không còn trong danh sách thì về con đầu tiên (ui-screens.md §10)
  const activeChildId = useMemo(() => {
    if (selectedChildId && childrenList.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return childrenList[0]?.id ?? "";
  }, [selectedChildId, childrenList]);
  const activeChild = childrenList.find((c) => c.id === activeChildId) ?? null;

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setChildErrorMessage(null);
    setNotice(null);
  };

  // Vùng 3: phản ánh của con, mới nhất trước, không phân trang
  const complaintsQuery = useChildComplaints(activeChildId);
  const complaints = complaintsQuery.data;

  // Tải lại danh sách con; con vừa lỗi không còn liên kết thì giữ message của backend và chuyển sang con
  // khác hoặc về rỗng (ui-screens.md §10). Không rẽ nhánh theo mã lỗi (frontend-conventions.md §5)
  const { refetch: refetchChildren } = childrenQuery;
  const syncChildrenAfterError = useCallback(
    async (childId: string, message: string) => {
      const res = await refetchChildren();
      const latestChildren = res.data ?? [];
      if (!latestChildren.some((c) => c.id === childId)) {
        setChildErrorMessage(message);
        setSelectedChildId(latestChildren[0]?.id ?? "");
      }
    },
    [refetchChildren]
  );

  // Phản ánh của con tải lỗi (ví dụ con bị gỡ liên kết → 404, AC-COMPLAINT-02 d). Ref chặn vòng lặp refetch
  // cho cùng một lần lỗi; hết lỗi thì đặt lại để lần lỗi sau của cùng con đó vẫn tải lại danh sách con
  const handledErrorChildIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!complaintsQuery.isError) {
      handledErrorChildIdRef.current = null;
      return;
    }
    if (!activeChildId || handledErrorChildIdRef.current === activeChildId) return;
    handledErrorChildIdRef.current = activeChildId;
    void syncChildrenAfterError(activeChildId, toApiError(complaintsQuery.error).message);
  }, [complaintsQuery.isError, complaintsQuery.error, activeChildId, syncChildrenAfterError]);

  // "Thử lại": tải lại danh sách con trước, rồi mới tải lại phản ánh nếu con vẫn còn (ui-screens.md §10)
  const handleRetry = async () => {
    setChildErrorMessage(null);
    const res = await refetchChildren();
    const latestChildren = res.data ?? [];
    if (activeChildId && !latestChildren.some((c) => c.id === activeChildId)) {
      setSelectedChildId(latestChildren[0]?.id ?? "");
      return;
    }
    // refetch() chạy cả khi query đang tắt, nên chỉ gọi khi đã có trẻ (frontend-conventions.md §3.3)
    if (activeChildId) void complaintsQuery.refetch();
  };

  const handleSubmitSuccess = () => {
    setChildErrorMessage(null);
    setNotice("Đã gửi phản ánh. Ban giám hiệu sẽ báo kết quả qua Thông báo.");
  };

  const handleSubmitError = (childId: string, message: string) => {
    setNotice(null);
    void syncChildrenAfterError(childId, message);
  };

  // Lỗi thay cả nội dung chỉ khi chưa có dữ liệu; đã có thì giữ dữ liệu cũ (frontend-conventions.md §3.3)
  const showChildrenLoading = childrenQuery.isPending;
  const showChildrenError = childrenQuery.isError && childrenQuery.data === undefined;
  const showChildrenRefreshError = childrenQuery.isError && childrenQuery.data !== undefined;
  const showComplaintsLoading = Boolean(activeChildId) && complaintsQuery.isPending;
  const showComplaintsError = complaintsQuery.isError && complaints === undefined;
  const showComplaintsRefreshError = complaintsQuery.isError && complaints !== undefined;

  return (
    <div className="py-8 space-y-6 min-w-0">
      <ChildSelectHeader
        title="Phản ánh tới Ban giám hiệu"
        subtitle="Gửi phản ánh về con tới Ban giám hiệu và theo dõi kết quả xử lý."
        childrenList={childrenList}
        selectedChildId={activeChildId}
        onSelectChild={handleSelectChild}
      />

      {notice && <NoticeBanner message={notice} onClose={() => setNotice(null)} />}

      {/* Message của backend khi con vừa lỗi, giữ cả sau khi tự chuyển sang con khác */}
      {childErrorMessage && (
        <NoticeBanner role="alert" message={childErrorMessage} onClose={() => setChildErrorMessage(null)} />
      )}

      {showChildrenRefreshError && (
        <ErrorAlert
          title="Không thể làm mới danh sách con"
          message={toApiError(childrenQuery.error).message}
          onRetry={() => void handleRetry()}
        />
      )}

      {showChildrenLoading ? (
        <LoadingSpinner label="Đang tải danh sách con..." />
      ) : showChildrenError ? (
        <ErrorAlert
          title="Không thể tải danh sách con"
          message={toApiError(childrenQuery.error).message}
          onRetry={() => void handleRetry()}
        />
      ) : childrenList.length === 0 || !activeChild ? (
        <EmptyState
          title="Chưa có trẻ nào"
          message="Tài khoản chưa được liên kết với trẻ nào. Liên hệ văn phòng nhà trường."
          icon={<Icons.User />}
        />
      ) : (
        <div className="space-y-6 min-w-0">
          {/* Vùng 2. key theo con: đổi con thì form khởi tạo lại, không gửi nhầm nội dung sang con khác */}
          <ComplaintSubmitForm
            key={activeChild.id}
            child={activeChild}
            onSuccess={handleSubmitSuccess}
            onSubmitError={handleSubmitError}
          />

          {/* Vùng 3 */}
          <section aria-labelledby="child-complaints-title" className="space-y-4 min-w-0">
            <div className="space-y-1 min-w-0">
              <h2 id="child-complaints-title" className="text-lg font-bold text-on-surface wrap-anywhere">
                Phản ánh về {activeChild.fullName}
              </h2>
              {/* Response không cho biết ai gửi nên ghi rõ danh sách gồm cả phản ánh của phụ huynh khác */}
              <p className="text-sm text-on-surface-variant">
                Gồm cả phản ánh do phụ huynh khác của con gửi.
              </p>
            </div>

            {showComplaintsRefreshError && (
              <ErrorAlert
                title="Không tải lại được phản ánh mới nhất"
                message={toApiError(complaintsQuery.error).message}
                onRetry={() => void handleRetry()}
              />
            )}

            {showComplaintsLoading ? (
              <LoadingSpinner label="Đang tải phản ánh..." />
            ) : showComplaintsError ? (
              <ErrorAlert
                title="Không thể tải phản ánh"
                message={toApiError(complaintsQuery.error).message}
                onRetry={() => void handleRetry()}
              />
            ) : !complaints || complaints.length === 0 ? (
              <EmptyState
                title="Chưa có phản ánh nào về con."
                message="Phản ánh đã gửi và kết quả xử lý của Ban giám hiệu sẽ hiện ở đây."
                icon={<Icons.Clipboard />}
              />
            ) : (
              <div className="space-y-4 min-w-0">
                {complaints.map((complaint) => (
                  <ChildComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
