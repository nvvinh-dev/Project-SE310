"use client";

import React from "react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";

const ACCOUNTANT_MENU_ITEMS: NavItem[] = [
  { label: "Quản lý học phí và hóa đơn", href: "/accountant/tuition", icon: "FileText", iconColorClass: "text-primary" },
  { label: "Báo cáo doanh thu", href: "/accountant/revenue", icon: "Activity" },
  { label: "Hồ sơ trẻ và phụ huynh", href: "/accountant/students", icon: "User" },
  { label: "Hồ sơ giáo viên", href: "/accountant/teachers", icon: "School" },
  { label: "Quản lý thực đơn tuần", href: "/accountant/menu", icon: "Clipboard" },
  { label: "Thông báo nghỉ học", href: "/accountant/notifications", icon: "Alert", iconColorClass: "text-error" },
];

export default function AccountantLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="Accountant">
      <DashboardLayout
        portalName="Cổng Kế Toán"
        groupTitle="Nhóm Kế toán & Văn phòng"
        menuItems={ACCOUNTANT_MENU_ITEMS}
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
