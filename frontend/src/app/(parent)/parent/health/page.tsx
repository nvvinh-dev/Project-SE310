"use client";

import { useMemo, useState } from "react";
import { EmptyState, ErrorAlert, LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import {
  useChildHealth,
  useChildIncidents,
  useMyChildren,
} from "./_lib/parent-health-api";
import { ChildSelectHeader } from "./_components/ChildSelectHeader";
import { HealthNotesCard } from "./_components/HealthNotesCard";
import { QuickHealthTab } from "./_components/QuickHealthTab";
import { GrowthMeasurementTab } from "./_components/GrowthMeasurementTab";
import { IncidentTab } from "./_components/IncidentTab";

type HealthTab = "quickHealth" | "growth" | "incidents";

const TABS: { id: HealthTab; label: string }[] = [
  { id: "quickHealth", label: "Sức khỏe hằng ngày" },
  { id: "growth", label: "Chiều cao, cân nặng" },
  { id: "incidents", label: "Sự cố" },
];

export default function ParentHealthPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<HealthTab>("quickHealth");

  // 1. Tải danh sách con liên kết (FR-ATT-02, D45)
  const childrenQuery = useMyChildren();
  const childrenList = useMemo(
    () => childrenQuery.data ?? [],
    [childrenQuery.data]
  );

  const activeChildId = useMemo(() => {
    if (selectedChildId && childrenList.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return childrenList[0]?.id ?? "";
  }, [selectedChildId, childrenList]);

  // 2. Tải sức khỏe và sự cố của con đang chọn (FR-HEALTH-05, FR-INCIDENT-03)
  const healthQuery = useChildHealth(activeChildId);
  const incidentsQuery = useChildIncidents(activeChildId);

  const healthData = healthQuery.data;
  const incidentItems = useMemo(
    () => incidentsQuery.data ?? [],
    [incidentsQuery.data]
  );

  // Thử lại / làm mới: làm mới danh sách con trước, nếu con bị gỡ liên kết thì chuyển con (ui-screens.md §10)
  const handleRefresh = async () => {
    const childrenRes = await childrenQuery.refetch();
    if (childrenRes.isSuccess && childrenRes.data) {
      const latestChildren = childrenRes.data;
      if (activeChildId && !latestChildren.some((c) => c.id === activeChildId)) {
        setSelectedChildId(latestChildren[0]?.id ?? "");
        return;
      }
    }
    if (activeChildId) {
      void healthQuery.refetch();
      void incidentsQuery.refetch();
    }
  };

  const isChildrenInitialLoading =
    childrenQuery.isPending && childrenQuery.data === undefined;
  const isChildrenInitialError =
    childrenQuery.isError && childrenQuery.data === undefined;
  const childrenErrorMessage = childrenQuery.error
    ? toApiError(childrenQuery.error).message
    : null;

  const hasHealthData = Boolean(healthData);
  const isHealthInitialLoading = healthQuery.isPending && !hasHealthData;
  const isHealthInitialError = healthQuery.isError && !hasHealthData;
  const healthErrorMessage = healthQuery.error
    ? toApiError(healthQuery.error).message
    : null;

  const hasIncidentData = incidentsQuery.data !== undefined;
  const isIncidentInitialLoading =
    incidentsQuery.isPending && !hasIncidentData;
  const isIncidentInitialError =
    incidentsQuery.isError && !hasIncidentData;
  const incidentErrorMessage = incidentsQuery.error
    ? toApiError(incidentsQuery.error).message
    : null;

  if (isChildrenInitialLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner label="Đang tải danh sách con..." />
      </div>
    );
  }

  if (isChildrenInitialError) {
    return (
      <div className="py-8">
        <ErrorAlert
          title="Không thể tải danh sách con"
          message={childrenErrorMessage ?? ""}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  if (childrenList.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          title="Chưa liên kết trẻ"
          message="Tài khoản chưa được liên kết với trẻ nào. Liên hệ văn phòng nhà trường."
        />
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <ChildSelectHeader
        childrenList={childrenList}
        selectedChildId={activeChildId}
        onSelectChild={setSelectedChildId}
        isLoading={healthQuery.isPending}
      />

      {/* Cảnh báo lỗi làm mới khi vẫn giữ dữ liệu cũ trong cache theo từng tab */}
      {activeTab !== "incidents" &&
        hasHealthData &&
        healthQuery.isError &&
        healthErrorMessage && (
          <ErrorAlert
            title="Không thể làm mới dữ liệu sức khỏe"
            message={healthErrorMessage}
            onRetry={handleRefresh}
          />
        )}

      {activeTab === "incidents" &&
        hasIncidentData &&
        incidentsQuery.isError &&
        incidentErrorMessage && (
          <ErrorAlert
            title="Không thể làm mới dữ liệu sự cố"
            message={incidentErrorMessage}
            onRetry={handleRefresh}
          />
        )}

      {isHealthInitialLoading ? (
        <LoadingSpinner label="Đang tải thông tin sức khỏe..." />
      ) : isHealthInitialError ? (
        <ErrorAlert
          title="Không thể tải thông tin sức khỏe"
          message={healthErrorMessage ?? ""}
          onRetry={handleRefresh}
        />
      ) : (
        <>
          <HealthNotesCard healthNotes={healthData?.healthNotes} />

          <div className="space-y-4">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Các mục sức khỏe của con"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "bg-primary text-on-primary shadow-xs"
                        : "border border-slate-200/90 bg-surface-container-lowest text-on-surface-variant hover:bg-slate-100 hover:text-on-surface"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "quickHealth" && (
              <QuickHealthTab items={healthData?.quickHealthStatuses ?? []} />
            )}

            {activeTab === "growth" && (
              <GrowthMeasurementTab
                items={healthData?.growthMeasurements ?? []}
              />
            )}

            {activeTab === "incidents" &&
              (isIncidentInitialLoading ? (
                <LoadingSpinner label="Đang tải dữ liệu sự cố..." />
              ) : isIncidentInitialError ? (
                <ErrorAlert
                  title="Không thể tải dữ liệu sự cố"
                  message={incidentErrorMessage ?? ""}
                  onRetry={handleRefresh}
                />
              ) : (
                <IncidentTab
                  childId={activeChildId}
                  items={incidentItems}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
