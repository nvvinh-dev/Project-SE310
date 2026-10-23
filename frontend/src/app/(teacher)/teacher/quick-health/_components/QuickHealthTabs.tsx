"use client";

import React from "react";
import { Icons } from "@/components";

export type QuickHealthTab = "health" | "incident";

interface QuickHealthTabsProps {
  activeTab: QuickHealthTab;
  onTabChange: (tab: QuickHealthTab) => void;
}

export function QuickHealthTabs({ activeTab, onTabChange }: QuickHealthTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Chuyển đổi chức năng sức khỏe nhanh và ghi sự cố"
      className="inline-flex p-1.5 rounded-2xl bg-surface-container-low border border-slate-200/80 gap-1.5 w-full sm:w-auto"
    >
      <button
        type="button"
        role="tab"
        id="tab-health"
        aria-selected={activeTab === "health"}
        aria-controls="panel-health"
        onClick={() => onTabChange("health")}
        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === "health"
            ? "bg-surface-container-lowest text-primary shadow-xs"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60"
        }`}
      >
        <span className={activeTab === "health" ? "text-primary" : "text-outline"}>
          <Icons.Heart />
        </span>
        <span>Sức khỏe nhanh</span>
      </button>

      <button
        type="button"
        role="tab"
        id="tab-incident"
        aria-selected={activeTab === "incident"}
        aria-controls="panel-incident"
        onClick={() => onTabChange("incident")}
        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === "incident"
            ? "bg-surface-container-lowest text-error shadow-xs"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60"
        }`}
      >
        <span className={activeTab === "incident" ? "text-error" : "text-outline"}>
          <Icons.Alert />
        </span>
        <span>Ghi sự cố</span>
      </button>
    </div>
  );
}
