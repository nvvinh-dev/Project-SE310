"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  CreatePickupRequest,
  PickupPersonResponse,
  PickupResponse,
} from "@/types/pickup";
import {
  ATTENDANCES_QUERY_KEY,
  HOMEROOM_CHILDREN_QUERY_KEY,
} from "@/app/(teacher)/teacher/attendance/_lib/attendance-api";

// Re-export để các component của module đón về tiện sử dụng (frontend-conventions.md §1)
export {
  useHomeroomChildren,
  useAttendances,
} from "@/app/(teacher)/teacher/attendance/_lib/attendance-api";

export const PICKUPS_QUERY_KEY = ["pickups"] as const;

export const pickupsQueryKey = (date: string) =>
  [...PICKUPS_QUERY_KEY, { date }] as const;

export const pickupPersonsQueryKey = (childId: string) =>
  ["homeroom-children", childId, "pickup-persons"] as const;

/**
 * Lấy danh sách đón về của lớp chủ nhiệm trong ngày theo giờ Việt Nam
 * (GET /api/pickups?date=YYYY-MM-DD - FR-PICKUP-02)
 */
export function usePickups(date: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: pickupsQueryKey(date),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PickupResponse[]>>("/api/pickups", {
        params: { date },
      });
      return res.data.data ?? [];
    },
    enabled: options.enabled ?? Boolean(date),
  });
}

/**
 * Lấy danh sách người đón đã đăng ký của trẻ để giáo viên xác minh
 * (GET /api/homeroom-children/{childId}/pickup-persons - FR-PICKUP-02)
 * Trả người chính trước, dự phòng sau. URL ảnh có thời hạn 60 phút (D53).
 */
export function usePickupPersons(childId: string | null) {
  return useQuery({
    queryKey: childId ? pickupPersonsQueryKey(childId) : ["homeroom-children", "none", "pickup-persons"],
    queryFn: async () => {
      if (!childId) return [];
      const res = await apiClient.get<ApiResponse<PickupPersonResponse[]>>(
        `/api/homeroom-children/${childId}/pickup-persons`
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(childId),
  });
}

/**
 * Ghi nhận đón về (POST /api/pickups - FR-PICKUP-01)
 */
export function useCreatePickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreatePickupRequest) => {
      const res = await apiClient.post<ApiResponse<PickupResponse>>(
        "/api/pickups",
        request
      );
      return res.data.data;
    },
    onSuccess: (created) => {
      // Đưa ngay bản ghi đón về vào danh sách để trạng thái trẻ đổi ngay lập tức
      if (created) {
        // Cập nhật mọi query pickups đang có liên quan
        queryClient.setQueriesData<PickupResponse[]>(
          { queryKey: PICKUPS_QUERY_KEY },
          (old) => {
            if (!old) return [created];
            return [...old.filter((p) => p.childId !== created.childId), created];
          }
        );
      }
      void queryClient.invalidateQueries({ queryKey: PICKUPS_QUERY_KEY });
    },
    onError: () => {
      // 409: trẻ đã được đón ở máy khác, trẻ vắng, hoặc chưa điểm danh
      // 404: trẻ vừa bị chuyển khỏi lớp
      // Làm mới toàn bộ dữ liệu liên quan để đồng bộ trạng thái mới nhất
      void queryClient.invalidateQueries({ queryKey: PICKUPS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ATTENDANCES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: HOMEROOM_CHILDREN_QUERY_KEY });
    },
  });
}
