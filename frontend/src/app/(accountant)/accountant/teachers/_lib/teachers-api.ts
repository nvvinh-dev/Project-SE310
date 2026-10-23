"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/auth";
import type { CreateTeacherRequest, TeacherAccountResponse, TeacherResponse } from "@/types/teacher";

export const TEACHERS_QUERY_KEY = ["teachers"] as const;
export const TEACHER_ACCOUNTS_QUERY_KEY = ["teacher-accounts"] as const;

// Backend trả danh sách đã sắp xếp theo họ tên
export function useTeachers() {
  return useQuery({
    queryKey: TEACHERS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TeacherResponse[]>>("/api/teachers");
      return res.data.data ?? [];
    },
  });
}

// Chỉ tài khoản Giáo viên đang hoạt động chưa có hồ sơ, theo họ tên. Chỉ hộp thoại lập hồ sơ gọi, nên chỉ
// tải khi mở hộp thoại
export function useTeacherAccounts() {
  return useQuery({
    queryKey: TEACHER_ACCOUNTS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TeacherAccountResponse[]>>("/api/teacher-accounts");
      return res.data.data ?? [];
    },
  });
}

// Tải lại cả hai danh sách kể cả khi lỗi: thành công thì tài khoản vừa lập rời danh sách chọn; 400 (tài
// khoản vừa bị vô hiệu hóa hay đổi vai trò) và 409 (Kế toán khác vừa lập hồ sơ) nghĩa là hai danh sách
// đang hiện đã cũ
export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateTeacherRequest) => {
      const res = await apiClient.post<ApiResponse<TeacherResponse>>("/api/teachers", body);
      const teacher = res.data.data;
      if (teacher === null) throw new Error("Phản hồi không có dữ liệu.");
      return teacher;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: TEACHER_ACCOUNTS_QUERY_KEY });
    },
  });
}
