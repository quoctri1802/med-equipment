"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitScanReport } from "@/app/actions/report"
import { CheckCircle2 } from "lucide-react"

export default function ReportForm({ equipmentId }: { equipmentId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState("WORKING")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await submitScanReport({ equipmentId, status, note })
      setSuccess(true)
      setNote("")
      router.refresh()
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
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
      <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
        1. Cập nhật Tình Trạng Hiện Tại
      </h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Đánh giá tình trạng thiết bị:
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
