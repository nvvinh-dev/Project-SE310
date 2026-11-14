"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  ActivityPhotoResponse,
  HomeroomClassResponse,
} from "@/types/media";

export const HOMEROOM_CLASSES_QUERY_KEY = ["homeroom-classes"] as const;

// Các lớp giáo viên phụ trách để chọn lớp chia sẻ ảnh (FR-MEDIA-01, D40 mục 2).
// Chưa được gán lớp nào thì danh sách rỗng
export function useHomeroomClasses() {
  return useQuery({
    queryKey: HOMEROOM_CLASSES_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<HomeroomClassResponse[]>>(
        "/api/homeroom-classes"
      );
      return res.data.data ?? [];
    },
  });
}

// Chia sẻ 1–5 ảnh cho một lớp, multipart trường photos (D39 mục 5). Lớp không thuộc mình → 404
export function useShareActivityPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classId,
      files,
    }: {
      classId: string;
      files: File[];
    }) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append("photos", file);
      }

      const res = await apiClient.post<ApiResponse<ActivityPhotoResponse[]>>(
        `/api/classes/${classId}/activity-photos`,
        formData
      );
      return res.data.data ?? [];
    },
    // Làm mới danh sách lớp kể cả khi lỗi: 404 thường do giáo viên vừa bị gỡ khỏi lớp
    // (frontend-conventions §3.2)
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: HOMEROOM_CLASSES_QUERY_KEY,
      });
    },
  });
}
