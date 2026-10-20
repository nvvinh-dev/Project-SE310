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
import { toApiError } from "@/lib/axios";
import type { ClassPlacementResponse, ClassResponse } from "@/types/class";
import { normalizeForSearch } from "../users/_lib/user-rules";
import { useClassPlacements, useClasses } from "./_lib/classes-api";
import { formatDateOnly } from "./_lib/class-rules";
import { PlacementClassBadge } from "./_components/ClassBadges";
import { ClassCards } from "./_components/ClassCards";
import { AssignClassModal, RemoveFromClassDialog } from "./_components/ClassPlacementModal";
import { HomeroomTeacherModal, RemoveHomeroomTeacherDialog } from "./_components/HomeroomTeacherModal";

// Cỡ trang mặc định của frontend-conventions.md §3.4; SCR-ADM-03 không ghi cỡ riêng
const PAGE_SIZE = 20;
const TABLE_COLUMNS = 4;
const UNASSIGNED_FILTER = "unassigned";

interface FilterValues {
  search: string;
  // "" = tất cả, UNASSIGNED_FILTER = chưa xếp lớp, còn lại là id lớp
  classFilter: string;
}

const EMPTY_FILTERS: FilterValues = { search: "", classFilter: "" };

// Mỗi lúc chỉ mở một hộp thoại
type DialogState =
  | { type: "assignTeacher"; cls: ClassResponse }
  | { type: "removeTeacher"; cls: ClassResponse }
  | { type: "assignClass"; placement: ClassPlacementResponse }
  | { type: "removeFromClass"; placement: ClassPlacementResponse }
  | null;

