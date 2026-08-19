"use client"

import { useState } from "react"
import { Calendar, Wrench, PenTool, X, Trash2, Edit } from "lucide-react"
import { createMaintenance, updateMaintenance, deleteMaintenance } from "@/app/actions/maintenance"

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
  technicians 
}: { 
  records: MaintenanceRecord[],
  equipments: { id: string, name: string, code: string }[],
  technicians: { id: string, name: string | null, email: string | null }[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  
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

  const openEditModal = (record) => {
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

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phiếu bảo trì này?")) return
    try {
      await deleteMaintenance(id)
      window.location.reload()
    } catch (e) {
      alert("Lỗi: " + e.message)
    }
  }

  const handleSubmit = async (e) => {
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
          window.location.reload()
        } else {
          setErrorMSG(res.error || "Cập nhật phiếu thất bại")
        }
      } else {
        const res = await createMaintenance(payload)
        if (res.success) {
          window.location.reload()
        } else {
          setErrorMSG(res.error || "Tạo phiếu thất bại")
        }
      }
    } catch (err) {
      setErrorMSG(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const labels = {
      PENDING: "Chờ xử lý",
      IN_PROGRESS: "Đang sửa chữa",
      COMPLETED: "Hoàn thành"
    }
    const styles = {
      PENDING: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
      IN_PROGRESS: "bg-yellow-50 text-yellow-750 border-yellow-250 dark:bg-yellow-955/20 dark:text-yellow-400 dark:border-yellow-900/40",
      COMPLETED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-955/20 dark:text-green-400 dark:border-green-900/40"
    }
    return (
      <span className={"px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider " + (styles[status] || styles.PENDING)}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700">
        <h3 className="font-extrabold text-sm uppercase text-slate-800 dark:text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-500 animate-pulse" /> Danh sách bảo trì & sửa chữa
        </h3>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 active:scale-95"
        >
          + Tạo phiếu bảo trì
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden">
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
              {records.map(record => (
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
                    <button onClick={() => openEditModal(record)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                      <Edit className="w-4 h-4"/> Sửa
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="text-red-550 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer">
                      <Trash2 className="w-4 h-4"/> Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
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
                  <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                </select>
                {formData.status === "COMPLETED" && (
                  <p className="text-[10px] text-green-600 mt-2 font-bold">Hệ thống sẽ tự động chuyển Thiết bị về trạng thái Sẵn Sàng (WORKING) khi hoàn thành.</p>
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
