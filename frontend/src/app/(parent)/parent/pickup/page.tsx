"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EmptyState,
  ErrorAlert,
  Icons,
  LoadingSpinner,
  NoticeBanner,
} from "@/components";
import { toApiError } from "@/lib/axios";
import type { PickupPersonResponse } from "@/types/pickup";
import { ChildSelectHeader } from "../attendance/_components/ChildSelectHeader";
import { DeletePickupPersonDialog } from "./_components/DeletePickupPersonDialog";
import { PickupPersonCard } from "./_components/PickupPersonCard";
import { PickupPersonFormModal } from "./_components/PickupPersonFormModal";
import { useChildPickupPersons, useMyChildren } from "./_lib/parent-pickup-api";

// Hộp thoại đang mở. childId giữ lại để hộp thoại vẫn ghi đúng trẻ nếu danh sách con đổi giữa chừng
type PickupDialog =
  | { type: "form"; childId: string; priority: 1 | 2; person: PickupPersonResponse | null }
  | { type: "delete"; childId: string; person: PickupPersonResponse };

// SCR-PAR-04 — Đăng ký người đón (FR-PICKUP-03, UC-PICKUP-02)
export default function ParentPickupPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childErrorMessage, setChildErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dialog, setDialog] = useState<PickupDialog | null>(null);
  // Trẻ đã xử lý lỗi tải người đón, để không tải lại danh sách con lặp lại cho cùng một lỗi
  const handledErrorChildIdRef = useRef<string | null>(null);

  // Dải thành công tự ẩn sau 6 giây (ui-screens.md §4.2)
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const childrenQuery = useMyChildren();
  const childrenList = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);

  // Một con thì chọn sẵn; con đang chọn không còn trong danh sách thì về con đầu tiên (ui-screens.md §10)
  const activeChildId = useMemo(() => {
    if (selectedChildId && childrenList.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return childrenList[0]?.id ?? "";
  }, [selectedChildId, childrenList]);

  const pickupPersonsQuery = useChildPickupPersons(activeChildId);
  const pickupPersons = pickupPersonsQuery.data;
  const primaryPerson = pickupPersons?.find((p) => p.priority === 1) ?? null;
  const backupPerson = pickupPersons?.find((p) => p.priority === 2) ?? null;

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setChildErrorMessage(null);
    setNotice(null);
    handledErrorChildIdRef.current = null;
  };

  // API trả lỗi cho trẻ đang chọn (ví dụ 404 vì vừa bị gỡ liên kết): tải lại danh sách con, trẻ không
  // còn thì hiện message của backend (ui-screens.md §10). Mỗi trẻ chỉ xử lý một lần
  const { refetch: refetchChildren } = childrenQuery;

  useEffect(() => {
    if (pickupPersonsQuery.isSuccess) {
      handledErrorChildIdRef.current = null;
      return;
    }
    if (
      !pickupPersonsQuery.isError ||
      !activeChildId ||
      handledErrorChildIdRef.current === activeChildId
    ) {
      return;
    }

    handledErrorChildIdRef.current = activeChildId;
    const message = toApiError(pickupPersonsQuery.error).message;
    void refetchChildren().then((res) => {
      const latestChildren = res.data ?? [];
      if (!latestChildren.some((c) => c.id === activeChildId)) {
        setChildErrorMessage(message);
      }
    });
  }, [
    pickupPersonsQuery.isSuccess,
    pickupPersonsQuery.isError,
    pickupPersonsQuery.error,
    activeChildId,
    refetchChildren,
  ]);

  const handleRetry = () => {
    setChildErrorMessage(null);
    handledErrorChildIdRef.current = null;
    void refetchChildren();
    // refetch() chạy cả khi query đang tắt, nên chỉ gọi khi đã có trẻ (frontend-conventions.md §3.3)
    if (activeChildId) void pickupPersonsQuery.refetch();
  };

  const handleRefreshPhoto = () => {
    if (activeChildId) void pickupPersonsQuery.refetch();
  };

  const openForm = (priority: 1 | 2, person: PickupPersonResponse | null) => {
    if (!activeChildId) return;
    setNotice(null);
    setDialog({ type: "form", childId: activeChildId, priority, person });
  };

  const handleDialogSuccess = (message: string) => {
    setDialog(null);
    setNotice(message);
  };

  // Lỗi thay cả nội dung chỉ khi chưa có dữ liệu; đã có thì giữ dữ liệu cũ (frontend-conventions.md §3.3)
  const childrenData = childrenQuery.data;
  const showChildrenLoading = childrenQuery.isPending;
  const showChildrenError = childrenQuery.isError && childrenData === undefined;
  const showPersonsLoading = Boolean(activeChildId) && pickupPersonsQuery.isPending;
  const showPersonsError = pickupPersonsQuery.isError && pickupPersons === undefined;
  const showPersonsRefreshError = pickupPersonsQuery.isError && pickupPersons !== undefined;

  return (
    <div className="py-8 space-y-6 min-w-0">
      <ChildSelectHeader
        title="Đăng ký người đón"
        subtitle="Người đón chính và người đón dự phòng của con, kèm ảnh khuôn mặt để giáo viên xác minh khi đón."
        childrenList={childrenList}
        selectedChildId={activeChildId}
        onSelectChild={handleSelectChild}
      />

      {notice && <NoticeBanner message={notice} onClose={() => setNotice(null)} />}

      {childErrorMessage && (
        <NoticeBanner
          role="alert"
          message={childErrorMessage}
          onClose={() => setChildErrorMessage(null)}
        />
      )}

      {showPersonsRefreshError && (
        <ErrorAlert
          title="Không tải lại được dữ liệu mới nhất"
          message={toApiError(pickupPersonsQuery.error).message}
          onRetry={handleRetry}
        />
      )}

      {showChildrenLoading ? (
        <LoadingSpinner label="Đang tải danh sách con..." />
      ) : showChildrenError ? (
        <ErrorAlert message={toApiError(childrenQuery.error).message} onRetry={handleRetry} />
      ) : childrenList.length === 0 ? (
        <EmptyState
          title="Chưa có trẻ nào"
          message="Tài khoản chưa được liên kết với trẻ nào. Liên hệ văn phòng nhà trường."
          icon={<Icons.User />}
        />
      ) : showPersonsLoading ? (
        <LoadingSpinner label="Đang tải người đón..." />
      ) : showPersonsError ? (
        <ErrorAlert message={toApiError(pickupPersonsQuery.error).message} onRetry={handleRetry} />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <PickupPersonCard
              priority={1}
              person={primaryPerson}
              hasPrimary={primaryPerson !== null}
              isRefreshingPhoto={pickupPersonsQuery.isFetching}
              onAdd={(priority) => openForm(priority, null)}
              onEdit={(person) => openForm(person.priority, person)}
              onRefreshPhoto={handleRefreshPhoto}
            />
            <PickupPersonCard
              priority={2}
              person={backupPerson}
              hasPrimary={primaryPerson !== null}
              isRefreshingPhoto={pickupPersonsQuery.isFetching}
              onAdd={(priority) => openForm(priority, null)}
              onEdit={(person) => openForm(person.priority, person)}
              onDelete={(person) => {
                setNotice(null);
                setDialog({ type: "delete", childId: activeChildId, person });
              }}
              onRefreshPhoto={handleRefreshPhoto}
            />
          </div>

          {/* SCR-PAR-04 Hành vi 4, 6 */}
          <p className="text-sm text-on-surface-variant">
            Người đón dự phòng chỉ thêm được khi đã có người đón chính và không được trùng số CCCD
            với người đón chính. Phụ huynh muốn tự đón con thì đăng ký chính mình làm một trong hai
            người.
          </p>
        </div>
      )}

      {dialog?.type === "form" && (
        <PickupPersonFormModal
          childId={dialog.childId}
          priority={dialog.priority}
          person={dialog.person}
          onClose={() => setDialog(null)}
          onSuccess={handleDialogSuccess}
        />
      )}

      {dialog?.type === "delete" && (
        <DeletePickupPersonDialog
          childId={dialog.childId}
          person={dialog.person}
          onClose={() => setDialog(null)}
          onSuccess={handleDialogSuccess}
        />
      )}
    </div>
  );
}
