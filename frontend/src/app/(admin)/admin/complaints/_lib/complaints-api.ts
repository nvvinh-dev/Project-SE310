"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  ComplaintPageResponse,
  ComplaintResponse,
  ComplaintStatus,
  HandleComplaintRequest,
} from "@/types/complaint";

export const COMPLAINTS_QUERY_KEY = ["complaints"] as const;

// Lọc và phân trang ở server (SCR-ADM-04 vùng 1, 3). Chọn Tất cả thì không gửi status. Giữ trang cũ
// trong lúc tải trang mới để danh sách không nháy về trạng thái đang tải
export function useComplaints(status: ComplaintStatus | "", page: number, pageSize: number) {
  return useQuery({
    queryKey: [...COMPLAINTS_QUERY_KEY, { status, page, pageSize }],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ComplaintPageResponse>>("/api/complaints", {
        params: { status: status || undefined, page, pageSize },
      });
      return res.data.data ?? { items: [], page, pageSize, totalCount: 0 };
    },
    placeholderData: keepPreviousData,
  });
}

// Chuyển sang đang xử lý hoặc đã xử lý kèm kết quả. Xong thì tải lại danh sách, kể cả khi lỗi: 409 là
// Admin khác vừa xử lý xong, 404 là phản ánh không còn, nên danh sách đang thấy đã cũ
export function useHandleComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: HandleComplaintRequest }) => {
      const res = await apiClient.put<ApiResponse<ComplaintResponse>>(`/api/complaints/${id}/handling`, body);
      const data = res.data.data;
      if (data === null) throw new Error("Phản hồi không có dữ liệu.");
      return data;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: COMPLAINTS_QUERY_KEY }),
  });
}
