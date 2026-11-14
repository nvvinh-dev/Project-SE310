"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { RevenueReportResponse } from "@/types/revenue";

// Cùng tiền tố với REVENUE_REPORTS_QUERY_KEY của màn hình học phí (SCR-ACC-02): lập, sửa hóa đơn hay ghi nhận thanh
// toán ở đó thì báo cáo này tự làm mới (frontend-conventions.md §3.2)
export const CURRENT_REVENUE_REPORT_QUERY_KEY = ["revenue-reports", "current"] as const;

// FR-TUITION-03: báo cáo của tháng hiện tại, không có tham số (D39 mục 12)
export function useCurrentRevenueReport() {
  return useQuery({
    queryKey: CURRENT_REVENUE_REPORT_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<RevenueReportResponse>>("/api/revenue-reports/current");
      const data = res.data.data;
      if (data === null) throw new Error("Phản hồi không có dữ liệu.");
      return data;
    },
  });
}
