"use client"

import React, { useState, useEffect } from "react"
import { X, Archive, FileText, CheckCircle2, AlertTriangle, Upload, DollarSign, Users, HelpCircle } from "lucide-react"
import { createLiquidation } from "@/app/actions/liquidation"

interface EquipmentOption {
  id: string
  name: string
  code: string
  model?: string | null
  serialNumber?: string | null
  brand?: string | null
  status: string
}

interface LiquidationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  equipments: EquipmentOption[]
  preselectedEquipmentId?: string
}

const COMMON_REASONS = [
  "Hư hỏng nặng không thể phục hồi, chi phí sửa chữa vượt quá giá trị máy",
  "Hết niên hạn sử dụng và hết khấu hao theo quy định Bộ Y tế",
  "Lạc hậu công nghệ, hãng sản xuất đã ngưng cung cấp linh kiện & hóa chất",
  "Hỏng bộ cảm biến/linh kiện cốt lõi không có phụ tùng thay thế",
  "Thiết bị không còn đạt chuẩn kiểm định đo lường an toàn y tế",
  "Điều chuyển hoặc thay thế theo đề án nâng cấp trang thiết bị mới"
]

const LIQUIDATION_METHODS = [
  { value: "AUCTION", label: "Bán đấu giá / Thanh lý thu hồi vốn" },
  { value: "DISPOSAL", label: "Phá dỡ / Tiêu hủy theo quy chuẩn rác thải y tế" },
  { value: "SALVAGE", label: "Rã xác thu hồi linh kiện / phụ tùng thay thế" },
  { value: "TRANSFER", label: "Điều chuyển cho đơn vị trực thuộc / Tài trợ" }
]

