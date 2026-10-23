"use client"

import React, { useState } from "react"
import {
  Archive,
  Plus,
  Search,
  Filter,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MoreVertical,
  DollarSign,
  Download,
  Trash2,
  Eye,
  Building,
  RefreshCw
} from "lucide-react"
import { formatDateVN } from "@/lib/date"
import LiquidationModal from "./LiquidationModal"
import LiquidationPrintModal from "./LiquidationPrintModal"
import { updateLiquidationStatus, deleteLiquidation } from "@/app/actions/liquidation"
import { useRouter } from "next/navigation"

interface LiquidationRecord {
  id: string
  liquidationCode: string
  decisionNumber?: string | null
  reason: string
  method: string
  status: string
  requestDate: string | Date
  approvedDate?: string | Date | null
  completedDate?: string | Date | null
  councilMembers?: string | null
  estimatedValue?: number | null
  recoveryValue?: number | null
  documentUrl?: string | null
  notes?: string | null
  equipment: {
    id: string
    name: string
    code: string
    model?: string | null
    serialNumber?: string | null
    brand?: string | null
    origin?: string | null
    purchaseDate: string | Date
    department?: string | null
    testGroup?: string | null
  }
  user?: {
    id: string
    name?: string | null
    email?: string | null
  } | null
}

interface EquipmentOption {
  id: string
  name: string
  code: string
  model?: string | null
  serialNumber?: string | null
  brand?: string | null
  status: string
}

interface LiquidationManagerProps {
  initialLiquidations: LiquidationRecord[]
  availableEquipments: EquipmentOption[]
  userRole?: string
}

