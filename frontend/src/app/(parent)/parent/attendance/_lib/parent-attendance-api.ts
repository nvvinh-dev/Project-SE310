"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { MyChildResponse } from "@/types/child";
import type { ChildAttendanceResponse } from "@/types/attendance";

export const MY_CHILDREN_QUERY_KEY = ["children", "mine"] as const;

export const childAttendancesQueryKey = (childId: string) =>
  ["children", childId, "attendances"] as const;

// Danh sách con của phụ huynh đang đăng nhập (FR-ATT-02, D45)
export function useMyChildren() {
  return useQuery({
    queryKey: MY_CHILDREN_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MyChildResponse[]>>("/api/children/mine");
      return res.data.data ?? [];
    },
  });
}

// Lịch sử điểm danh của đúng con đã chọn (FR-ATT-02, UC-ATT-02, AC-ATT-03, AC-ATT-04)
// Backend trả danh sách đã sắp xếp ngày mới nhất lên đầu
export function useChildAttendances(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId ? childAttendancesQueryKey(childId) : ["children", "empty", "attendances"],
    queryFn: async () => {
      if (!childId) return [];
      const res = await apiClient.get<ApiResponse<ChildAttendanceResponse[]>>(
        `/api/children/${childId}/attendances`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(childId),
    retry: false, // 404 hoặc 400 là kết quả tra cứu bình thường, không thử lại (frontend-conventions.md §3.3)
  });
}
