"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState, ErrorAlert, Icons, LoadingSpinner } from "@/components";
import { toApiError } from "@/lib/axios";
import { useMyChildren, useChildInvoices } from "./_lib/parent-tuition-api";
import { ChildSelectHeader } from "../attendance/_components/ChildSelectHeader";
import { InvoiceHistoryTable } from "./_components/InvoiceHistoryTable";

export default function ParentTuitionPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childErrorMessage, setChildErrorMessage] = useState<string | null>(null);

  // 1. Tải danh sách con của phụ huynh đang đăng nhập (FR-TUITION-05, D45)
  const childrenQuery = useMyChildren();
  const childrenList = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);

  // Tự động chọn con đầu tiên khi nạp danh sách thành công
  const activeChildId = useMemo(() => {
    if (selectedChildId && childrenList.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return childrenList[0]?.id ?? "";
  }, [selectedChildId, childrenList]);

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setChildErrorMessage(null);
  };

  // 2. Tải danh sách hóa đơn học phí của con đang chọn (FR-TUITION-05, UC-TUITION-04, AC-TUITION-05)
  const invoicesQuery = useChildInvoices(activeChildId);
  const invoicesList = useMemo(
    () => invoicesQuery.data ?? [],
    [invoicesQuery.data]
  );

  // Dùng cho "Thử lại": tải lại danh sách trẻ trước (ui-screens.md §4.2, §10: 404 thì tải lại danh sách con)
  const handleRefresh = async () => {
    setChildErrorMessage(null);
    const childrenResult = await childrenQuery.refetch();
    const latestChildren = childrenResult.data ?? [];
    if (
      activeChildId &&
      !latestChildren.some((c) => c.id === activeChildId)
    ) {
      setSelectedChildId(latestChildren[0]?.id ?? "");
      return;
    }
    if (activeChildId) {
      void invoicesQuery.refetch();
    }
  };

  // Khi query hóa đơn của trẻ gặp lỗi (ví dụ trẻ bị gỡ liên kết hoặc lỗi hệ thống),
  // tự động tải lại danh sách con để đồng bộ và lưu thông báo lỗi để hiển thị kể cả sau khi chuyển trẻ
  // (frontend-conventions.md §5: không rẽ nhánh theo mã HTTP, ui-screens.md §10: hiện message và tải lại danh sách con)
  const handledErrorChildIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (invoicesQuery.isError && activeChildId && handledErrorChildIdRef.current !== activeChildId) {
      handledErrorChildIdRef.current = activeChildId;
      const err = toApiError(invoicesQuery.error);
      const msg = err.message ?? null;
      void childrenQuery.refetch().then((res) => {
        const latestChildren = res.data ?? [];
        // Chỉ lưu message khi trẻ đang xem không còn trong danh sách sau khi tải lại (ví dụ bị gỡ liên kết theo ui-screens.md §10)
        if (msg && !latestChildren.some((c) => c.id === activeChildId)) {
          setChildErrorMessage(msg);
        }
      });
    }
  }, [invoicesQuery.isError, invoicesQuery.error, activeChildId, childrenQuery]);

  // Xử lý lỗi theo ui-screens.md §4.2 & frontend-conventions.md §3.3:
  // - Chỉ hiện lỗi thay cả màn hình khi chưa có dữ liệu (data === undefined).
  // - Đã có dữ liệu mà lần tải lại bị lỗi thì giữ dữ liệu cũ và báo phía trên.
  const isChildrenInitialLoading = childrenQuery.isPending && childrenQuery.data === undefined;
  const isChildrenInitialError = childrenQuery.isError && childrenQuery.data === undefined;
  const childrenErrorMessage = childrenQuery.error
    ? toApiError(childrenQuery.error).message ?? "Đã xảy ra lỗi khi tải danh sách con."
    : null;

  const hasInvoicesData = invoicesQuery.data !== undefined;
  const isInvoicesInitialLoading = invoicesQuery.isPending && !hasInvoicesData;
  const isInvoicesInitialError = invoicesQuery.isError && !hasInvoicesData;
  const isInvoicesBackgroundError = invoicesQuery.isError && hasInvoicesData;
  const invoicesErrorMessage = invoicesQuery.error
    ? toApiError(invoicesQuery.error).message ?? "Đã xảy ra lỗi khi tải danh sách hóa đơn."
    : null;

  return (
    <div className="py-8 space-y-6 min-w-0 max-w-7xl">
      {/* Cảnh báo lỗi tải lại nền khi đã có dữ liệu (ui-screens.md §4.2) */}
      {childErrorMessage && (
        <ErrorAlert
          title="Thông báo"
          message={childErrorMessage}
          onRetry={handleRefresh}
        />
      )}
      {!isChildrenInitialError && childrenErrorMessage && (
        <ErrorAlert
          title="Không thể làm mới danh sách con"
          message={childrenErrorMessage}
          onRetry={handleRefresh}
        />
      )}
      {isInvoicesBackgroundError && invoicesErrorMessage && (
        <ErrorAlert
          title="Lỗi làm mới dữ liệu"
          message={invoicesErrorMessage}
          onRetry={() => void invoicesQuery.refetch()}
        />
      )}

      {/* Vùng 1: Header chọn con (ui-screens.md SCR-PAR-06 & §10) */}
      <ChildSelectHeader
        title="Học phí và hóa đơn"
        subtitle="Xem hóa đơn học phí của con và theo dõi trạng thái thanh toán"
        childrenList={childrenList}
        selectedChildId={activeChildId}
        onSelectChild={handleSelectChild}
      />

      {/* Xử lý 4 trạng thái danh sách con */}
      {isChildrenInitialLoading ? (
        <LoadingSpinner label="Đang tải danh sách con..." />
      ) : isChildrenInitialError ? (
        <ErrorAlert
          title="Không thể tải danh sách con"
          message={childrenErrorMessage ?? ""}
          onRetry={handleRefresh}
        />
      ) : childrenList.length === 0 ? (
        <EmptyState
          title="Chưa liên kết trẻ"
          message="Tài khoản chưa được liên kết với trẻ nào. Liên hệ văn phòng nhà trường."
        />
      ) : (
        <div className="space-y-6 min-w-0">
          {/* Vùng 2: Bảng hóa đơn học phí (ui-screens.md SCR-PAR-06) */}
          <InvoiceHistoryTable
            items={invoicesList}
            isLoading={isInvoicesInitialLoading}
            errorMessage={isInvoicesInitialError ? invoicesErrorMessage : null}
            onRetry={() => void invoicesQuery.refetch()}
          />

          {/* Vùng 3: Hướng dẫn nộp tiền cố định (ui-screens.md SCR-PAR-06) */}
          <div className="rounded-2xl border border-slate-200/90 bg-surface-container-low p-4 sm:p-5 text-sm text-on-surface-variant min-w-0">
            <div className="flex items-start gap-3">
              <span className="text-primary mt-0.5 shrink-0" aria-hidden="true">
                <Icons.Info />
              </span>
              <p className="wrap-anywhere leading-relaxed">
                Phụ huynh nộp học phí bằng tiền mặt hoặc chuyển khoản trực tiếp cho nhà trường; văn phòng sẽ cập nhật trạng thái sau khi nhận tiền.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
