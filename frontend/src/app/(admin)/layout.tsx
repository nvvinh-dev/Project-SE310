"use client";

import React from "react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useAbsenceEscalations } from "./admin/absences/_lib/absences-api";

const ADMIN_MENU_ITEMS: NavItem[] = [
  { label: "Tổng quan", href: "/admin/dashboard", icon: "Activity", iconColorClass: "text-primary" },
  { label: "Tài khoản và vai trò", href: "/admin/users", icon: "User" },
  { label: "Lớp và giáo viên", href: "/admin/classes", icon: "School" },
  { label: "Phản ánh của phụ huynh", href: "/admin/complaints", icon: "Clipboard" },
  { label: "Vắng không phép cần xử lý", href: "/admin/absences", icon: "Alert" },
  { label: "Thông báo", href: "/admin/notifications", icon: "Info" },
];

const ABSENCES_HREF = "/admin/absences";

// Menu SCR-ADM-06 có số đếm (ui-screens.md SCR-ADM-06). Tách ra để chỉ gọi API khi đã đăng nhập đúng vai
// trò Admin, tức là bên trong RoleGuard
function AdminShell({ children }: { children: React.ReactNode }) {
  const escalationsQuery = useAbsenceEscalations();
  const count = escalationsQuery.data?.length;

  const menuItems = ADMIN_MENU_ITEMS.map((item) =>
    item.href === ABSENCES_HREF && count ? { ...item, count, countLabel: `${count} trẻ cần xử lý` } : item
  );

  return (
    <DashboardLayout portalName="Cổng Quản Trị" groupTitle="Nhóm Ban giám hiệu" menuItems={menuItems}>
      {children}
    </DashboardLayout>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="Admin">
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}
