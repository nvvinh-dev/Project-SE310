"use client";

import React from "react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";

const PARENT_MENU_ITEMS: NavItem[] = [
  { label: "Điểm danh của con", href: "/parent/attendance", icon: "Clock", iconColorClass: "text-primary" },
  { label: "Sức khỏe và sự cố của con", href: "/parent/health", icon: "Heart", iconColorClass: "text-error" },
  { label: "Đăng ký người đón", href: "/parent/pickup", icon: "User" },
  { label: "Ảnh hoạt động", href: "/parent/activities", icon: "Camera" },
  { label: "Học phí và hóa đơn", href: "/parent/tuition", icon: "FileText" },
  { label: "Thực đơn tuần", href: "/parent/menu", icon: "Clipboard" },
  { label: "Thông báo", href: "/parent/notifications", icon: "Alert" },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="Parent">
      <DashboardLayout
        portalName="Cổng Phụ Huynh"
        groupTitle="Dành cho Phụ huynh"
        menuItems={PARENT_MENU_ITEMS}
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
