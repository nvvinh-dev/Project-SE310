"use client";

import React from "react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";

const MEDICAL_MENU_ITEMS: NavItem[] = [
  { label: "Chiều cao, cân nặng", href: "/medical/health", icon: "Activity", iconColorClass: "text-secondary" },
  { label: "Lịch sử sức khỏe và sự cố", href: "/medical/history", icon: "FileText" },
  { label: "Lưu ý sức khỏe", href: "/medical/health-notes", icon: "Clipboard" },
  { label: "Thông báo sự cố", href: "/medical/incidents", icon: "Alert", iconColorClass: "text-error" },
];

export default function MedicalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="Medical">
      <DashboardLayout
        portalName="Cổng Y Tế"
        groupTitle="Nhóm Y tế học đường"
        menuItems={MEDICAL_MENU_ITEMS}
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}