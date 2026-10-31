"use client";

import { useEffect, useState } from "react";
import { ApiErrorAlert, Button, ConfirmDialog, ErrorAlert, Icons, LoadingSpinner, NoticeBanner } from "@/components";
import { toApiError } from "@/lib/axios";
import { formatWeekRange, getMondayOfWeek, getTodayVietnamDateString } from "@/lib/datetime";
import type { MenuEntryRequest } from "@/types/menu";
import { useCreateWeeklyMenu, useUpdateWeeklyMenu, useWeeklyMenu } from "./_lib/weekly-menus-api";
import { WeekPicker } from "./_components/WeekPicker";
import { WeeklyMenuForm } from "./_components/WeeklyMenuForm";

const FORM_ID = "weekly-menu-form";

// SCR-ACC-06: chỉ Kế toán tạo và sửa thực đơn tuần, không xóa (BR-MENU-01, D40 mục 1)
export default function WeeklyMenuPage() {
  // Mặc định tuần hiện tại theo giờ Việt Nam (frontend-conventions.md §6)
  const [weekStartDate, setWeekStartDate] = useState(() => getMondayOfWeek(getTodayVietnamDateString()));
  const [pendingWeekStartDate, setPendingWeekStartDate] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const menuQuery = useWeeklyMenu(weekStartDate);
  const createMenu = useCreateWeeklyMenu();
  const updateMenu = useUpdateWeeklyMenu();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  // null là tuần chưa có thực đơn; undefined là chưa tải được lần nào
  const menu = menuQuery.data;
  const isSaving = createMenu.isPending || updateMenu.isPending;
  const saveError = createMenu.error ?? updateMenu.error;

  // Lỗi khi chưa có dữ liệu thì thay cả form; lỗi lúc tải lại thì giữ form và báo ở trên
  const loadError = menuQuery.isError ? toApiError(menuQuery.error).message : null;
  const showFullError = loadError !== null && menu === undefined;
  const retryMenu = () => void menuQuery.refetch();

  const changeWeek = (nextWeekStartDate: string) => {
    setWeekStartDate(nextWeekStartDate);
    setPendingWeekStartDate(null);
    setIsDirty(false);
    // Lỗi lưu thuộc tuần vừa rời, không còn đúng với tuần mới
    createMenu.reset();
    updateMenu.reset();
  };

  // SCR-ACC-06, Hành vi 6: còn thay đổi chưa lưu thì hỏi trước khi bỏ
  const requestWeek = (nextWeekStartDate: string) => {
    if (nextWeekStartDate === weekStartDate) return;
    if (isDirty) {
      setPendingWeekStartDate(nextWeekStartDate);
      return;
    }
    changeWeek(nextWeekStartDate);
  };

  // Tuần chưa có thực đơn thì tạo (Hành vi 2), đã có thì sửa (Hành vi 3). Lỗi ném lại cho form giữ phần đang gõ
  const saveMenu = async (entries: MenuEntryRequest[]) => {
    setNotice(null);
    createMenu.reset();
    updateMenu.reset();

    const saved = menu
      ? await updateMenu.mutateAsync({ id: menu.id, body: { entries } })
      : await createMenu.mutateAsync({ weekStartDate, entries });

    setNotice(
      `${menu ? "Đã lưu" : "Đã tạo"} thực đơn tuần ${formatWeekRange(saved.weekStartDate)}.`
    );
    return saved;
  };

  return (
    <div className="py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-on-surface">Thực đơn tuần</h1>
        <p className="text-sm text-on-surface-variant">
          Nhập món ăn từng ngày trong tuần. Phụ huynh xem được thực đơn đã lưu.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <WeekPicker weekStartDate={weekStartDate} onChange={requestWeek} disabled={isSaving} />
        {menu !== undefined && (
          <Button
            type="submit"
            form={FORM_ID}
            isLoading={isSaving}
            disabled={!isDirty}
            icon={<Icons.Check />}
            className="self-stretch sm:self-auto shrink-0 min-h-11 sm:min-h-0"
          >
            Lưu
          </Button>
        )}
      </div>

      {notice && <NoticeBanner message={notice} onClose={() => setNotice(null)} />}

      {loadError && menu !== undefined && (
        <ErrorAlert title="Không tải lại được thực đơn tuần" message={loadError} onRetry={retryMenu} />
      )}

      {menuQuery.isPending ? (
        <LoadingSpinner label="Đang tải thực đơn tuần..." />
      ) : showFullError ? (
        <ErrorAlert message={loadError} onRetry={retryMenu} />
      ) : menu !== undefined ? (
        <div className="rounded-3xl border border-slate-200/90 bg-surface-container-lowest p-4 sm:p-6 shadow-sm space-y-4">
          <p className="text-sm text-on-surface-variant">
            {menu
              ? "Ô để trống là ngày không có thực đơn: lưu lại sẽ gỡ ngày đó khỏi thực đơn tuần."
              : "Tuần này chưa có thực đơn. Nhập món cho những ngày có thực đơn rồi bấm Lưu để tạo."}
          </p>

          <ApiErrorAlert error={saveError} />

          {/* Đổi tuần hay thực đơn vừa được tạo (kể cả do Kế toán khác, sau 409) thì nạp lại form từ đầu */}
          <WeeklyMenuForm
            key={`${weekStartDate}:${menu?.id ?? "new"}`}
            formId={FORM_ID}
            weekStartDate={weekStartDate}
            menu={menu}
            isSaving={isSaving}
            onSave={saveMenu}
            onDirtyChange={setIsDirty}
          />
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={pendingWeekStartDate !== null}
        onClose={() => setPendingWeekStartDate(null)}
        onConfirm={() => {
          if (pendingWeekStartDate) changeWeek(pendingWeekStartDate);
        }}
        variant="warning"
        title={`Bỏ thay đổi chưa lưu của tuần ${formatWeekRange(weekStartDate)}?`}
        message="Thực đơn tuần này có thay đổi chưa lưu. Chuyển sang tuần khác sẽ bỏ các thay đổi đó."
        confirmText="Bỏ thay đổi"
      />
    </div>
  );
}
