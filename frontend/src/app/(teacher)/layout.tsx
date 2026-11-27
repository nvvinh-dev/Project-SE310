"use client";

import React from "react";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { countNotContacted } from "./teacher/absences/_lib/absence-rules";
import { useAbsencesToday } from "./teacher/absences/_lib/absences-api";

const TEACHER_MENU_ITEMS: NavItem[] = [
  { label: "Điểm danh vào lớp", href: "/teacher/attendance", icon: "Check", iconColorClass: "text-primary" },
  { label: "Vắng không phép cần liên hệ", href: "/teacher/absences", icon: "Alert" },
  { label: "Lịch sử điểm danh lớp", href: "/teacher/attendance-history", icon: "Clock" },
  { label: "Sức khỏe nhanh và sự cố", href: "/teacher/quick-health", icon: "Heart", iconColorClass: "text-error" },
  { label: "Đón về", href: "/teacher/pickup", icon: "User" },
  { label: "Lưu ý sức khỏe của lớp", href: "/teacher/class-health-notes", icon: "Clipboard" },
  { label: "Ảnh hoạt động", href: "/teacher/class-activities", icon: "Camera" },
];

const ABSENCES_HREF = "/teacher/absences";

// Menu SCR-TCH-07 có số đếm trẻ chưa liên hệ (ui-screens.md SCR-TCH-07, Hành vi 1). Tách ra để chỉ gọi API
// khi đã đăng nhập đúng vai trò Giáo viên, tức là bên trong RoleGuard
function TeacherShell({ children }: { children: React.ReactNode }) {
  const absencesQuery = useAbsencesToday();
  const count = countNotContacted(absencesQuery.data);

  const menuItems = TEACHER_MENU_ITEMS.map((item) =>
    item.href === ABSENCES_HREF && count ? { ...item, count, countLabel: `${count} trẻ chưa liên hệ` } : item
  );

  return (
    <DashboardLayout portalName="Cổng Giáo Viên" groupTitle="Nhóm Giáo viên" menuItems={menuItems}>
      {children}
    </DashboardLayout>
  );
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="Teacher">
      <TeacherShell>{children}</TeacherShell>
    </RoleGuard>
  );
}
