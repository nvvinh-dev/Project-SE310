"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { SchoolChildResponse, UpdateHealthNotesRequest } from "@/types/health";
import { SCHOOL_CHILDREN_QUERY_KEY } from "../../health/_lib/health-api";

// Y tế ghi và cập nhật lưu ý sức khỏe của trẻ (FR-HEALTH-06, UC-HEALTH-05, AC-HEALTH-13)
// PUT /api/children/{childId}/health-notes
export function useUpdateHealthNotes(childId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateHealthNotesRequest) => {
      if (!childId) throw new Error("Chưa chọn trẻ.");
      const res = await apiClient.put<ApiResponse<SchoolChildResponse>>(
        `/api/children/${childId}/health-notes`,
        body
      );
      return res.data.data;
    },
    onSuccess: (updatedChild) => {
      if (!updatedChild) return;
      // Cập nhật trực tiếp trẻ vào cache school-children để ô chọn và SCR-MED-02 thấy ngay lưu ý mới
      // mà không phải chờ tải lại toàn bộ danh sách (ui-screens.md SCR-MED-03 Hành vi 2)
      queryClient.setQueryData<SchoolChildResponse[]>(
        SCHOOL_CHILDREN_QUERY_KEY,
        (oldList) => {
          if (!oldList) return oldList;
          return oldList.map((c) => (c.id === updatedChild.id ? updatedChild : c));
        }
      );
    },
    onError: () => {
      // Làm mới danh sách trẻ toàn trường cho mọi lỗi (frontend-conventions.md §3.2, §5)
      // Không rẽ nhánh theo status === 404 và không dùng exact: true để làm mới theo tiền tố
      void queryClient.invalidateQueries({
        queryKey: SCHOOL_CHILDREN_QUERY_KEY,
      });
    },
  });
}
