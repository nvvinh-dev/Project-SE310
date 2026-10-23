"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ApiErrorAlert,
  Button,
  EmptyState,
  ErrorAlert,
  Icons,
  LoadingSpinner,
  NoticeBanner,
} from "@/components";
import { toApiError } from "@/lib/axios";
import {
  useAttachIncidentPhotos,
  useCreateIncident,
  useCreateQuickHealthStatus,
  useHomeroomChildren,
} from "./_lib/quick-health-api";
import { QuickHealthTabs, type QuickHealthTab } from "./_components/QuickHealthTabs";
import { ChildSelector } from "./_components/ChildSelector";
import { QuickHealthStatusForm } from "./_components/QuickHealthStatusForm";
import { IncidentForm } from "./_components/IncidentForm";
import type { HealthMood } from "@/types/health";

export default function QuickHealthPage() {
  const [activeTab, setActiveTab] = useState<QuickHealthTab>("health");
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childSelectError, setChildSelectError] = useState<string | undefined>(undefined);

  // Banners & Errors
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<unknown | null>(null);
  const [submittingStepText, setSubmittingStepText] = useState<string>("");

  // Trạng thái lưu tạm sự cố đã tạo để chống nhân bản sự cố nếu upload ảnh thất bại
  const [pendingIncident, setPendingIncident] = useState<{
    id: string;
    childName: string;
  } | null>(null);

  // Dải thành công tự ẩn sau 6 giây theo onboarding-guide §4.0.2
  useEffect(() => {
    if (!successNotice) return;
    const timer = setTimeout(() => setSuccessNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [successNotice]);

  // Queries & Mutations
  const childrenQuery = useHomeroomChildren();
  const createQuickHealthStatusMutation = useCreateQuickHealthStatus();
  const createIncidentMutation = useCreateIncident();
  const attachPhotosMutation = useAttachIncidentPhotos();

  const childrenList = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);

  // Đồng bộ lại selectedChildId nếu danh sách trẻ thay đổi (ví dụ Admin vừa gỡ trẻ khỏi lớp - 404)
  const [prevChildrenList, setPrevChildrenList] = useState(childrenList);
  if (prevChildrenList !== childrenList) {
    setPrevChildrenList(childrenList);
    if (selectedChildId && !childrenList.some((c) => c.id === selectedChildId)) {
      setSelectedChildId("");
      setChildSelectError("Trẻ đã được chuyển lớp hoặc không còn trong danh sách lớp.");
    }
  }

  const selectedChild = useMemo(
    () => childrenList.find((c) => c.id === selectedChildId) ?? null,
    [childrenList, selectedChildId]
  );

  const validateChildSelection = (): boolean => {
    if (!selectedChildId) {
      setChildSelectError("Vui lòng chọn trẻ trong lớp.");
      return false;
    }
    setChildSelectError(undefined);
    return true;
  };

  // Xử lý gửi Sức khỏe nhanh
  const handleQuickHealthSubmit = async (values: {
    mood: HealthMood;
    temperatureCelsius: number | null;
    notes: string;
  }): Promise<boolean> => {
    if (!selectedChildId) {
      setChildSelectError("Vui lòng chọn trẻ trong lớp.");
      return false;
    }
    setApiError(null);

    try {
      await createQuickHealthStatusMutation.mutateAsync({
        childId: selectedChildId,
        mood: values.mood,
        temperatureCelsius: values.temperatureCelsius,
        notes: values.notes,
      });

      const childName = selectedChild ? selectedChild.fullName : "trẻ";
      setSuccessNotice(`Đã lưu tình trạng sức khỏe cho ${childName}.`);
      return true;
    } catch (err) {
      const parsed = toApiError(err);
      if (parsed.status === 404) {
        setSelectedChildId("");
        setChildSelectError("Trẻ không còn thuộc lớp chủ nhiệm của bạn.");
      }
      setApiError(err);
      return false;
    }
  };

  // Xử lý gửi Sự cố (Bước 1: Lưu sự cố -> Bước 2: Tải ảnh)
  // Xử lý lỗi nguyên tử: Lưu pendingIncident để tránh nhân bản sự cố khi tải ảnh thất bại
  const handleIncidentSubmit = async (values: {
    occurredAtUtc: string;
    description: string;
    photos: File[];
  }): Promise<boolean> => {
    if (!selectedChildId) {
      setChildSelectError("Vui lòng chọn trẻ trong lớp.");
      return false;
    }
    setApiError(null);

    const childName = selectedChild ? selectedChild.fullName : "trẻ";

    try {
      setSubmittingStepText("Đang lưu sự cố...");
      const createdIncident = await createIncidentMutation.mutateAsync({
        childId: selectedChildId,
        occurredAtUtc: values.occurredAtUtc,
        description: values.description,
      });

      if (!createdIncident?.id) {
        throw new Error("Không nhận được phản hồi hợp lệ từ máy chủ.");
      }

      // Đính kèm ảnh nếu có
      if (values.photos.length > 0) {
        setPendingIncident({ id: createdIncident.id, childName });
        setSubmittingStepText("Đang tải ảnh sự cố...");

        await attachPhotosMutation.mutateAsync({
          incidentId: createdIncident.id,
          files: values.photos,
        });

        // Tải ảnh thành công
        setPendingIncident(null);
        setSuccessNotice(`Đã lưu sự cố và ảnh cho ${childName}.`);
        return true;
      }

      // Không có ảnh đính kèm
      setPendingIncident(null);
      setSuccessNotice(`Đã lưu sự cố cho ${childName}.`);
      return true;
    } catch (err) {
      const parsed = toApiError(err);
      if (parsed.status === 404) {
        setSelectedChildId("");
        setChildSelectError("Trẻ không còn thuộc lớp chủ nhiệm của bạn.");
      }
      setApiError(err);
      return false;
    } finally {
      setSubmittingStepText("");
    }
  };

  // Thử lại việc tải ảnh riêng biệt cho sự cố đã lưu (tránh gọi lại API tạo sự cố)
  const handleRetryPhotosOnly = async (files: File[]): Promise<boolean> => {
    if (!pendingIncident) return false;
    setApiError(null);

    try {
      setSubmittingStepText("Đang thử lại tải ảnh...");
      await attachPhotosMutation.mutateAsync({
        incidentId: pendingIncident.id,
        files,
      });

      const childName = pendingIncident.childName;
      setPendingIncident(null);
      setSuccessNotice(`Đã tải ảnh sự cố thành công cho ${childName}.`);
      return true;
    } catch (err) {
      setApiError(err);
      return false;
    } finally {
      setSubmittingStepText("");
    }
  };

  // Bỏ qua ảnh khi tải ảnh gặp sự cố
  const handleSkipPhotos = () => {
    const childName = pendingIncident?.childName || "trẻ";
    setPendingIncident(null);
    setApiError(null);
    setSuccessNotice(`Đã hoàn tất ghi nhận sự cố cho ${childName} (không đính kèm ảnh).`);
  };

  const isSubmittingHealth = createQuickHealthStatusMutation.isPending;
  const isSubmittingIncident =
    createIncidentMutation.isPending || attachPhotosMutation.isPending;

  // Xử lý hiển thị theo ui-screens.md §4.2:
  // Chưa có dữ liệu thì hiện vòng quay / bảng lỗi đầy trang; đã có dữ liệu mà lần tải lại bị lỗi thì giữ dữ liệu cũ
  const hasData = childrenList.length > 0;
  const isInitialLoading = childrenQuery.isLoading && !hasData;
  const isInitialError = childrenQuery.isError && !hasData;

  return (
    <div className="py-8 space-y-6 max-w-4xl mx-auto">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Sức khỏe nhanh và sự cố
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Ghi nhận tình trạng sức khỏe trong ngày hoặc báo cáo sự cố xảy ra với trẻ trong lớp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => childrenQuery.refetch()}
            disabled={childrenQuery.isFetching}
            icon={<Icons.Refresh />}
          >
            Làm mới danh sách
          </Button>
        </div>
      </div>

      {/* Thông báo thành công */}
      {successNotice && (
        <NoticeBanner
          role="status"
          message={successNotice}
          onClose={() => setSuccessNotice(null)}
        />
      )}

      {/* Cảnh báo khi tải lại danh sách trẻ ngầm bị lỗi (giữ nguyên form và dữ liệu cũ) */}
      {childrenQuery.isError && hasData && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-amber-600 shrink-0"><Icons.Alert /></span>
            <span>Không thể làm mới danh sách học sinh. Danh sách hiện tại vẫn được giữ nguyên.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => childrenQuery.refetch()}
            disabled={childrenQuery.isFetching}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Thông báo lỗi từ API */}
      {Boolean(apiError) && (
        <div className="relative">
          <ApiErrorAlert error={apiError} />
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="absolute top-3 right-3 text-outline hover:text-on-surface p-1 rounded-full cursor-pointer"
            aria-label="Đóng thông báo lỗi"
          >
            <Icons.Close />
          </button>
        </div>
      )}

      {/* Trạng thái tải lần đầu hoặc lỗi tải lần đầu */}
      {isInitialLoading ? (
        <div className="p-12 text-center">
          <LoadingSpinner label="Đang tải danh sách học sinh của lớp..." />
        </div>
      ) : isInitialError ? (
        <ErrorAlert
          title="Không thể tải danh sách học sinh"
          message="Đã có lỗi xảy ra khi nạp danh sách học sinh của lớp. Vui lòng thử lại."
          onRetry={() => childrenQuery.refetch()}
        />
      ) : childrenList.length === 0 ? (
        /* Trạng thái rỗng theo ui-screens.md §2.3: Chưa có trẻ nào trong lớp chủ nhiệm */
        <EmptyState
          title="Chưa có trẻ nào trong lớp chủ nhiệm của bạn."
          message="Nếu bạn chưa được phân công lớp, liên hệ Ban giám hiệu."
          icon={<Icons.School />}
          actionText="Tải lại danh sách"
          onAction={() => childrenQuery.refetch()}
        />
      ) : (
        <div className="space-y-6">
          {/* [1] Hai thẻ chức năng */}
          <div className="flex justify-start">
            <QuickHealthTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* [2] Bộ chọn trẻ trong lớp (dùng chung cho cả 2 thẻ) */}
          <ChildSelector
            childrenList={childrenList}
            selectedChildId={selectedChildId}
            onSelectChild={(id) => {
              setSelectedChildId(id);
              setChildSelectError(undefined);
              setApiError(null);
            }}
            error={childSelectError}
            disabled={isSubmittingHealth || isSubmittingIncident}
          />

          {/* [3] Form Sức khỏe nhanh hoặc [4] Form Ghi sự cố */}
          {activeTab === "health" ? (
            <QuickHealthStatusForm
              isSubmitting={isSubmittingHealth}
              onValidateChild={validateChildSelection}
              onSubmit={handleQuickHealthSubmit}
            />
          ) : (
            <IncidentForm
              isSubmitting={isSubmittingIncident}
              submittingStepText={submittingStepText}
              pendingIncidentId={pendingIncident?.id ?? null}
              onValidateChild={validateChildSelection}
              onSubmit={handleIncidentSubmit}
              onRetryPhotosOnly={handleRetryPhotosOnly}
              onSkipPhotos={handleSkipPhotos}
            />
          )}
        </div>
      )}
    </div>
  );
}
