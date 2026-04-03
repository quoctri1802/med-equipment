"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitScanReport } from "@/app/actions/report"
import { CheckCircle2 } from "lucide-react"

export default function ReportForm({ equipmentId }: { equipmentId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState("WORKING")
  const [note, setNote] = useState("")
  const [reporterName, setReporterName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Chế độ tự động
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Tự động điền tên và ưu tiên chế độ
  useEffect(() => {
    const savedName = localStorage.getItem("med_reporter_name")
    if (savedName) setReporterName(savedName)

    const savedAuto = localStorage.getItem("med_auto_mode") === "true"
    setIsAutoMode(savedAuto)
  }, [])

  // Logic đếm ngược tự động gửi
  useEffect(() => {
    if (isAutoMode && !success && !loading && reporterName.trim()) {
      setCountdown(2)
      const timer = setInterval(() => {
        setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0))
      }, 1000)

      const autoSubmit = setTimeout(() => {
        if (isAutoMode) {
           handleAutoSubmit()
        }
      }, 2000)

      return () => {
        clearInterval(timer)
        clearTimeout(autoSubmit)
      }
    } else {
        setCountdown(null)
    }
  }, [isAutoMode, reporterName, success])

  const handleAutoSubmit = () => {
     // Trigger click on a hidden submit or just call the logic
     const form = document.querySelector('form')
     if (form) form.requestSubmit()
  }

  const toggleAutoMode = () => {
    const newVal = !isAutoMode
    setIsAutoMode(newVal)
    localStorage.setItem("med_auto_mode", newVal.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reporterName.trim()) {
        alert("Vui lòng nhập tên người báo cáo.")
        return
    }

    setLoading(true)
    try {
      // Lưu tên vào máy để lần sau không phải nhập lại
      localStorage.setItem("med_reporter_name", reporterName)

      await submitScanReport({ equipmentId, status, note, reporterName })
      setSuccess(true)
      setNote("")
      router.refresh()
      
      // Tự động chuyển về trang chủ sau 2 giây để người dùng kịp thấy thông báo thành công
      setTimeout(() => {
        router.push("/")
      }, 2000)
      
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 text-green-700 p-8 rounded-2xl border border-green-200 text-center shadow-sm flex flex-col items-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-in zoom-in" />
        <h3 className="font-bold text-xl mb-2">Đã cập nhật trạng thái thiết bị thành công!</h3>
        <p className="text-sm opacity-80 mb-6 max-w-xs">Thông tin báo cáo đã được lưu vào hệ thống và Cảnh báo sẽ xuất hiện trên màn hình Quản trị nếu có rủi ro.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition shadow-sm"
        >
          Gửi báo cáo khác
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6 relative">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Báo cáo trạng thái thiết bị
        </h3>
        
        {/* Toggle Chế độ tự động */}
        <button 
          type="button"
          onClick={toggleAutoMode}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${isAutoMode ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}
        >
          {isAutoMode ? "Auto Mode: ON" : "Auto Mode: OFF"}
        </button>
      </div>

      {countdown !== null && isAutoMode && (
         <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-sm text-center font-medium animate-pulse border border-blue-100 dark:border-blue-800">
            Hệ thống sẽ tự động gửi báo cáo sau {countdown}s... (Chạm vào màn hình để dừng)
         </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Họ và tên người báo cáo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          required
          placeholder="Nhập tên của bạn... (VD: Nguyễn Văn A)"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          1. Đánh giá tình trạng thiết bị:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className={`cursor-pointer flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${status === "WORKING" ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 transform scale-[1.02]" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
            <input type="radio" value="WORKING" checked={status === "WORKING"} onChange={(e) => setStatus(e.target.value)} className="sr-only" />
            <span className="font-semibold">Bình thường</span>
          </label>
          <label className={`cursor-pointer flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${status === "WARNING" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 transform scale-[1.02]" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
            <input type="radio" value="WARNING" checked={status === "WARNING"} onChange={(e) => setStatus(e.target.value)} className="sr-only" />
            <span className="font-semibold">Có vấn đề/Cảnh báo</span>
          </label>
          <label className={`cursor-pointer flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${status === "BROKEN" ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 transform scale-[1.02]" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}>
            <input type="radio" value="BROKEN" checked={status === "BROKEN"} onChange={(e) => setStatus(e.target.value)} className="sr-only" />
            <span className="font-semibold">Hỏng/Ngừng HĐ</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Ghi chú thêm (Bắt buộc nếu lỗi/hỏng)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          required={status === "BROKEN" || status === "WARNING"}
          placeholder="Nhập chi tiết về tình trạng thiết bị... VD: Phát ra tiếng kêu lạ ở động cơ."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-70 transition shadow-sm transform active:scale-[0.98]"
      >
        {loading ? "Đang xử lý..." : "Lưu Báo Cáo"}
      </button>
    </form>
  )
}
