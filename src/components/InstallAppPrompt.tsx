"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react"

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop")

  useEffect(() => {
    // 1. Kiểm tra xem app đã chạy ở chế độ standalone (đã cài đặt) chưa
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      setIsInstalled(isStandalone)
      return isStandalone
    }

    if (checkInstalled()) {
      return
    }

    // 2. Nhận diện nền tảng thiết bị
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    const isAndroidDevice = /android/.test(userAgent)

    if (isIOSDevice) {
      setPlatform("ios")
    } else if (isAndroidDevice) {
      setPlatform("android")
    } else {
      setPlatform("desktop")
    }

    // 3. Bắt sự kiện beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // Bắt sự kiện appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowBanner(false)
      setShowModal(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    // Lắng nghe sự kiện tùy biến từ menu Sidebar hoặc bất kỳ đâu để mở modal cài đặt
    const handleOpenModal = () => {
      setShowModal(true)
    }
    window.addEventListener("open-install-modal", handleOpenModal)

    // 4. Kiểm tra xem người dùng có từng bấm tắt banner gần đây không (lưu 2 ngày)
    const dismissedTime = localStorage.getItem("med_pwa_banner_dismissed")
    const now = Date.now()
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000

    if (!dismissedTime || now - parseInt(dismissedTime, 10) > TWO_DAYS) {
      // Đợi 2.5 giây sau khi tải trang để không làm phiền người dùng ngay lập tức
      const timer = setTimeout(() => {
        if (!checkInstalled()) {
          setShowBanner(true)
        }
      }, 2500)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
      window.removeEventListener("open-install-modal", handleOpenModal)
    }
  }, [])

  const handleDismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem("med_pwa_banner_dismissed", Date.now().toString())
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
        setShowBanner(false)
        setShowModal(false)
      }
    } else {
      // Nếu không có prompt tự động (iOS hoặc trình duyệt cần thao tác tay), mở Modal hướng dẫn
      setShowModal(true)
    }
  }

  if (isInstalled) {
    return null
  }

  return (
    <>
      {/* 1. Floating Banner dành cho điện thoại và máy tính (nếu chưa cài) */}
      {showBanner && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/40 text-white rounded-3xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Hiệu ứng phát sáng */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-lg shrink-0 flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-full" />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Ứng dụng di động
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-white uppercase tracking-tight truncate">
                  Cài đặt LabEquip lên điện thoại
                </h4>
                <p className="text-[11px] text-slate-350 mt-1 leading-snug">
                  Mở 1 chạm từ màn hình chính, quét QR mượt mà và hoạt động nhanh chóng!
                </p>
              </div>

              <button
                type="button"
                onClick={handleDismissBanner}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition shrink-0"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
              <button
                type="button"
                onClick={handleDismissBanner}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-200 px-3 py-1.5"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md shadow-blue-500/25 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cài đặt ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Hướng dẫn Cài đặt Chi tiết cho iOS & Android */}
      {showModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden space-y-5">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">
                    Cài đặt ứng dụng di động
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Khoa Xét Nghiệm • TTYT Liên Chiểu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setPlatform("ios")}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  platform === "ios"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                🍎 iPhone / iPad (iOS)
              </button>
              <button
                type="button"
                onClick={() => setPlatform("android")}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  platform === "android" || platform === "desktop"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                🤖 Android / Chrome
              </button>
            </div>

            {/* Nội dung hướng dẫn theo hệ điều hành */}
            {platform === "ios" ? (
              <div className="space-y-3.5 text-xs">
                <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  Trên thiết bị Apple (iPhone / iPad), Apple yêu cầu cài đặt ứng dụng qua trình duyệt <strong>Safari</strong> theo các bước sau:
                </p>

                <div className="space-y-3">
                  {/* Bước 1 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Mở bằng trình duyệt Safari
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Đảm bảo bạn đang mở trang web này trong ứng dụng <strong>Safari</strong> trên iPhone.
                      </p>
                    </div>
                  </div>

                  {/* Bước 2 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span>Nhấn nút Chia sẻ</span>
                        <Share2 className="w-4 h-4 text-blue-500 inline" />
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Biểu tượng hình vuông có mũi tên hướng lên ở thanh công cụ dưới cùng của Safari.
                      </p>
                    </div>
                  </div>

                  {/* Bước 3 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span>Chọn &quot;Thêm vào MH chính&quot;</span>
                        <PlusSquare className="w-4 h-4 text-green-500 inline" />
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Cuộn xuống menu chọn <em>Add to Home Screen</em> (Thêm vào Màn hình chính).
                      </p>
                    </div>
                  </div>

                  {/* Bước 4 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Nhấn nút &quot;Thêm&quot; ở góc trên bên phải
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Biểu tượng <strong>LabEquip</strong> sẽ xuất hiện trên màn hình điện thoại như một ứng dụng độc lập!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {deferredPrompt ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                      <Zap className="w-7 h-7 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                        Thiết bị của bạn đã sẵn sàng cài đặt!
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 max-w-xs mx-auto">
                        Nhấn nút bên dưới để xác nhận thêm ứng dụng vào màn hình chính của điện thoại.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 active:scale-95 transition"
                    >
                      Bấm cài đặt ngay vào điện thoại
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                      Trên thiết bị Android hoặc máy tính (Chrome, Cốc Cốc, Edge):
                    </p>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span>1. Nhấn nút Cài đặt tự động:</span>
                      </p>
                      <button
                        type="button"
                        onClick={handleInstallClick}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition"
                      >
                        Thử kích hoạt cài đặt
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        2. Cài đặt thủ công qua menu trình duyệt:
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Nhấn vào biểu tượng <strong>3 chấm dọc ⋮</strong> ở góc trên bên phải trình duyệt Chrome $\rightarrow$ Chọn <strong>&quot;Cài đặt ứng dụng&quot;</strong> hoặc <strong>&quot;Thêm vào Màn hình chính&quot;</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Modal */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
