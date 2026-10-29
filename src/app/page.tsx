"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Dna, 
  ChevronDown, 
  ArrowRight, 
  Play, 
  QrCode, 
  ShieldCheck, 
  Activity, 
  FlaskConical, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Smartphone, 
  Lock, 
  Sparkles,
  X,
  CheckCircle2,
  Layers,
  Menu
} from "lucide-react"

export default function LandingPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0a192f] flex flex-col relative overflow-x-hidden font-sans">
      {/* =========================================================================
          BACKGROUND VIDEO & GRADIENT OVERLAY
          ========================================================================= */}
      {/* Absolute-positioned video covering the entire screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center filter brightness-[0.98]"
        >
          <source src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/dna_video.mp4" type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
        </video>
      </div>

      {/* Video Overlay: High-tech biotechnology gradient for maximum text contrast */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: "linear-gradient(90deg, rgba(240, 248, 255, 1) 0%, rgba(240, 248, 255, 0.88) 45%, rgba(240, 248, 255, 0.2) 100%)"
        }}
      />
      {/* Mobile-specific vertical gradient enhancer */}
      <div 
        className="md:hidden absolute inset-0 pointer-events-none -z-10"
        style={{
          background: "linear-gradient(180deg, rgba(240, 248, 255, 0.98) 0%, rgba(240, 248, 255, 0.92) 50%, rgba(240, 248, 255, 0.6) 100%)"
        }}
      />

      {/* =========================================================================
          NAVBAR
          ========================================================================= */}
      <header className="w-full py-6 px-6 sm:px-10 lg:px-16 flex items-center justify-between border-b border-black/[0.06] bg-white/40 backdrop-blur-md sticky top-0 z-40 transition-all">
        {/* Left: Logo container with DNA icon and stacked text */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-2xl bg-[#eff6ff] border border-[#1a56db]/20 text-[#1a56db] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#1a56db] group-hover:text-white transition-all duration-300">
            <Dna className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[1.5rem] font-bold text-[#0a192f] leading-none tracking-tight">
              Genova <span className="text-[#1a56db]">Lab</span>
            </span>
            <span className="text-[0.65rem] font-semibold text-[#475569] tracking-[2px] uppercase mt-1">
              BIOSCIENCES • LIÊN CHIỂU
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-10">
          {/* Solutions with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
              onMouseEnter={() => setIsSolutionsOpen(true)}
              className="flex items-center gap-1.5 text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors py-2"
            >
              <span>Giải Pháp</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSolutionsOpen ? 'rotate-180 text-[#1a56db]' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isSolutionsOpen && (
              <div 
                onMouseLeave={() => setIsSolutionsOpen(false)}
                className="absolute top-full left-0 w-72 bg-white/95 rounded-2xl shadow-xl border border-black/[0.08] p-3 backdrop-blur-xl animate-fade-in-up space-y-1 z-50"
              >
                <Link
                  href="/dashboard/equipment"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#eff6ff] text-[#0a192f] transition group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1a56db] group-hover:bg-[#1a56db] group-hover:text-white transition">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Quản Lý Trang Thiết Bị</p>
                    <p className="text-[10px] text-[#475569]">Số hóa & hồ sơ kỹ thuật số</p>
                  </div>
                </Link>

                <Link
                  href="/scanner"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#eff6ff] text-[#0a192f] transition group"
                >
                  <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Định Danh QR Thông Minh</p>
                    <p className="text-[10px] text-[#475569]">Quét mã tra cứu & báo cáo tức thì</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/reports"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#eff6ff] text-[#0a192f] transition group"
                >
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Chất Lượng ISO 15189</p>
                    <p className="text-[10px] text-[#475569]">Sổ theo dõi sự cố & nhật ký QC</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/reagents"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#eff6ff] text-[#0a192f] transition group"
                >
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Kho Hóa Chất & Vật Tư</p>
                    <p className="text-[10px] text-[#475569]">Cảnh báo hao mòn & hạn sử dụng</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <a href="#technology" className="text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors">
            Công Nghệ
          </a>
          <a href="#research" className="text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors">
            Nghiên Cứu & ISO
          </a>
          <a href="#about" className="text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors">
            Về Chúng Tôi
          </a>
          <a href="#contact" className="text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors">
            Liên Hệ
          </a>
        </nav>

        {/* Right: Primary "Contact Us" / "Login" Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/scanner"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[0.9rem] font-medium text-[#0a192f] bg-white/60 hover:bg-white border border-black/10 backdrop-blur-md transition-all shadow-sm active:scale-95"
          >
            <QrCode className="w-4 h-4 text-[#1a56db]" />
            <span>Quét QR</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0c2b64] hover:bg-[#133a80] text-white text-[0.95rem] font-medium transition-all shadow-lg shadow-[#0c2b64]/15 hover:-translate-y-0.5 active:scale-95"
          >
            <span>Đăng Nhập</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/70 border border-black/10 text-[#0a192f] active:scale-95"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-black/10 px-6 py-5 space-y-3 animate-fade-in-up z-30">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-4 rounded-xl text-sm font-semibold text-[#0a192f] hover:bg-[#eff6ff] hover:text-[#1a56db] transition"
          >
            Bảng điều khiển trung tâm
          </Link>
          <Link
            href="/dashboard/equipment"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-4 rounded-xl text-sm font-semibold text-[#0a192f] hover:bg-[#eff6ff] hover:text-[#1a56db] transition"
          >
            Hồ sơ thiết bị xét nghiệm
          </Link>
          <Link
            href="/scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-4 rounded-xl text-sm font-semibold text-[#0a192f] hover:bg-[#eff6ff] hover:text-[#1a56db] transition"
          >
            Máy quét mã QR di động
          </Link>
          <Link
            href="/dashboard/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-4 rounded-xl text-sm font-semibold text-[#0a192f] hover:bg-[#eff6ff] hover:text-[#1a56db] transition"
          >
            Báo cáo chất lượng ISO 15189
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-4 rounded-xl text-sm font-bold text-center bg-[#0c2b64] text-white transition mt-2 shadow-md"
          >
            Đăng nhập hệ thống
          </Link>
        </div>
      )}

      {/* =========================================================================
          HERO MAIN CONTENT (LEFT-ALIGNED)
          ========================================================================= */}
      <main className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-20 max-w-7xl w-full mx-auto z-10">
        <div className="max-w-[800px] text-left">
          {/* Chip / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e0f2fe] text-[#0369a1] text-[0.75rem] font-semibold uppercase tracking-[1px] mb-6 border border-[#0369a1]/15 shadow-sm animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0369a1] animate-pulse" />
            <span>INNOVATING LIFE SCIENCES • KHOA XÉT NGHIỆM</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-bold text-[#0a192f] leading-[1.1] tracking-[-0.02em] mb-6 animate-fade-in-up animation-delay-100">
            Tiên phong khoa học.
            <br />
            <span className="text-[#1a56db]">Chuyển hóa</span> y khoa tương lai.
          </h1>

          {/* Description */}
          <p className="text-[1.15rem] leading-[1.6] text-[#475569] mb-10 max-w-2xl font-normal animate-fade-in-up animation-delay-200">
            Genova Biosciences đồng hành cùng Khoa Xét nghiệm - TTYT Liên Chiểu trong việc phát triển các giải pháp số hóa toàn diện trang thiết bị, chuẩn hóa quy trình kiểm định IQC/EQC vì sự an toàn và sức khỏe cộng đồng.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 mb-16 animate-fade-in-up animation-delay-300">
            {/* Primary Action Button */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0c2b64] hover:bg-[#133a80] text-white text-[0.95rem] font-medium transition-all shadow-xl shadow-[#0c2b64]/20 hover:-translate-y-0.5 active:scale-95 group"
            >
              <span>Vào Bảng Điều Khiển</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary Action Button (Glassmorphism with Circle Play Icon) */}
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/60 hover:bg-white/80 text-[#0a192f] text-[0.95rem] font-medium backdrop-blur-md border border-black/10 hover:border-black/20 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95 group"
            >
              <div className="w-6 h-6 rounded-full bg-[#1a56db] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span>Xem Video Giới Thiệu</span>
            </button>
          </div>

          {/* Quick Metrics / Verification Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-black/10 max-w-xl animate-fade-in-up animation-delay-400">
            <div>
              <p className="text-2xl font-bold text-[#0a192f] tracking-tight">100%</p>
              <p className="text-xs text-[#475569] font-medium mt-0.5">Định danh số hóa QR</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a56db] tracking-tight">ISO 15189</p>
              <p className="text-xs text-[#475569] font-medium mt-0.5">Chuẩn năng lực xét nghiệm</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 tracking-tight">24/7</p>
              <p className="text-xs text-[#475569] font-medium mt-0.5">Tiếp nhận cấp cứu & trực máy</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FEATURE PILLARS (BIOTECH SYSTEM HIGHLIGHTS)
            ========================================================================= */}
        <section id="technology" className="mt-28 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#1a56db] mb-2">HỆ SINH THÁI Y KHOA TIÊN TIẾN</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0a192f] tracking-tight">
                Giải pháp công nghệ số cho phòng xét nghiệm
              </h2>
            </div>
            <Link
              href="/dashboard/equipment"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a56db] hover:text-[#0c2b64] transition group"
            >
              <span>Xem danh mục thiết bị</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: QR & Smart Asset Tracking */}
            <div className="relative group bg-white/70 hover:bg-white rounded-[2rem] p-8 border border-black/[0.08] backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-[#1a56db]/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#1a56db] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1a56db] group-hover:text-white transition-all shadow-sm">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0a192f] mb-3">Định Danh Mã QR Độc Bản</h3>
              <p className="text-sm text-[#475569] leading-relaxed font-normal">
                Mỗi thiết bị xét nghiệm được gắn mã QR duy nhất. Kỹ thuật viên dễ dàng quét mã bằng camera điện thoại để tra cứu thông số kỹ thuật, lịch sử hiệu chuẩn và nhật ký sử dụng.
              </p>
            </div>

            {/* Pillar 2: ISO 15189 Quality Control */}
            <div id="research" className="relative group bg-white/70 hover:bg-white rounded-[2rem] p-8 border border-black/[0.08] backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-[#1a56db]/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#1a56db] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1a56db] group-hover:text-white transition-all shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0a192f] mb-3">Kiểm Định Chất Lượng ISO 15189</h3>
              <p className="text-sm text-[#475569] leading-relaxed font-normal">
                Tự động hóa báo cáo kiểm định chất lượng phòng xét nghiệm y khoa. Xuất Excel mẫu biểu tiêu chuẩn, theo dõi nhật ký vận hành và ghi chép hành động khắc phục sự cố.
              </p>
            </div>

            {/* Pillar 3: AI Monitoring & RBAC Security */}
            <div id="about" className="relative group bg-white/70 hover:bg-white rounded-[2rem] p-8 border border-black/[0.08] backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-[#1a56db]/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#1a56db] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1a56db] group-hover:text-white transition-all shadow-sm">
                <Lock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0a192f] mb-3">Bảo Mật RBAC & Cảnh Báo AI</h3>
              <p className="text-sm text-[#475569] leading-relaxed font-normal">
                Phân quyền truy cập 3 tầng nghiêm ngặt (Admin, KTV bảo trì, Nhân viên xét nghiệm). Thuật toán phân tích dự đoán chu kỳ bảo dưỡng và phát hiện nguy cơ hỏng hóc sớm.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          INTERACTIVE VIDEO MODAL ("WATCH OUR STORY")
          ========================================================================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-black/[0.06] bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#eff6ff] rounded-xl text-[#1a56db]">
                  <Dna className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0a192f]">Genova Biosciences • Video Giới Thiệu</h3>
                  <p className="text-xs text-[#475569]">Số hóa trang thiết bị phòng xét nghiệm y khoa TTYT Liên Chiểu</p>
                </div>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-[#0a192f] transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video w-full bg-black">
              <video
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/dna_video.mp4" type="video/mp4" />
                Trình duyệt không hỗ trợ thẻ video.
              </video>
            </div>

            {/* Modal Footer Description */}
            <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#475569] leading-relaxed max-w-xl">
                Genova Biosciences ứng dụng các giải pháp phần mềm hiện đại vào y sinh học, nâng tầm năng lực xét nghiệm đạt chuẩn quốc tế.
              </p>
              <Link
                href="/dashboard"
                onClick={() => setIsVideoModalOpen(false)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0c2b64] text-white text-xs font-semibold hover:bg-[#133a80] transition"
              >
                <span>Trải nghiệm ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AWARD-WINNING RESPONSIVE FOOTER
          ========================================================================= */}
      <footer id="contact" className="relative bg-white/85 border-t border-black/[0.08] text-[#475569] text-xs py-14 px-6 sm:px-10 lg:px-16 backdrop-blur-xl z-10 mt-auto shrink-0 w-full overflow-hidden">
        {/* Subtle Ambient Glow Effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-[#1a56db]/30 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start">
          {/* Cột 1: Thương hiệu & Đơn vị chủ quản */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] border border-[#1a56db]/20 text-[#1a56db] flex items-center justify-center shadow-sm">
                <Dna className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-[#0a192f] uppercase">
                    Genova <span className="text-[#1a56db]">BioLab</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#e0f2fe] text-[#0369a1] border border-[#0369a1]/20">
                    v2.5 Pro
                  </span>
                </div>
                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mt-0.5">
                  Hệ thống số hóa trang thiết bị y tế
                </p>
              </div>
            </div>

            <div className="space-y-1 bg-white/70 p-3.5 rounded-2xl border border-black/[0.06] shadow-sm">
              <p className="text-[12px] font-black text-[#0a192f] uppercase tracking-wider">
                Trung tâm Y tế khu vực Liên Chiểu
              </p>
              <p className="text-[11px] font-bold text-[#1a56db] uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] animate-ping" />
                Khoa Xét Nghiệm • Chẩn đoán & Kiểm định
              </p>
              <p className="text-[10px] text-[#475569] font-medium pt-0.5">
                Chuyên khoa: Hóa sinh • Huyết học • Vi sinh • Miễn dịch
              </p>
            </div>

            <p className="text-[#475569] leading-relaxed font-normal text-[11px]">
              Giải pháp số hóa toàn diện giúp giám sát tình trạng vận hành, kiểm định chất lượng IQC/EQC, hiệu chuẩn định kỳ và theo dõi trang thiết bị xét nghiệm y khoa theo chuẩn mực an toàn sinh học.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Hệ thống trực tuyến 24/7
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#0369a1] border border-blue-200 shadow-sm">
                <Smartphone className="w-3.5 h-3.5 text-[#1a56db]" />
                Hỗ trợ PWA Mobile & Tablet
              </span>
            </div>
          </div>

          {/* Cột 2: Hỗ trợ kỹ thuật & Trực ban 24/7 */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase text-[#0a192f] tracking-widest border-b border-black/[0.08] pb-2.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1a56db]" />
              Hỗ trợ kỹ thuật & Trực ban 24/7
            </h4>

            {/* Hotline Highlight Card */}
            <div className="bg-gradient-to-br from-[#eff6ff] to-white border border-[#1a56db]/20 p-4 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#475569] tracking-wider">
                  Đường dây nóng kỹ thuật
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Sẵn sàng
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0c2b64] text-white flex items-center justify-center shadow-md shadow-[#0c2b64]/20 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <a
                    href="tel:0906440970"
                    className="font-mono font-bold text-[#0a192f] hover:text-[#1a56db] transition text-base tracking-wide"
                  >
                    0906.440.970
                  </a>
                  <p className="text-[10px] text-[#475569] font-medium">Bấm gọi hỗ trợ khẩn cấp</p>
                </div>
              </div>
            </div>

            <ul className="space-y-3 font-medium text-[#475569] text-[11px]">
              <li className="flex gap-2.5 items-start">
                <MapPin className="w-4 h-4 text-[#1a56db] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Trung tâm Y tế khu vực Liên Chiểu: 525 Tôn Đức Thắng, phường Hòa Khánh, TP. Đà Nẵng
                </span>
              </li>

              <li className="flex gap-2.5 items-start">
                <Mail className="w-4 h-4 text-[#1a56db] shrink-0 mt-0.5" />
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className="text-slate-400 text-[10px] uppercase">Email:</span>
                  <a href="mailto:tranquangvu230789@gmail.com" className="font-mono font-bold text-[#0a192f] hover:text-[#1a56db] transition break-all">
                    tranquangvu230789@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex gap-2.5 items-start pt-1 border-t border-black/[0.06]">
                <Clock className="w-4 h-4 text-[#1a56db] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[#0a192f]">Thời gian làm việc:</span>
                  <p className="text-[10px] text-[#475569]">
                    • Cấp cứu & tiếp nhận mẫu: <strong>24/24h (Tất cả các ngày)</strong><br />
                    • Giờ hành chính: Sáng 07:00 - 11:30 | Chiều 13:30 - 17:00
                  </p>
                </div>
              </li>

              <li className="text-[10px] text-slate-400 italic">
                * Tiếp nhận báo cáo sự cố máy móc, phiếu bảo dưỡng & kiểm định hiệu chuẩn thiết bị.
              </li>
            </ul>
          </div>

          {/* Cột 3: Tiêu chuẩn kỹ thuật & An toàn thông tin */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase text-[#0a192f] tracking-widest border-b border-black/[0.08] pb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Tiêu chuẩn & Kiểm định
            </h4>
            <div className="space-y-2.5 font-medium">
              <div className="group flex items-center gap-3 bg-white/70 border border-black/[0.06] p-3 rounded-2xl hover:border-emerald-500/50 hover:shadow-md transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#0a192f] uppercase tracking-wider">
                      ISO 15189:2022
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[10px] text-[#475569] font-normal leading-relaxed mt-0.5">
                    Quản lý chất lượng & năng lực phòng xét nghiệm y khoa
                  </p>
                </div>
              </div>

              <div className="group flex items-center gap-3 bg-white/70 border border-black/[0.06] p-3 rounded-2xl hover:border-[#1a56db]/50 hover:shadow-md transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#1a56db] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#0a192f] uppercase tracking-wider">
                      QR IDENTIFIER
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-blue-100 text-[#0369a1] border border-blue-300">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[10px] text-[#475569] font-normal leading-relaxed mt-0.5">
                    Tem định danh số hóa máy xét nghiệm toàn viện
                  </p>
                </div>
              </div>

              <div className="group flex items-center gap-3 bg-white/70 border border-black/[0.06] p-3 rounded-2xl hover:border-indigo-500/50 hover:shadow-md transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#0a192f] uppercase tracking-wider">
                      BẢO MẬT RBAC
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                      SECURE
                    </span>
                  </div>
                  <p className="text-[10px] text-[#475569] font-normal leading-relaxed mt-0.5">
                    Phân quyền đa tầng & kiểm soát truy cập dữ liệu y tế
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="relative z-10 max-w-7xl mx-auto border-t border-black/[0.08] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#475569] font-semibold text-[11px] text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>&copy; {new Date().getFullYear()} Trung tâm Y tế khu vực Liên Chiểu - Khoa Xét nghiệm. Bảo lưu mọi quyền.</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
            <span>Phát triển bởi</span>
            <span className="text-[#1a56db] font-bold">QUỐC TRÍ</span>
            <span className="text-slate-300">|</span>
            <span className="text-[#475569] font-normal normal-case">
              Hỗ trợ kỹ thuật: <strong className="font-mono text-[#0a192f]">0906440970</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
