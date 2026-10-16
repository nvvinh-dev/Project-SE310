"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  AttendanceResponse,
  CheckInRequest,
  HomeroomChildResponse,
} from "@/types/attendance";

export const HOMEROOM_CHILDREN_QUERY_KEY = ["homeroom-children"] as const;
// Mọi query điểm danh dùng chung tiền tố này: điểm danh xong thì làm mới cả màn hình lịch sử
export const ATTENDANCES_QUERY_KEY = ["attendances"] as const;

// Luôn gửi đúng một trong hai tham số; không gửi classId (ui-screens.md SCR-TCH-02 Hành vi 1, 2)
export type AttendanceQuery = { date: string } | { childId: string };

export const attendancesQueryKey = (query: AttendanceQuery) =>
  [...ATTENDANCES_QUERY_KEY, query] as const;

export function useHomeroomChildren() {
  return useQuery({
    queryKey: HOMEROOM_CHILDREN_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<HomeroomChildResponse[]>>(
        "/api/homeroom-children"
      );
      return res.data.data ?? [];
    },
  });
}

// query = null khi chưa đủ điều kiện gọi (ví dụ đang xem theo trẻ mà chưa chọn trẻ)
export function useAttendances(
  query: AttendanceQuery | null,
  options: { retry?: boolean } = {}
) {
  return useQuery({
    queryKey: query ? attendancesQueryKey(query) : [...ATTENDANCES_QUERY_KEY, "none"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AttendanceResponse[]>>("/api/attendances", {
        params: query,
      });
      return res.data.data ?? [];
    },
    enabled: query !== null,
    retry: options.retry,
  });
}

export function useCheckInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CheckInRequest) => {
      const res = await apiClient.post<ApiResponse<AttendanceResponse>>(
        "/api/attendances",
        request
      );
      return res.data.data;
    },
    onSuccess: (created) => {
      // Đưa ngay bản ghi vừa tạo vào danh sách hôm nay để ba nút biến mất trước khi tải lại xong,
      // tránh bấm lần hai (SCR-TCH-01 Hành vi 2)
      if (created) {
        queryClient.setQueryData<AttendanceResponse[]>(
          attendancesQueryKey({ date: created.attendanceDate }),
          (old) =>
            old ? [...old.filter((a) => a.childId !== created.childId), created] : old
        );
      }
      void queryClient.invalidateQueries({ queryKey: ATTENDANCES_QUERY_KEY });
    },
    onError: () => {
      // 409: trẻ đã được điểm danh ở máy khác → cần điểm danh mới nhất. 404: trẻ vừa bị chuyển
      // khỏi lớp → cần danh sách lớp mới nhất (SCR-TCH-01 Hành vi 3). Làm mới cả hai, không rẽ
      // nhánh theo mã lỗi.
      void queryClient.invalidateQueries({ queryKey: ATTENDANCES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: HOMEROOM_CHILDREN_QUERY_KEY });
    },
  });
}
