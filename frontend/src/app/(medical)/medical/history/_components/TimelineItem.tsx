"use client";

import { Icons } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import {
  HEALTH_MOOD_LABELS,
  isHealthMood,
  type GrowthMeasurementHistoryItemResponse,
  type HealthHistoryItemResponse,
  type IncidentHistoryItemResponse,
  type QuickHealthStatusHistoryItemResponse,
} from "@/types/health";

interface TimelineItemProps {
  item: HealthHistoryItemResponse;
  isLast?: boolean;
  onViewPhotos?: (incidentId: string) => void;
}

// SCR-MED-02 Vùng 3: Render từng loại bản ghi trên dòng thời gian
export function TimelineItem({
  item,
  isLast = false,
  onViewPhotos,
}: TimelineItemProps) {
  const formattedTime = formatMeasurementDateTime(item.occurredAtUtc);

  return (
    <div className="relative flex gap-4">
      {/* Cột trục thời gian (dot + vertical line) */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 border-surface-container-lowest mt-1.5 shrink-0 ${
            item.type === "Incident" ? "bg-error" : "bg-secondary"
          }`}
          aria-hidden="true"
        />
        {!isLast && (
          <div className="w-0.5 grow bg-slate-200 my-1" aria-hidden="true" />
        )}
      </div>

      {/* Khối nội dung bản ghi */}
      <div className={`grow pb-5 min-w-0 ${isLast ? "pb-1" : ""}`}>
        <div className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs">
          {/* Hàng đầu: Nhãn loại + Thời điểm */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              {item.type === "Incident" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-error-container text-on-error-container">
                  <span className="w-1.5 h-1.5 rounded-full bg-error" aria-hidden="true" />
                  Sự cố
                </span>
              )}

              {item.type === "QuickHealthStatus" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-surface-container-low text-secondary">
                  Sức khỏe nhanh
                </span>
              )}

              {item.type === "GrowthMeasurement" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-surface-container-low text-secondary">
                  Số đo
                </span>
              )}
            </div>

            <time
              dateTime={item.occurredAtUtc}
              className="text-xs text-on-surface-variant font-medium shrink-0"
            >
              {formattedTime}
            </time>
          </div>

          {/* Chi tiết nội dung theo từng loại */}
          {item.type === "Incident" && (
            <IncidentDetail item={item} onViewPhotos={onViewPhotos} />
          )}
          {item.type === "QuickHealthStatus" && <QuickHealthDetail item={item} />}
          {item.type === "GrowthMeasurement" && <GrowthMeasurementDetail item={item} />}
        </div>
      </div>
    </div>
  );
}

// Chi tiết sự cố: mô tả văn bản người dùng nhập giữ khoảng trắng và xuống dòng (whitespace-pre-wrap break-words)
// Kèm nút "Xem ảnh (n)" nếu sự cố có ảnh (photoCount > 0) theo SCR-MED-02 Vùng 3 & 4
function IncidentDetail({
  item,
  onViewPhotos,
}: {
  item: IncidentHistoryItemResponse;
  onViewPhotos?: (incidentId: string) => void;
}) {
  return (
    <div className="space-y-2 min-w-0">
      <p className="text-sm text-on-surface whitespace-pre-wrap break-words leading-relaxed">
        {item.description}
      </p>

      {item.photoCount > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => onViewPhotos?.(item.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg py-1 px-1.5 bg-primary-fixed/30 hover:bg-primary-fixed/50 transition-colors"
          >
            <Icons.Camera />
            <span>Xem ảnh ({item.photoCount})</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Chi tiết sức khỏe nhanh: tâm trạng tiếng Việt (chữ thường, không gắn tông đánh giá - design-system.md §3.2)
// + nhiệt độ (°C nếu có) + ghi chú (whitespace-pre-wrap break-words)
function QuickHealthDetail({ item }: { item: QuickHealthStatusHistoryItemResponse }) {
  const moodLabel = isHealthMood(item.mood) ? HEALTH_MOOD_LABELS[item.mood] : item.mood;
  const tempStr =
    item.temperatureCelsius !== null && item.temperatureCelsius !== undefined
      ? `${item.temperatureCelsius.toLocaleString("vi-VN")} °C`
      : null;

  return (
    <div className="text-sm text-on-surface flex flex-wrap items-baseline gap-1.5 min-w-0">
      <span className="font-medium shrink-0">{moodLabel}</span>
      {tempStr && (
        <>
          <span className="text-slate-400" aria-hidden="true">
            ·
          </span>
          <span className="shrink-0">{tempStr}</span>
        </>
      )}
      {item.notes && (
        <>
          <span className="text-slate-400" aria-hidden="true">
            ·
          </span>
          <span className="text-on-surface-variant whitespace-pre-wrap break-words min-w-0">
            {item.notes}
          </span>
        </>
      )}
    </div>
  );
}

// Chi tiết số đo: chỉ hiện giá trị có, không hiện "—" theo đặc tả SCR-MED-02
function GrowthMeasurementDetail({
  item,
}: {
  item: GrowthMeasurementHistoryItemResponse;
}) {
  const hasHeight = item.heightCm !== null && item.heightCm !== undefined;
  const hasWeight = item.weightKg !== null && item.weightKg !== undefined;

  if (!hasHeight && !hasWeight) {
    return null;
  }

  return (
    <div className="text-sm font-medium text-on-surface flex items-baseline gap-1.5">
      {hasHeight && (
        <span>{item.heightCm!.toLocaleString("vi-VN")} cm</span>
      )}
      {hasHeight && hasWeight && (
        <span className="text-slate-400" aria-hidden="true">
          ·
        </span>
      )}
      {hasWeight && (
        <span>{item.weightKg!.toLocaleString("vi-VN")} kg</span>
      )}
    </div>
  );
}
