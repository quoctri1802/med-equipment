import { Metadata } from "next"
import { Suspense } from "react"
import LoginForm from "@/components/LoginForm"
import Link from "next/link"
import Image from "next/image"
import { 
  Dna, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  FlaskConical, 
  Activity, 
  Sparkles,
  CheckCircle2,
  Cpu
} from "lucide-react"

export const metadata: Metadata = {
  title: "Đăng nhập | LabEquip Pro - Quản lý thiết bị xét nghiệm",
  description: "Cổng đăng nhập hệ thống quản lý thiết bị phòng xét nghiệm y khoa - TTYT Liên Chiểu",
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] font-sans text-[#0a192f] p-4 sm:p-6">
      {/* Background DNA Video */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center filter brightness-[0.95]"
        >
          <source src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/dna_video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Video Overlay with Biotech Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: "linear-gradient(135deg, rgba(240, 248, 255, 0.94) 0%, rgba(224, 242, 254, 0.88) 50%, rgba(240, 248, 255, 0.75) 100%)"
        }}
      />

      {/* =========================================================================
          FLOATING BACKGROUND ANIMATED BIOTECH ICONS (LAYER DEPTH)
          ========================================================================= */}
      {/* Top Left Floating DNA */}
      <div className="absolute top-[12%] left-[8%] pointer-events-none -z-10 hidden md:block animate-float-slow opacity-25">
        <div className="p-4 rounded-3xl bg-[#1a56db]/10 border border-[#1a56db]/20 text-[#1a56db] backdrop-blur-sm shadow-lg">
          <Dna className="w-10 h-10 animate-[spin_16s_linear_infinite]" />
        </div>
      </div>

      {/* Top Right Floating Lab Flask */}
      <div className="absolute top-[15%] right-[10%] pointer-events-none -z-10 hidden md:block animate-float-reverse opacity-25">
        <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 backdrop-blur-sm shadow-lg">
          <FlaskConical className="w-9 h-9 animate-[bounce_3s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Bottom Left Floating Heartbeat Activity */}
      <div className="absolute bottom-[12%] left-[10%] pointer-events-none -z-10 hidden md:block opacity-25">
        <div className="p-3.5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 backdrop-blur-sm shadow-lg animate-heartbeat">
          <Activity className="w-8 h-8" />
        </div>
      </div>

      {/* Bottom Right Floating Security Shield */}
      <div className="absolute bottom-[14%] right-[8%] pointer-events-none -z-10 hidden md:block animate-float-slow opacity-25">
        <div className="p-3.5 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 backdrop-blur-sm shadow-lg">
          <ShieldCheck className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      {/* Back to Home floating button with animated arrow */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-[#0a192f] text-xs font-semibold backdrop-blur-md border border-black/10 shadow-sm hover:shadow transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#1a56db] transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="relative w-full max-w-md my-8 animate-fade-in-up">
        {/* Main Glassmorphic Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(12,43,100,0.15)]">
          {/* Subtle top glow line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#1a56db]/50 to-transparent pointer-events-none" />

          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Chip Badge with Pulsing Sparkle */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] text-[11px] font-semibold tracking-wider uppercase mb-5 border border-[#0369a1]/15 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0369a1] animate-ping" />
              <Sparkles className="w-3 h-3 text-[#0369a1] animate-[spin_4s_linear_infinite]" />
              <span>CỔNG XÁC THỰC BẢO MẬT</span>
            </div>

            {/* Combined Brand Logo with Animated Rotating DNA and Hospital Crest */}
            <div className="flex items-center gap-3.5 mb-4">
              {/* DNA Animated Container */}
              <div className="relative group/dna">
                <div className="absolute -inset-1 rounded-2xl bg-[#1a56db]/30 blur-md opacity-40 group-hover/dna:opacity-80 transition duration-500 animate-pulse-glow" />
                <div className="relative w-13 h-13 p-3 rounded-2xl bg-[#eff6ff] border border-[#1a56db]/30 text-[#1a56db] flex items-center justify-center shadow-md shadow-[#1a56db]/10">
                  <Dna className="w-7 h-7 animate-[spin_10s_linear_infinite] hover:animate-[spin_3s_linear_infinite] transition-all cursor-pointer" />
                </div>
              </div>

              {/* Hospital Crest with hover scale */}
              <div className="relative group/logo">
                <div className="w-13 h-13 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover/logo:scale-105 transition-transform duration-300">
                  <Image 
                    src="/logo.png" 
                    alt="Logo TTYT Liên Chiểu" 
                    width={44} 
                    height={44} 
                    className="rounded-xl object-contain"
                  />
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0a192f] dark:text-white">
                LabEquip <span className="text-[#1a56db]">Pro</span>
              </h1>
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#475569] mt-1">
                TTYT KHU VỰC LIÊN CHIỂU • KHOA XÉT NGHIỆM
              </p>
            </div>
          </div>

          {/* Login Form Container with Animated Icons */}
          <div className="space-y-4">
            <Suspense fallback={<div className="text-center text-xs text-slate-500 py-8">Đang khởi tạo biểu mẫu xác thực...</div>}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Security & Verification Badges with Animated Icons */}
          <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[10px] text-[#475569] font-medium">
            <div className="group/badge flex items-center gap-1.5 hover:text-emerald-700 transition cursor-default">
              <ShieldCheck className="w-4 h-4 text-emerald-600 transition-transform duration-300 group-hover/badge:scale-125" />
              <span>ISO 15189:2022</span>
            </div>

            <span className="text-slate-300">|</span>

            <div className="group/badge flex items-center gap-1.5 hover:text-[#1a56db] transition cursor-default">
              <Lock className="w-3.5 h-3.5 text-[#1a56db] transition-transform duration-300 group-hover/badge:rotate-12" />
              <span>RBAC 256-Bit</span>
            </div>

            <span className="text-slate-300">|</span>

            <div className="group/badge flex items-center gap-1.5 hover:text-cyan-700 transition cursor-default">
              <Activity className="w-3.5 h-3.5 text-cyan-600 animate-heartbeat" />
              <span>24/7 Live</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 text-center text-[11px] text-[#475569] font-medium">
          &copy; {new Date().getFullYear()} TTYT Khu vực Liên Chiểu - Khoa Xét nghiệm • Phát triển bởi <strong className="text-[#0a192f] font-bold">QUỐC TRÍ</strong>
        </div>
      </div>
    </div>
  )
}
