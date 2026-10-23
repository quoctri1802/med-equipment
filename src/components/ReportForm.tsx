"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { submitScanReport } from "@/app/actions/report"
import { CheckCircle2, Camera, X, Play, Square, Activity, ShieldAlert, Loader2 } from "lucide-react"
import { compressImage } from "@/lib/imageCompress"

interface ReportFormProps {
  equipmentId: string
  photoCount?: number
  onViewGallery?: () => void
  onReportSuccess?: () => void
}

export default function ReportForm({ 
  equipmentId,
  photoCount = 0,
  onViewGallery,
  onReportSuccess
}: ReportFormProps) {
  const router = useRouter()
  const formRef = useRef(null)
  const [status, setStatus] = useState("WORKING")
  const [note, setNote] = useState("")
  const [reporterName, setReporterName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)

  // Chế độ tự động gửi
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Tự động điền tên và lưu chế độ
  useEffect(() => {
    const savedName = localStorage.getItem("med_reporter_name")
    if (savedName) setReporterName(savedName)

    const savedAuto = localStorage.getItem("med_auto_mode") === "true"
    setIsAutoMode(savedAuto)
  }, [])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setCompressing(true)
        // Nén ảnh trực tiếp tại client để dung lượng nhẹ (<150KB), tải siêu nhanh
        const { file: compressedFile, base64 } = await compressImage(file, 1280, 1280, 0.75)
        setImageFile(compressedFile)
        setImagePreview(base64)
        setImageBase64(base64)
      } catch (err) {
        console.error("Lỗi nén ảnh:", err)
        setImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
          setImageBase64(reader.result as string)
        }
        reader.readAsDataURL(file)
      } finally {
        setCompressing(false)
      }
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageBase64(null)
  }

  const performSubmit = async (formData: { status: string; note: string; reporterName: string }) => {
    setLoading(true)
    try {
      let photoUrl: string | null = null

      if (imageFile || imageBase64) {
        setUploading(true)
        try {
          if (imageFile) {
            const uploadFormData = new FormData()
            uploadFormData.append("file", imageFile)
            
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData
            })
            
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json()
              photoUrl = uploadData.url
            } else {
              // Dự phòng an toàn: nếu API upload không lưu được file, dùng trực tiếp Base64 đã nén
              photoUrl = imageBase64
            }
          } else {
            photoUrl = imageBase64
          }
        } catch (uploadError) {
          console.warn("Lỗi gọi API upload, chuyển sang lưu trực tiếp Data URL:", uploadError)
          photoUrl = imageBase64
        } finally {
          setUploading(false)
        }
      }

      const res = await submitScanReport(equipmentId, {
        status: formData.status,
        note: formData.note,
        reporterName: formData.reporterName,
        photoUrl
      })

      if (res.success) {
        localStorage.setItem("med_reporter_name", formData.reporterName)
        setSuccess(true)
        setNote("")
        setImageFile(null)
        setImagePreview(null)
        setImageBase64(null)
        onReportSuccess?.()
        router.refresh()
      } else {
        alert("Gửi báo cáo thất bại")
      }
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  // Countdown for Auto Mode
  useEffect(() => {
    if (!isAutoMode || status !== "WORKING" || !reporterName.trim() || success) {
      setCountdown(null)
      return
    }

    setCountdown(5)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null
        if (prev <= 1) {
          clearInterval(interval)
          performSubmit({ status, note, reporterName })
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isAutoMode, status, reporterName, success])

  const toggleAutoMode = () => {
    const newVal = !isAutoMode
    setIsAutoMode(newVal)
    localStorage.setItem("med_auto_mode", newVal.toString())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reporterName.trim()) {
        alert("Vui lòng nhập tên người báo cáo.")
        return
    }
    await performSubmit({ status, note, reporterName })
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-955/20 text-green-700 dark:text-green-400 p-8 rounded-3xl border border-green-200 dark:border-green-900/30 text-center shadow-md flex flex-col items-center">
        <CheckCircle2 className="w-16 h-16 text-green-550 mb-4 animate-bounce" />
        <h3 className="font-extrabold text-lg mb-2 uppercase">Đã cập nhật trạng thái thành công!</h3>
        <p className="text-xs font-semibold opacity-85 mb-6 max-w-xs leading-relaxed">Thông tin báo cáo đã được lưu vào hệ thống. Các cảnh báo sự cố sẽ hiển thị trên màn hình quản lý nếu có rủi ro xảy ra.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-green-500/10 active:scale-95"
        >
          Gửi báo cáo khác
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 space-y-6 relative">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
        <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" /> Báo cáo trạng thái thiết bị
        </h3>
        
        {/* Toggle Auto Mode */}
        <button 
          type="button"
          onClick={toggleAutoMode}
          className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border " + (isAutoMode ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-550/15" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-450")}
        >
          {isAutoMode ? (
            <>
              <Play className="w-2.5 h-2.5 fill-white text-white animate-pulse" /> Auto Mode: ON
            </>
          ) : (
            <>
              <Square className="w-2.5 h-2.5 text-slate-400" /> Auto Mode: OFF
            </>
          )}
        </button>
      </div>

      {countdown !== null && isAutoMode && (
         <div className="bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 p-3 rounded-2xl text-xs text-center font-bold animate-pulse border border-blue-100 dark:border-blue-900/40">
            Hệ thống sẽ tự động gửi báo cáo sau {"" + countdown}s... (Chạm vào form để dừng)
         </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Họ và tên người báo cáo *</label>
        <input
          type="text"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          required
          placeholder="Nhập tên của bạn... (VD: KTV. Nguyễn Văn A)"
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none text-sm font-semibold"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">Đánh giá tình trạng hiện tại *</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className={"cursor-pointer flex flex-col items-center justify-center p-4 border rounded-2xl transition-all shadow-sm " + (status === "WORKING" ? "border-green-500 bg-green-50 dark:bg-green-955/15 text-green-700 dark:text-green-400 transform scale-[1.02] shadow-md shadow-green-500/5 font-extrabold" : "border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 font-semibold")}>
            <input type="radio" value="WORKING" checked={status === "WORKING"} onChange={(e) => setStatus(e.target.value)} className="sr-only" />
            <span className="text-xs text-center">Vận hành tốt / Sẵn sàng</span>
          </label>
          <label className={"cursor-pointer flex flex-col items-center justify-center p-4 border rounded-2xl transition-all shadow-sm " + (status === "WARNING" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-955/15 text-yellow-750 dark:text-yellow-400 transform scale-[1.02] shadow-md shadow-yellow-500/5 font-extrabold" : "border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 font-semibold")}>
            <input type="radio" value="WARNING" checked={status === "WARNING"} onChange={(e) => setStatus(e.target.value)} className="sr-only" />
            <span className="text-xs text-center">Cần hiệu chuẩn / Có lỗi</span>
          </label>
          <label className={"cursor-pointer flex flex-col items-center justify-center p-4 border rounded-2xl transition-all shadow-sm " + (status === "BROKEN" ? "border-red-500 bg-red-50 dark:bg-red-955/15 text-red-700 dark:text-red-400 transform scale-[1.02] shadow-md shadow-red-500/5 font-extrabold" : "border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 font-semibold")}>
            <input type="radio" value="BROKEN" checked={status === "BROKEN"} onChange={(e) => setStatus(e.target.value)} className="sr-only" />
            <span className="text-xs text-center">Sự cố / Báo hỏng</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
          Ghi chú chi tiết {status !== "WORKING" && " *"}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          required={status === "BROKEN" || status === "WARNING"}
          placeholder="Nhập mô tả chi tiết tình trạng thiết bị... (Ví dụ: Chỉ số QC chạy ra ngoài khoảng cho phép 2SD)"
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none text-sm font-semibold"
        />
      </div>

      {/* Photo Capture & Upload Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
            Chụp ảnh lưu hiện trạng thiết bị
          </label>
          {photoCount > 0 && onViewGallery && (
            <button
              type="button"
              onClick={onViewGallery}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Xem lại {photoCount} ảnh đã lưu</span> &rarr;
            </button>
          )}
        </div>
        
        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-sm shadow-md group">
            <img src={imagePreview} alt="Xem trước ảnh hiện trạng" className="w-full h-auto object-cover max-h-56" />
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors shadow-md"
                title="Xóa ảnh này"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2 bg-slate-900/70 text-white text-[11px] text-center font-bold">
              Ảnh hiện trạng đã sẵn sàng để lưu cùng báo cáo
            </div>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              id="incident-photo"
              onChange={handleImageChange}
              disabled={compressing}
              className="hidden"
            />
            <label
              htmlFor="incident-photo"
              className={"inline-flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-650 dark:text-slate-300 transition-all border-dashed hover:border-blue-400 " + (compressing ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800")}
            >
              {compressing ? (
                <>
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  Đang tối ưu dung lượng ảnh...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-blue-500" />
                  Chụp ảnh bằng Camera / Tải ảnh hiện trạng
                </>
              )}
            </label>
            <p className="text-[10px] text-slate-400 mt-1.5 italic">
              * Ảnh sẽ tự động được nén tối ưu để gửi nhanh và lưu trữ an toàn.
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider disabled:opacity-70 transition shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
      >
        {uploading ? "Đang tải ảnh..." : loading ? "Đang gửi báo cáo..." : "Gửi Báo Cáo"}
      </button>
    </form>
  )
}
