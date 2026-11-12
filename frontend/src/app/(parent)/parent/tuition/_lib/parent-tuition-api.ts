"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { ChildInvoiceResponse } from "@/types/tuition";
import {
  MY_CHILDREN_QUERY_KEY,
  useMyChildren,
} from "../../attendance/_lib/parent-attendance-api";

// Tái sử dụng query danh sách con từ màn hình điểm danh (frontend-conventions.md §1)
export { MY_CHILDREN_QUERY_KEY, useMyChildren };

export const childInvoicesQueryKey = (childId: string) =>
  ["children", childId, "invoices"] as const;

// Danh sách hóa đơn học phí của con đã chọn (FR-TUITION-05, UC-TUITION-04, AC-TUITION-05)
// Mới lập trước, không phân trang (ui-screens.md SCR-PAR-06)
export function useChildInvoices(childId: string | null | undefined) {
  return useQuery({
    queryKey: childId ? childInvoicesQueryKey(childId) : ["children", "empty", "invoices"],
    queryFn: async () => {
      if (!childId) return [];
      const res = await apiClient.get<ApiResponse<ChildInvoiceResponse[]>>(
        `/api/children/${childId}/invoices`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(childId),
    retry: false, // 404 là kết quả tra cứu bình thường khi trẻ chưa liên kết hoặc bị gỡ (frontend-conventions.md §3.3)
  });
}