export default function LiquidationManager({
  initialLiquidations,
  availableEquipments,
  userRole
}: LiquidationManagerProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [methodFilter, setMethodFilter] = useState("ALL")

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [printRecord, setPrintRecord] = useState<LiquidationRecord | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Calculations for KPIs
  const totalCount = initialLiquidations.length
  const pendingCount = initialLiquidations.filter(i => i.status === "PENDING").length
  const approvedCount = initialLiquidations.filter(i => i.status === "APPROVED").length
  const completedCount = initialLiquidations.filter(i => i.status === "COMPLETED").length
  const totalRecoveryValue = initialLiquidations.reduce((sum, item) => sum + (item.recoveryValue || 0), 0)

  // Filter list
  const filteredList = initialLiquidations.filter(item => {
    const matchesSearch =
      item.liquidationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.equipment.model && item.equipment.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.decisionNumber && item.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter
    const matchesMethod = methodFilter === "ALL" || item.method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const formatCurrency = (val?: number | null) => {
    if (!val) return "0 đ"
    return new Intl.NumberFormat("vi-VN").format(val) + " đ"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Chờ phê duyệt
          </span>
        )
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" /> Đã phê duyệt
          </span>
        )
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Đã thanh lý
          </span>
        )
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Đã từ chối/hủy
          </span>
        )
      default:
        return <span>{status}</span>
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "AUCTION":
        return <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Bán đấu giá</span>
      case "DISPOSAL":
        return <span className="text-xs font-semibold text-red-600 dark:text-red-400">Tiêu hủy an toàn</span>
      case "SALVAGE":
        return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Rã xác linh kiện</span>
      case "TRANSFER":
        return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Điều chuyển</span>
      default:
        return <span className="text-xs font-semibold">{method}</span>
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "COMPLETED" | "REJECTED") => {
    const confirmMsg =
      newStatus === "APPROVED"
        ? "Phê duyệt đề xuất thanh lý này?"
        : newStatus === "COMPLETED"
        ? "Xác nhận đã hoàn tất thanh lý thiết bị? Trạng thái thiết bị sẽ được chuyển thành 'ĐÃ THANH LÝ'."
        : "Hủy bỏ/từ chối đề xuất thanh lý này? Thiết bị sẽ được hoàn trả về danh mục máy sự cố."

    if (!confirm(confirmMsg)) return

    let extraRecoveryValue: number | undefined = undefined
    if (newStatus === "COMPLETED") {
      const valInput = prompt("Nhập số tiền thu hồi thực tế từ thanh lý (VNĐ, bỏ trống nếu 0):")
      if (valInput !== null && valInput.trim() !== "") {
        extraRecoveryValue = Number(valInput.replace(/\D/g, ""))
      }
    }

    try {
      setActionLoadingId(id)
      const res = await updateLiquidationStatus(id, newStatus, {
        recoveryValue: extraRecoveryValue
      })
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || "Cập nhật thất bại")
      }
    } catch (e: any) {
      alert("Lỗi: " + e.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa hồ sơ thanh lý ${code}?`)) return
    try {
      setActionLoadingId(id)
      const res = await deleteLiquidation(id)
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || "Xóa thất bại")
      }
    } catch (e: any) {
      alert("Lỗi: " + e.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <Archive className="w-7 h-7 text-red-600 dark:text-red-400" />
            Module Quản lý thanh lý thiết bị
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Quy trình lập biên bản, kiểm tra kỹ thuật, phê duyệt và thanh lý trang thiết bị y tế Khoa Xét nghiệm
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Lập đề xuất thanh lý
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số hồ sơ</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Chờ phê duyệt
          </p>
          <p className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã phê duyệt
          </p>
          <p className="text-2xl font-black text-blue-500 mt-1">{approvedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh lý
          </p>
          <p className="text-2xl font-black text-emerald-500 mt-1">{completedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Giá trị thu hồi
          </p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate" title={formatCurrency(totalRecoveryValue)}>
            {formatCurrency(totalRecoveryValue)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã thanh lý, tên máy, mã định danh, số quyết định..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-xs font-semibold text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-red-500 transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ phê duyệt</option>
              <option value="APPROVED">Đã phê duyệt</option>
              <option value="COMPLETED">Đã thanh lý</option>
              <option value="REJECTED">Đã từ chối/hủy</option>
            </select>
          </div>

          {/* Method filter */}
          <div className="relative">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-red-500 transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả hình thức</option>
              <option value="AUCTION">Bán đấu giá</option>
              <option value="DISPOSAL">Tiêu hủy an toàn</option>
              <option value="SALVAGE">Rã xác phụ tùng</option>
              <option value="TRANSFER">Điều chuyển đơn vị</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/70 dark:bg-slate-900/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4 font-black tracking-wider">Hồ sơ thanh lý</th>
                <th className="px-5 py-4 font-black tracking-wider">Trang thiết bị</th>
                <th className="px-5 py-4 font-black tracking-wider">Ngày lập / Quyết định</th>
                <th className="px-5 py-4 font-black tracking-wider">Hình thức</th>
                <th className="px-5 py-4 font-black tracking-wider">Giá trị thu hồi</th>
                <th className="px-5 py-4 font-black tracking-wider">Trạng thái</th>
                <th className="px-5 py-4 font-black tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-slate-400 italic">
                    Chưa có hồ sơ thanh lý nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/20 transition-colors">
                    {/* Code & reason */}
                    <td className="px-5 py-4">
                      <div className="font-mono font-black text-slate-900 dark:text-white">
                        {item.liquidationCode}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs truncate" title={item.reason}>
                        Lý do: {item.reason}
                      </p>
                    </td>

                    {/* Equipment */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white uppercase">
                        {item.equipment.name}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">
                        {item.equipment.code} {item.equipment.model ? `• Model: ${item.equipment.model}` : ""}
                      </div>
                    </td>

                    {/* Date & Decision */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatDateVN(item.requestDate)}
                      </div>
                      {item.decisionNumber ? (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                          Số: {item.decisionNumber}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">Chưa có số QĐ</div>
                      )}
                    </td>

                    {/* Method */}
                    <td className="px-5 py-4">
                      {getMethodBadge(item.method)}
                    </td>

                    {/* Recovery value */}
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(item.recoveryValue)}
                      </div>
                      {item.estimatedValue ? (
                        <div className="text-[10px] text-slate-400">
                          Ước tính: {formatCurrency(item.estimatedValue)}
                        </div>
                      ) : null}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Print / View document button */}
                        <button
                          type="button"
                          onClick={() => setPrintRecord(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          title="Xem & In biên bản thanh lý chuẩn"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* File download if exists */}
                        {item.documentUrl && (
                          <a
                            href={item.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Tải tệp chứng từ đính kèm"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}

                        {/* Approve button (If PENDING) */}
                        {item.status === "PENDING" && (
                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                            title="Phê duyệt đề xuất thanh lý"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Complete button (If APPROVED or PENDING) */}
                        {item.status !== "COMPLETED" && item.status !== "REJECTED" && (
                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() => handleUpdateStatus(item.id, "COMPLETED")}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                            title="Hoàn tất thanh lý thiết bị"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reject button (If PENDING or APPROVED) */}
                        {item.status !== "REJECTED" && item.status !== "COMPLETED" && (
                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Hủy bỏ / Từ chối đề xuất"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete record */}
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleDelete(item.id, item.liquidationCode)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Xóa hồ sơ thanh lý"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liquidation Create Modal */}
      <LiquidationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          router.refresh()
        }}
        equipments={availableEquipments}
      />

      {/* Liquidation Print Modal */}
      <LiquidationPrintModal
        isOpen={Boolean(printRecord)}
        onClose={() => setPrintRecord(null)}
        liquidation={printRecord}
      />
    </div>
  )
}
