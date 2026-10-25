import type { AttendanceResponse, HomeroomChildResponse } from "@/types/attendance";
import type { PickupResponse } from "@/types/pickup";
import { PICKUP_METHOD_LABELS } from "@/types/pickup";
import { formatVietnamTime } from "@/lib/datetime";

export interface PickupRowItem {
  child: HomeroomChildResponse;
  attendance?: AttendanceResponse;
  pickup?: PickupResponse;
}

export interface PickupStats {
  totalPresent: number;
  totalPickedUp: number;
}

export function calculatePickupStats(items: PickupRowItem[]): PickupStats {
  let totalPresent = 0;
  let totalPickedUp = 0;

  for (const item of items) {
    if (item.attendance?.status === "Present") {
      totalPresent++;
      if (item.pickup) {
        totalPickedUp++;
      }
    }
  }

  return {
    totalPresent,
    totalPickedUp,
  };
}

/**
 * Hiển thị dòng thông tin đón về theo wireframe SCR-TCH-04:
 * Ví dụ: "Đã đón 16:35 · Nguyễn Thị C · Người đón chính"
 * hoặc: "Đã đón 16:35 · Lê Văn D · Người khác, đã gọi xác nhận (Xác nhận bởi Nguyễn Thị C)"
 */
export function formatPickupDetails(pickup: PickupResponse): string {
  const timeStr = formatVietnamTime(pickup.pickupTimeUtc);
  const methodLabel = PICKUP_METHOD_LABELS[pickup.pickupMethod] || pickup.pickupMethod;
  const parts = [`Đã đón ${timeStr}`, pickup.pickerFullName, methodLabel];

  if (pickup.confirmedByName) {
    parts.push(`(Xác nhận bởi ${pickup.confirmedByName})`);
  }

  return parts.join(" · ");
}
