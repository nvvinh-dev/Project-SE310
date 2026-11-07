"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { MyChildResponse } from "@/types/child";
import type { ChildHealthResponse } from "@/types/health";
import type { IncidentResponse } from "@/types/incident";
import { MOCK_CHILD_INCIDENTS } from "./parent-health-mock";

export const MY_CHILDREN_QUERY_KEY = ["children", "mine"] as const;

export const childHealthQueryKey = (childId: string) =>
  ["children", childId, "health"] as const;

export const childIncidentsQueryKey = (childId: string) =>
  ["children", childId, "incidents"] as const;

// 1. Danh sách con của phụ huynh đang đăng nhập (FR-ATT-02, D45)
export function useMyChildren() {
  return useQuery({
    queryKey: MY_CHILDREN_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MyChildResponse[]>>("/api/children/mine");
      return res.data.data ?? [];
    },
  });
}

// 2. Sức khỏe của đúng con đã chọn (FR-HEALTH-05, UC-HEALTH-04, AC-HEALTH-10)
// api/parent-health.md: trả healthNotes, quickHealthStatuses, growthMeasurements
export function useChildHealth(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId ? childHealthQueryKey(childId) : ["children", "empty", "health"],
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

// 3. Sự cố của con (FR-INCIDENT-03, UC-INCIDENT-02, AC-INCIDENT-07)
// Trong thời gian chờ backend FR-INCIDENT-03, kết nối API thật và tự động fallback sang mock data
export function useChildIncidents(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId ? childIncidentsQueryKey(childId) : ["children", "empty", "incidents"],
    queryFn: async () => {
      if (!childId) return [];
      try {
        const res = await apiClient.get<ApiResponse<IncidentResponse[]>>(
          `/api/children/${childId}/incidents`
        );
        return res.data.data ?? [];
      } catch {
        // Fallback sang dữ liệu giả chuẩn docs/testing/testing-strategy.md §3.2
        return MOCK_CHILD_INCIDENTS.map((inc) => ({
          ...inc,
          childId: childId ?? "",
        }));
      }
    },
    enabled: Boolean(childId),
    retry: false,
  });
}