export default function LiquidationModal({
  isOpen,
  onClose,
  onSuccess,
  equipments,
  preselectedEquipmentId
}: LiquidationModalProps) {
  const [selectedEquipId, setSelectedEquipId] = useState(preselectedEquipmentId || "")
  const [liquidationCode, setLiquidationCode] = useState("")
  const [decisionNumber, setDecisionNumber] = useState("")
  const [reason, setReason] = useState(COMMON_REASONS[0])
  const [customReason, setCustomReason] = useState("")
  const [method, setMethod] = useState("AUCTION")
  const [councilMembers, setCouncilMembers] = useState("1. Đại diện Ban Giám đốc TTYT (Chủ tịch HĐ)\n2. Trưởng khoa Xét nghiệm\n3. Trưởng phòng Kế hoạch - Tài chính\n4. Phụ trách Trang thiết bị y tế")
  const [estimatedValue, setEstimatedValue] = useState("")
  const [recoveryValue, setRecoveryValue] = useState("")
  const [status, setStatus] = useState("PENDING")
  const [notes, setNotes] = useState("")
  
  // File upload state
  const [docFile, setDocFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (preselectedEquipmentId) {
        setSelectedEquipId(preselectedEquipmentId)
      } else if (equipments.length > 0 && !selectedEquipId) {
        setSelectedEquipId(equipments[0].id)
      }

      // Generate suggested liquidation code
      const now = new Date()
      const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "")
      setLiquidationCode(`TL-${yyyymmdd}-${Math.floor(100 + Math.random() * 900)}`)
      setErrorMsg(null)
    }
  }, [isOpen, preselectedEquipmentId, equipments])

  if (!isOpen) return null

  const selectedEquipment = equipments.find(e => e.id === selectedEquipId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEquipId) {
      setErrorMsg("Vui lòng chọn thiết bị cần lập đề xuất thanh lý.")
      return
    }

    const finalReason = reason === "OTHER" ? customReason.trim() : reason
    if (!finalReason) {
      setErrorMsg("Vui lòng nhập lý do thanh lý thiết bị.")
      return
    }

    try {
      setLoading(true)
      setErrorMsg(null)

      let documentUrl: string | undefined = undefined

      if (docFile) {
        setUploading(true)
        const uploadData = new FormData()
        uploadData.append("file", docFile)
        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData
        })
        if (res.ok) {
          const json = await res.json()
          documentUrl = json.url
        }
        setUploading(false)
      }

      const res = await createLiquidation({
        equipmentId: selectedEquipId,
        liquidationCode,
        decisionNumber,
        reason: finalReason,
        method,
        status,
        councilMembers,
        estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
        recoveryValue: recoveryValue ? Number(recoveryValue) : undefined,
        documentUrl,
        notes
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setErrorMsg(res.error || "Không thể tạo hồ sơ thanh lý.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi hệ thống")
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                Lập biên bản đề xuất thanh lý
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Khoa Xét nghiệm • TTYT Khu vực Liên Chiểu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
          {/* Equipment selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              Chọn thiết bị xét nghiệm cần thanh lý *
            </label>
            <select
              value={selectedEquipId}
              onChange={(e) => setSelectedEquipId(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            >
              <option value="">-- Chọn máy xét nghiệm --</option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  [{eq.code}] {eq.name} {eq.model ? `(${eq.model})` : ""} - Hiện trạng: {eq.status === "BROKEN" ? "HỎNG/SỰ CỐ" : eq.status === "WARNING" ? "LỖI QC" : "BÌNH THƯỜNG"}
                </option>
              ))}
            </select>

            {selectedEquipment && (
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div>Model: <strong className="text-slate-900 dark:text-white">{selectedEquipment.model || "N/A"}</strong></div>
                <div>Serial: <strong className="text-slate-900 dark:text-white">{selectedEquipment.serialNumber || "N/A"}</strong></div>
                <div>Hãng sản xuất: <strong className="text-slate-900 dark:text-white">{selectedEquipment.brand || "N/A"}</strong></div>
                <div>Trạng thái hiện tại: <strong className={selectedEquipment.status === "BROKEN" ? "text-red-500" : "text-amber-500"}>{selectedEquipment.status}</strong></div>
              </div>
            )}
          </div>

          {/* Liquidation Code & Decision number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                Mã biên bản thanh lý *
              </label>
              <input
                type="text"
                value={liquidationCode}
                onChange={(e) => setLiquidationCode(e.target.value)}
                required
                placeholder="TL-YYYYMMDD-001"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold font-mono dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                Số quyết định / Tờ trình
              </label>
              <input
                type="text"
                value={decisionNumber}
                onChange={(e) => setDecisionNumber(e.target.value)}
                placeholder="VD: 152/QĐ-TTYT"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              Lý do đề xuất thanh lý *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            >
              {COMMON_REASONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
              <option value="OTHER">-- Lý do khác (Tự nhập) --</option>
            </select>

            {reason === "OTHER" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={2}
                required
                placeholder="Nhập chi tiết nguyên nhân xin thanh lý..."
                className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-medium dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            )}
          </div>

          {/* Method & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                Hình thức thanh lý *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              >
                {LIQUIDATION_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                Trạng thái hồ sơ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              >
                <option value="PENDING">Chờ phê duyệt (PENDING)</option>
                <option value="APPROVED">Đã phê duyệt (APPROVED)</option>
                <option value="COMPLETED">Đã thanh lý xong (COMPLETED)</option>
              </select>
            </div>
          </div>

          {/* Council members */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" /> Thành phần Hội đồng thanh lý
            </label>
            <textarea
              value={councilMembers}
              onChange={(e) => setCouncilMembers(e.target.value)}
              rows={3}
              placeholder="Nhập danh sách thành viên hội đồng kiểm định & thanh lý..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-medium dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
            />
          </div>

          {/* Values: Estimated & Recovery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                Giá trị ước tính còn lại (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="VD: 5000000"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                Giá trị thu hồi thực tế (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                value={recoveryValue}
                onChange={(e) => setRecoveryValue(e.target.value)}
                placeholder="VD: 4500000 (Nếu đã bán)"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          {/* Document File Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              Biên bản thẩm định kỹ thuật / Quyết định đính kèm
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="doc-upload"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="doc-upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-650 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                {docFile ? docFile.name : "Tải lên tệp chứng từ / biên bản"}
              </label>
              {docFile && (
                <button
                  type="button"
                  onClick={() => setDocFile(null)}
                  className="text-xs text-red-500 hover:underline font-bold"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              Ghi chú bổ sung
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ghi chú thêm về điều kiện vận chuyển, bàn giao, an toàn sinh học..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-medium dark:bg-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-500/20 disabled:opacity-60 flex items-center gap-2"
            >
              {uploading ? "Đang tải tệp..." : loading ? "Đang lưu..." : "Xác nhận lập biên bản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
