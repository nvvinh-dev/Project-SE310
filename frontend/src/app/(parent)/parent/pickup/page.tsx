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
import type { PickupPersonFormValues } from "./_lib/pickup-person-rules";
import {
  useChildPickupPersons,
  useCreatePickupPerson,
  useDeletePickupPerson,
  useMyChildren,
  useUpdatePickupPerson,
} from "./_lib/parent-pickup-api";

export default function ParentPickupPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childErrorMessage, setChildErrorMessage] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Modal Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formPriority, setFormPriority] = useState<1 | 2>(1);
  const [editingPerson, setEditingPerson] = useState<PickupPersonResponse | null>(null);

  // Dialog Xóa State
  const [deletingPerson, setDeletingPerson] = useState<PickupPersonResponse | null>(null);

  // 1. Tải danh sách con của phụ huynh (FR-PICKUP-03, D45)
  const childrenQuery = useMyChildren();
  const childrenList = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);

  // Tự động chọn con đầu tiên khi nạp danh sách thành công
  const activeChildId = useMemo(() => {
    if (selectedChildId && childrenList.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return childrenList[0]?.id ?? "";
  }, [selectedChildId, childrenList]);

  // 2. Tải danh sách người đón đã đăng ký của con đang chọn
  const pickupPersonsQuery = useChildPickupPersons(activeChildId);
  const pickupPersonsList = useMemo(
    () => pickupPersonsQuery.data ?? [],
    [pickupPersonsQuery.data]
  );

  const primaryPerson = useMemo(
    () => pickupPersonsList.find((p) => p.priority === 1) ?? null,
    [pickupPersonsList]
  );

  const backupPerson = useMemo(
    () => pickupPersonsList.find((p) => p.priority === 2) ?? null,
    [pickupPersonsList]
  );

  // Mutations
  const createMutation = useCreatePickupPerson();
  const updateMutation = useUpdatePickupPerson();
  const deleteMutation = useDeletePickupPerson();

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setChildErrorMessage(null);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
    handledErrorChildIdRef.current = null;
  };

  // Thử lại toàn bộ (ui-screens.md §4.2, §10)
  const handleRefresh = async () => {
    setChildErrorMessage(null);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
    handledErrorChildIdRef.current = null;

    const childrenResult = await childrenQuery.refetch();
    const latestChildren = childrenResult.data ?? [];
    if (activeChildId && !latestChildren.some((c) => c.id === activeChildId)) {
      setSelectedChildId(latestChildren[0]?.id ?? "");
      return;
    }
    if (activeChildId) {
      void pickupPersonsQuery.refetch();
    }
  };

  // Xử lý lỗi khi truy vấn người đón gặp sự cố (ví dụ trẻ bị gỡ liên kết theo ui-screens.md §10)
  const handledErrorChildIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (pickupPersonsQuery.isSuccess) {
      handledErrorChildIdRef.current = null;
      return;
    }

    if (
      pickupPersonsQuery.isError &&
      activeChildId &&
      handledErrorChildIdRef.current !== activeChildId
    ) {
      handledErrorChildIdRef.current = activeChildId;
      const err = toApiError(pickupPersonsQuery.error);
      const msg = err.message ?? null;

      void childrenQuery.refetch().then((res) => {
        const latestChildren = res.data ?? [];
        if (msg && !latestChildren.some((c) => c.id === activeChildId)) {
          setChildErrorMessage(msg);
        }
      });
    }
  }, [
    pickupPersonsQuery.isSuccess,
    pickupPersonsQuery.isError,
    pickupPersonsQuery.error,
    activeChildId,
    childrenQuery,
  ]);

  // Mở modal thêm người đón
  const handleOpenAdd = (priority: 1 | 2) => {
    setFormPriority(priority);
    setEditingPerson(null);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
    setIsFormOpen(true);
  };

  // Mở modal sửa người đón
  const handleOpenEdit = (person: PickupPersonResponse) => {
    setFormPriority(person.priority);
    setEditingPerson(person);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
    setIsFormOpen(true);
  };

  // Submit form thêm hoặc sửa người đón
  const handleFormSubmit = async (values: PickupPersonFormValues) => {
    if (!activeChildId) return;
    setActionErrorMessage(null);
    setActionSuccessMessage(null);

    try {
      if (editingPerson) {
        // Sửa người đón
        await updateMutation.mutateAsync({
          childId: activeChildId,
          personId: editingPerson.id,
          fullName: values.fullName,
          relationship: values.relationship,
          phoneNumber: values.phoneNumber,
          citizenIdNumber: values.citizenIdNumber,
          consentConfirmed: values.consentConfirmed,
          photoFile: values.photoFile,
        });
        setActionSuccessMessage(
          `Đã cập nhật thông tin ${
            editingPerson.priority === 1 ? "người đón chính" : "người đón dự phòng"
          } thành công.`
        );
      } else {
        // Thêm người đón
        if (!values.photoFile) return;
        await createMutation.mutateAsync({
          childId: activeChildId,
          priority: formPriority,
          fullName: values.fullName,
          relationship: values.relationship,
          phoneNumber: values.phoneNumber,
          citizenIdNumber: values.citizenIdNumber,
          consentConfirmed: values.consentConfirmed,
          photoFile: values.photoFile,
        });
        setActionSuccessMessage(
          `Đã đăng ký ${
            formPriority === 1 ? "người đón chính" : "người đón dự phòng"
          } thành công.`
        );
      }
      setIsFormOpen(false);
    } catch (err) {
      const apiErr = toApiError(err);
      setActionErrorMessage(apiErr.message);
      // Tải lại danh sách nếu có xung đột cập nhật đồng thời (AC-PICKUP-11, 409)
      void pickupPersonsQuery.refetch();
    }
  };

  // Xóa người đón dự phòng
  const handleDeleteConfirm = async () => {
    if (!activeChildId || !deletingPerson) return;
    setActionErrorMessage(null);
    setActionSuccessMessage(null);

    try {
      await deleteMutation.mutateAsync({
        childId: activeChildId,
        personId: deletingPerson.id,
      });
      setActionSuccessMessage(
        `Đã xóa người đón dự phòng "${deletingPerson.fullName}" thành công.`
      );
      setDeletingPerson(null);
    } catch (err) {
      const apiErr = toApiError(err);
      setActionErrorMessage(apiErr.message);
      setDeletingPerson(null);
      void pickupPersonsQuery.refetch();
    }
  };

  // 4 Trạng thái giao diện
  const isChildrenInitialLoading = childrenQuery.isPending && childrenQuery.data === undefined;
  const isChildrenInitialError = childrenQuery.isError && childrenQuery.data === undefined;
  const childrenErrorMessage = childrenQuery.error
    ? toApiError(childrenQuery.error).message ?? "Đã xảy ra lỗi khi tải danh sách con."
    : null;

  const hasPersonsData = pickupPersonsQuery.data !== undefined;
  const isPersonsInitialLoading = pickupPersonsQuery.isPending && !hasPersonsData;
  const isPersonsInitialError = pickupPersonsQuery.isError && !hasPersonsData;
  const isPersonsBackgroundError = pickupPersonsQuery.isError && hasPersonsData;
  const personsErrorMessage = pickupPersonsQuery.error
    ? toApiError(pickupPersonsQuery.error).message ?? "Đã xảy ra lỗi khi tải danh sách người đón."
    : null;

  return (
    <div className="py-8 space-y-6 min-w-0 max-w-7xl">
      {/* 1. Header chọn con */}
      <ChildSelectHeader
        title="Đăng ký người đón"
        subtitle="Quản lý người đón chính và người đón dự phòng của con, kèm ảnh khuôn mặt để giáo viên đối chiếu khi đón trẻ."
        childrenList={childrenList}
        selectedChildId={activeChildId}
        onSelectChild={handleSelectChild}
      />

      {/* Thông báo thao tác thành công */}
      {actionSuccessMessage && (
        <NoticeBanner
          message={actionSuccessMessage}
          onClose={() => setActionSuccessMessage(null)}
          role="status"
        />
      )}

      {/* Thông báo lỗi thao tác (Action Error) */}
      {actionErrorMessage && (
        <NoticeBanner
          message={actionErrorMessage}
          onClose={() => setActionErrorMessage(null)}
          role="alert"
        />
      )}

      {/* Dải báo lỗi khi con bị gỡ liên kết hoặc lỗi chuyển con (ui-screens.md §10) */}
      {childErrorMessage && (
        <NoticeBanner
          message={childErrorMessage}
          onClose={() => setChildErrorMessage(null)}
          role="alert"
        />
      )}

      {/* Dải báo lỗi làm mới nền (background refetch error) */}
      {isPersonsBackgroundError && personsErrorMessage && (
        <NoticeBanner
          message={personsErrorMessage}
          onClose={() => void pickupPersonsQuery.refetch()}
          role="alert"
        />
      )}

      {/* 2. Trạng thái tải danh sách con */}
      {isChildrenInitialLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner label="Đang tải danh sách con..." />
        </div>
      ) : isChildrenInitialError ? (
        <ErrorAlert
          message={childrenErrorMessage || "Không thể tải danh sách con."}
          onRetry={handleRefresh}
        />
      ) : childrenList.length === 0 ? (
        <EmptyState
          title="Chưa liên kết trẻ"
          message="Tài khoản chưa được liên kết với trẻ nào. Liên hệ văn phòng nhà trường."
          icon={<Icons.User />}
        />
      ) : isPersonsInitialLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner label="Đang tải thông tin người đón..." />
        </div>
      ) : isPersonsInitialError ? (
        <ErrorAlert
          message={personsErrorMessage || "Không thể tải thông tin người đón."}
          onRetry={handleRefresh}
        />
      ) : (
        /* 3. Nội dung chính: 2 thẻ người đón */
        <div className="space-y-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
            {/* Thẻ 1: Người đón chính */}
            <PickupPersonCard
              priority={1}
              person={primaryPerson}
              hasPrimary={Boolean(primaryPerson)}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              onDelete={() => {}}
              onImageError={() => void pickupPersonsQuery.refetch()}
            />

            {/* Thẻ 2: Người đón dự phòng */}
            <PickupPersonCard
              priority={2}
              person={backupPerson}
              hasPrimary={Boolean(primaryPerson)}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              onDelete={(person) => setDeletingPerson(person)}
              onImageError={() => void pickupPersonsQuery.refetch()}
            />
          </div>

          {/* Lưu ý quy định đón trẻ */}
          <div className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant space-y-1.5 min-w-0 border border-slate-200/60">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <Icons.Info /> Quy định về người đón trẻ:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-1 min-w-0">
              <li className="wrap-anywhere">
                Mỗi trẻ có tối đa <strong>1 người đón chính</strong> và <strong>1 người đón dự phòng</strong>.
              </li>
              <li className="wrap-anywhere">
                Người đón dự phòng chỉ có thể đăng ký sau khi đã có người đón chính, và không được trùng số CCCD với người chính.
              </li>
              <li className="wrap-anywhere">
                Nếu phụ huynh muốn tự đón con, vui lòng đăng ký chính mình làm người đón chính hoặc người dự phòng.
              </li>
              <li className="wrap-anywhere">
                Ảnh khuôn mặt của người đón được lưu trữ bảo mật và chỉ dùng để giáo viên xác minh khi giao nhận con.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa người đón */}
      <PickupPersonFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        priority={formPriority}
        person={editingPerson}
        otherPersonCitizenId={
          formPriority === 1
            ? backupPerson?.citizenIdNumber
            : primaryPerson?.citizenIdNumber
        }
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      {/* Dialog xác nhận xóa người dự phòng */}
      <DeletePickupPersonDialog
        isOpen={Boolean(deletingPerson)}
        person={deletingPerson}
        isLoading={deleteMutation.isPending}
        onClose={() => setDeletingPerson(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
