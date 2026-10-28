"use client"

import React, { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Camera, Image as ImageIcon, Keyboard, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react"

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onError?: (error: string) => void
}

export default function QRScanner({ onScanSuccess, onError }: QRScannerProps) {
  const [mode, setMode] = useState<"camera" | "file" | "manual">("camera")
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [processingFile, setProcessingFile] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerId = "med-qr-reader"
  const isMountedRef = useRef(true)

  // Phát âm thanh bíp nhẹ bằng Web Audio API khi quét thành công
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // Bỏ qua nếu trình duyệt chặn audio
    }
  }

  // Rung phản hồi haptic
  const triggerHaptic = () => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([60, 40, 80])
      }
    } catch {
      // ignore
    }
  }

  const handleSuccess = async (text: string) => {
    if (!text || scannedResult) return
    setScannedResult(text)
    playBeep()
    triggerHaptic()

    // Dừng camera an toàn
    await stopCamera()

    // Chuyển kết quả về callback sau 300ms hiệu ứng
    setTimeout(() => {
      onScanSuccess(text)
    }, 350)
  }

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.getState() === 2) { // 2 = SCANNING
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch (err) {
        console.warn("Lỗi khi dừng camera:", err)
      } finally {
        scannerRef.current = null
        if (isMountedRef.current) {
          setCameraActive(false)
        }
      }
    }
  }

  const startCamera = async () => {
    setCameraError(null)
    setScannedResult(null)

    // Đảm bảo dừng instance cũ nếu có
    await stopCamera()

    try {
      const html5QrCode = new Html5Qrcode(containerId)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleSuccess(decodedText)
        },
        () => {
          // Frame không có QR - bỏ qua
        }
      )

      if (isMountedRef.current) {
        setCameraActive(true)
      }
    } catch (err: any) {
      console.warn("Không thể khởi động camera:", err)
      if (isMountedRef.current) {
        setCameraActive(false)
        setCameraError(
          "Không thể truy cập camera. Vui lòng cấp quyền camera trên trình duyệt hoặc sử dụng tính năng tải ảnh / nhập mã thủ công."
        )
      }
      onError?.(err?.message || "Lỗi camera")
    }
  }

  useEffect(() => {
    isMountedRef.current = true

    if (mode === "camera") {
      // Đợi DOM render thẻ container
      const timer = setTimeout(() => {
        startCamera()
      }, 150)
      return () => {
        clearTimeout(timer)
        stopCamera()
      }
    } else {
      stopCamera()
    }

    return () => {
      isMountedRef.current = false
      stopCamera()
    }
  }, [mode])

  // Xử lý quét qua tệp ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProcessingFile(true)
    setCameraError(null)

    try {
      // Dừng camera nếu đang chạy
      await stopCamera()

      const html5QrCode = new Html5Qrcode(containerId)
      const decodedText = await html5QrCode.scanFile(file, true)
      html5QrCode.clear()

      handleSuccess(decodedText)
    } catch (err: any) {
      console.warn("Lỗi quét ảnh:", err)
      setCameraError("Không nhận diện được mã QR trong ảnh. Vui lòng chụp rõ nét hơn hoặc nhập mã trực tiếp.")
    } finally {
      setProcessingFile(false)
    }
  }

  // Xử lý gửi mã thủ công
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    handleSuccess(manualCode.trim())
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Tab lựa chọn chế độ quét */}
      <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 flex gap-1 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => { setMode("camera"); setCameraError(null); }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            mode === "camera"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Camera</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode("file"); setCameraError(null); }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            mode === "file"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Tải ảnh QR</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode("manual"); setCameraError(null); }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            mode === "manual"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Nhập mã</span>
        </button>
      </div>

      {/* Vùng quét chính */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl min-h-[340px] flex flex-col items-center justify-center p-4">
        {/* DOM element bắt buộc cho Html5Qrcode */}
        <div
          id={containerId}
          className={`w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden ${
            mode === "camera" ? "block" : "hidden"
          }`}
        />

        {/* Khung ngắm laser khi ở chế độ Camera */}
        {mode === "camera" && cameraActive && !scannedResult && (
          <div className="pointer-events-none absolute inset-6 flex items-center justify-center">
            <div className="relative w-64 h-64 border-2 border-cyan-400/40 rounded-3xl">
              {/* 4 góc ngắm phát sáng */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />

              {/* Đường laser quét lên xuống */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse absolute top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Trạng thái đã quét thành công */}
        {scannedResult && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h4 className="font-black text-sm uppercase text-white tracking-wider">Đã nhận diện mã thiết bị!</h4>
            <p className="font-mono text-xs text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-500/30 max-w-xs break-all">
              {scannedResult}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">Đang mở hồ sơ thiết bị...</p>
          </div>
        )}

        {/* Chế độ File Upload */}
        {mode === "file" && !scannedResult && (
          <div className="text-center py-6 px-4 space-y-4 w-full">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase text-white">Chọn ảnh chứa mã QR</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Tải ảnh chụp tem thiết bị từ thư viện máy ảnh hoặc bộ nhớ thiết bị của bạn.
              </p>
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                id="qr-file-input"
                onChange={handleFileChange}
                disabled={processingFile}
                className="hidden"
              />
              <label
                htmlFor="qr-file-input"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                {processingFile ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang giải mã QR...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    Chọn tệp ảnh
                  </>
                )}
              </label>
            </div>
          </div>
        )}

        {/* Chế độ Nhập mã thủ công */}
        {mode === "manual" && !scannedResult && (
          <form onSubmit={handleManualSubmit} className="w-full max-w-sm py-4 px-2 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Keyboard className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h4 className="font-extrabold text-sm uppercase text-white">Nhập mã thiết bị</h4>
              <p className="text-xs text-slate-400 mt-1">
                Nhập mã định danh (VD: XN-01, HHO-002) hoặc dán đường dẫn QR.
              </p>
            </div>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ví dụ: XN-01 hoặc mã ID..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition font-semibold"
              autoFocus
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider disabled:opacity-50 transition shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Mở hồ sơ thiết bị
            </button>
          </form>
        )}

        {/* Thông báo lỗi nếu camera không bật được */}
        {cameraError && !scannedResult && (
          <div className="mt-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-xs text-center space-y-2 max-w-xs animate-shake">
            <div className="flex items-center justify-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Thông báo truy cập</span>
            </div>
            <p className="leading-relaxed opacity-90">{cameraError}</p>
            {mode === "camera" && (
              <button
                type="button"
                onClick={startCamera}
                className="mt-1 text-[11px] underline font-bold text-red-200 hover:text-white inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Thử kết nối lại camera
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ghi chú hướng dẫn */}
      <div className="text-center text-[11px] text-slate-400 font-medium">
        💡 Hướng camera vuông góc với tem mã QR dán trên thân máy xét nghiệm để nhận diện nhanh nhất.
      </div>
    </div>
  )
}
