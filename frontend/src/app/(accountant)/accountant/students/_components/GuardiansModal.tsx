"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, EmptyState, ErrorAlert, Icons, Input, LoadingSpinner, Modal } from "@/components";
import { toApiError } from "@/lib/axios";
import type { ChildResponse, GuardianResponse } from "@/types/child";
// Tạm dùng bản của SCR-ADM-02; chuyển sang bản trong src/components/ khi bản đó vào develop
import { ApiErrorAlert } from "@/app/(admin)/admin/users/_components/ApiErrorAlert";
import { useChildGuardians, useLinkGuardian, useParentAccounts } from "../_lib/children-api";
import { NoticeBanner } from "./NoticeBanner";

// Chờ ngừng gõ một chút rồi mới tìm, để không gọi API ở mỗi phím
const SEARCH_DELAY_MS = 300;

interface GuardiansModalProps {
  child: ChildResponse;
  notice: string | null;
  onNotice: (message: string) => void;
  onDismissNotice: () => void;
  onUnlink: (guardian: GuardianResponse) => void;
  onClose: () => void;
}

// Xem, liên kết và gỡ liên kết phụ huynh của một trẻ (FR-STU-02). Kế toán chỉ chọn tài khoản Phụ huynh có
// sẵn, không tạo hay sửa tài khoản (D39 mục 16)
export function GuardiansModal({ child, notice, onNotice, onDismissNotice, onUnlink, onClose }: GuardiansModalProps) {
  const guardiansQuery = useChildGuardians(child.id);
  const linkGuardian = useLinkGuardian(child.id);
  const isLinking = linkGuardian.isPending;

  const handleClose = () => {
    if (!isLinking) onClose();
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      size="xl"
      title={`Phụ huynh của ${child.fullName}`}
      description="Phụ huynh được liên kết xem được dữ liệu của trẻ ngay từ lần thao tác kế tiếp."
      closeOnBackdropClick={!isLinking}
      closeOnEscape={!isLinking}
      showCloseButton={!isLinking}
    >
      <div className="space-y-6">
        {notice && <NoticeBanner message={notice} onClose={onDismissNotice} />}

        <LinkedGuardians query={guardiansQuery} childName={child.fullName} disabled={isLinking} onUnlink={onUnlink} />

        <ParentAccountSearch
          linkedGuardians={guardiansQuery.data}
          linkGuardian={linkGuardian}
          onLinked={(guardian) => onNotice(`Đã liên kết ${guardian.fullName} với ${child.fullName}.`)}
        />

        <Button variant="outline" onClick={handleClose} disabled={isLinking} className="w-full min-h-11 sm:min-h-0">
          Đóng
        </Button>
      </div>
    </Modal>
  );
}

