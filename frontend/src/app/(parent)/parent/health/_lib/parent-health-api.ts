"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { ChildHealthResponse } from "@/types/health";
import type {
  ChildIncidentResponse,
  ChildIncidentSummaryResponse,
} from "@/types/incident";
import {
  MY_CHILDREN_QUERY_KEY,
  useMyChildren,
} from "../../attendance/_lib/parent-attendance-api";

// Tái sử dụng query danh sách con từ màn hình điểm danh để tránh trùng lặp code (frontend-conventions.md §1)
export { MY_CHILDREN_QUERY_KEY, useMyChildren };

export const childHealthQueryKey = (childId: string) =>
  ["children", childId, "health"] as const;

export const childIncidentsQueryKey = (childId: string) =>
  ["children", childId, "incidents"] as const;

export const childIncidentDetailQueryKey = (
  childId: string,
  incidentId: string
) => ["children", childId, "incidents", incidentId] as const;

// 1. Sức khỏe của con đã chọn: lưu ý, sức khỏe nhanh, số đo (FR-HEALTH-05, UC-HEALTH-04, AC-HEALTH-10)
export function useChildHealth(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId
      ? childHealthQueryKey(childId)
      : ["children", "empty", "health"],
    queryFn: async () => {
      if (!childId) return null;
      const res = await apiClient.get<ApiResponse<ChildHealthResponse>>(
        `/api/children/${childId}/health`
      );
      return res.data.data ?? null;
    },
    enabled: Boolean(childId),
    retry: false, // 404 hoặc 400 là kết quả tra cứu bình thường (frontend-conventions.md §3.3)
  });
}

// 2. Danh sách sự cố của con (FR-INCIDENT-03, UC-INCIDENT-02, D39 mục 10)
export function useChildIncidents(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId
      ? childIncidentsQueryKey(childId)
      : ["children", "empty", "incidents"],
    queryFn: async () => {
      if (!childId) return [];
      const res = await apiClient.get<
        ApiResponse<ChildIncidentSummaryResponse[]>
      >(`/api/children/${childId}/incidents`);
      return res.data.data ?? [];
    },
    enabled: Boolean(childId),
    retry: false,
  });
}

// 3. Chi tiết sự cố kèm ảnh có URL ký hạn 60 phút (FR-INCIDENT-03, AC-INCIDENT-07, D53)
export function useChildIncidentDetail(
  childId: string | null | undefined,
  incidentId: string | null | undefined
) {
  return useQuery({
    queryKey:
      childId && incidentId
        ? childIncidentDetailQueryKey(childId, incidentId)
        : ["children", "empty", "incident-detail"],
    queryFn: async () => {
      if (!childId || !incidentId) return null;
      const res = await apiClient.get<ApiResponse<ChildIncidentResponse>>(
        `/api/children/${childId}/incidents/${incidentId}`
      );
      return res.data.data ?? null;
    },
    enabled: Boolean(childId && incidentId),
    retry: false,
  });
}
