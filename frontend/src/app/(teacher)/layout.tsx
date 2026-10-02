"use client";

import React from "react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";

const TEACHER_MENU_ITEMS: NavItem[] = [
  { label: "Điểm danh vào lớp", href: "/teacher/attendance", icon: "Check", iconColorClass: "text-primary" },
  { label: "Lịch sử điểm danh lớp", href: "/teacher/attendance-history", icon: "Clock" },
  { label: "Sức khỏe nhanh và sự cố", href: "/teacher/quick-health", icon: "Heart", iconColorClass: "text-error" },
  { label: "Đón về", href: "/teacher/pickup", icon: "User" },
  { label: "Lưu ý sức khỏe của lớp", href: "/teacher/class-health-notes", icon: "Clipboard" },
  { label: "Ảnh hoạt động", href: "/teacher/class-activities", icon: "Camera" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="Teacher">
      <DashboardLayout
        portalName="Cổng Giáo Viên"
        groupTitle="Nhóm Giáo viên"
        menuItems={TEACHER_MENU_ITEMS}
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}