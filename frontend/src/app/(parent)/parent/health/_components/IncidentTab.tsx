"use client";

import { useState } from "react";
import { EmptyState } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import type { IncidentResponse } from "@/types/incident";
import { IncidentPhotosModal } from "./IncidentPhotosModal";

interface IncidentTabProps {
  items: IncidentResponse[];
  onRefreshPhotos?: () => void;
}

// SCR-PAR-03 Vùng [3]: Tab Sự cố
export function IncidentTab({ items, onRefreshPhotos }: IncidentTabProps) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Tìm sự cố đang xem từ items hiện tại để tự động nhận URL mới khi refetch (Lỗi 2.1)
  const selectedIncident = items.find((i) => i.id === selectedIncidentId) ?? null;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Chưa có sự cố"
        message="Chưa có ghi nhận sự cố nào của con."
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200/90 bg-surface-container-lowest p-4 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-2 text-sm text-on-surface min-w-0">
                <time
                  dateTime={item.occurredAtUtc}
                  className="text-xs font-medium text-on-surface-variant shrink-0 mr-1"
                >
                  {formatMeasurementDateTime(item.occurredAtUtc)}
                </time>

                <p className="text-sm text-on-surface whitespace-pre-wrap break-words leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Wireframe: [ảnh][ảnh] */}
              {item.photos.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  {item.photos.map((photo, pIdx) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setSelectedIncidentId(item.id)}
                      className="rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      title="Xem ảnh sự cố"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={`Ảnh sự cố ${pIdx + 1}`}
                        className="h-10 w-10 object-cover bg-slate-100"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <IncidentPhotosModal
        key={selectedIncidentId ?? "none"}
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncidentId(null)}
        incident={selectedIncident}
        onRefreshPhotos={onRefreshPhotos}
      />
    </>
  );
}
