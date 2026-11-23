"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { AbsenceEscalationResponse } from "@/types/absence";

// Trang SCR-ADM-06 và số đếm trên menu Admin dùng chung key này, nên chỉ gọi API một lần
export const ABSENCE_ESCALATIONS_QUERY_KEY = ["absence-escalations", "today"] as const;

// Danh sách thay đổi trong ngày (giáo viên ghi liên hệ, qua 10:00 thêm trẻ chưa liên hệ) mà không có
// thông báo đẩy, nên tải lại mỗi 5 phút và khi quay lại tab
const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

// GET /api/absence-escalations/today (FR-ATT-04, D39 mục 20). "Hôm nay" theo giờ Việt Nam do server tính,
// không gửi tham số ngày
export function useAbsenceEscalations() {
  return useQuery({
    queryKey: ABSENCE_ESCALATIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AbsenceEscalationResponse[]>>("/api/absence-escalations/today");
      return res.data.data ?? [];
    },
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}