function LinkedGuardians({
  query,
  childName,
  disabled,
  onUnlink,
}: {
  query: ReturnType<typeof useChildGuardians>;
  childName: string;
  disabled: boolean;
  onUnlink: (guardian: GuardianResponse) => void;
}) {
  const guardians = query.data;
  const loadError = query.isError ? toApiError(query.error).message : null;
  const retry = () => void query.refetch();

  return (
    <section aria-labelledby="linked-guardians-heading" className="space-y-3">
      <h4 id="linked-guardians-heading" className="text-base font-bold text-on-surface">
        Phụ huynh đã liên kết
      </h4>

      {query.isPending ? (
        <LoadingSpinner label="Đang tải danh sách phụ huynh..." />
      ) : !guardians ? (
        <ErrorAlert title="Không tải được danh sách phụ huynh" message={loadError ?? ""} onRetry={retry} />
      ) : (
        <>
          {/* Đã có dữ liệu mà tải lại lỗi thì giữ danh sách cũ và báo ở trên (ui-screens.md §4.2) */}
          {loadError && (
            <ErrorAlert title="Không tải lại được danh sách phụ huynh" message={loadError} onRetry={retry} />
          )}

          {guardians.length === 0 ? (
            <EmptyState
              title="Chưa liên kết phụ huynh nào"
              message={`Tìm tài khoản Phụ huynh ở phần bên dưới để liên kết với ${childName}.`}
            />
          ) : (
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/90">
              {guardians.map((guardian) => (
                <li key={guardian.userId} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <AccountIdentity account={guardian} />
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onUnlink(guardian)}
                    disabled={disabled}
                    className="min-h-11 sm:min-h-0"
                  >
                    Gỡ liên kết<span className="sr-only"> {guardian.fullName}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

interface SearchFormValues {
  search: string;
}

function ParentAccountSearch({
  linkedGuardians,
  linkGuardian,
  onLinked,
}: {
  linkedGuardians: GuardianResponse[] | undefined;
  linkGuardian: ReturnType<typeof useLinkGuardian>;
  onLinked: (guardian: GuardianResponse) => void;
}) {
  const { register, control } = useForm<SearchFormValues>({ defaultValues: { search: "" } });
  const search = useWatch({ control, name: "search" }).trim();

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const accountsQuery = useParentAccounts(debouncedSearch);
  const accounts = accountsQuery.data;
  const loadError = accountsQuery.isError ? toApiError(accountsQuery.error).message : null;
  const retry = () => void accountsQuery.refetch();
  const linkingUserId = linkGuardian.isPending ? linkGuardian.variables?.guardianUserId : undefined;

  const isLinked = (account: GuardianResponse) =>
    linkedGuardians?.some((guardian) => guardian.userId === account.userId) ?? false;

  const link = (account: GuardianResponse) =>
    linkGuardian.mutate({ guardianUserId: account.userId }, { onSuccess: onLinked });

  return (
    <section aria-labelledby="add-guardian-heading" className="space-y-3 border-t border-slate-100 pt-6">
      <h4 id="add-guardian-heading" className="text-base font-bold text-on-surface">
        Thêm phụ huynh
      </h4>

      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <Input
          type="search"
          aria-label="Tìm tài khoản Phụ huynh theo họ tên hoặc email"
          placeholder="Tìm tài khoản Phụ huynh theo họ tên hoặc email"
          autoComplete="off"
          prefixIcon={<Icons.Search />}
          {...register("search")}
        />
      </form>

      <ApiErrorAlert error={linkGuardian.error} />

      {debouncedSearch === "" ? (
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Gõ họ tên hoặc email để tìm. Đối chiếu họ tên và email với giấy tờ nhập học của trẻ trước khi liên kết.
        </p>
      ) : accountsQuery.isPending ? (
        <LoadingSpinner label="Đang tìm tài khoản..." />
      ) : !accounts ? (
        <ErrorAlert title="Không tìm được tài khoản" message={loadError ?? ""} onRetry={retry} />
      ) : (
        <>
          {loadError && <ErrorAlert title="Không tìm lại được tài khoản" message={loadError} onRetry={retry} />}

          {accounts.length === 0 ? (
            <EmptyState
              title="Không tìm thấy tài khoản"
              message="Không có tài khoản Phụ huynh đang hoạt động nào khớp với từ khóa. Nhờ Admin tạo tài khoản Phụ huynh trước."
            />
          ) : (
            <ul
              aria-busy={accountsQuery.isPlaceholderData}
              className={`divide-y divide-slate-100 rounded-2xl border border-slate-200/90 transition-opacity ${
                accountsQuery.isPlaceholderData ? "opacity-60" : ""
              }`}
            >
              {accounts.map((account) => (
                <li key={account.userId} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <AccountIdentity account={account} />
                  {isLinked(account) ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold bg-primary-fixed/40 text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                      Đã liên kết
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => link(account)}
                      isLoading={linkingUserId === account.userId}
                      disabled={linkGuardian.isPending}
                      className="min-h-11 sm:min-h-0"
                    >
                      Liên kết<span className="sr-only"> {account.fullName}</span>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

// Họ tên và email để Kế toán đối chiếu với giấy tờ nhập học (UC-STU-02)
function AccountIdentity({ account }: { account: GuardianResponse }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-on-surface break-words">{account.fullName}</p>
      <p className="text-xs text-on-surface-variant wrap-anywhere">{account.email}</p>
    </div>
  );
}
