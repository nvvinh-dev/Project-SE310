"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";

const TEACHER_MENU_ITEMS: NavItem[] = [
  {
    label: "Điểm danh vào lớp",
    href: "/attendance",
    icon: "how_to_reg",
    iconColorClass: "text-primary",
    badgeText: "Hôm nay",
    badgeVariant: "secondary",
  },
  {
    label: "Lịch sử điểm danh lớp",
    href: "/attendance-history",
    icon: "event_available",
  },
  {
    label: "Sức khỏe nhanh và sự cố",
    href: "/quick-health",
    icon: "health_and_safety",
    iconColorClass: "text-tertiary-container",
    badgeText: "2 cảnh báo",
    badgeVariant: "error",
  },
  {
    label: "Đón về",
    href: "/pickup",
    icon: "directions_walk",
  },
  {
    label: "Lưu ý sức khỏe của lớp",
    href: "/class-health-notes",
    icon: "clinical_notes",
  },
  {
    label: "Ảnh hoạt động",
    href: "/class-activities",
    icon: "photo_library",
  },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null;
  }

  // Chặn sai vai trò
  if (user.role !== "Teacher") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-md max-w-md flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] text-error">
            gpp_bad
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
            Không có quyền truy cập
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Tài khoản của bạn không thuộc vai trò <strong>Giáo viên</strong>.
          </p>
          <button
            onClick={() => void logout()}
            className="px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg"
          >
            Đăng xuất / Đổi tài khoản
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      portalName="Cổng Giáo Viên"
      groupTitle="Nhóm Giáo viên"
      menuItems={TEACHER_MENU_ITEMS}
      contextBadge={{ icon: "palette", label: "Lớp Mặt Trời 1 (4-5 Tuổi)" }}
    >
      {children}
    </DashboardLayout>
  );
}