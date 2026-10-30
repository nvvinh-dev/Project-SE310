"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ErrorAlert, NoticeBanner } from "@/components";
import type { AttendanceResponse, HomeroomChildResponse } from "@/types/attendance";
import type { PickupPersonResponse, PickupResponse } from "@/types/pickup";
import {
  useHomeroomChildren,
  useAttendances,
  usePickups,
  useCreatePickup,
} from "./_lib/pickup-api";
import {
  calculatePickupStats,
  type PickupRowItem,
} from "./_lib/pickup-helpers";
import { getTodayVietnamDateString } from "@/lib/datetime";
import { toApiError } from "@/lib/axios";
import { PickupProgressCard } from "./_components/PickupProgressCard";
import { PickupList } from "./_components/PickupList";
import { PickupVerificationModal } from "./_components/PickupVerificationModal";

export default function TeacherPickupPage() {
  const [todayStr] = useState(() => getTodayVietnamDateString());

  // Queries
  const childrenQuery = useHomeroomChildren();
  const attendancesQuery = useAttendances({ date: todayStr });
  const pickupsQuery = usePickups(todayStr);
  const createPickupMutation = useCreatePickup();

  // Local state
  const [selectedChild, setSelectedChild] = useState<HomeroomChildResponse | null>(null);

  // Dải thông báo thành công (ui-screens.md §4.2)
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Dải thành công tự ẩn sau 6 giây
  useEffect(() => {
    if (!successNotice) return;
    const timer = setTimeout(() => setSuccessNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [successNotice]);

  const children = useMemo(() => childrenQuery.data ?? [], [childrenQuery.data]);
  const attendances = useMemo(() => attendancesQuery.data ?? [], [attendancesQuery.data]);
  const pickups = useMemo(() => pickupsQuery.data ?? [], [pickupsQuery.data]);

  // Đã có dữ liệu trước đó hay chưa (giữ dữ liệu cũ khi refetch lỗi - ui-screens §4.2, frontend-conventions §3.3)
  const hasData =
    childrenQuery.data !== undefined &&
    attendancesQuery.data !== undefined &&
    pickupsQuery.data !== undefined;

  // Map theo childId để tra cứu O(1)
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceResponse>();
    for (const att of attendances) {
      map.set(att.childId, att);
    }
    return map;
  }, [attendances]);

  const pickupMap = useMemo(() => {
    const map = new Map<string, PickupResponse>();
    for (const p of pickups) {
      map.set(p.childId, p);
    }
    return map;
  }, [pickups]);

  // Ghép danh sách lớp với điểm danh hôm nay và lượt đón hôm nay theo wireframe SCR-TCH-04
  const allItems: PickupRowItem[] = useMemo(() => {
    return children.map((child) => ({
      child,
      attendance: attendanceMap.get(child.id),
      pickup: pickupMap.get(child.id),
    }));
  }, [children, attendanceMap, pickupMap]);

  // Vùng [1]: Tiến độ đón về hôm nay
  const stats = useMemo(() => calculatePickupStats(allItems), [allItems]);

  // Xử lý làm mới
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      childrenQuery.refetch(),
      attendancesQuery.refetch(),
      pickupsQuery.refetch(),
    ]);
  }, [childrenQuery, attendancesQuery, pickupsQuery]);

  // Giao cho người đón chính hoặc người dự phòng (Primary / Backup)
  const handlePickupDirect = async (person: PickupPersonResponse): Promise<void> => {
    if (!selectedChild) return;

    const pickupMethod = person.priority === 1 ? "Primary" : "Backup";
    const personRoleLabel = person.priority === 1 ? "Người đón chính" : "Người dự phòng";

    await createPickupMutation.mutateAsync({
      childId: selectedChild.id,
      pickupMethod,
      pickupPersonId: person.id,
    });

    setSuccessNotice(
      `Đã ghi nhận giao trẻ ${selectedChild.fullName} cho ${person.fullName} (${personRoleLabel}).`
    );
  };

  // Giao cho người khác đến đón (đã gọi xác nhận - PhoneConfirmed)
  const handlePickupPhoneConfirmed = async (
    pickerFullName: string,
    pickupPersonId: string
  ): Promise<void> => {
    if (!selectedChild) return;

    await createPickupMutation.mutateAsync({
      childId: selectedChild.id,
      pickupMethod: "PhoneConfirmed",
      pickupPersonId,
      pickerFullName,
    });

    setSuccessNotice(
      `Đã ghi nhận giao trẻ ${selectedChild.fullName} cho ${pickerFullName} (xác nhận qua điện thoại).`
    );
  };

  // Trạng thái tải lần đầu (khi chưa có dữ liệu)
  const isInitialLoading =
    (childrenQuery.isPending && childrenQuery.data === undefined) ||
    (attendancesQuery.isPending && attendancesQuery.data === undefined) ||
    (pickupsQuery.isPending && pickupsQuery.data === undefined);

  // Lỗi tải lần đầu (thay thế toàn bộ danh sách)
  const initialErrorMessage = useMemo(() => {
    if (childrenQuery.isError && childrenQuery.data === undefined) {
      return toApiError(childrenQuery.error).message;
    }
    if (attendancesQuery.isError && attendancesQuery.data === undefined) {
      return toApiError(attendancesQuery.error).message;
    }
    if (pickupsQuery.isError && pickupsQuery.data === undefined) {
      return toApiError(pickupsQuery.error).message;
    }
    return null;
  }, [
    childrenQuery.isError,
    childrenQuery.data,
    childrenQuery.error,
    attendancesQuery.isError,
    attendancesQuery.data,
    attendancesQuery.error,
    pickupsQuery.isError,
    pickupsQuery.data,
    pickupsQuery.error,
  ]);

  // Cảnh báo khi làm mới thất bại nhưng đã có dữ liệu trước đó (ui-screens §4.2, frontend-conventions §3.3)
  const refreshErrorMessage = useMemo(() => {
    if (!hasData) return null;
    if (childrenQuery.isError) {
      return toApiError(childrenQuery.error).message;
    }
    if (attendancesQuery.isError) {
      return toApiError(attendancesQuery.error).message;
    }
    if (pickupsQuery.isError) {
      return toApiError(pickupsQuery.error).message;
    }
    return null;
  }, [
    hasData,
    childrenQuery.isError,
    childrenQuery.error,
    attendancesQuery.isError,
    attendancesQuery.error,
    pickupsQuery.isError,
    pickupsQuery.error,
  ]);

  const isClassEmpty = !isInitialLoading && !initialErrorMessage && children.length === 0;

  return (
    <div className="py-8 space-y-4 sm:space-y-6">
      {/* Thông báo thành công (tự ẩn sau 6 giây) */}
      {successNotice && (
        <NoticeBanner
          message={successNotice}
          onClose={() => setSuccessNotice(null)}
          role="status"
        />
      )}

      {/* Cảnh báo khi làm mới danh sách ngầm bị lỗi (giữ nguyên dữ liệu cũ - ui-screens §4.2, frontend-conventions §3.3) */}
      {refreshErrorMessage && (
        <ErrorAlert
          title="Không tải lại được danh sách"
          message={refreshErrorMessage}
          onRetry={handleRefresh}
        />
      )}

      {/* Khối [1]: Ngày và tiến độ */}
      <PickupProgressCard
        todayStr={todayStr}
        stats={stats}
        hasData={hasData}
      />

      {/* Vùng [2]: Danh sách trẻ hôm nay */}
      <PickupList
        items={allItems}
        isClassEmpty={isClassEmpty}
        isLoading={isInitialLoading}
        errorMessage={initialErrorMessage}
        onRetry={handleRefresh}
        onOpenVerification={(child) => setSelectedChild(child)}
      />

      {/* Khung xác minh người đón [3, 4, 5] */}
      {selectedChild && (
        <PickupVerificationModal
          key={selectedChild.id}
          child={selectedChild}
          isOpen={Boolean(selectedChild)}
          onClose={() => setSelectedChild(null)}
          onPickupDirect={handlePickupDirect}
          onPickupPhoneConfirmed={handlePickupPhoneConfirmed}
        />
      )}
    </div>
  );
}
