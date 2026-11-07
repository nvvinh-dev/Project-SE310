"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { MyChildResponse } from "@/types/child";
import type { ChildHealthResponse } from "@/types/health";
import type { IncidentResponse } from "@/types/incident";

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

// 2. Sức khỏe của con đã chọn: lưu ý, sức khỏe nhanh, số đo (FR-HEALTH-05, UC-HEALTH-04, AC-HEALTH-10)
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
export function useChildIncidents(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId ? childIncidentsQueryKey(childId) : ["children", "empty", "incidents"],
    queryFn: async () => {
      if (!childId) return [];
      const res = await apiClient.get<ApiResponse<IncidentResponse[]>>(
        `/api/children/${childId}/incidents`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(childId),
    retry: false,
  });
}
