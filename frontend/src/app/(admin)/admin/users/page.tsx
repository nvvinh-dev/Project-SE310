"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Button,
  EmptyState,
  ErrorAlert,
  Icons,
  Input,
  LoadingSpinner,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableError,
  TableHead,
  TableHeader,
  TableLoading,
  TableRow,
} from "@/components";
import { ROLE_VIETNAMESE_LABELS } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { toApiError } from "@/lib/axios";
import type { Role } from "@/types/auth";
import type { UserResponse } from "@/types/user";
import { useUsers } from "./_lib/users-api";
import { ROLES, normalizeForSearch } from "./_lib/user-rules";
import { AccountStatusDialog } from "./_components/AccountStatusDialog";
import { ChangeRoleModal, ConfirmChangeRoleDialog } from "./_components/ChangeRoleModal";
import { ConfirmResetPasswordDialog, ResetPasswordModal } from "./_components/ResetPasswordModal";
import { RoleBadge, StatusBadge } from "./_components/UserBadges";
import { CreateUserModal, EditUserModal } from "./_components/UserFormModal";

const PAGE_SIZE = 10;
const TABLE_COLUMNS = 5;

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "Tất cả vai trò" },
  ...ROLES.map((role) => ({ value: role, label: ROLE_VIETNAMESE_LABELS[role] })),
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Đã vô hiệu hóa" },
];

interface FilterValues {
  search: string;
  role: Role | "";
  status: "" | "active" | "inactive";
}

const EMPTY_FILTERS: FilterValues = { search: "", role: "", status: "" };

