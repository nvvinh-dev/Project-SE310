"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  AbsenceFollowUpResponse,
  AbsenceTodayResponse,
  CreateAbsenceFollowUpRequest,
} from "@/types/absence";

// Trang SCR-TCH-07 và số đếm trên menu Giáo viên dùng chung key này, nên chỉ gọi API một lần
export const ABSENCES_TODAY_QUERY_KEY = ["absence-follow-ups", "today"] as const;

// Danh sách đổi trong ngày khi trẻ được ghi vắng không phép (có thể ở máy khác) hay giáo viên khác của lớp
// ghi liên hệ, mà không có thông báo đẩy, nên tải lại mỗi 5 phút và khi quay lại tab
const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

// GET /api/absence-follow-ups/today (FR-ATT-04, D39 mục 20). Backend lọc theo lớp giáo viên phụ trách và
// tính "hôm nay" theo giờ Việt Nam, nên không gửi id lớp hay ngày
export function useAbsencesToday() {
  return useQuery({
    queryKey: ABSENCES_TODAY_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AbsenceTodayResponse[]>>("/api/absence-follow-ups/today");
      return res.data.data ?? [];
    },
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}

// POST /api/attendances/{id}/follow-ups: ghi một lần liên hệ người đón. Người ghi và giờ ghi do server đặt
// (D44 mục 2); lần đã ghi không sửa, không xóa (BR-ATTENDANCE-07)
export function useCreateAbsenceFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attendanceId, request }: { attendanceId: string; request: CreateAbsenceFollowUpRequest }) => {
      const res = await apiClient.post<ApiResponse<AbsenceFollowUpResponse>>(
        `/api/attendances/${attendanceId}/follow-ups`,
        request
      );
      return res.data.data;
    },
    onSuccess: (created, { attendanceId }) => {
      // Thêm ngay lần vừa ghi vào trẻ để kết quả sau cùng đổi liền, không chờ tải lại
      if (created) {
        queryClient.setQueryData<AbsenceTodayResponse[]>(ABSENCES_TODAY_QUERY_KEY, (old) =>
          old?.map((absence) =>
            absence.attendanceId === attendanceId
              ? { ...absence, followUps: [...absence.followUps, created] }
              : absence
          )
        );
      }
      void queryClient.invalidateQueries({ queryKey: ABSENCES_TODAY_QUERY_KEY });
    },
    onError: () => {
      // 409 (bản điểm danh không còn là vắng không phép của hôm nay) hay lỗi khác: không rẽ nhánh theo mã
      // lỗi, lần nào cũng tải lại danh sách (ui-screens.md SCR-TCH-07, Hành vi 3)
      void queryClient.invalidateQueries({ queryKey: ABSENCES_TODAY_QUERY_KEY });
    },
  });
}
