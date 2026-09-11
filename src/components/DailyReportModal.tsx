"use client"

import React, { useState, useEffect } from "react"
import { submitScanReport } from "@/app/actions/report"
import { X, Camera, Activity, CheckCircle2, AlertTriangle, Wrench } from "lucide-react"

interface Equipment {
  id: string
  name: string
  code: string
  model?: string | null
  qcTechnician?: string | null
}

interface DailyReportModalProps {
  equipment: Equipment | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DailyReportModal({
  equipment,
  isOpen,
  onClose,
  onSuccess
}: DailyReportModalProps) {
  const [status, setStatus] = useState("WORKING")
  const [note, setNote] = useState("")
  const [reporterName, setReporterName] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const savedName = localStorage.getItem("med_reporter_name")
      if (savedName) {
        setReporterName(savedName)
      }
      setStatus("WORKING")
      setNote("")
      setImageFile(null)
      setImagePreview(null)
      setErrorMsg(null)
    }
  }, [isOpen, equipment])

  if (!isOpen || !equipment) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reporterName.trim()) {
      setErrorMsg("Vui lòng nhập tên người báo cáo.")
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      let photoUrl: string | null = null

      if (imageFile) {
        setUploading(true)
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
          console.error("Lỗi tải ảnh lên server")
        }
        setUploading(false)
      }

      const res = await submitScanReport(equipment.id, {
        status,
        note: note.trim() || (status === "WORKING" ? "Đã kiểm tra kiểm kê hằng ngày - Vận hành tốt." : "Đã báo cáo kiểm kê hằng ngày."),
        reporterName: reporterName.trim(),
        photoUrl
      })

      if (res.success) {
        localStorage.setItem("med_reporter_name", reporterName.trim())
        onSuccess()
        onClose()
      } else {
        setErrorMsg("Gửi báo cáo kiểm kê thất bại. Vui lòng thử lại.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi hệ thống")
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700/80 relative space-y-5 animate-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                {equipment.code}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Báo cáo kiểm kê hằng ngày</span>
            </div>
            <h3 className="font-extrabold text-base uppercase text-slate-900 dark:text-white leading-tight">
              {equipment.name}
            </h3>
            {(equipment.model || equipment.qcTechnician) && (
              <p className="text-xs text-slate-500 font-medium mt-1">
                {equipment.model && <span>Model: <strong className="text-slate-700 dark:text-slate-300">{equipment.model}</strong></span>}
                {equipment.model && equipment.qcTechnician && <span className="mx-2">•</span>}
                {equipment.qcTechnician && <span>QC KTV: <strong className="text-slate-700 dark:text-slate-300">{equipment.qcTechnician}</strong></span>}
              </p>
            )}
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reporter Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              Họ và tên người kiểm tra / báo cáo *
            </label>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              required
              placeholder="Nhập họ tên... (VD: KTV. BS. Nguyễn Văn A)"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Kết quả kiểm tra vận hành *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus("WORKING")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                  status === "WORKING"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-extrabold ring-2 ring-green-500/20"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 font-semibold"
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 ${status === "WORKING" ? "text-green-600 dark:text-green-400" : "text-slate-400"}`} />
                <span className="text-[11px] leading-tight">Vận hành tốt</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("WARNING")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                  status === "WARNING"
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-750 dark:text-yellow-400 font-extrabold ring-2 ring-yellow-500/20"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 font-semibold"
                }`}
              >
                <Activity className={`w-5 h-5 ${status === "WARNING" ? "text-yellow-600 dark:text-yellow-400" : "text-slate-400"}`} />
                <span className="text-[11px] leading-tight">Cần hiệu chuẩn</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("BROKEN")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                  status === "BROKEN"
                    ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-extrabold ring-2 ring-red-500/20"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 font-semibold"
                }`}
              >
                <Wrench className={`w-5 h-5 ${status === "BROKEN" ? "text-red-600 dark:text-red-400" : "text-slate-400"}`} />
                <span className="text-[11px] leading-tight">Sự cố / Báo hỏng</span>
              </button>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              Ghi chú kiểm tra {status !== "WORKING" && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              required={status !== "WORKING"}
              placeholder={status === "WORKING" ? "Nhập ghi chú (không bắt buộc)..." : "Nhập chi tiết tình trạng sự cố / hiệu chuẩn..."}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold dark:bg-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              Hình ảnh đính kèm (Ngoại quan / Sự cố)
            </label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-xs shadow-sm">
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  id="daily-report-photo"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="daily-report-photo"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-dashed"
                >
                  <Camera className="w-4 h-4 text-blue-500" />
                  Chụp / Tải ảnh minh họa
                </label>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 disabled:opacity-60 flex items-center gap-2"
            >
              {uploading ? "Đang tải ảnh..." : loading ? "Đang gửi báo cáo..." : "Xác nhận báo cáo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
