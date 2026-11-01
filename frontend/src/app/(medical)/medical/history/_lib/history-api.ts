"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { HealthHistoryResponse } from "@/types/health";
import type { IncidentResponse } from "@/types/incident";

export const HEALTH_HISTORY_QUERY_PREFIX = "health-history" as const;
export const INCIDENTS_QUERY_PREFIX = "incidents" as const;

export const healthHistoryQueryKey = (childId: string) =>
  ["school-children", childId, HEALTH_HISTORY_QUERY_PREFIX] as const;

export const incidentQueryKey = (incidentId: string) =>
  [INCIDENTS_QUERY_PREFIX, incidentId] as const;

// FR-HEALTH-04: Y tế xem lịch sử gộp sự cố, sức khỏe nhanh và số đo của một trẻ (mới nhất trước)
export function useHealthHistory(childId: string | null) {
  return useQuery({
    queryKey: childId ? healthHistoryQueryKey(childId) : [HEALTH_HISTORY_QUERY_PREFIX],
    queryFn: async () => {
      if (!childId) return null;
      const res = await apiClient.get<ApiResponse<HealthHistoryResponse>>(
        `/api/school-children/${childId}/health-history`
      );
      return res.data.data ?? null;
    },
    enabled: Boolean(childId),
    retry: false,
  });
}

// FR-HEALTH-04, AC-HEALTH-18: Y tế mở sự cố để xem ảnh (D39 mục 9, D53)
export function useIncident(incidentId: string | null) {
  return useQuery({
    queryKey: incidentId ? incidentQueryKey(incidentId) : [INCIDENTS_QUERY_PREFIX],
    queryFn: async () => {
      if (!incidentId) return null;
      const res = await apiClient.get<ApiResponse<IncidentResponse>>(
        `/api/incidents/${incidentId}`
      );
      return res.data.data ?? null;
    },
    enabled: Boolean(incidentId),
    retry: false,
  });
}
