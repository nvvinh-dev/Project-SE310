"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EmptyState,
  ErrorAlert,
  Icons,
  LoadingSpinner,
  Pagination,
} from "@/components";
import { toApiError } from "@/lib/axios";
import {
  useChildActivityPhotos,
  useMyChildren,
} from "./_lib/parent-activities-api";
import { ChildSelectHeader } from "../attendance/_components/ChildSelectHeader";
import { ActivityPhotoGrid } from "./_components/ActivityPhotoGrid";
import { ActivityPhotoViewerModal } from "./_components/ActivityPhotoViewerModal";
import { ExpiredPhotosBanner } from "./_components/ExpiredPhotosBanner";

// Mặc định 20 ảnh mỗi trang (ui-screens.md SCR-PAR-05 Vùng 3, frontend-conventions.md §3.4)
const PAGE_SIZE = 20;

// SCR-PAR-05 — Ảnh hoạt động (FR-MEDIA-02, UC-MEDIA-02, AC-MEDIA-02, AC-MEDIA-04, AC-SEC-12)
export default function ParentActivitiesPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [childErrorMessage, setChildErrorMessage] = useState<string | null>(null);
  const [viewingPhotoId, setViewingPhotoId] = useState<string | null>(null);
  // Đánh dấu theo url: refetch trả URL ký mới nên dấu lỗi của URL cũ tự hết tác dụng (D53)
  const [failedPhotoUrls, setFailedPhotoUrls] = useState<Record<string, boolean>>({});
  const [isReloadingUrls, setIsReloadingUrls] = useState(false);

  // 1. Danh sách con liên kết với phụ huynh đang đăng nhập (D45)
  const childrenQuery = useMyChildren();
  const childrenList = useMemo(
    () => childrenQuery.data ?? [],
    [childrenQuery.data]
  );

  const activeChildId = useMemo(() => {
    if (selectedChildId && childrenList.some((c) => c.id === selectedChildId)) {
      return selectedChildId;
    }
    return childrenList[0]?.id ?? "";
  }, [selectedChildId, childrenList]);

  // Đổi con thì về trang 1 và đóng ảnh đang xem (ui-screens.md SCR-PAR-05 Hành vi)
  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setChildErrorMessage(null);
    setPage(1);
    setViewingPhotoId(null);
  };

  // 2. Ảnh của lớp con đang học; phụ huynh chọn con, không chọn lớp (D39 mục 10)
  const photosQuery = useChildActivityPhotos(activeChildId, page, PAGE_SIZE);
  const pageData = photosQuery.data;
  const photos = useMemo(() => pageData?.items ?? [], [pageData]);
  const totalCount = pageData?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  // Trang đang xem lớn hơn số trang (ảnh bị bớt giữa chừng) thì hiện trang cuối (frontend-conventions.md §3.4).
  // Không dùng Math.min(page, totalPages) như danh sách phân trang ở client: ở đây `page` nằm trong query key
  // và totalPages lại tính từ chính kết quả của query đó, nên chỉ kẹp số khi hiển thị thì query vẫn giữ trang
  // cũ (items rỗng) mà Pagination lại báo trang cuối. Đặt lại state ngay trong lúc render để query tải đúng
  // trang cuối; React render lại ngay, không qua effect nên không nháy giao diện
  if (pageData && totalCount > 0 && page > totalPages) {
    setPage(totalPages);
  }

  // Ảnh đang xem lớn lấy theo id từ trang hiện tại, để sau khi refetch modal nhận luôn URL ký mới
  const viewingPhoto = viewingPhotoId
    ? photos.find((p) => p.id === viewingPhotoId) ?? null
    : null;

  // Ghi lại ảnh vừa bấm để đóng hộp thoại thì trả focus về đúng ảnh đó (a11y, testing-strategy §3.3 F)
  const lastPhotoTriggerRef = useRef<HTMLElement | null>(null);

  const handleOpenPhoto = (photoId: string) => {
    lastPhotoTriggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setViewingPhotoId(photoId);
  };

  const handleClosePhoto = () => {
    setViewingPhotoId(null);
    // Ảnh vừa bấm vẫn nằm trong lưới phía sau hộp thoại nên trả focus được ngay
    const trigger = lastPhotoTriggerRef.current;
    if (trigger?.isConnected) trigger.focus();
  };

  const handlePhotoError = (url: string) => {
    setFailedPhotoUrls((prev) => ({ ...prev, [url]: true }));
  };

  // Số ảnh của trang đang xem tải lỗi; > 0 thì hiện một dải thông báo có nút "Thử lại" chung cho cả trang
  const failedPhotoCount = photos.filter((p) => failedPhotoUrls[p.url]).length;

  // URL ký hết hạn 60 phút: gọi lại API của trang đang xem để nhận URL mới, không lưu URL lâu dài (D53)
  // Ref chặn bấm "Thử lại" liên tiếp: state chưa kịp cập nhật giữa hai lần bấm nhanh nên không dùng được để chặn
  const isReloadingUrlsRef = useRef(false);
  const handleReloadUrls = async () => {
    if (isReloadingUrlsRef.current) return;
    isReloadingUrlsRef.current = true;
    setIsReloadingUrls(true);
    try {
      const res = await photosQuery.refetch();
      if (res.isSuccess) {
        setFailedPhotoUrls({});
      }
    } finally {
      isReloadingUrlsRef.current = false;
      setIsReloadingUrls(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // "Thử lại": tải lại danh sách con trước. Con đang xem vừa bị gỡ liên kết thì chuyển sang con khác hoặc về
  // rỗng, thay vì gửi lại đúng request sẽ lại 404 (ui-screens.md §10). Không rẽ nhánh theo mã lỗi (§5)
  const handleRefresh = async () => {
    setChildErrorMessage(null);
    const childrenResult = await childrenQuery.refetch();
    const latestChildren = childrenResult.data ?? [];
    if (activeChildId && !latestChildren.some((c) => c.id === activeChildId)) {
      setSelectedChildId(latestChildren[0]?.id ?? "");
      setPage(1);
      setViewingPhotoId(null);
      return;
    }
    if (activeChildId) {
      void photosQuery.refetch();
    }
  };

  // Ảnh của con gặp lỗi (ví dụ con bị gỡ liên kết → 404, AC-MEDIA-04): tự tải lại danh sách con và giữ message
  // của backend để hiện cả sau khi đã chuyển sang con khác (ui-screens.md §10, frontend-conventions.md §5).
  // Ref chặn vòng lặp refetch cho cùng một lần lỗi của một con. Query hết lỗi (Thử lại thành công, đổi con, đổi
  // trang) thì đặt lại, để lần lỗi sau của cùng con đó (ví dụ vừa bị gỡ liên kết → 404) vẫn tải lại danh sách con
  const handledErrorChildIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!photosQuery.isError) {
      handledErrorChildIdRef.current = null;
      return;
    }
    if (activeChildId && handledErrorChildIdRef.current !== activeChildId) {
      handledErrorChildIdRef.current = activeChildId;
      const msg = toApiError(photosQuery.error).message ?? null;
      void childrenQuery.refetch().then((res) => {
        const latestChildren = res.data ?? [];
        if (!latestChildren.some((c) => c.id === activeChildId)) {
          if (msg) setChildErrorMessage(msg);
          // Tự chuyển sang con khác cũng là đổi con: chốt lựa chọn mới và về trang 1 (SCR-PAR-05 Hành vi)
          setSelectedChildId(latestChildren[0]?.id ?? "");
          setPage(1);
          setViewingPhotoId(null);
        }
      });
    }
  }, [photosQuery.isError, photosQuery.error, activeChildId, childrenQuery]);

  const isChildrenInitialLoading =
    childrenQuery.isPending && childrenQuery.data === undefined;
  const isChildrenInitialError =
    childrenQuery.isError && childrenQuery.data === undefined;
  const childrenErrorMessage = childrenQuery.error
    ? toApiError(childrenQuery.error).message
    : null;

  // Lỗi thay cả vùng ảnh chỉ khi chưa có dữ liệu; đã có thì giữ ảnh cũ và báo phía trên (frontend-conventions.md §3.3)
  const hasPhotoData = pageData !== undefined;
  const isPhotosInitialLoading = photosQuery.isPending && !hasPhotoData;
  const isPhotosInitialError = photosQuery.isError && !hasPhotoData;
  const isPhotosBackgroundError = photosQuery.isError && hasPhotoData;
  const photosErrorMessage = photosQuery.error
    ? toApiError(photosQuery.error).message
    : null;

  return (
    <div className="py-8 space-y-6 min-w-0">
      {/* Vùng [1]: Tiêu đề và chọn con */}
      <ChildSelectHeader
        title="Ảnh hoạt động"
        subtitle="Ảnh của lớp con đang học"
        childrenList={childrenList}
        selectedChildId={activeChildId}
        onSelectChild={handleSelectChild}
      />

      {/* Message của backend khi tải ảnh của con lỗi, giữ cả sau khi tự chuyển sang con khác */}
      {childErrorMessage && (
        <ErrorAlert
          title="Thông báo"
          message={childErrorMessage}
          onRetry={handleRefresh}
        />
      )}

      {/* Lỗi làm mới danh sách con ở chế độ nền */}
      {!isChildrenInitialError && childrenErrorMessage && (
        <ErrorAlert
          title="Không thể làm mới danh sách con"
          message={childrenErrorMessage}
          onRetry={handleRefresh}
        />
      )}

      {/* Lỗi làm mới ảnh khi vẫn giữ ảnh cũ */}
      {isPhotosBackgroundError && photosErrorMessage && (
        <ErrorAlert
          title="Không tải lại được ảnh mới nhất"
          message={photosErrorMessage}
          onRetry={handleRefresh}
        />
      )}

      {isChildrenInitialLoading ? (
        <LoadingSpinner label="Đang tải danh sách con..." />
      ) : isChildrenInitialError ? (
        <ErrorAlert
          title="Không thể tải danh sách con"
          message={childrenErrorMessage ?? ""}
          onRetry={handleRefresh}
        />
      ) : childrenList.length === 0 ? (
        /* Tài khoản chưa được liên kết với trẻ nào (ui-screens.md Bảng 2.3) */
        <EmptyState
          title="Chưa liên kết trẻ"
          message="Tài khoản chưa được liên kết với trẻ nào. Liên hệ văn phòng nhà trường."
        />
      ) : isPhotosInitialLoading ? (
        <LoadingSpinner label="Đang tải ảnh hoạt động..." />
      ) : isPhotosInitialError ? (
        <ErrorAlert
          title="Không thể tải ảnh hoạt động"
          message={photosErrorMessage ?? ""}
          onRetry={handleRefresh}
        />
      ) : totalCount === 0 ? (
        /* Lớp chưa có ảnh, hoặc con chưa được xếp lớp: cùng một câu (FR-MEDIA-02) */
        <EmptyState
          title="Chưa có ảnh hoạt động nào."
          message="Ảnh giáo viên chia sẻ cho lớp của con sẽ hiện ở đây."
          icon={<Icons.Camera />}
        />
      ) : (
        <div className="space-y-4 min-w-0">
          {/* Ảnh hết hạn hiển thị: một dải chung thay cho nút Thử lại ở từng ô (D53) */}
          {failedPhotoCount > 0 && (
            <ExpiredPhotosBanner
              failedCount={failedPhotoCount}
              isReloading={isReloadingUrls}
              onReload={() => void handleReloadUrls()}
            />
          )}

          {/* Vùng [2]: Ảnh theo ngày */}
          <ActivityPhotoGrid
            photos={photos}
            failedPhotoUrls={failedPhotoUrls}
            onPhotoError={handlePhotoError}
            onOpenPhoto={handleOpenPhoto}
          />

          {/* Vùng [3]: Phân trang ở server */}
          {totalPages > 1 && (
            <div className="pt-4 flex justify-center min-w-0">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      <ActivityPhotoViewerModal
        photo={viewingPhoto}
        isPhotoFailed={viewingPhoto ? Boolean(failedPhotoUrls[viewingPhoto.url]) : false}
        isReloadingUrls={isReloadingUrls}
        onPhotoError={handlePhotoError}
        onReloadUrls={() => void handleReloadUrls()}
        onClose={handleClosePhoto}
      />
    </div>
  );
}
