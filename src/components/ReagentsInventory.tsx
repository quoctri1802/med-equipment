"use client"

import { useState } from "react"
import { Package, Plus, Trash2, Calendar, AlertTriangle, CheckCircle2, ChevronRight, PenTool, Database, RefreshCw, X, Loader2, ArrowUpDown } from "lucide-react"
import { addReagent, deleteReagent, adjustReagentVolume } from "@/app/actions/reagents"
import { formatDateVN } from "@/lib/date"

interface Equipment {
  id: string
  name: string
  code: string
}

interface Reagent {
  id: string
  name: string
  code: string
  lotNumber: string
  expiryDate: Date | string
  volume: number
  unit: string
  minSafetyVolume: number
  consumptionPerSample: number
  equipmentId: string | null
  equipment: Equipment | null
}

interface Props {
  initialReagents: Reagent[]
  equipments: Equipment[]
  currentUser: { id: string; role: string; name: string | null } | null
}

export default function ReagentsInventory({ initialReagents, equipments, currentUser }: Props) {
  const [reagents, setReagents] = useState<Reagent[]>(initialReagents)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Form states
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [lotNumber, setLotNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [volume, setVolume] = useState("")
  const [unit, setUnit] = useState("ml")
  const [minSafetyVolume, setMinSafetyVolume] = useState("")
  const [consumptionPerSample, setConsumptionPerSample] = useState("")
  const [equipmentId, setEquipmentId] = useState("")

  // Editing state
  const [editingReagent, setEditingReagent] = useState<Reagent | null>(null)
  const [newVolume, setNewVolume] = useState("")

  // Loading & Feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isAdmin = currentUser?.role === "ADMIN"
  const canEdit = currentUser && (currentUser.role === "ADMIN" || currentUser.role === "TECHNICIAN")

  // Filter logic
  const filteredReagents = reagents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.equipment?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Out of stock or expiring soon list
  const alerts = reagents.filter(r => {
    const isLow = r.volume <= r.minSafetyVolume
    const daysDiff = Math.ceil((new Date(r.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    const isExpiring = daysDiff <= 30
    return isLow || isExpiring
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code || !lotNumber || !expiryDate || !volume || !minSafetyVolume) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const res = await addReagent({
        name,
        code,
        lotNumber,
        expiryDate,
        volume: Number(volume),
        unit,
        minSafetyVolume: Number(minSafetyVolume),
        consumptionPerSample: Number(consumptionPerSample || 0),
        equipmentId: equipmentId || undefined
      })

      if (res.success && res.reagent) {
        // Resolve linked equipment local reference
        const linkedEq = equipments.find(eq => eq.id === equipmentId) || null
        const newReagent: Reagent = {
          ...(res.reagent as any),
          equipment: linkedEq
        }
        
        setReagents(prev => [newReagent, ...prev])
        setName("")
        setCode("")
        setLotNumber("")
        setExpiryDate("")
        setVolume("")
        setMinSafetyVolume("")
        setConsumptionPerSample("")
        setEquipmentId("")
        setShowAddForm(false)
        setSuccess("Đã thêm hóa chất mới vào kho thành công!")
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi thêm hóa chất.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hóa chất này khỏi kho?")) return

    try {
      setLoading(true)
      const res = await deleteReagent(id)
      if (res.success) {
        setReagents(prev => prev.filter(r => r.id !== id))
        setSuccess("Đã xóa hóa chất thành công!")
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi xóa hóa chất.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustVolume = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReagent || !newVolume) return

    try {
      setLoading(true)
      setError(null)
      const res = await adjustReagentVolume(editingReagent.id, Number(newVolume))
      if (res.success && res.reagent) {
        setReagents(prev => prev.map(r => r.id === editingReagent.id ? { ...r, volume: Number(newVolume) } : r))
        setEditingReagent(null)
        setNewVolume("")
        setSuccess("Đã điều chỉnh lượng tồn kho thành công!")
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi điều chỉnh tồn kho.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Panel */}
      {alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-5 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
            <span>CẢNH BÁO TỒN KHO & HẠN SỬ DỤNG ({alerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map(r => {
              const daysDiff = Math.ceil((new Date(r.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              const isExpired = daysDiff <= 0
              const isLow = r.volume <= r.minSafetyVolume
              return (
                <div key={r.id} className="p-3.5 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950/50 rounded-2xl flex flex-col justify-between gap-1 text-xs">
                  <div>
                    <h5 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase">{r.name}</h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Lô: {r.lotNumber} | Máy: {r.equipment?.name || "Chưa liên kết"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {isLow && (
                      <span className="bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900 px-2 py-0.5 rounded-full font-bold text-[9px]">
                        TỒN KHO THẤP ({r.volume} {r.unit})
                      </span>
                    )}
                    {isExpired ? (
                      <span className="bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900 px-2 py-0.5 rounded-full font-bold text-[9px]">
                        ĐÃ HẾT HẠN
                      </span>
                    ) : daysDiff <= 30 ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900 px-2 py-0.5 rounded-full font-bold text-[9px]">
                        SẮP HẾT HẠN ({daysDiff} ngày)
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Operation Status Feedback */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/20 text-green-600 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/60">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm hóa chất, số lô, máy..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 pl-9 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
          />
          <span className="absolute left-3 top-3.5 text-slate-400 text-xs">🔍</span>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4.5 h-4.5" />
            {showAddForm ? "Ẩn Biểu Mẫu" : "Nhập Hóa Chất Mới"}
          </button>
        )}
      </div>

      {/* Collapsible Add Reagent Form */}
      {showAddForm && canEdit && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-lg space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-50 dark:border-slate-700 pb-2">Khai báo lô hóa chất y tế mới</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Tên hóa chất / SKU *</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Diluent DX-500"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs dark:bg-slate-900 dark:text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Mã hóa chất (SKU Code) *</label>
              <input
                required
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: DIL-DX500"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs dark:bg-slate-900 dark:text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Số lô (Lot Number) *</label>
              <input
                required
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="VD: Lot 987654"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs dark:bg-slate-900 dark:text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Thể tích / Lượng ban đầu *</label>
              <input
                required
                type="number"
                step="any"
                min="0"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="VD: 1000"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs dark:bg-slate-900 dark:text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Đơn vị *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs dark:bg-slate-900 dark:text-white font-bold outline-none"
              >
                <option value="ml">ml (Mililit)</option>
                <option value="test">test (Phép đo)</option>
                <option value="pcs">pcs (Cái/Chiếc)</option>
                <option value="kits">kits (Bộ)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Ngưỡng báo động tồn kho tối thiểu *</label>
              <input
                required
                type="number"
                step="any"
                min="0"
                value={minSafetyVolume}
                onChange={(e) => setMinSafetyVolume(e.target.value)}
                placeholder="VD: 100"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs dark:bg-slate-900 dark:text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Hạn sử dụng *</label>
              <input
                required
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs dark:bg-slate-900 dark:text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Liên kết với thiết bị phụ trách (Nạp vào máy nào)</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs dark:bg-slate-900 dark:text-white font-bold outline-none"
              >
                <option value="">-- Chọn máy liên kết (Không bắt buộc) --</option>
                {equipments.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Định mức tiêu hao tự động (Đơn vị / 1 Mẫu chạy)</label>
              <input
                type="number"
                step="any"
                min="0"
                value={consumptionPerSample}
                onChange={(e) => setConsumptionPerSample(e.target.value)}
                placeholder="VD: 0.05 (mỗi ca chạy tự động trừ 0.05 ml trong kho)"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs dark:bg-slate-900 dark:text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Lưu hóa chất vào kho
            </button>
          </div>
        </form>
      )}

      {/* Reagents Table Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-150 dark:border-slate-700/50 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
            <Database className="w-4 h-4 text-blue-500" /> Bảng danh sách vật tư hóa chất xét nghiệm
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
                <th className="p-4">Tên Hóa Chất / SKU</th>
                <th className="p-4">Lô (Lot)</th>
                <th className="p-4">Hạn Sử Dụng</th>
                <th className="p-4">Số Lượng Trong Kho</th>
                <th className="p-4">Độ Tiêu Hao / Mẫu</th>
                <th className="p-4">Thiết Bị Liên Kết</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReagents.map((r) => {
                const daysDiff = Math.ceil((new Date(r.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                const isExpired = daysDiff <= 0
                const isLow = r.volume <= r.minSafetyVolume
                
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-slate-900 dark:text-white uppercase block leading-tight">{r.name}</span>
                      <span className="text-[10px] text-slate-450 font-mono mt-0.5 block">{r.code}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-750 dark:text-slate-350">{r.lotNumber}</td>
                    <td className="p-4">
                      <span className="font-semibold block">{formatDateVN(r.expiryDate)}</span>
                      {isExpired ? (
                        <span className="text-red-500 font-bold text-[9px] uppercase tracking-wider block mt-0.5">Đã hết hạn!</span>
                      ) : daysDiff <= 30 ? (
                        <span className="text-amber-500 font-bold text-[9px] block mt-0.5">Sắp hết hạn ({daysDiff} ngày)</span>
                      ) : (
                        <span className="text-slate-400 text-[9px] block mt-0.5">Còn {daysDiff} ngày</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black font-mono text-sm ${isLow ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                          {r.volume.toFixed(1)} {r.unit}
                        </span>
                        {isLow && (
                          <span className="bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">Yếu</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-450 block mt-0.5">Ngưỡng tối thiểu: {r.minSafetyVolume} {r.unit}</span>
                    </td>
                    <td className="p-4">
                      {r.consumptionPerSample > 0 ? (
                        <span className="font-semibold text-slate-750 dark:text-slate-300 font-mono">
                          {r.consumptionPerSample} {r.unit}/mẫu
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                      {r.equipment ? (
                        <div className="flex flex-col">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 uppercase leading-none">{r.equipment.name}</span>
                          <span className="text-[9px] text-slate-450 font-mono mt-1">{r.equipment.code}</span>
                        </div>
                      ) : (
                        <span className="text-slate-450 italic">Chưa liên kết</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingReagent(r)
                              setNewVolume(String(r.volume))
                              setError(null)
                            }}
                            className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1 font-bold"
                            title="Điều chỉnh kho"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Điều chỉnh
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredReagents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-sm italic">
                    {searchQuery ? "Không tìm thấy hóa chất nào khớp với từ khóa tìm kiếm." : "Kho hóa chất hiện tại đang trống."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Volume Modal */}
      {editingReagent && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-750 shadow-2xl p-6 w-full max-w-sm space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Điều chỉnh lượng tồn kho</h4>
              <button 
                onClick={() => setEditingReagent(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Cập nhật lại số lượng thực tế trong kho của hóa chất <strong>{editingReagent.name}</strong> (Lô: {editingReagent.lotNumber}).
            </p>

            <form onSubmit={handleAdjustVolume} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Số lượng thực tế mới ({editingReagent.unit})</label>
                <input
                  required
                  type="number"
                  step="any"
                  min="0"
                  value={newVolume}
                  onChange={(e) => setNewVolume(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm dark:bg-slate-900 dark:text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReagent(null)}
                  className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
