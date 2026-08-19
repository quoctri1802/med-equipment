"use client"

import { useState } from "react"
import { UserCheck, UserMinus, Clock, Play, Square, ListOrdered } from "lucide-react"
import { startEquipmentUsage, endEquipmentUsage } from "@/app/actions/usage"
import { formatDateTimeVN } from "@/lib/date"

type UsageLog = {
  id: string
  userName: string
  purpose: string
  startTime: Date
  endTime: Date | null
  userId: string | null
  user?: { name: string | null, email?: string | null } | null
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
  const [activeUsage, setActiveUsage] = useState(initialActiveUsage)
  const [history, setHistory] = useState(initialHistory)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Form fields
  const [userName, setUserName] = useState("")
  const [purpose, setPurpose] = useState("")

  const handleStartUsage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !purpose.trim()) return

    setLoading(true)
    try {
      const res = await startEquipmentUsage({ equipmentId, userName, purpose })
      if (res.success && res.log) {
        const newLog = res.log as unknown as UsageLog
        setActiveUsage(newLog)
        setHistory(prev => [newLog, ...prev])
        setUserName("")
        setPurpose("")
        setShowForm(false)
      }
    } catch (err) {
      alert(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  const handleEndUsage = async () => {
    if (!activeUsage) return
    if (!confirm("Bạn có chắc chắn muốn trả thiết bị và hoàn tất lượt sử dụng này?")) return

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
    } catch (err) {
      alert(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Usage Status */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 p-6">
        <h3 className="text-sm font-black mb-4 uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
          {activeUsage ? <UserCheck className="w-5 h-5 animate-pulse" /> : <UserMinus className="w-5 h-5" />}
          Trạng thái Sử dụng & Bảo quản
        </h3>

        {activeUsage ? (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest">Đang sử dụng / bảo quản</p>
                  <h4 className="font-extrabold text-slate-900 dark:text-white mt-1 text-sm uppercase">KTV: {activeUsage.userName}</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-350 mt-1 font-semibold">Mục đích: {activeUsage.purpose}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse">
                  <Play className="w-2 h-2 fill-orange-700 dark:fill-orange-400" />
                  Đang dùng
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-4 flex items-center gap-1 border-t border-orange-100/50 dark:border-orange-900/30 pt-2 font-bold font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Bắt đầu: {formatDateTimeVN(activeUsage.startTime)}</span>
              </div>
            </div>

            <button
              onClick={handleEndUsage}
              disabled={loading}
              className="w-full py-3 bg-red-650 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/10 flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-75 cursor-pointer active:scale-98"
            >
              <Square className="w-3 h-3 fill-white" />
              Trả thiết bị & Hoàn tất sử dụng
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50/50 dark:bg-green-950/15 border border-green-150 dark:border-green-900/40 rounded-2xl text-center py-6">
              <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Thiết bị đang SẴN SÀNG sử dụng</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Chưa có cán bộ đăng ký mượn hoặc bảo quản tại ca trực này</p>
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 active:scale-98"
              >
                Đăng ký mượn / Vận hành thiết bị
              </button>
            ) : (
              <form onSubmit={handleStartUsage} className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Họ tên người mượn / sử dụng *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="VD: KTV. Nguyễn Văn A"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:text-white transition-all outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Mục đích sử dụng *</label>
                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="VD: Chạy mẫu sinh hóa ca sáng"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:text-white transition-all outline-none font-semibold"
                  />
                </div>
                <div className="flex gap-2 justify-end text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-75 shadow-md shadow-blue-500/10"
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
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
          <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-xs uppercase tracking-wider">
            <ListOrdered className="w-4 h-4 text-purple-500 animate-pulse" /> Nhật ký mượn & sử dụng máy
          </h3>
        </div>
        <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar">
          {history.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-xs italic font-medium">Chưa có lịch sử sử dụng thiết bị này.</p>
          ) : (
            <div className="space-y-3">
              {history.map(log => (
                <div key={log.id} className="p-4 border-l-4 border-purple-500 bg-slate-50/30 dark:bg-slate-900/20 text-xs rounded-r-2xl border border-slate-100/50 dark:border-slate-800/80">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs uppercase">{log.userName}</span>
                    <span className={"px-2 py-0.5 rounded-full text-[9px] font-black border " + (
                      log.endTime ? "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800" : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-955/20 dark:text-orange-400 animate-pulse"
                    )}>
                      {log.endTime ? "ĐÃ TRẢ" : "ĐANG DÙNG"}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-350 font-semibold text-xs leading-relaxed">Mục đích: {log.purpose}</p>
                  <div className="text-[10px] text-slate-400 mt-3 space-y-0.5 border-t border-slate-100/40 dark:border-slate-800/40 pt-1.5 font-bold font-mono">
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
