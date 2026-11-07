"use client";

import { useState } from "react";
import { EmptyState, Icons } from "@/components";
import { formatMeasurementDateTime } from "@/lib/datetime";
import type { ChildIncidentSummaryResponse } from "@/types/incident";
import { IncidentPhotosModal } from "./IncidentPhotosModal";

interface IncidentTabProps {
  childId: string;
  items: ChildIncidentSummaryResponse[];
}

// SCR-PAR-03 Vùng [3]: Tab Sự cố (FR-INCIDENT-03, D39 mục 10)
export function IncidentTab({ childId, items }: IncidentTabProps) {
  const [selectedIncident, setSelectedIncident] =
    useState<ChildIncidentSummaryResponse | null>(null);

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
              {item.photoCount > 0 && (
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  {Array.from({ length: Math.min(item.photoCount, 5) }).map(
                    (_, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setSelectedIncident(item)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-slate-100 text-on-surface-variant hover:border-primary hover:text-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title={`Xem ảnh sự cố (${item.photoCount} ảnh)`}
                        aria-label={`Xem ảnh sự cố ${pIdx + 1}`}
                      >
                        <Icons.Camera />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <IncidentPhotosModal
        key={selectedIncident?.id ?? "none"}
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        childId={childId}
        incidentId={selectedIncident?.id ?? null}
        occurredAtUtc={selectedIncident?.occurredAtUtc}
        description={selectedIncident?.description}
      />
    </>
  );
}