// Mỗi lúc chỉ mở một hộp thoại. Đổi vai trò và đặt lại mật khẩu đi hai bước: nhập liệu rồi xác nhận
type DialogState =
  | { type: "create" }
  | { type: "edit"; user: UserResponse }
  | { type: "changeRole"; user: UserResponse }
  | { type: "confirmChangeRole"; user: UserResponse; role: Role }
  | { type: "resetPassword"; user: UserResponse }
  | { type: "confirmResetPassword"; user: UserResponse; newPassword: string }
  | { type: "setActive"; user: UserResponse; activate: boolean }
  | null;

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const usersQuery = useUsers();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { register, control, reset } = useForm<FilterValues>({ defaultValues: EMPTY_FILTERS });
  const [search, roleFilter, statusFilter] = useWatch({ control, name: ["search", "role", "status"] });
  const hasFilter = search.trim() !== "" || roleFilter !== "" || statusFilter !== "";

  // Đổi bộ lọc (kể cả xóa bộ lọc) thì quay về trang 1. Đặt lại ngay trong lúc render theo mẫu
  // "điều chỉnh state khi giá trị đầu vào đổi" của React, không cần thêm effect
  const filterKey = `${search}|${roleFilter}|${statusFilter}`;
  const [page, setPage] = useState(1);
  const [pageFilterKey, setPageFilterKey] = useState(filterKey);
  if (pageFilterKey !== filterKey) {
    setPageFilterKey(filterKey);
    setPage(1);
  }

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const users = usersQuery.data;

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const keyword = normalizeForSearch(search);

    return users.filter(
      (user) =>
        (keyword === "" ||
          normalizeForSearch(user.fullName).includes(keyword) ||
          normalizeForSearch(user.email).includes(keyword)) &&
        (roleFilter === "" || user.role === roleFilter) &&
        (statusFilter === "" || user.isActive === (statusFilter === "active"))
    );
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  // Danh sách ngắn lại (vô hiệu hóa rồi đang lọc "Đang hoạt động"...) thì không đứng ở trang đã hết dữ liệu
  const currentPage = Math.min(page, totalPages);
  const pageUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const isCurrentUser = (user: UserResponse) =>
    currentUser?.userId.toLowerCase() === user.id.toLowerCase();

  const closeDialog = () => setDialog(null);

  const finish = (message: string) => {
    setDialog(null);
    setNotice(message);
  };

  const actions: UserActionHandlers = {
    onEdit: (user) => setDialog({ type: "edit", user }),
    onChangeRole: (user) => setDialog({ type: "changeRole", user }),
    onResetPassword: (user) => setDialog({ type: "resetPassword", user }),
    onSetActive: (user, activate) => setDialog({ type: "setActive", user, activate }),
  };

  const isInitialLoading = usersQuery.isPending;
  // Lỗi khi chưa có dữ liệu thì thay cả danh sách; lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên
  const loadError = usersQuery.isError ? toApiError(usersQuery.error).message : null;
  const showFullError = loadError !== null && !users;
  const emptyTitle = hasFilter ? "Không tìm thấy tài khoản" : "Chưa có tài khoản nào";
  const emptyMessage = hasFilter
    ? "Không có tài khoản nào khớp với bộ lọc đang chọn."
    : "Bấm “Thêm tài khoản” để tạo tài khoản đầu tiên.";
  const emptyActionText = hasFilter ? "Xóa bộ lọc" : undefined;
  const clearFilters = () => reset(EMPTY_FILTERS);

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-on-surface">Tài khoản và vai trò</h1>
          <p className="text-sm text-on-surface-variant">
            Tạo tài khoản, sửa thông tin, đổi vai trò, đặt lại mật khẩu và vô hiệu hóa tài khoản người dùng.
          </p>
        </div>
        <Button onClick={() => setDialog({ type: "create" })} className="self-start sm:self-auto shrink-0">
          Thêm tài khoản
        </Button>
      </div>

      {notice && (
        <div
          role="status"
          className="rounded-2xl border border-primary/20 bg-primary-fixed/30 p-4 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <span className="text-primary shrink-0">
              <Icons.Check />
            </span>
            <p className="text-sm font-semibold text-on-surface">{notice}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Đóng thông báo"
            className="shrink-0 p-1 rounded-full text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
          >
            <Icons.Close />
          </button>
        </div>
      )}

      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_13rem_13rem]"
      >
        <div className="sm:col-span-2 xl:col-span-1">
          <Input
            type="search"
            aria-label="Tìm theo họ tên hoặc email"
            placeholder="Tìm theo họ tên hoặc email"
            autoComplete="off"
            {...register("search")}
          />
        </div>
        <Select aria-label="Lọc theo vai trò" options={ROLE_FILTER_OPTIONS} {...register("role")} />
        <Select aria-label="Lọc theo trạng thái" options={STATUS_FILTER_OPTIONS} {...register("status")} />
      </form>

      {loadError && users && (
        <ErrorAlert
          title="Không tải lại được danh sách"
          message={loadError}
          onRetry={() => void usersQuery.refetch()}
        />
      )}

      <div className="space-y-2">
        {/* Màn hình rộng (từ 1280px): bảng */}
        <div className="hidden xl:block">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Họ tên</TableHead>
                <TableHead className="hidden 2xl:table-cell">Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {isInitialLoading ? (
                <TableLoading colSpan={TABLE_COLUMNS} />
              ) : showFullError ? (
                <TableError colSpan={TABLE_COLUMNS} message={loadError} onRetry={() => void usersQuery.refetch()} />
              ) : pageUsers.length === 0 ? (
                <TableEmpty
                  colSpan={TABLE_COLUMNS}
                  title={emptyTitle}
                  message={emptyMessage}
                  actionText={emptyActionText}
                  onAction={clearFilters}
                />
              ) : (
                pageUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <UserIdentity user={user} isCurrentUser={isCurrentUser(user)} emailClassName="2xl:hidden" />
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell text-on-surface-variant">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge isActive={user.isActive} />
                    </TableCell>
                    <TableCell>
                      <UserActions
                        user={user}
                        isCurrentUser={isCurrentUser(user)}
                        handlers={actions}
                        className="min-w-60"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dưới 1280px (tablet, điện thoại, laptop nhỏ có sidebar): mỗi tài khoản một thẻ */}
        <div className="xl:hidden">
          {isInitialLoading ? (
            <LoadingSpinner label="Đang tải danh sách tài khoản..." />
          ) : showFullError ? (
            <ErrorAlert message={loadError} onRetry={() => void usersQuery.refetch()} />
          ) : pageUsers.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              message={emptyMessage}
              actionText={emptyActionText}
              onAction={clearFilters}
            />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {pageUsers.map((user) => (
                <li
                  key={user.id}
                  className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm space-y-3"
                >
                  <UserIdentity user={user} isCurrentUser={isCurrentUser(user)} />
                  <div className="flex flex-wrap items-center gap-2">
                    <RoleBadge role={user.role} />
                    <StatusBadge isActive={user.isActive} />
                  </div>
                  <UserActions
                    user={user}
                    isCurrentUser={isCurrentUser(user)}
                    handlers={actions}
                    className="border-t border-slate-100 pt-3"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isInitialLoading && !showFullError && filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {dialog?.type === "create" && (
        <CreateUserModal
          onClose={closeDialog}
          onSuccess={(user) => finish(`Đã tạo tài khoản cho ${user.fullName}.`)}
        />
      )}

      {dialog?.type === "edit" && (
        <EditUserModal
          user={dialog.user}
          onClose={closeDialog}
          onSuccess={(user) => finish(`Đã cập nhật tài khoản ${user.fullName}.`)}
        />
      )}

      {dialog?.type === "changeRole" && (
        <ChangeRoleModal
          user={dialog.user}
          onClose={closeDialog}
          onNext={(role) => setDialog({ type: "confirmChangeRole", user: dialog.user, role })}
        />
      )}

      {dialog?.type === "confirmChangeRole" && (
        <ConfirmChangeRoleDialog
          user={dialog.user}
          role={dialog.role}
          onClose={closeDialog}
          onSuccess={(user) =>
            finish(`Đã đổi vai trò của ${user.fullName} sang ${ROLE_VIETNAMESE_LABELS[user.role]}.`)
          }
        />
      )}

      {dialog?.type === "resetPassword" && (
        <ResetPasswordModal
          user={dialog.user}
          onClose={closeDialog}
          onNext={(newPassword) => setDialog({ type: "confirmResetPassword", user: dialog.user, newPassword })}
        />
      )}

      {dialog?.type === "confirmResetPassword" && (
        <ConfirmResetPasswordDialog
          user={dialog.user}
          newPassword={dialog.newPassword}
          isCurrentUser={isCurrentUser(dialog.user)}
          onClose={closeDialog}
          onSuccess={(user) => finish(`Đã đặt lại mật khẩu cho ${user.fullName}.`)}
        />
      )}

      {dialog?.type === "setActive" && (
        <AccountStatusDialog
          user={dialog.user}
          activate={dialog.activate}
          onClose={closeDialog}
          onSuccess={(user) =>
            finish(
              user.isActive
                ? `Đã mở lại tài khoản ${user.fullName}.`
                : `Đã vô hiệu hóa tài khoản ${user.fullName}.`
            )
          }
        />
      )}
    </div>
  );
}

function UserIdentity({
  user,
  isCurrentUser,
  emailClassName = "",
}: {
  user: UserResponse;
  isCurrentUser: boolean;
  emailClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 shrink-0 rounded-full bg-surface-container-low text-primary flex items-center justify-center font-bold">
        {user.fullName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-on-surface break-words">{user.fullName}</span>
          {isCurrentUser && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-primary">
              Bạn
            </span>
          )}
        </div>
        <p className={`text-xs text-on-surface-variant wrap-anywhere ${emailClassName}`}>{user.email}</p>
      </div>
    </div>
  );
}

interface UserActionHandlers {
  onEdit: (user: UserResponse) => void;
  onChangeRole: (user: UserResponse) => void;
  onResetPassword: (user: UserResponse) => void;
  onSetActive: (user: UserResponse, activate: boolean) => void;
}

// Ẩn đổi vai trò và vô hiệu hóa trên chính tài khoản đang đăng nhập; backend vẫn chặn bằng 409 (D39 mục 7)
function UserActions({
  user,
  isCurrentUser,
  handlers,
  className = "",
}: {
  user: UserResponse;
  isCurrentUser: boolean;
  handlers: UserActionHandlers;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <Button size="sm" variant="outline" onClick={() => handlers.onEdit(user)}>
        Sửa
      </Button>
      {!isCurrentUser && (
        <Button size="sm" variant="outline" onClick={() => handlers.onChangeRole(user)}>
          Đổi vai trò
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={() => handlers.onResetPassword(user)}>
        Đặt lại mật khẩu
      </Button>
      {!isCurrentUser &&
        (user.isActive ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlers.onSetActive(user, false)}
            className="text-error! hover:bg-error-container!"
          >
            Vô hiệu hóa
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlers.onSetActive(user, true)}
            className="text-primary! hover:bg-primary-fixed/40!"
          >
            Mở lại
          </Button>
        ))}
    </div>
  );
}
