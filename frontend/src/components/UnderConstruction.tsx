'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export interface MetricItem {
  label: string;
  value: string | number;
  subText: string;
  icon: string;
  variant: 'neutral' | 'primary' | 'secondary' | 'error';
}

export interface ModuleCardItem {
  title: string;
  description: string;
  href: string;
  icon: string;
  statusBadge: string;
  footerLeft: string;
  footerRight: string;
  variant: 'primary' | 'tertiary' | 'secondary' | 'neutral';
}

export interface ParentNoteItem {
  studentName: string;
  studentCode: string;
  tagText: string;
  tagIcon: string;
  content: string;
  variant: 'warm' | 'mint' | 'blue';
}

interface UnderConstructionProps {
  pageTitle: string;
  description?: string;
  classNameTitle?: string;
  semesterLabel?: string;
  primaryActionHref?: string;
  primaryActionLabel?: string;
  progressPercent?: number;
  metrics?: MetricItem[];
  modules?: ModuleCardItem[];
  notes?: ParentNoteItem[];
}

const DEFAULT_METRICS: MetricItem[] = [
  { label: 'Sĩ số lớp', value: 28, subText: 'thiếu nhi', icon: 'groups', variant: 'neutral' },
  { label: 'Đã đến lớp', value: 25, subText: '89.3%', icon: 'check_circle', variant: 'primary' },
  { label: 'Vắng có phép', value: 2, subText: 'bé (ốm nhẹ)', icon: 'event_busy', variant: 'secondary' },
  { label: 'Cần theo dõi', value: 1, subText: 'Bé Tuệ Nhi (Dị ứng)', icon: 'warning_amber', variant: 'error' },
];

const DEFAULT_MODULES: ModuleCardItem[] = [
  {
    title: 'Điểm danh vào lớp sáng',
    description: 'Ghi nhận giờ đón, thân nhiệt ban đầu và người đưa trẻ đến lớp. Tỉ lệ hôm nay đạt 89.3%.',
    href: '/attendance',
    icon: 'fact_check',
    statusBadge: 'Đang xây dựng',
    footerLeft: 'Đã ghi nhận: 25/28 bé',
    footerRight: 'Vào lớp',
    variant: 'primary',
  },
  {
    title: 'Sức khỏe nhanh & Sự cố',
    description: 'Cập nhật biểu đồ nhiệt độ 2 cữ/ngày, theo dõi dị ứng thức ăn và nhật ký xử lý vết xước.',
    href: '/quick-health',
    icon: 'health_and_safety',
    statusBadge: '1 Cảnh báo thuốc',
    footerLeft: 'Cữ đo kế tiếp: 13:30',
    footerRight: 'Chi tiết',
    variant: 'tertiary',
  },
  {
    title: 'Đón về & Thẻ ủy quyền',
    description: 'Quét mã thẻ định danh đón bé buổi chiều và xác thực người thân được ủy quyền.',
    href: '/pickup',
    icon: 'pin_drop',
    statusBadge: 'Sắp áp dụng',
    footerLeft: 'Bắt đầu lúc 16h00',
    footerRight: 'Xem trước',
    variant: 'secondary',
  },
  {
    title: 'Lịch sử điểm danh lớp',
    description: 'Tổng hợp tỷ lệ đi học theo tuần, tính tiền ăn bán trú tự động gửi về phòng Kế toán.',
    href: '/attendance-history',
    icon: 'calendar_month',
    statusBadge: 'Đang hoàn thiện',
    footerLeft: 'Dữ liệu: Tuần hiện tại',
    footerRight: 'Sắp mở',
    variant: 'neutral',
  },
  {
    title: 'Ảnh hoạt động & Album',
    description: 'Chia sẻ khoảnh khắc vui chơi học tập ngoài trời, giờ tạo hình đất nặn và tiệc sinh nhật.',
    href: '/class-activities',
    icon: 'photo_camera',
    statusBadge: 'Thử nghiệm nội bộ',
    footerLeft: '48 ảnh chờ duyệt',
    footerRight: 'Sắp mở',
    variant: 'neutral',
  },
  {
    title: 'Lưu ý sức khỏe của lớp',
    description: 'Phiếu bàn giao thuốc có xác nhận của phụ huynh, phân liều chuẩn xác theo chỉ dẫn y tế.',
    href: '/class-health-notes',
    icon: 'medical_services',
    statusBadge: 'Đồng bộ Y tế',
    footerLeft: 'Liên kết Y tế trường',
    footerRight: 'Xem sổ',
    variant: 'secondary',
  },
];

