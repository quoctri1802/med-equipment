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
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null)
  
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

  const openEditModal = (record: MaintenanceRecord) => {
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
    if (!confirm("Bạn có chắc muốn xoá phiếu bảo trì này?")) return
    try {
      await deleteMaintenance(id)
      window.location.reload()
    } catch (e: any) {
      alert("Lỗi: " + e.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMSG("")

    try {
      const submitData = {
        equipmentId: formData.equipmentId,
        technicianId: formData.technicianId,
        description: formData.description,
        cost: formData.cost ? Number(formData.cost) : undefined,
        status: formData.status,
        date: formData.date
      }

      if (editingRecord) {
        await updateMaintenance(editingRecord.id, submitData)
      } else {
        await createMaintenance(submitData as any)
      }
      setIsModalOpen(false)
      window.location.reload()
    } catch (err: any) {
      setErrorMSG(err.message || "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">Hoàn thành</span>
      case "IN_PROGRESS":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50">Đang xử lý</span>
      case "PENDING":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Chờ duyệt</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" /> Quản lý bảo trì
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi, cập nhật tiến độ công việc bảo trì thiết bị hệ thống.
          </p>
        </div>
        <div className="flex gap-3 items-center w-full justify-start md:justify-end md:w-auto mt-4 md:mt-0">
          <button 
            onClick={async () => {
              try {
                const res = await fetch('/api/cron/notify');
                const result = await res.json();
                alert(result.message);
                if (result.success) window.location.reload();
              } catch (e) {
                alert("Lỗi gọi Server: " + e)
              }
            }}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50 px-4 py-2 flex items-center gap-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            Quét & Gửi Email Nhắc Lịch
          </button>
          
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            Tạo / Hẹn lịch bảo trì
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Thiết bị</th>
                <th className="px-6 py-4 font-semibold">Mô tả sự cố/Bảo trì</th>
                <th className="px-6 py-4 font-semibold">Ngày thực hiện</th>
                <th className="px-6 py-4 font-semibold">Tạo lúc</th>
                <th className="px-6 py-4 font-semibold">Chi phí</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold">Kỹ thuật viên</th>
                <th className="px-6 py-4 font-semibold text-right">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{record.equipment.name}</div>
                    <div className="text-xs text-slate-500">{record.equipment.code}</div>
                  </td>
                  <td className="px-6 py-4 max-w-[250px] truncate" title={record.description}>
                    {record.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(record.date).toLocaleDateString("vi-VN")}
                      {new Date(record.date) > new Date() && record.status === "PENDING" && !record.isNotified && (
                        <span className="ml-1 text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded uppercase font-bold border border-sky-200">Sắp tới</span>
                      )}
                      {record.isNotified && (
                        <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase font-bold border border-green-200">Đã báo Email</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                    {new Date(record.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {record.cost ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.cost) : '---'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                    <div className="font-medium">{record.technician.name || 'Không rõ'}</div>
                    {record.technician.email && <div className="text-xs text-slate-500">{record.technician.email}</div>}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3 h-full">
                    <button onClick={() => openEditModal(record)} className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
                      <Edit className="w-4 h-4"/> Sửa
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                      <Trash2 className="w-4 h-4"/> Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Chưa có lịch sử bảo trì nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingRecord ? "Chỉnh sửa phiếu bảo trì" : "Tạo phiếu bảo trì"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMSG && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">{errorMSG}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thiết bị</label>
                <select 
                  required
                  value={formData.equipmentId} onChange={e => setFormData({...formData, equipmentId: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  {equipments.map(eq => <option key={eq.id} value={eq.id}>{eq.name} - {eq.code}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kỹ thuật viên phụ trách</label>
                <select 
                  required
                  value={formData.technicianId} onChange={e => setFormData({...formData, technicianId: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mô tả sự cố / Công việc</label>
                <textarea 
                  required rows={3}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chi phí (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})}
                    placeholder="VD: 500000"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dự kiến thực hiện (Hẹn lịch)</label>
                  <input 
                    type="date" required
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Trạng thái</label>
                <select 
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="PENDING">Chờ duyệt (PENDING)</option>
                  <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
                  <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                </select>
                {formData.status === "COMPLETED" && (
                  <p className="text-xs text-green-600 mt-1">Hệ thống sẽ tự động chuyển Thiết bị về trạng thái Đang Hoạt Động (WORKING).</p>
                )}
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                  Huỷ
                </button>
                <button disabled={loading} type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition">
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
