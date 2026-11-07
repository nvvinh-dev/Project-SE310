"use client";

import { useState } from "react";
import { EmptyState, Icons } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import type { IncidentResponse } from "@/types/incident";
import { IncidentPhotosModal } from "./IncidentPhotosModal";

interface IncidentTabProps {
  items: IncidentResponse[];
  onRefreshPhotos?: () => void;
}

// SCR-PAR-03 Vùng [3]: Tab Sự cố
export function IncidentTab({ items, onRefreshPhotos }: IncidentTabProps) {
  const [selectedIncident, setSelectedIncident] = useState<IncidentResponse | null>(null);

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
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <time
                    dateTime={item.occurredAtUtc}
                    className="text-xs font-medium text-on-surface-variant shrink-0"
                  >
                    {formatMeasurementDateTime(item.occurredAtUtc)}
                  </time>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
                    <span className="w-1.5 h-1.5 rounded-full bg-error" aria-hidden="true" />
                    Sự cố
                  </span>
                </div>

                <p className="text-sm text-on-surface whitespace-pre-wrap break-words">
                  {item.description}
                </p>
              </div>

              {/* Wireframe: [ảnh][ảnh] */}
              {item.photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIncident(item)}
                  className="flex items-center gap-1.5 shrink-0 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  title="Xem ảnh sự cố"
                >
                  <div className="flex -space-x-2 overflow-hidden">
                    {item.photos.slice(0, 3).map((photo, pIdx) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={`Ảnh sự cố ${pIdx + 1}`}
                        className="inline-block h-10 w-10 rounded-lg object-cover ring-2 ring-surface-container-lowest bg-slate-100"
                      />
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-primary px-1 flex items-center gap-1">
                    <Icons.Camera />
                    <span>{item.photos.length}</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <IncidentPhotosModal
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        incident={selectedIncident}
        onRefreshPhotos={onRefreshPhotos}
      />
    </>
  );
}
