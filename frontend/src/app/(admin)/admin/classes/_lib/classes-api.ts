"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type {
  AssignClassRequest,
  AssignHomeroomTeacherRequest,
  ClassPlacementResponse,
  ClassResponse,
} from "@/types/class";
import { USERS_QUERY_KEY } from "../../users/_lib/users-api";

export const CLASSES_QUERY_KEY = ["classes"] as const;
export const CLASS_PLACEMENTS_QUERY_KEY = ["class-placements"] as const;

// Thao tác ghi thành công luôn trả bản ghi sau khi đổi; thiếu data thì coi như lỗi
function unwrap<T>(res: { data: ApiResponse<T> }): T {
  const data = res.data.data;
  if (data === null) throw new Error("Phản hồi không có dữ liệu.");
  return data;
}

export function useClasses() {
  return useQuery({
    queryKey: CLASSES_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ClassResponse[]>>("/api/classes");
      return res.data.data ?? [];
    },
  });
}

// Trẻ toàn trường kèm lớp hiện tại, gồm cả trẻ chưa xếp lớp. Trẻ chưa có hồ sơ thì không có ở đây
export function useClassPlacements() {
  return useQuery({
    queryKey: CLASS_PLACEMENTS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ClassPlacementResponse[]>>("/api/class-placements");
      return res.data.data ?? [];
    },
  });
}

// Gán, đổi hay bỏ (teacherUserId = null) giáo viên chủ nhiệm. Thành công thì thay ngay lớp đó bằng bản
// ghi API trả về, không chờ tải lại. Xong thì tải lại danh sách lớp, kể cả khi lỗi: 404, 409 thường do
// Admin khác vừa đổi lớp đó. Lỗi thì tải lại cả danh sách tài khoản, vì tài khoản được chọn có thể vừa
// bị vô hiệu hóa hay đổi vai trò
export function useAssignHomeroomTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, body }: { classId: string; body: AssignHomeroomTeacherRequest }) =>
      unwrap(await apiClient.put<ApiResponse<ClassResponse>>(`/api/classes/${classId}/homeroom-teacher`, body)),
    onSuccess: (updated) =>
      queryClient.setQueryData<ClassResponse[]>(CLASSES_QUERY_KEY, (classes) =>
        classes?.map((cls) => (cls.id === updated.id ? updated : cls))
      ),
    onError: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CLASSES_QUERY_KEY }),
  });
}

// Xếp, chuyển hay gỡ (classId = null) lớp của một trẻ. Thành công thì thay ngay dòng của trẻ bằng bản
// ghi API trả về. Tải lại danh sách cả khi lỗi: 409 "ngày sinh vừa được cập nhật" hay 404 trẻ không
// còn thì danh sách đang hiện đã cũ
export function useAssignClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childId, body }: { childId: string; body: AssignClassRequest }) =>
      unwrap(await apiClient.put<ApiResponse<ClassPlacementResponse>>(`/api/class-placements/${childId}`, body)),
    onSuccess: (updated) =>
      queryClient.setQueryData<ClassPlacementResponse[]>(CLASS_PLACEMENTS_QUERY_KEY, (placements) =>
        placements?.map((placement) => (placement.childId === updated.childId ? updated : placement))
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CLASS_PLACEMENTS_QUERY_KEY }),
  });
}
