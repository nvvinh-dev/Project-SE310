"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { SchoolClosureRequest, SchoolClosureResponse } from "@/types/notification";

// FR-NOTI-03: phát tới mọi phụ huynh đang hoạt động, trả số người nhận. Không làm mới query nào: màn hình không đọc
// dữ liệu, Kế toán không nhận thông báo và không có danh sách thông báo đã gửi (SCR-ACC-07, Hành vi 3)
export function useBroadcastSchoolClosure() {
  return useMutation({
    mutationFn: async (body: SchoolClosureRequest) => {
      const res = await apiClient.post<ApiResponse<SchoolClosureResponse>>(
        "/api/notifications/school-closures",
        body
      );
      const data = res.data.data;
      if (data === null) throw new Error("Phản hồi không có dữ liệu.");
      return data;
    },
  });
}
