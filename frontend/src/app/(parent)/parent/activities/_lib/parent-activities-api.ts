"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { ActivityPhotoPageResponse } from "@/types/media";
import {
  MY_CHILDREN_QUERY_KEY,
  useMyChildren,
} from "../../attendance/_lib/parent-attendance-api";

// Tái sử dụng query danh sách con từ màn hình điểm danh (frontend-conventions.md §1)
export { MY_CHILDREN_QUERY_KEY, useMyChildren };

export const childActivityPhotosQueryKey = (
  childId: string,
  page: number,
  pageSize: number
) => ["children", childId, "activity-photos", { page, pageSize }] as const;

// Ảnh hoạt động của lớp con đang học, mới nhất trước, phân trang ở server (FR-MEDIA-02, UC-MEDIA-02, AC-MEDIA-02).
// GET /api/children/{childId}/activity-photos?page=&pageSize=
// url của từng ảnh là URL ký hạn 60 phút (D53): không lưu lâu dài, hết hạn thì refetch trang đang xem.
export function useChildActivityPhotos(
  childId: string | null | undefined,
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: childId
      ? childActivityPhotosQueryKey(childId, page, pageSize)
      : ["children", "empty", "activity-photos"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ActivityPhotoPageResponse>>(
        `/api/children/${childId}/activity-photos`,
        { params: { page, pageSize } }
      );
      return res.data.data;
    },
    enabled: Boolean(childId),
    // Giữ trang cũ trong lúc tải trang mới của cùng một con (frontend-conventions.md §3.4).
    // Đổi con thì không giữ, để không hiện ảnh lớp của con trước dưới tên con vừa chọn
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === childId ? previousData : undefined,
    retry: false, // 404 là kết quả tra cứu bình thường (frontend-conventions.md §3.3)
  });
}
