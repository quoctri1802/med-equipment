"use client"

import { useState } from "react"
import { startEquipmentUsage, endEquipmentUsage } from "@/app/actions/usage"
import { formatDateTimeVN } from "@/lib/date"
import { UserCheck, UserMinus, Clock, Play, Square, ListOrdered } from "lucide-react"

interface UsageLog {
  id: string
  equipmentId: string
  userId: string | null
  userName: string
  purpose: string
  startTime: Date | string
  endTime: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export default function UsageManager({
  equipmentId,
  initialActiveUsage,
  initialHistory
}: {
  equipmentId: string
  initialActiveUsage: UsageLog | null
  initialHistory: UsageLog[]
}) {
  const [activeUsage, setActiveUsage] = useState<UsageLog | null>(initialActiveUsage)
  const [history, setHistory] = useState<UsageLog[]>(initialHistory)
  const [userName, setUserName] = useState("")
  const [purpose, setPurpose] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Auto fill name if stored
  useState(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("med_reporter_name")
      if (savedName) setUserName(savedName)
    }
  })

  const handleStartUsage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !purpose.trim()) {
      alert("Vui lòng điền đầy đủ thông tin.")
      return
    }

    setLoading(true)
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("med_reporter_name", userName)
      }

      const res = await startEquipmentUsage({
        equipmentId,
        userName,
        purpose
      })

      if (res.success && res.log) {
        const newLog = res.log as unknown as UsageLog
        setActiveUsage(newLog)
        setHistory(prev => [newLog, ...prev])
        setPurpose("")
        setShowForm(false)
      }
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  const handleEndUsage = async () => {
    if (!activeUsage) return
    if (!confirm("Xác nhận trả thiết bị này và hoàn tất lượt sử dụng?")) return

    setLoading(true)
    try {
      const res = await endEquipmentUsage(activeUsage.id, equipmentId)
      if (res.success && res.log) {
        const updatedLog = res.log as unknown as UsageLog
        setActiveUsage(null)
        setHistory(prev =>
          prev.map(item => (item.id === updatedLog.id ? updatedLog : item))
        )
      }
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Usage Status */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold mb-4 uppercase tracking-tight text-blue-600 dark:text-blue-400 flex items-center gap-2">
          {activeUsage ? <UserCheck className="w-5 h-5" /> : <UserMinus className="w-5 h-5" />}
          Trạng thái Sử dụng & Bảo quản
        </h3>

        {activeUsage ? (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider">Đang mượn / sử dụng</p>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-base">Họ tên: {activeUsage.userName}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">Mục đích: {activeUsage.purpose}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse">
                  <Play className="w-3 h-3 fill-orange-700 dark:fill-orange-400" />
                  Đang dùng
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Bắt đầu lúc: <span className="font-bold">{formatDateTimeVN(activeUsage.startTime)}</span></span>
              </div>
            </div>

            <button
              onClick={handleEndUsage}
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2 hover:shadow-md disabled:opacity-75"
            >
              <Square className="w-4 h-4 fill-white" />
              Trả thiết bị & Hoàn tất sử dụng
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 rounded-xl text-center py-6">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">Thiết bị hiện đang sẵn sàng cho ca trực tiếp theo</p>
              <p className="text-xs text-slate-400 mt-1">Chưa có ai đăng ký sử dụng hoặc bảo quản lúc này</p>
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm hover:shadow-md"
              >
                Đăng ký mượn / Sử dụng thiết bị
              </button>
            ) : (
              <form onSubmit={handleStartUsage} className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Họ tên người mượn / sử dụng *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="VD: Bác sĩ Nguyễn Văn A"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mục đích sử dụng *</label>
                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="VD: Đo huyết áp cho bệnh nhân phòng 102"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
                  />
                </div>
                <div className="flex gap-2 justify-end text-sm pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-75"
                  >
                    {loading ? "Đang lưu..." : "Xác nhận mượn"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Usage History Logs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase">
            <ListOrdered className="w-4 h-4 text-purple-500" /> Nhật ký mượn & sử dụng thiết bị
          </h3>
        </div>
        <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
          {history.length === 0 ? (
            <p className="text-slate-500 text-center py-8 text-sm italic">Chưa có lịch sử sử dụng thiết bị này.</p>
          ) : (
            <div className="space-y-3">
              {history.map(log => (
                <div key={log.id} className="p-3 border-l-4 border-purple-500 bg-slate-50/50 dark:bg-slate-900/20 text-xs rounded-r-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{log.userName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.endTime ? "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 animate-pulse"
                    }`}>
                      {log.endTime ? "Đã trả" : "Đang dùng"}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Mục đích: {log.purpose}</p>
                  <div className="text-[10px] text-slate-400 mt-2 space-y-0.5">
                    <p>Bắt đầu: {formatDateTimeVN(log.startTime)}</p>
                    {log.endTime && <p>Kết thúc: {formatDateTimeVN(log.endTime)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
