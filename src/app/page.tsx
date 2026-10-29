"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { 
  FlaskConical,
  Dna, 
  ChevronDown, 
  ArrowRight, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  QrCode, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Smartphone, 
  Lock, 
  Sparkles,
  Layers,
  Menu,
  X,
  Maximize2
} from "lucide-react"

export default function LandingPage() {
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0a192f] flex flex-col relative overflow-x-hidden font-sans">
      {/* Background Cyber Lab Grid & Glow Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[45%] h-[55%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* =========================================================================
          NAVBAR
          ========================================================================= */}
      <header className="w-full py-5 px-6 sm:px-10 lg:px-16 flex items-center justify-between border-b border-black/[0.06] bg-white/70 backdrop-blur-xl sticky top-0 z-40 transition-all shadow-sm">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-2xl bg-[#eff6ff] border border-[#1a56db]/20 text-[#1a56db] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#1a56db] group-hover:text-white transition-all duration-300">
            <FlaskConical className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[1.4rem] font-bold text-[#0a192f] leading-none tracking-tight">
              LabEquip <span className="text-[#1a56db]">Center</span>
            </span>
            <span className="text-[0.65rem] font-bold text-[#475569] tracking-[1.5px] uppercase mt-1">
              TTYT KHU VỰC LIÊN CHIỂU • KHOA XÉT NGHIỆM
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Solutions with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
              onMouseEnter={() => setIsSolutionsOpen(true)}
              className="flex items-center gap-1.5 text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors py-2"
            >
              <span>Giải Pháp Xét Nghiệm</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSolutionsOpen ? 'rotate-180 text-[#1a56db]' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isSolutionsOpen && (
              <div 
                onMouseLeave={() => setIsSolutionsOpen(false)}
                className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-xl border border-black/[0.08] p-3 backdrop-blur-xl animate-fade-in-up space-y-1 z-50"
              >
                <Link
                  href="/dashboard/equipment"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#eff6ff] text-[#0a192f] transition group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1a56db] group-hover:bg-[#1a56db] group-hover:text-white transition">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Hồ Sơ Trang Thiết Bị</p>
                    <p className="text-[10px] text-[#475569]">Số hóa & thông số kỹ thuật</p>
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
                    <p className="text-xs font-bold">Định Danh Mã QR</p>
                    <p className="text-[10px] text-[#475569]">Tra cứu thông tin & báo lỗi nhanh</p>
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
                    <p className="text-xs font-bold">Tiêu Chuẩn ISO 15189</p>
                    <p className="text-[10px] text-[#475569]">Sổ sự cố & xuất báo cáo Excel</p>
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
                    <p className="text-[10px] text-[#475569]">Cảnh báo hao mòn & hạn dùng</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <a href="#technology" className="text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors">
            Công Nghệ Số
          </a>
          <a href="#iso-standards" className="text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors">
            Chuẩn ISO 15189
          </a>
          <a href="#about" className="text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors">
            Khoa Xét Nghiệm
          </a>
          <a href="#contact" className="text-[0.95rem] font-medium text-[#475569] hover:text-[#1a56db] transition-colors">
            Liên Hệ 24/7
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/scanner"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[0.9rem] font-medium text-[#0a192f] bg-white hover:bg-slate-50 border border-black/10 shadow-sm transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4 text-[#1a56db]" />
            <span>Quét QR</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0c2b64] hover:bg-[#133a80] text-white text-[0.95rem] font-medium transition-all shadow-md shadow-[#0c2b64]/20 hover:-translate-y-0.5 active:scale-95"
          >
            <span>Đăng Nhập</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white border border-black/10 text-[#0a192f] active:scale-95"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-black/10 px-6 py-5 space-y-3 animate-fade-in-up z-30 shadow-lg">
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
            Danh mục thiết bị xét nghiệm
          </Link>
          <Link
            href="/scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-4 rounded-xl text-sm font-semibold text-[#0a192f] hover:bg-[#eff6ff] hover:text-[#1a56db] transition"
          >
            Máy quét mã QR thiết bị
          </Link>
          <Link
            href="/dashboard/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 px-4 rounded-xl text-sm font-semibold text-[#0a192f] hover:bg-[#eff6ff] hover:text-[#1a56db] transition"
          >
            Báo cáo kiểm định chất lượng ISO 15189
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 px-4 rounded-xl text-sm font-bold text-center bg-[#0c2b64] text-white transition mt-2 shadow-md"
          >
            Đăng nhập hệ thống
          </Link>
        </div>
      )}

      {/* =========================================================================
          HERO SECTION (SPLIT LAYOUT: INFO LEFT + LIVE VIDEO PLAYER RIGHT)
          ========================================================================= */}
      <main className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-16 max-w-7xl w-full mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headlines, Description & Actions */}
          <div className="lg:col-span-7 text-left">
            {/* Chip Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e0f2fe] text-[#0369a1] text-[0.75rem] font-semibold uppercase tracking-[1px] mb-6 border border-[#0369a1]/15 shadow-sm animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-[#0369a1] animate-pulse" />
              <span>SỐ HÓA TRANG THIẾT BỊ • KHOA XÉT NGHIỆM</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[4.2rem] font-bold text-[#0a192f] leading-[1.12] tracking-[-0.02em] mb-6 animate-fade-in-up animation-delay-100">
              Tiên phong khoa học.
              <br />
              <span className="text-[#1a56db]">Chuyển hóa</span> y khoa tương lai.
            </h1>

            {/* Description */}
            <p className="text-[1.05rem] sm:text-[1.15rem] leading-[1.6] text-[#475569] mb-8 max-w-2xl font-normal animate-fade-in-up animation-delay-200">
              Hệ thống quản lý và số hóa toàn diện trang thiết bị phòng xét nghiệm y khoa - TTYT Khu vực Liên Chiểu. Ứng dụng công nghệ định danh mã QR thông minh, theo dõi chu kỳ bảo dưỡng và kiểm soát chất lượng đạt chuẩn ISO 15189.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 mb-10 animate-fade-in-up animation-delay-300">
              {/* Primary Action Button */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0c2b64] hover:bg-[#133a80] text-white text-[0.95rem] font-medium transition-all shadow-xl shadow-[#0c2b64]/20 hover:-translate-y-0.5 active:scale-95 group"
              >
                <span>Vào Bảng Điều Khiển</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary Action Button (Quét QR trực tiếp) */}
              <Link
                href="/scanner"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-[#0a192f] text-[0.95rem] font-medium border border-black/10 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95"
              >
                <QrCode className="w-4 h-4 text-[#1a56db]" />
                <span>Quét Mã QR Thiết Bị</span>
              </Link>
            </div>

            {/* Key Metrics / Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/10 max-w-lg animate-fade-in-up animation-delay-400">
              <div>
                <p className="text-2xl font-bold text-[#0a192f] tracking-tight">100%</p>
                <p className="text-xs text-[#475569] font-medium mt-0.5">Số hóa thiết bị qua QR</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a56db] tracking-tight">ISO 15189</p>
                <p className="text-xs text-[#475569] font-medium mt-0.5">Chuẩn năng lực xét nghiệm</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 tracking-tight">24/24h</p>
                <p className="text-xs text-[#475569] font-medium mt-0.5">Tiếp nhận & vận hành máy</p>
              </div>
            </div>
          </div>

          {/* Right Column: LIVE VIDEO DISPLAYED DIRECTLY ON THE INTERFACE */}
          <div className="lg:col-span-5 flex justify-center items-center animate-fade-in-up animation-delay-200">
            <div className="relative w-full max-w-[500px]">
              {/* High-tech Glow Backing */}
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-[#1a56db]/30 via-cyan-400/20 to-indigo-600/30 blur-xl opacity-70 group-hover:opacity-100 transition duration-700 pointer-events-none" />

              {/* Main Video Player Container Card */}
              <div className="relative bg-white/90 rounded-[2.2rem] p-3.5 sm:p-4 shadow-2xl border border-black/[0.08] backdrop-blur-xl">
                {/* Header Status Bar above video */}
                <div className="flex items-center justify-between px-3 py-2 mb-2 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="text-[11px] font-bold text-[#0a192f] uppercase tracking-wider">
                      LIVE LAB FEED • CÔNG NGHỆ PHÂN TỬ
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#eff6ff] text-[#1a56db] border border-[#1a56db]/20">
                    BIO-TECH 4.0
                  </span>
                </div>

                {/* The Embedded Video Viewport */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-inner bg-slate-950 group">
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover object-center cursor-pointer"
                    onClick={togglePlay}
                  >
                    <source src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/dna_video.mp4" type="video/mp4" />
                    Trình duyệt không hỗ trợ thẻ video.
                  </video>

                  {/* Subtle video scanline & gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Play / Pause Center Overlay (appears when paused) */}
                  {!isPlaying && (
                    <div 
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/90 text-[#0c2b64] flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Interactive Controls Overlay at bottom of video */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between text-white z-10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlay}
                        className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition active:scale-95"
                        title={isPlaying ? "Tạm dừng" : "Phát video"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>

                      <button
                        onClick={toggleMute}
                        className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition active:scale-95"
                        title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-wider bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-cyan-300">
                        DNA_HELIX_SIMULATION
                      </span>
                      <button
                        onClick={toggleFullScreen}
                        className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition active:scale-95"
                        title="Xem toàn màn hình"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer caption below video */}
                <div className="mt-3 px-2 flex items-center justify-between text-[11px] text-[#475569]">
                  <span className="flex items-center gap-1.5">
                    <Dna className="w-4 h-4 text-[#1a56db]" />
                    <span>Mô phỏng chuỗi xoắn kép DNA sinh học y khoa</span>
                  </span>
                  <span className="font-semibold text-emerald-600">● ỔN ĐỊNH</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            FEATURE PILLARS SECTION
            ========================================================================= */}
        <section id="technology" className="mt-24 sm:mt-32 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#1a56db] mb-2">HỆ THỐNG Y TẾ THÔNG MINH</p>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#0a192f] tracking-tight">
                Giải pháp số hóa toàn diện phòng xét nghiệm
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
            {/* Pillar 1: QR Code Tracking */}
            <div className="relative group bg-white rounded-[2rem] p-8 border border-black/[0.08] shadow-sm hover:shadow-xl hover:shadow-[#1a56db]/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#1a56db] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1a56db] group-hover:text-white transition-all shadow-sm">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0a192f] mb-3">Định Danh Mã QR Độc Bản</h3>
              <p className="text-sm text-[#475569] leading-relaxed font-normal">
                Mỗi thiết bị xét nghiệm được gắn mã QR định danh riêng biệt. Cán bộ y tế quét mã bằng điện thoại thông minh để tra cứu hồ sơ, lịch bảo trì và gửi báo cáo sự cố tức thời.
              </p>
            </div>

            {/* Pillar 2: ISO 15189 Quality Control */}
            <div id="iso-standards" className="relative group bg-white rounded-[2rem] p-8 border border-black/[0.08] shadow-sm hover:shadow-xl hover:shadow-[#1a56db]/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#1a56db] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1a56db] group-hover:text-white transition-all shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0a192f] mb-3">Kiểm Định Chất Lượng ISO 15189</h3>
              <p className="text-sm text-[#475569] leading-relaxed font-normal">
                Số hóa toàn bộ hồ sơ kiểm định chất lượng, nhật ký vận hành máy, hiệu chuẩn định kỳ IQC/EQC và tự động xuất các biểu mẫu Excel theo quy chuẩn y tế quốc gia.
              </p>
            </div>

            {/* Pillar 3: RBAC Security */}
            <div id="about" className="relative group bg-white rounded-[2rem] p-8 border border-black/[0.08] shadow-sm hover:shadow-xl hover:shadow-[#1a56db]/5 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#1a56db] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1a56db] group-hover:text-white transition-all shadow-sm">
                <Lock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0a192f] mb-3">Phân Quyền Đa Tầng RBAC</h3>
              <p className="text-sm text-[#475569] leading-relaxed font-normal">
                Phân quyền truy cập 3 cấp độ chặt chẽ (Ban giám đốc, Kỹ thuật viên bảo trì máy, Nhân viên xét nghiệm). Bảo đảm an toàn thông tin và ghi vết nhật ký vận hành 24/7.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          VERIFIED HOSPITAL FOOTER
          ========================================================================= */}
      <footer id="contact" className="relative bg-white border-t border-black/[0.08] text-[#475569] text-xs py-14 px-6 sm:px-10 lg:px-16 z-10 mt-auto shrink-0 w-full overflow-hidden">
        {/* Subtle Ambient Glow Effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-[#1a56db]/30 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start">
          {/* Cột 1: Thương hiệu & Đơn vị chủ quản */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] border border-[#1a56db]/20 text-[#1a56db] flex items-center justify-center shadow-sm">
                <FlaskConical className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-[#0a192f] uppercase">
                    LabEquip <span className="text-[#1a56db]">Center</span>
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

            <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-black/[0.06] shadow-sm">
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
              <div className="group flex items-center gap-3 bg-slate-50 border border-black/[0.06] p-3 rounded-2xl hover:border-emerald-500/50 hover:shadow-md transition-all duration-300">
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

              <div className="group flex items-center gap-3 bg-slate-50 border border-black/[0.06] p-3 rounded-2xl hover:border-[#1a56db]/50 hover:shadow-md transition-all duration-300">
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

              <div className="group flex items-center gap-3 bg-slate-50 border border-black/[0.06] p-3 rounded-2xl hover:border-indigo-500/50 hover:shadow-md transition-all duration-300">
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