export default function ClassesPage() {
  const classesQuery = useClasses();
  const placementsQuery = useClassPlacements();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { register, control, reset } = useForm<FilterValues>({ defaultValues: EMPTY_FILTERS });
  const [search, classFilter] = useWatch({ control, name: ["search", "classFilter"] });
  const hasFilter = search.trim() !== "" || classFilter !== "";

  // Đổi bộ lọc (kể cả xóa bộ lọc) thì quay về trang 1, đặt lại ngay trong lúc render như SCR-ADM-02
  const filterKey = `${search}|${classFilter}`;
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

  const classFilterOptions = [
    { value: "", label: "Tất cả" },
    { value: UNASSIGNED_FILTER, label: "Chưa xếp lớp" },
    ...(classesQuery.data ?? []).map((cls) => ({ value: cls.id, label: cls.name })),
  ];

  const placements = placementsQuery.data;

  // Tìm và lọc ở client trên toàn bộ danh sách rồi mới cắt trang; giữ thứ tự backend trả về
  const filteredPlacements = useMemo(() => {
    if (!placements) return [];
    const keyword = normalizeForSearch(search);

    return placements.filter(
      (placement) =>
        (keyword === "" || normalizeForSearch(placement.fullName).includes(keyword)) &&
        (classFilter === "" ||
          (classFilter === UNASSIGNED_FILTER ? placement.classId === null : placement.classId === classFilter))
    );
  }, [placements, search, classFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPlacements.length / PAGE_SIZE));
  // Danh sách ngắn lại sau khi lọc hay tải lại thì không đứng ở trang đã hết dữ liệu
  const currentPage = Math.min(page, totalPages);
  const pagePlacements = filteredPlacements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const closeDialog = () => setDialog(null);

  const finish = (message: string) => {
    setDialog(null);
    setNotice(message);
  };

  const placementActions: PlacementActionHandlers = {
    onAssign: (placement) => setDialog({ type: "assignClass", placement }),
    onRemove: (placement) => setDialog({ type: "removeFromClass", placement }),
  };

  const isInitialLoading = placementsQuery.isPending;
  // Lỗi khi chưa có dữ liệu thì thay cả danh sách; lỗi lúc tải lại thì giữ danh sách cũ và báo ở trên
  const loadError = placementsQuery.isError ? toApiError(placementsQuery.error).message : null;
  const showFullError = loadError !== null && !placements;
  const retryPlacements = () => void placementsQuery.refetch();
  // Trẻ chỉ có trong danh sách khi Kế toán đã lập hồ sơ nhập học (ui-screens.md §2.3, BR-CLASS-02)
  const emptyTitle = hasFilter ? "Không tìm thấy trẻ" : "Chưa có trẻ nào";
  const emptyMessage = hasFilter
    ? "Không có trẻ nào khớp với bộ lọc đang chọn."
    : "Trẻ hiện ở đây sau khi Kế toán lập hồ sơ nhập học.";
  const emptyActionText = hasFilter ? "Xóa bộ lọc" : undefined;
  const clearFilters = () => reset(EMPTY_FILTERS);

  return (
    <div className="py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-on-surface">Lớp và giáo viên chủ nhiệm</h1>
        <p className="text-sm text-on-surface-variant">
          Gán giáo viên chủ nhiệm cho ba lớp và xếp, chuyển, gỡ trẻ khỏi lớp theo nhóm tuổi.
        </p>
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

      <section aria-labelledby="classes-heading" className="space-y-3">
        <h2 id="classes-heading" className="text-base font-bold text-on-surface">
          Lớp
        </h2>
        <ClassCards
          onAssignTeacher={(cls) => setDialog({ type: "assignTeacher", cls })}
          onRemoveTeacher={(cls) => setDialog({ type: "removeTeacher", cls })}
        />
      </section>

      <section aria-labelledby="placements-heading" className="space-y-3">
        <h2 id="placements-heading" className="text-base font-bold text-on-surface">
          Xếp lớp
        </h2>

        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]"
        >
          <Input
            type="search"
            aria-label="Tìm theo họ tên"
            placeholder="Tìm theo họ tên"
            autoComplete="off"
            {...register("search")}
          />
          <Select aria-label="Lọc theo lớp" options={classFilterOptions} {...register("classFilter")} />
        </form>

        {loadError && placements && (
          <ErrorAlert title="Không tải lại được danh sách trẻ" message={loadError} onRetry={retryPlacements} />
        )}

        <div className="space-y-2">
          {/* Màn hình rộng (từ 1280px): bảng */}
          <div className="hidden xl:block">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Lớp hiện tại</TableHead>
                  <TableHead>Thao tác</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {isInitialLoading ? (
                  <TableLoading colSpan={TABLE_COLUMNS} />
                ) : showFullError ? (
                  <TableError colSpan={TABLE_COLUMNS} message={loadError} onRetry={retryPlacements} />
                ) : pagePlacements.length === 0 ? (
                  <TableEmpty
                    colSpan={TABLE_COLUMNS}
                    title={emptyTitle}
                    message={emptyMessage}
                    actionText={emptyActionText}
                    onAction={clearFilters}
                  />
                ) : (
                  pagePlacements.map((placement) => (
                    <TableRow key={placement.childId}>
                      <TableCell className="font-semibold break-words">{placement.fullName}</TableCell>
                      <TableCell className="text-on-surface-variant whitespace-nowrap">
                        {formatDateOnly(placement.dateOfBirth)}
                      </TableCell>
                      <TableCell>
                        <PlacementClassBadge name={placement.className} />
                      </TableCell>
                      <TableCell>
                        <PlacementActions placement={placement} handlers={placementActions} />
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
              <ErrorAlert message={loadError} onRetry={retryPlacements} />
            ) : pagePlacements.length === 0 ? (
              <EmptyState
                title={emptyTitle}
                message={emptyMessage}
                actionText={emptyActionText}
                onAction={clearFilters}
              />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {pagePlacements.map((placement) => (
                  <li
                    key={placement.childId}
                    className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface break-words">{placement.fullName}</p>
                        <p className="text-xs text-on-surface-variant">
                          Ngày sinh {formatDateOnly(placement.dateOfBirth)}
                        </p>
                      </div>
                      <PlacementClassBadge name={placement.className} />
                    </div>
                    <PlacementActions
                      placement={placement}
                      handlers={placementActions}
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
              totalItems={filteredPlacements.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </div>
      </section>

      {dialog?.type === "assignTeacher" && (
        <HomeroomTeacherModal
          cls={dialog.cls}
          onClose={closeDialog}
          onSuccess={(cls) =>
            finish(
              cls.homeroomTeacher
                ? `Đã phân công ${cls.homeroomTeacher.fullName} làm giáo viên chủ nhiệm lớp ${cls.name}.`
                : `Đã cập nhật giáo viên chủ nhiệm lớp ${cls.name}.`
            )
          }
        />
      )}

      {dialog?.type === "removeTeacher" && (
        <RemoveHomeroomTeacherDialog
          cls={dialog.cls}
          onClose={closeDialog}
          onSuccess={(cls) => finish(`Đã bỏ giáo viên chủ nhiệm của lớp ${cls.name}.`)}
        />
      )}

      {dialog?.type === "assignClass" && (
        <AssignClassModal
          placement={dialog.placement}
          onClose={closeDialog}
          onSuccess={(placement) =>
            finish(
              dialog.placement.classId === null
                ? `Đã xếp ${placement.fullName} vào lớp ${placement.className}.`
                : `Đã chuyển ${placement.fullName} sang lớp ${placement.className}.`
            )
          }
        />
      )}

      {dialog?.type === "removeFromClass" && (
        <RemoveFromClassDialog
          placement={dialog.placement}
          onClose={closeDialog}
          onSuccess={(placement) =>
            finish(`Đã gỡ ${placement.fullName} khỏi lớp ${dialog.placement.className}.`)
          }
        />
      )}
    </div>
  );
}

interface PlacementActionHandlers {
  onAssign: (placement: ClassPlacementResponse) => void;
  onRemove: (placement: ClassPlacementResponse) => void;
}

// Trẻ chưa xếp lớp chỉ có "Xếp lớp"; trẻ đã có lớp có "Chuyển lớp" và "Gỡ lớp". Chữ sr-only nêu tên
// trẻ, vì mọi dòng có nút cùng chữ
function PlacementActions({
  placement,
  handlers,
  className = "",
  buttonClassName = "",
}: {
  placement: ClassPlacementResponse;
  handlers: PlacementActionHandlers;
  className?: string;
  buttonClassName?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {placement.classId === null ? (
        <Button size="sm" variant="outline" onClick={() => handlers.onAssign(placement)} className={buttonClassName}>
          Xếp lớp<span className="sr-only"> cho {placement.fullName}</span>
        </Button>
      ) : (
        <>
          <Button size="sm" variant="outline" onClick={() => handlers.onAssign(placement)} className={buttonClassName}>
            Chuyển lớp<span className="sr-only"> cho {placement.fullName}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handlers.onRemove(placement)} className={buttonClassName}>
            Gỡ lớp<span className="sr-only"> của {placement.fullName}</span>
          </Button>
        </>
      )}
    </div>
  );
}
