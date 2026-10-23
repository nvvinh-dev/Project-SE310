"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ApiErrorAlert,
  Button,
  ErrorAlert,
  Icons,
  LoadingSpinner,
  NoticeBanner,
} from "@/components";
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

  // Banners & Errors
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<unknown | null>(null);
  const [submittingStepText, setSubmittingStepText] = useState<string>("");

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

  const selectedChild = useMemo(
    () => childrenList.find((c) => c.id === selectedChildId) ?? null,
    [childrenList, selectedChildId]
  );

  // Xử lý gửi Sức khỏe nhanh
  const handleQuickHealthSubmit = async (values: {
    mood: HealthMood;
    temperatureCelsius: number | null;
    notes: string;
  }): Promise<boolean> => {
    if (!selectedChildId) return false;
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
      setApiError(err);
      return false;
    }
  };

  // Xử lý gửi Sự cố (bao gồm cả tải ảnh nếu có)
  const handleIncidentSubmit = async (values: {
    occurredAtUtc: string;
    description: string;
    photos: File[];
  }): Promise<boolean> => {
    if (!selectedChildId) return false;
    setApiError(null);

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

      // Đính kèm ảnh sự cố nếu có ảnh đã chọn
      if (values.photos.length > 0) {
        setSubmittingStepText("Đang tải ảnh sự cố...");
        await attachPhotosMutation.mutateAsync({
          incidentId: createdIncident.id,
          files: values.photos,
        });
      }

      const childName = selectedChild ? selectedChild.fullName : "trẻ";
      setSuccessNotice(`Đã lưu sự cố cho ${childName}.`);
      return true;
    } catch (err) {
      setApiError(err);
      return false;
    } finally {
      setSubmittingStepText("");
    }
  };

  const isSubmittingHealth = createQuickHealthStatusMutation.isPending;
  const isSubmittingIncident =
    createIncidentMutation.isPending || attachPhotosMutation.isPending;

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

      {/* Trạng thái tải dữ liệu học sinh */}
      {childrenQuery.isLoading ? (
        <div className="p-12 text-center">
          <LoadingSpinner label="Đang tải danh sách học sinh của lớp..." />
        </div>
      ) : childrenQuery.isError ? (
        <ErrorAlert
          title="Không thể tải danh sách học sinh"
          message="Đã có lỗi xảy ra khi nạp danh sách học sinh của lớp. Vui lòng thử lại."
          onRetry={() => childrenQuery.refetch()}
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
              setApiError(null);
            }}
            disabled={isSubmittingHealth || isSubmittingIncident}
          />

          {/* [3] Form Sức khỏe nhanh hoặc [4] Form Ghi sự cố */}
          {activeTab === "health" ? (
            <QuickHealthStatusForm
              selectedChildId={selectedChildId}
              isSubmitting={isSubmittingHealth}
              onSubmit={handleQuickHealthSubmit}
            />
          ) : (
            <IncidentForm
              selectedChildId={selectedChildId}
              isSubmitting={isSubmittingIncident}
              submittingStepText={submittingStepText}
              onSubmit={handleIncidentSubmit}
            />
          )}
        </div>
      )}
    </div>
  );
}