const DEFAULT_NOTES: ParentNoteItem[] = [
  {
    studentName: 'Bé Bảo An',
    studentCode: 'MT-14',
    tagText: '10:00',
    tagIcon: 'alarm',
    content: 'Mẹ gửi 01 chai siro ho thảo dược. Uống sau bữa ăn phụ 5ml, đã ký xác nhận bàn giao thuốc ở cổng.',
    variant: 'warm',
  },
  {
    studentName: 'Bé Gia Huy',
    studentCode: 'MT-08',
    tagText: 'Dinh dưỡng',
    tagIcon: 'nutrition',
    content: 'Mẹ gửi bình sữa hạt hạnh nhân riêng cho bữa chiều, bé không uống sữa bò tiệt trùng của trường.',
    variant: 'mint',
  },
  {
    studentName: 'Bé Minh Khôi',
    studentCode: 'MT-22',
    tagText: '16:15',
    tagIcon: 'schedule',
    content: 'Bà nội đón sớm hơn thường lệ (16h15) do gia đình có việc, cô chuẩn bị cặp sách giúp bé.',
    variant: 'blue',
  },
];

export default function UnderConstruction({
  pageTitle,
  description = 'Khu vực nghiệp vụ này đang được phòng Công nghệ Giáo dục phối hợp cùng các cô giáo và nhân viên y tế tối ưu hóa để hỗ trợ tốt nhất cho công tác chăm sóc các bé mỗi ngày.',
  classNameTitle = 'Lớp Mặt Trời 1 (4-5 Tuổi)',
  semesterLabel = 'Học kỳ 1 • 2026-2027',
  primaryActionHref = '/attendance',
  primaryActionLabel = 'Điểm danh ngay',
  progressPercent = 78,
  metrics = DEFAULT_METRICS,
  modules = DEFAULT_MODULES,
  notes = DEFAULT_NOTES,
}: UnderConstructionProps) {
  const { user } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="flex flex-col w-full py-space-md pb-space-xl">
      {/* Top Welcome & Status Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-tertiary-container/20 to-primary-container/20 blur-3xl"></div>
        <div className="pointer-events-none absolute left-1/3 -bottom-20 h-48 w-48 rounded-full bg-secondary-fixed/30 blur-2xl"></div>

        <div className="relative z-10 flex flex-col gap-space-md">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
            <div className="flex items-start gap-space-sm">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary-container shadow-inner">
                <span className="material-symbols-outlined text-[32px]">wb_sunny</span>
              </div>
              <div>
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="font-headline-md text-headline-md text-on-surface">
                    Chào buổi sáng, {user?.fullName || 'Cô giáo'}!
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-label-sm">
                    {semesterLabel}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Đang xem phân hệ <strong className="text-primary font-title-md">{pageTitle}</strong> •{' '}
                  <strong className="text-on-surface font-title-md">{classNameTitle}</strong>
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={primaryActionHref}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                <span>{primaryActionLabel}</span>
              </Link>
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container hover:text-on-surface transition-all">
                <span className="material-symbols-outlined text-secondary text-[18px]">medication</span>
                <span>Ghi chú thuốc / Dặn dò</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-lg text-label-lg hover:bg-error-container hover:text-on-error-container transition-all">
                <span className="material-symbols-outlined text-tertiary-container text-[18px]">emergency_share</span>
                <span>Báo y tế</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Pills Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm pt-2">
            {metrics.map((m, idx) => {
              const bgClass =
                m.variant === 'primary'
                  ? 'bg-primary-fixed/30'
                  : m.variant === 'secondary'
                  ? 'bg-secondary-fixed/40'
                  : m.variant === 'error'
                  ? 'bg-error-container/40'
                  : 'bg-surface-container-low';

              const textClass =
                m.variant === 'primary'
                  ? 'text-primary'
                  : m.variant === 'secondary'
                  ? 'text-secondary'
                  : m.variant === 'error'
                  ? 'text-error'
                  : 'text-outline';

              return (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl ${bgClass}`}>
                  <div
                    className={`h-10 w-10 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-sm ${
                      m.variant === 'neutral' ? 'text-primary' : textClass
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-label-sm text-label-sm uppercase tracking-wider ${textClass}`}>
                      {m.label}
                    </span>
                    <div className="flex items-baseline gap-1 truncate">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {m.value}
                      </span>
                      {m.variant === 'primary' ? (
                        <span className="font-label-sm text-label-sm px-1.5 py-0.2 rounded-full bg-primary text-on-primary">
                          {m.subText}
                        </span>
                      ) : (
                        <span
                          className={`font-body-sm text-body-sm truncate ${
                            m.variant === 'error' ? 'text-error font-medium' : 'text-on-surface-variant'
                          }`}
                        >
                          {m.subText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Split Layout: Under Construction Centerpiece + Daily Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-lg">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Primary Featured Card: Đang xây dựng */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#effcf5] via-[#fffbf2] to-[#fff4ec] p-space-xl shadow-md">
            <div className="pointer-events-none absolute -top-8 -right-8 w-44 h-44 rounded-full bg-tertiary-container/15 blur-2xl"></div>
            <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-primary-container/15 blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-space-xl">
              {/* Mascot SVG */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-40 h-40 rounded-3xl bg-surface-container-lowest p-3 shadow-md flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="80" cy="80" fill="#E8F8F1" r="70"></circle>
                    <circle cx="80" cy="65" fill="#FDE047" r="32"></circle>
                    <path
                      d="M80 20V28M80 102V110M35 65H43M117 65H125M48 33L54 39M106 91L112 97M48 97L54 91M106 39L112 33"
                      stroke="#F59E0B"
                      strokeLinecap="round"
                      strokeWidth="4"
                    ></path>
                    <circle cx="72" cy="62" fill="#4B5563" r="3.5"></circle>
                    <circle cx="88" cy="62" fill="#4B5563" r="3.5"></circle>
                    <path d="M74 72C76 76 84 76 86 72" stroke="#EF4444" strokeLinecap="round" strokeWidth="3"></path>
                    <ellipse cx="66" cy="69" fill="#FCA5A5" rx="3" ry="1.5"></ellipse>
                    <ellipse cx="94" cy="69" fill="#FCA5A5" rx="3" ry="1.5"></ellipse>
                    <rect fill="#4EBA8E" height="28" rx="6" width="28" x="36" y="105"></rect>
                    <text
                      fill="#FFFFFF"
                      fontFamily="'Plus Jakarta Sans', sans-serif"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      x="50"
                      y="124"
                    >
                      A
                    </text>
                    <rect fill="#77CDFF" height="35" rx="6" width="30" x="68" y="98"></rect>
                    <text
                      fill="#003554"
                      fontFamily="'Plus Jakarta Sans', sans-serif"
                      fontSize="16"
                      fontWeight="bold"
                      textAnchor="middle"
                      x="83"
                      y="120"
                    >
                      ★
                    </text>
                    <rect fill="#F7896D" height="28" rx="6" width="26" x="102" y="105"></rect>
                    <text
                      fill="#FFFFFF"
                      fontFamily="'Plus Jakarta Sans', sans-serif"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      x="115"
                      y="124"
                    >
                      1
                    </text>
                  </svg>
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#fde047] text-on-tertiary-container shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary-container animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                    Hệ Thống Sao Mai Edu
                  </span>
                </div>
              </div>

              {/* Nội dung thông báo Đang xây dựng */}
              <div className="flex flex-col gap-space-xs text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm">
                    Đang xây dựng
                  </span>
                  <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md">
                    Phân hệ: {pageTitle}
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                  {pageTitle} — Đang xây dựng 🎨
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-surface-container-highest/60 rounded-full h-3 overflow-hidden mt-1 p-0.5">
                  <div
                    className="bg-gradient-to-r from-primary-container to-secondary-container h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-label-sm font-label-sm text-outline">
                  <span>Tiến độ hoàn thiện: {progressPercent}%</span>
                  <span className="text-primary font-semibold">Giai đoạn: Kiểm thử tương thích sư phạm</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-space-sm pt-2 flex-wrap">
                  <Link
                    href={primaryActionHref}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    <span>Trở về trang chính</span>
                  </Link>
                  <button
                    onClick={() => setFeedbackOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-lg text-label-lg hover:bg-tertiary-container hover:text-on-tertiary transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                    <span>Gửi ý kiến đóng góp tính năng</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section Title for Grid Modules */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1.5 rounded-full bg-primary-container"></span>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">
                Bản đồ phân hệ nghiệp vụ
              </h3>
            </div>
            <span className="font-label-sm text-label-sm text-outline">
              {modules.length} phân hệ cốt lõi
            </span>
          </div>

          {/* Modules Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {modules.map((mod, i) => {
              const iconWrapClass =
                mod.variant === 'primary'
                  ? 'bg-primary-fixed/40 text-primary'
                  : mod.variant === 'tertiary'
                  ? 'bg-tertiary-fixed/50 text-tertiary'
                  : mod.variant === 'secondary'
                  ? 'bg-secondary-fixed/50 text-secondary'
                  : 'bg-surface-container-low text-outline';

              const badgeClass =
                mod.variant === 'primary'
                  ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                  : mod.variant === 'tertiary'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed font-bold'
                  : mod.variant === 'secondary'
                  ? 'bg-secondary-fixed text-on-secondary-fixed-variant font-bold'
                  : 'bg-surface-container text-on-surface-variant';

              return (
                <Link
                  key={i}
                  href={mod.href}
                  className="group flex flex-col justify-between p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${iconWrapClass}`}
                    >
                      <span className="material-symbols-outlined text-[24px]">{mod.icon}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1 ${badgeClass}`}>
                      {mod.statusBadge}
                    </span>
                  </div>
                  <div className="mt-space-md">
                    <div className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors font-bold">
                      {mod.title}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                      {mod.description}
                    </p>
                  </div>
                  <div className="mt-space-sm pt-space-xs flex items-center justify-between text-outline text-label-sm font-label-sm">
                    <span>{mod.footerLeft}</span>
                    <span className="text-primary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      {mod.footerRight} <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right 4 Columns */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Classroom Morning Notes Card */}
          <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">sticky_note_2</span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface font-bold">
                  Lưu ý phụ huynh sáng nay
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-label-sm">
                {notes.length} ghi chú
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {notes.map((n, idx) => {
                const cardBg =
                  n.variant === 'warm'
                    ? 'bg-[#fffbf2] hover:bg-surface-container-low'
                    : n.variant === 'mint'
                    ? 'bg-surface-container-low hover:bg-[#effcf5]'
                    : 'bg-[#f0f7ff] hover:bg-surface-container-low';

                const tagColor =
                  n.variant === 'warm'
                    ? 'text-tertiary'
                    : n.variant === 'mint'
                    ? 'text-primary'
                    : 'text-secondary';

                return (
                  <div key={idx} className={`p-3 rounded-2xl flex flex-col gap-1 transition-colors ${cardBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface font-bold">
                        {n.studentName} (Mã: {n.studentCode})
                      </span>
                      <span className={`font-label-sm text-label-sm font-semibold flex items-center gap-1 ${tagColor}`}>
                        <span className="material-symbols-outlined text-[14px]">{n.tagIcon}</span> {n.tagText}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{n.content}</p>
                  </div>
                );
              })}
            </div>

            <button className="w-full py-2 px-3 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center justify-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Thêm lưu ý mới từ phụ huynh</span>
            </button>
          </section>

          {/* Kindergarten Support & Administrative Hotline Card */}
          <section className="rounded-3xl bg-gradient-to-br from-surface-container-lowest to-[#eff9f4] p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="h-10 w-10 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">perm_phone_msg</span>
              </div>
              <div>
                <h4 className="font-title-md text-title-md text-on-surface font-bold">
                  Hỗ trợ nghiệp vụ &amp; Sư phạm
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Văn phòng MN Sao Mai luôn đồng hành
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-container-lowest">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline">Phòng Quản lý Sư phạm</span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Cô Trưởng khối Mai Chi
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold">
                  Máy lẻ: 102
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-container-lowest">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline">Phòng Y tế học đường</span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    BS. Lê Quỳnh Hương
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold">
                  Máy lẻ: 105
                </span>
              </div>
            </div>
            <div className="pt-1 flex items-center justify-center gap-1.5 text-outline font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
              <span>Chuẩn an toàn chăm sóc trẻ Sao Mai Gold Standard</span>
            </div>
          </section>

          {/* Daily Meal Plan Preview */}
          <div className="rounded-3xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-title-md text-title-md text-on-surface font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-[20px]">restaurant</span>
                Thực đơn hôm nay
              </span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">Theo tuần Dinh Dưỡng</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-body-sm text-body-sm">
              <div className="p-2 rounded-xl bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-outline font-bold">Bữa Sáng</span>
                <span className="text-on-surface font-medium mt-0.5">Súp gà bắp non</span>
              </div>
              <div className="p-2 rounded-xl bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-outline font-bold">Bữa Trưa</span>
                <span className="text-on-surface font-medium mt-0.5">Cơm tôm rim củ quả</span>
              </div>
              <div className="p-2 rounded-xl bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-label-sm text-outline font-bold">Bữa Xế</span>
                <span className="text-on-surface font-medium mt-0.5">Sữa chua hoa quả dầm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Interactive Modal (Quản lý bằng React State) */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface-container-lowest p-space-xl shadow-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Đóng góp ý kiến tính năng
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Gửi trực tiếp đến Tổ Công nghệ Giáo dục
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFeedbackOpen(false)}
                className="p-1 rounded-full text-outline hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-sm">
              <label className="font-label-md text-label-md text-on-surface">
                Phân hệ muốn đóng góp ý tưởng:
              </label>
              <select
                defaultValue={pageTitle}
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value={pageTitle}>{pageTitle}</option>
                <option>Đón trẻ buổi chiều &amp; Mã thẻ phụ huynh</option>
                <option>Nhật ký &amp; Album hoạt động của lớp</option>
                <option>Ghi chú sổ tay y tế &amp; Thuốc</option>
              </select>
              <label className="font-label-md text-label-md text-on-surface mt-2">
                Nội dung đề xuất / Mong muốn cụ thể:
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-2xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container resize-none"
                placeholder="Ví dụ: Tôi muốn có thêm nút gửi ảnh nhanh cho mẹ vào buổi trưa..."
                rows={4}
              ></textarea>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFeedbackOpen(false)}
                className="px-4 py-2 rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  alert('Cảm ơn! Ý kiến đóng góp đã được chuyển về ban phát triển phần mềm Sao Mai Edu.');
                  setFeedbackOpen(false);
                }}
                className="px-5 py-2 rounded-full font-label-md text-label-md bg-primary-container text-on-primary shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                Gửi góp ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}