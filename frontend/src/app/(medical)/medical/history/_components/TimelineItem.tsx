"use client";

import { formatMeasurementDateTime } from "@/lib/datetime";
import {
  HEALTH_MOOD_LABELS,
  isHealthMood,
  type HealthHistoryItemResponse,
  type IncidentHistoryItemResponse,
  type QuickHealthStatusHistoryItemResponse,
  type GrowthMeasurementHistoryItemResponse,
} from "@/types/health";

interface TimelineItemProps {
  item: HealthHistoryItemResponse;
  isLast?: boolean;
}

// Render từng loại bản ghi trên dòng thời gian theo ui-screens.md §8 (SCR-MED-02)
export function TimelineItem({ item, isLast = false }: TimelineItemProps) {
  const formattedTime = formatMeasurementDateTime(item.occurredAtUtc);

  return (
    <div className="relative flex gap-4">
      {/* Cột trục thời gian (dot + vertical line) */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 border-surface-container-lowest mt-1.5 shrink-0 ${
            item.type === "Incident"
              ? "bg-error"
              : item.type === "QuickHealthStatus"
              ? "bg-secondary"
              : "bg-primary"
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
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
                  <span className="w-1.5 h-1.5 rounded-full bg-error" aria-hidden="true" />
                  Sự cố
                </span>
              )}

              {item.type === "QuickHealthStatus" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-low text-secondary">
                  Sức khỏe nhanh
                </span>
              )}

              {item.type === "GrowthMeasurement" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed/40 text-primary">
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
          {item.type === "Incident" && <IncidentDetail item={item} />}
          {item.type === "QuickHealthStatus" && <QuickHealthDetail item={item} />}
          {item.type === "GrowthMeasurement" && <GrowthMeasurementDetail item={item} />}
        </div>
      </div>
    </div>
  );
}

// Chi tiết sự cố: mô tả thuần văn bản, xuống dòng (D39 mục 17)
function IncidentDetail({ item }: { item: IncidentHistoryItemResponse }) {
  return (
    <p className="text-sm text-on-surface whitespace-pre-line leading-relaxed">
      {item.description}
    </p>
  );
}

// Chi tiết sức khỏe nhanh: tâm trạng tiếng Việt (chữ thường, không gắn tông đánh giá - design-system.md §3.2)
// + nhiệt độ (°C) + ghi chú
function QuickHealthDetail({ item }: { item: QuickHealthStatusHistoryItemResponse }) {
  const moodLabel = isHealthMood(item.mood) ? HEALTH_MOOD_LABELS[item.mood] : item.mood;
  const tempStr =
    item.temperatureCelsius !== null && item.temperatureCelsius !== undefined
      ? `${item.temperatureCelsius.toLocaleString("vi-VN")} °C`
      : null;

  return (
    <div className="text-sm text-on-surface flex flex-wrap items-baseline gap-1.5">
      <span className="font-medium">{moodLabel}</span>
      {tempStr && (
        <>
          <span className="text-slate-400">·</span>
          <span>{tempStr}</span>
        </>
      )}
      {item.notes && (
        <>
          <span className="text-slate-400">·</span>
          <span className="text-on-surface-variant whitespace-pre-line">{item.notes}</span>
        </>
      )}
    </div>
  );
}

// Chi tiết số đo: Chiều cao cm · Cân nặng kg (nếu null hiện "—" theo ui-screens.md)
function GrowthMeasurementDetail({
  item,
}: {
  item: GrowthMeasurementHistoryItemResponse;
}) {
  const heightText =
    item.heightCm !== null && item.heightCm !== undefined
      ? `${item.heightCm.toLocaleString("vi-VN")} cm`
      : "—";

  const weightText =
    item.weightKg !== null && item.weightKg !== undefined
      ? `${item.weightKg.toLocaleString("vi-VN")} kg`
      : "—";

  return (
    <div className="text-sm font-medium text-on-surface">
      <span>{heightText}</span>
      <span className="text-slate-400 mx-1.5">·</span>
      <span>{weightText}</span>
    </div>
  );
}
