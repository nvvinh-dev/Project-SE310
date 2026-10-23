"use client";

import { useEffect, useState } from "react";
import {
  Button,
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
  NoticeBanner,
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
// Hàm chung đổi thời điểm Utc sang dd/MM/yyyy HH:mm giờ Việt Nam (ui-screens.md §4.4), không riêng cho số đo
import { formatMeasurementDateTime } from "@/lib/datetime";
import { useTeachers } from "./_lib/teachers-api";
import { CreateTeacherModal } from "./_components/CreateTeacherModal";

// Cỡ trang mặc định của frontend-conventions.md §3.4; SCR-ACC-05 không ghi cỡ riêng
const PAGE_SIZE = 20;
const TABLE_COLUMNS = 3;

const EMPTY_TITLE = "Chưa có hồ sơ giáo viên nào";
const EMPTY_MESSAGE = "Bấm “Lập hồ sơ giáo viên” để lập hồ sơ cho tài khoản Giáo viên do Quản trị viên tạo.";

// Chỉ Tạo và Xem: không có nút sửa hay xóa hồ sơ (D40 mục 1, FR-TEACHER-01)
export default function TeachersPage() {
  const teachersQuery = useTeachers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const teachers = teachersQuery.data;
  const allTeachers = teachers ?? [];

  // Giữ thứ tự backend trả về (theo họ tên). Danh sách ngắn lại sau khi tải lại thì không đứng ở trang đã
  // hết dữ liệu
  const totalPages = Math.max(1, Math.ceil(allTeachers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageTeachers = allTeachers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const isInitialLoading = teachersQuery.isPending;
  // Lỗi khi chưa có dữ liệu thì thay cả danh sách; lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên
  const loadError = teachersQuery.isError ? toApiError(teachersQuery.error).message : null;
  const showFullError = loadError !== null && !teachers;
  const retryTeachers = () => void teachersQuery.refetch();

  const openCreate = () => {
    setNotice(null);
    setIsCreateOpen(true);
  };

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-on-surface">Hồ sơ giáo viên</h1>
          <p className="text-sm text-on-surface-variant">
            Lập hồ sơ cho tài khoản Giáo viên để Quản trị viên gán làm giáo viên chủ nhiệm.
          </p>
        </div>
        <Button onClick={openCreate} className="self-start sm:self-auto shrink-0 min-h-11 sm:min-h-0">
          Lập hồ sơ giáo viên
        </Button>
      </div>

      {notice && <NoticeBanner message={notice} onClose={() => setNotice(null)} />}

      {loadError && teachers && (
        <ErrorAlert title="Không tải lại được danh sách hồ sơ" message={loadError} onRetry={retryTeachers} />
      )}

      <div className="space-y-2">
        {/* Màn hình rộng (từ 1280px): bảng */}
        <div className="hidden xl:block">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ngày lập</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {isInitialLoading ? (
                <TableLoading colSpan={TABLE_COLUMNS} />
              ) : showFullError ? (
                <TableError colSpan={TABLE_COLUMNS} message={loadError} onRetry={retryTeachers} />
              ) : pageTeachers.length === 0 ? (
                <TableEmpty colSpan={TABLE_COLUMNS} title={EMPTY_TITLE} message={EMPTY_MESSAGE} />
              ) : (
                pageTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-semibold break-words">{teacher.fullName}</TableCell>
                    <TableCell className="text-on-surface-variant break-all">{teacher.email}</TableCell>
                    <TableCell className="text-on-surface-variant whitespace-nowrap">
                      {formatMeasurementDateTime(teacher.createdAtUtc)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dưới 1280px (tablet, điện thoại, laptop nhỏ có sidebar): mỗi hồ sơ một thẻ */}
        <div className="xl:hidden">
          {isInitialLoading ? (
            <LoadingSpinner label="Đang tải danh sách hồ sơ giáo viên..." />
          ) : showFullError ? (
            <ErrorAlert message={loadError} onRetry={retryTeachers} />
          ) : pageTeachers.length === 0 ? (
            <EmptyState title={EMPTY_TITLE} message={EMPTY_MESSAGE} />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {pageTeachers.map((teacher) => (
                <li
                  key={teacher.id}
                  className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm space-y-1"
                >
                  <p className="font-semibold text-on-surface break-words">{teacher.fullName}</p>
                  <p className="text-sm text-on-surface-variant break-all">{teacher.email}</p>
                  <p className="text-xs text-on-surface-variant">
                    Ngày lập {formatMeasurementDateTime(teacher.createdAtUtc)}
                  </p>
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
            totalItems={allTeachers.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {isCreateOpen && (
        <CreateTeacherModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(teacher) => {
            setIsCreateOpen(false);
            setNotice(`Đã lập hồ sơ giáo viên cho ${teacher.fullName}.`);
          }}
        />
      )}
    </div>
  );
}
