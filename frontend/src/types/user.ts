import type { Role } from "./auth";

// Phản chiếu UserResponse của backend: không bao giờ có mật khẩu hay hash (D45)
export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
}

// Vai trò bắt buộc chọn tường minh, không có giá trị mặc định (D43 mục 5)
export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

// Sửa tài khoản chỉ đổi họ tên và email (D39 mục 7)
export interface UpdateUserRequest {
  fullName: string;
  email: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface ChangeRoleRequest {
  role: Role;
}
