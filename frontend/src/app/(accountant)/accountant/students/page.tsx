"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Button,
  EmptyState,
  ErrorAlert,
  Input,
  LoadingSpinner,
  Pagination,
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
import { toApiError } from "@/lib/axios";
import { formatVietnamShortDate } from "@/lib/datetime";
import { normalizeForSearch } from "@/lib/text";
import type { ChildResponse, GuardianResponse } from "@/types/child";
import { useChildren } from "./_lib/children-api";
import { ChildFormModal } from "./_components/ChildFormModal";
import { GuardiansModal } from "./_components/GuardiansModal";
import { NoticeBanner } from "./_components/NoticeBanner";
import { UnlinkGuardianDialog } from "./_components/UnlinkGuardianDialog";

// Cỡ trang mặc định của frontend-conventions.md §3.4; SCR-ACC-04 không ghi cỡ riêng
const PAGE_SIZE = 20;
const TABLE_COLUMNS = 4;

interface FilterValues {
  search: string;
}

const EMPTY_FILTERS: FilterValues = { search: "" };

// Mỗi lúc chỉ mở một hộp thoại. Gỡ liên kết thay hộp thoại phụ huynh bằng hộp thoại xác nhận, xong hay hủy
// thì quay lại hộp thoại phụ huynh của trẻ đó
type DialogState =
  | { type: "create" }
  | { type: "edit"; child: ChildResponse }
  | { type: "guardians"; child: ChildResponse }
  | { type: "unlink"; child: ChildResponse; guardian: GuardianResponse }
  | null;

