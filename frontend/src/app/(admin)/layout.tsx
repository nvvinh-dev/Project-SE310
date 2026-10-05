"use client";

import React from "react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";

const ADMIN_MENU_ITEMS: NavItem[] = [
  { label: "Tổng quan", href: "/admin/dashboard", icon: "Activity", iconColorClass: "text-primary" },
  { label: "Tài khoản và vai trò", href: "/admin/users", icon: "User" },
  { label: "Lớp và giáo viên chủ nhiệm", href: "/admin/classes", icon: "School" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="Admin">
      <DashboardLayout
        portalName="Cổng Quản Trị"
        groupTitle="Nhóm Ban giám hiệu"
        menuItems={ADMIN_MENU_ITEMS}
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
