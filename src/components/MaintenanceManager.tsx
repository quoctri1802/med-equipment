/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wrench, X, Trash2, Edit, CheckCircle } from "lucide-react"
import { createMaintenance, updateMaintenance, deleteMaintenance, verifyMaintenance } from "@/app/actions/maintenance"

type MaintenanceRecord = {
  id: string
  description: string
  date: Date
  cost: number | null
  status: string
  equipmentId: string
  technicianId: string
  createdAt: Date
  isNotified?: boolean
  equipment: { name: string, code: string }
  technician: { name: string | null, email?: string | null }
}

export default function MaintenanceManager({ 
  records, 
  equipments, 
  technicians,
  userRole
}: { 
  records: MaintenanceRecord[],
  equipments: { id: string, name: string, code: string }[],
  technicians: { id: string, name: string | null, email: string | null }[],
  userRole: string
}) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"LIST" | "CALENDAR">("LIST")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  
  // Local records state for Optimistic UI updates
  const [localRecords, setLocalRecords] = useState<MaintenanceRecord[]>(records)

  // Sync local records when server props change
  useEffect(() => {
    setLocalRecords(records)
  }, [records])
  
  // State for Calendar Month/Year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const [formData, setFormData] = useState({
    equipmentId: equipments[0]?.id || "",
    technicianId: technicians[0]?.id || "",
    description: "",
    cost: "",
    status: "PENDING",
    date: new Date().toISOString().split('T')[0]
  })
  
  const [loading, setLoading] = useState(false)
  const [errorMSG, setErrorMSG] = useState("")

  const openAddModal = () => {
    setEditingRecord(null)
    setFormData({
      equipmentId: equipments[0]?.id || "",
      technicianId: technicians[0]?.id || "",
      description: "",
      cost: "",
      status: "PENDING",
      date: new Date().toISOString().split('T')[0]
    })
    setErrorMSG("")
    setIsModalOpen(true)
  }

  const openEditModal = (record: any) => {
    setEditingRecord(record)
    setFormData({
      equipmentId: record.equipmentId,
      technicianId: record.technicianId,
      description: record.description || "",
      cost: record.cost ? record.cost.toString() : "",
      status: record.status,
      date: new Date(record.date).toISOString().split('T')[0]
    })
    setErrorMSG("")
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phiếu bảo trì này?")) return
    
    // Optimistic UI: remove from display immediately
    const originalRecords = localRecords
    setLocalRecords(prev => prev.filter(r => r.id !== id))
    
    try {
      const res = await deleteMaintenance(id)
      if (res.success) {
        router.refresh()
      } else {
        // Rollback
        setLocalRecords(originalRecords)
        alert("Lỗi: Xóa phiếu bảo trì thất bại.")
      }
    } catch (e: any) {
      // Rollback
      setLocalRecords(originalRecords)
      alert("Lỗi: " + e.message)
    }
  }

  const handleVerify = async (id: string) => {
    if (!confirm("Xác nhận nghiệm thu thiết bị hoạt động bình thường trở lại và chuyển sang trạng thái Sẵn Sàng (WORKING)?")) return
    
    // Optimistic UI: update status immediately
    const originalRecords = localRecords
    setLocalRecords(prev => prev.map(r => r.id === id ? { ...r, status: "VERIFIED" } : r))
    
    try {
      const res = await verifyMaintenance(id)
      if (res.success) {
        router.refresh()
      } else {
        // Rollback
        setLocalRecords(originalRecords)
        alert("Lỗi nghiệm thu phiếu bảo trì.")
      }
    } catch (e: any) {
      // Rollback
      setLocalRecords(originalRecords)
      alert("Lỗi: " + e.message)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setErrorMSG("")

    const payload = {
      equipmentId: formData.equipmentId,
      technicianId: formData.technicianId,
      description: formData.description,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      status: formData.status,
      date: new Date(formData.date)
    }

    try {
      if (editingRecord) {
        const res = await updateMaintenance(editingRecord.id, payload)
        if (res.success) {
          setIsModalOpen(false)
          router.refresh()
        } else {
          setErrorMSG(res.error || "Cập nhật phiếu thất bại")
        }
      } else {
        const res = await createMaintenance(payload)
        if (res.success) {
          setIsModalOpen(false)
          router.refresh()
        } else {
          setErrorMSG(res.error || "Tạo phiếu thất bại")
        }
      }
    } catch (err: any) {
      setErrorMSG(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "Chờ xử lý",
      IN_PROGRESS: "Đang sửa chữa",
      COMPLETED: "Chờ nghiệm thu",
      VERIFIED: "Đã nghiệm thu"
    }
    const styles: Record<string, string> = {
      PENDING: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
      IN_PROGRESS: "bg-yellow-50 text-yellow-750 border-yellow-250 dark:bg-yellow-955/20 dark:text-yellow-400 dark:border-yellow-900/40",
      COMPLETED: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-955/20 dark:text-orange-400 dark:border-orange-900/40",
      VERIFIED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-955/20 dark:text-green-400 dark:border-green-900/40"
    }
    return (
      <span className={"px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider " + (styles[status] || styles.PENDING)}>
        {labels[status] || status}
      </span>
    )
  }

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1)
    const days = []
    
    // JS getDay: 0 = Sun, 1 = Mon, ..., 6 = Sat
    // Align so Monday is first column
    const startDayOfWeek = date.getDay()
    const prevMonthPadding = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
    
    const prevMonth = new Date(year, month, 0)
    for (let i = prevMonthPadding - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      })
    }
    
    const totalDays = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }
    
    const remainingCells = days.length % 7
    if (remainingCells > 0) {
      const nextMonthPadding = 7 - remainingCells
      for (let i = 1; i <= nextMonthPadding; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        })
      }
    }
    
    return days
  }

  const daysGrid = getDaysInMonth(currentYear, currentMonth)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate()
  }

  const handleDayClick = (dayDate: Date) => {
    setEditingRecord(null)
    setFormData({
      equipmentId: equipments[0]?.id || "",
      technicianId: technicians[0]?.id || "",
      description: "",
      cost: "",
      status: "PENDING",
      date: dayDate.toLocaleDateString('en-CA') // YYYY-MM-DD
    })
    setErrorMSG("")
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700 gap-4">
        <h3 className="font-extrabold text-sm uppercase text-slate-800 dark:text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-500 animate-pulse" /> Lịch trình bảo trì & sửa chữa
        </h3>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Toggle buttons */}
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex text-xs font-bold">
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1.5 rounded-xl transition ${
                viewMode === "LIST" 
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Danh sách
            </button>
            <button
              onClick={() => setViewMode("CALENDAR")}
              className={`px-3 py-1.5 rounded-xl transition ${
                viewMode === "CALENDAR" 
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Xem Lịch
            </button>
          </div>

          <button 
            onClick={openAddModal}
            className="ml-auto sm:ml-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 active:scale-95"
          >
            + Tạo phiếu bảo trì
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === "LIST" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in duration-350">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-150 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold">Thiết bị xét nghiệm</th>
                  <th className="px-6 py-4 font-bold">Nội dung công việc</th>
                  <th className="px-6 py-4 font-bold">Thời gian đặt lịch</th>
                  <th className="px-6 py-4 font-bold">Chi phí</th>
                  <th className="px-6 py-4 font-bold">Trạng thái</th>
                  <th className="px-6 py-4 font-bold">Người chịu trách nhiệm</th>
                  <th className="px-6 py-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {localRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900 dark:text-white uppercase text-xs">{record.equipment.name}</div>
                      <div className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{record.equipment.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 dark:text-slate-200 text-xs font-semibold max-w-xs line-clamp-2 leading-relaxed">
                        {record.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-semibold">
                      {new Date(record.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {record.cost ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.cost) : '---'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      <div className="font-bold text-xs uppercase">{record.technician?.name || 'Chưa phân công'}</div>
                      {record.technician?.email && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{record.technician.email}</div>}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      {userRole === "ADMIN" && record.status === "COMPLETED" && (
                        <button 
                          onClick={() => handleVerify(record.id)} 
                          className="text-green-600 dark:text-green-400 font-bold hover:underline flex items-center gap-1 cursor-pointer mr-2 shrink-0"
                          title="Xác nhận nghiệm thu thiết bị đã hoạt động tốt"
                        >
                          <CheckCircle className="w-4 h-4" /> Nghiệm thu
                        </button>
                      )}
                      <button onClick={() => openEditModal(record)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                        <Edit className="w-4 h-4"/> Sửa
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="text-red-550 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer">
                        <Trash2 className="w-4 h-4"/> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {localRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Chưa có lịch sử bảo trì nào trong khoa xét nghiệm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CALENDAR VIEW */}
      {viewMode === "CALENDAR" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden animate-in fade-in duration-350">
          {/* Calendar Month Selector */}
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base uppercase tracking-wider">
              Tháng {currentMonth + 1} - Năm {currentYear}
            </h4>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-650 dark:text-slate-300 transition"
              >
                &larr; Tháng trước
              </button>
              <button 
                onClick={handleNextMonth}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-650 dark:text-slate-300 transition"
              >
                Tháng sau &rarr;
              </button>
            </div>
          </div>

          {/* Weekdays columns */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <div>Thứ 2</div>
            <div>Thứ 3</div>
            <div>Thứ 4</div>
            <div>Thứ 5</div>
            <div>Thứ 6</div>
            <div>Thứ 7</div>
            <div className="text-red-500">Chủ Nhật</div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysGrid.map((day, idx) => {
              const dayRecords = localRecords.filter(r => isSameDay(new Date(r.date), day.date))
              
              return (
                <div 
                  key={idx}
                  onClick={() => handleDayClick(day.date)}
                  className={`min-h-[110px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    day.isCurrentMonth 
                      ? 'bg-slate-50/40 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-700/60 hover:bg-slate-100/50 dark:hover:bg-slate-900' 
                      : 'bg-slate-100/20 dark:bg-slate-950/5 border-slate-100 dark:border-slate-800/40 text-slate-300 dark:text-slate-700'
                  }`}
                >
                  {/* Day Date Header */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[11px] font-black ${
                      day.date.getDay() === 0 ? 'text-red-500' : 'text-slate-750 dark:text-slate-300'
                    } ${!day.isCurrentMonth && 'opacity-20'}`}>
                      {day.date.getDate()}
                    </span>
                    <span className="text-[9px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      + Tạo
                    </span>
                  </div>

                  {/* Scheduled maintenance list */}
                  <div className="mt-2 space-y-1 overflow-y-auto max-h-[72px]" onClick={(e) => e.stopPropagation()}>
                    {dayRecords.map(rec => {
                      const badgeColors: Record<string, string> = {
                        PENDING: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
                        IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-955/40 dark:text-yellow-400 dark:border-yellow-900/40",
                        COMPLETED: "bg-orange-100 text-orange-850 border-orange-300 dark:bg-orange-955/40 dark:text-orange-450 dark:border-orange-900/40",
                        VERIFIED: "bg-green-100 text-green-800 border-green-300 dark:bg-green-955/40 dark:text-green-400 dark:border-green-900/40"
                      }
                      
                      return (
                        <div 
                          key={rec.id}
                          onClick={() => openEditModal(rec)}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate cursor-pointer transition hover:scale-[1.02] ${
                            badgeColors[rec.status] || badgeColors.PENDING
                          }`}
                          title={`${rec.equipment.name} (${rec.equipment.code}): ${rec.description}`}
                        >
                          {rec.equipment.name}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-sm">
                {editingRecord ? "Chỉnh sửa phiếu bảo trì" : "Tạo phiếu bảo trì mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMSG && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold">{errorMSG}</div>}
              
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Thiết bị xét nghiệm cần bảo trì</label>
                <select 
                  required
                  value={formData.equipmentId} onChange={e => setFormData({...formData, equipmentId: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-bold"
                >
                  {equipments.map(eq => <option key={eq.id} value={eq.id}>{eq.name} - {eq.code}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Kỹ thuật viên phụ trách</label>
                <select 
                  required
                  value={formData.technicianId} onChange={e => setFormData({...formData, technicianId: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-bold"
                >
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Mô tả sự cố / Công việc thực hiện</label>
                <textarea 
                  required rows={3}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả sự cố chi tiết và các phụ tùng thay thế nếu có..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Chi phí dự kiến (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})}
                    placeholder="VD: 500000"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Ngày hẹn bảo trì</label>
                  <input 
                    type="date" required
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">Trạng thái bảo trì</label>
                <select 
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 outline-none dark:bg-slate-900 dark:text-white transition-all font-bold"
                >
                  <option value="PENDING">Chờ xử lý (PENDING)</option>
                  <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
                  <option value="COMPLETED">Đã hoàn thành - Chờ nghiệm thu (COMPLETED)</option>
                  {userRole === "ADMIN" && (
                    <option value="VERIFIED">Đã nghiệm thu / Đưa vào sử dụng (VERIFIED)</option>
                  )}
                </select>
                {formData.status === "COMPLETED" && (
                  <p className="text-[10px] text-orange-600 mt-2 font-bold">Lưu ý: Trạng thái này CHƯA kích hoạt thiết bị chạy lại. Cần Quản trị viên nghiệm thu.</p>
                )}
                {formData.status === "VERIFIED" && (
                  <p className="text-[10px] text-green-600 mt-2 font-bold">Hệ thống sẽ tự động chuyển Thiết bị về trạng thái Sẵn Sàng (WORKING) khi đã nghiệm thu.</p>
                )}
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700/80">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-700 transition">
                  Hủy
                </button>
                <button disabled={loading} type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10">
                  {loading ? "Đang lưu..." : "Lưu phiếu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
