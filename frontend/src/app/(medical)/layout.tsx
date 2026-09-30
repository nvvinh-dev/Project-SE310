"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout, { NavItem } from "@/components/DashboardLayout";

const MEDICAL_MENU_ITEMS: NavItem[] = [
  {
    label: "Chiều cao, cân nặng",
    href: "/health",
    icon: "monitor_weight",
    iconColorClass: "text-secondary",
  },
  {
    label: "Lịch sử sức khỏe và sự cố",
    href: "/medical-history",
    icon: "prescriptions",
  },
  {
    label: "Lưu ý sức khỏe",
    href: "/medical-health-notes",
    icon: "clinical_notes",
  },
  {
    label: "Thông báo sự cố",
    href: "/medical-incidents", // Không đặt /notifications để tránh trùng với Phụ huynh (Mục 7)
    icon: "report",
    iconColorClass: "text-tertiary-container",
  },
];

export default function MedicalLayout({
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
  if (user.role !== "Medical") {
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
            Tài khoản của bạn không thuộc vai trò <strong>Nhân viên Y tế</strong>.
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
      portalName="Cổng Y Tế"
      groupTitle="Nhóm Y tế học đường"
      menuItems={MEDICAL_MENU_ITEMS}
      contextBadge={{ icon: "local_hospital", label: "Phòng Y tế Học đường" }}
    >
      {children}
    </DashboardLayout>
  );
}