"use client";

import { useState } from "react";
import { Button, EmptyState, Icons } from "@/components";
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

                <p className="text-sm text-on-surface whitespace-pre-wrap wrap-anywhere min-w-0 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.photoCount > 0 && (
                <div className="shrink-0 self-end sm:self-start">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11"
                    icon={<Icons.Camera />}
                    onClick={() => setSelectedIncident(item)}
                    title={`Xem ảnh sự cố (${item.photoCount} ảnh)`}
                  >
                    Xem ảnh ({item.photoCount})
                  </Button>
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