export default function StudentsPage() {
  const childrenQuery = useChildren();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { register, control, reset } = useForm<FilterValues>({ defaultValues: EMPTY_FILTERS });
  const search = useWatch({ control, name: "search" });
  const hasFilter = search.trim() !== "";

  // Đổi ô tìm (kể cả xóa bộ lọc) thì quay về trang 1, đặt lại ngay trong lúc render như SCR-ADM-02
  const [page, setPage] = useState(1);
  const [pageSearch, setPageSearch] = useState(search);
  if (pageSearch !== search) {
    setPageSearch(search);
    setPage(1);
  }

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const children = childrenQuery.data;

  // Tìm theo họ tên ở client, không phân biệt dấu, trên toàn bộ danh sách rồi mới cắt trang; giữ thứ tự
  // backend trả về
  const filteredChildren = useMemo(() => {
    if (!children) return [];
    const keyword = normalizeForSearch(search);
    return children.filter((child) => keyword === "" || normalizeForSearch(child.fullName).includes(keyword));
  }, [children, search]);

  const totalPages = Math.max(1, Math.ceil(filteredChildren.length / PAGE_SIZE));
  // Danh sách ngắn lại sau khi tìm hay tải lại thì không đứng ở trang đã hết dữ liệu
  const currentPage = Math.min(page, totalPages);
  const pageChildren = filteredChildren.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const closeDialog = () => setDialog(null);
  const isGuardianDialog = dialog?.type === "guardians" || dialog?.type === "unlink";

  const finish = (message: string) => {
    setDialog(null);
    setNotice(message);
  };

  const actions: ChildActionHandlers = {
    onEdit: (child) => setDialog({ type: "edit", child }),
    onGuardians: (child) => {
      setNotice(null);
      setDialog({ type: "guardians", child });
    },
  };

  const isInitialLoading = childrenQuery.isPending;
  // Lỗi khi chưa có dữ liệu thì thay cả danh sách; lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên
  const loadError = childrenQuery.isError ? toApiError(childrenQuery.error).message : null;
  const showFullError = loadError !== null && !children;
  const retryChildren = () => void childrenQuery.refetch();
  const emptyTitle = hasFilter ? "Không tìm thấy trẻ" : "Chưa có hồ sơ trẻ nào";
  const emptyMessage = hasFilter
    ? "Không có trẻ nào khớp với họ tên đang tìm."
    : "Bấm “Thêm hồ sơ trẻ” để lập hồ sơ nhập học đầu tiên.";
  const emptyActionText = hasFilter ? "Xóa bộ lọc" : undefined;
  const clearFilters = () => reset(EMPTY_FILTERS);

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-on-surface">Hồ sơ trẻ và phụ huynh</h1>
          <p className="text-sm text-on-surface-variant">
            Lập, sửa hồ sơ nhập học của trẻ và liên kết tài khoản phụ huynh với trẻ.
          </p>
        </div>
        <Button
          onClick={() => setDialog({ type: "create" })}
          className="self-start sm:self-auto shrink-0 min-h-11 sm:min-h-0"
        >
          Thêm hồ sơ trẻ
        </Button>
      </div>

      {/* Hộp thoại phụ huynh tự hiện thông báo bên trong, phía dưới lớp phủ thì không cần hiện nữa */}
      {notice && !isGuardianDialog && <NoticeBanner message={notice} onClose={() => setNotice(null)} />}

      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm"
      >
        <Input
          type="search"
          aria-label="Tìm theo họ tên"
          placeholder="Tìm theo họ tên"
          autoComplete="off"
          {...register("search")}
        />
      </form>

      {loadError && children && (
        <ErrorAlert title="Không tải lại được danh sách trẻ" message={loadError} onRetry={retryChildren} />
      )}

      <div className="space-y-2">
        {/* Màn hình rộng (từ 1280px): bảng */}
        <div className="hidden xl:block">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Họ tên</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Ngày nhập học</TableHead>
                <TableHead>Thao tác</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {isInitialLoading ? (
                <TableLoading colSpan={TABLE_COLUMNS} />
              ) : showFullError ? (
                <TableError colSpan={TABLE_COLUMNS} message={loadError} onRetry={retryChildren} />
              ) : pageChildren.length === 0 ? (
                <TableEmpty
                  colSpan={TABLE_COLUMNS}
                  title={emptyTitle}
                  message={emptyMessage}
                  actionText={emptyActionText}
                  onAction={clearFilters}
                />
              ) : (
                pageChildren.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-semibold break-words">{child.fullName}</TableCell>
                    <TableCell className="text-on-surface-variant whitespace-nowrap">
                      {formatVietnamShortDate(child.dateOfBirth)}
                    </TableCell>
                    <TableCell className="text-on-surface-variant whitespace-nowrap">
                      {formatVietnamShortDate(child.enrollmentDate)}
                    </TableCell>
                    <TableCell>
                      <ChildActions child={child} handlers={actions} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dưới 1280px (tablet, điện thoại, laptop nhỏ có sidebar): mỗi trẻ một thẻ */}
        <div className="xl:hidden">
          {isInitialLoading ? (
            <LoadingSpinner label="Đang tải danh sách trẻ..." />
          ) : showFullError ? (
            <ErrorAlert message={loadError} onRetry={retryChildren} />
          ) : pageChildren.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              message={emptyMessage}
              actionText={emptyActionText}
              onAction={clearFilters}
            />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {pageChildren.map((child) => (
                <li
                  key={child.id}
                  className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm space-y-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-on-surface break-words">{child.fullName}</p>
                    <p className="text-xs text-on-surface-variant">
                      Ngày sinh {formatVietnamShortDate(child.dateOfBirth)} · Nhập học{" "}
                      {formatVietnamShortDate(child.enrollmentDate)}
                    </p>
                  </div>
                  <ChildActions
                    child={child}
                    handlers={actions}
                    buttonClassName="min-h-11 sm:min-h-0"
                    className="border-t border-slate-100 pt-3"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chỉ hiện khi có hơn một trang và đã có dữ liệu (frontend-conventions.md §3.4) */}
        {!isInitialLoading && !showFullError && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredChildren.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {dialog?.type === "create" && (
        <ChildFormModal
          onClose={closeDialog}
          onSuccess={(child) => finish(`Đã thêm hồ sơ trẻ ${child.fullName}.`)}
        />
      )}

      {dialog?.type === "edit" && (
        <ChildFormModal
          child={dialog.child}
          onClose={closeDialog}
          onSuccess={(child) => finish(`Đã cập nhật hồ sơ trẻ ${child.fullName}.`)}
        />
      )}

      {dialog?.type === "guardians" && (
        <GuardiansModal
          child={dialog.child}
          notice={notice}
          onNotice={setNotice}
          onDismissNotice={() => setNotice(null)}
          onUnlink={(guardian) => setDialog({ type: "unlink", child: dialog.child, guardian })}
          onClose={closeDialog}
        />
      )}

      {dialog?.type === "unlink" && (
        <UnlinkGuardianDialog
          child={dialog.child}
          guardian={dialog.guardian}
          onClose={() => setDialog({ type: "guardians", child: dialog.child })}
          onSuccess={(guardian) => {
            setDialog({ type: "guardians", child: dialog.child });
            setNotice(`Đã gỡ liên kết ${guardian.fullName} khỏi ${dialog.child.fullName}.`);
          }}
        />
      )}
    </div>
  );
}

interface ChildActionHandlers {
  onEdit: (child: ChildResponse) => void;
  onGuardians: (child: ChildResponse) => void;
}

// Không có nút xóa hồ sơ (D40 mục 1). Chữ sr-only nêu tên trẻ, vì mọi dòng có nút cùng chữ
function ChildActions({
  child,
  handlers,
  className = "",
  buttonClassName = "",
}: {
  child: ChildResponse;
  handlers: ChildActionHandlers;
  className?: string;
  buttonClassName?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Button size="sm" variant="outline" onClick={() => handlers.onEdit(child)} className={buttonClassName}>
        Sửa<span className="sr-only"> hồ sơ {child.fullName}</span>
      </Button>
      <Button size="sm" variant="outline" onClick={() => handlers.onGuardians(child)} className={buttonClassName}>
        Phụ huynh<span className="sr-only"> của {child.fullName}</span>
      </Button>
    </div>
  );
}
