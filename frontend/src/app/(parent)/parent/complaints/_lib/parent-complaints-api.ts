"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { ChildComplaintResponse, CreateComplaintRequest } from "@/types/complaint";
import {
  MY_CHILDREN_QUERY_KEY,
  useMyChildren,
} from "../../attendance/_lib/parent-attendance-api";

// Dùng lại query danh sách con của màn hình điểm danh phụ huynh (frontend-conventions.md §1)
export { MY_CHILDREN_QUERY_KEY, useMyChildren };

export const childComplaintsQueryKey = (childId: string) =>
  ["children", childId, "complaints"] as const;

/**
 * Phản ánh của con, gồm cả phản ánh do phụ huynh khác của con gửi (FR-COMPLAINT-01, AC-COMPLAINT-01)
 * GET /api/children/{childId}/complaints — mới nhất trước, không phân trang (D39 mục 18)
 */
export function useChildComplaints(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId ? childComplaintsQueryKey(childId) : ["children", "empty", "complaints"],
    queryFn: async () => {
      if (!childId) return [];
      const res = await apiClient.get<ApiResponse<ChildComplaintResponse[]>>(
        `/api/children/${childId}/complaints`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(childId),
    retry: false, // 404 (con vừa bị gỡ liên kết) là kết quả bình thường (frontend-conventions.md §3.3)
  });
}

export interface CreateComplaintVariables {
  childId: string;
  body: CreateComplaintRequest;
}

// POST /api/children/{childId}/complaints, chỉ gửi { content } (D44). Xong hay lỗi đều tải lại phản ánh
// của con (SCR-PAR-09 Hành vi 3); trang lo tải lại danh sách con khi lỗi (ui-screens.md §10)
export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, body }: CreateComplaintVariables) => {
      const res = await apiClient.post<ApiResponse<ChildComplaintResponse>>(
        `/api/children/${childId}/complaints`,
        body
      );
      return res.data.data;
    },
    onSettled: (_data, _error, variables) =>
      queryClient.invalidateQueries({ queryKey: childComplaintsQueryKey(variables.childId) }),
  });
}
