"use client"

import React, { useRef } from "react"
import { X, Printer, Download, CheckCircle2, AlertTriangle, FileText, Camera } from "lucide-react"
import { formatDateVN } from "@/lib/date"

interface LiquidationItem {
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
  imageUrl?: string | null
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
    name?: string | null
    email?: string | null
  } | null
}

interface LiquidationPrintModalProps {
  liquidation: LiquidationItem | null
  isOpen: boolean
  onClose: () => void
}

export default function LiquidationPrintModal({
  liquidation,
  isOpen,
  onClose
}: LiquidationPrintModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !liquidation) return null

  const handlePrint = () => {
    window.print()
  }

  const getMethodText = (method: string) => {
    switch (method) {
      case "AUCTION":
        return "Bán đấu giá / Thanh lý thu hồi vốn"
      case "DISPOSAL":
        return "Phá dỡ / Tiêu hủy theo quy chuẩn rác thải y tế"
      case "SALVAGE":
        return "Rã xác thu hồi linh kiện / phụ tùng thay thế"
      case "TRANSFER":
        return "Điều chuyển đơn vị / Tài trợ"
      default:
        return method
    }
  }

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null) return "-- VNĐ"
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 my-8 max-h-[92vh] flex flex-col">
        {/* Modal Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase">
                Phiếu đề xuất thanh lý trang thiết bị y tế
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Số: {liquidation.liquidationCode} {liquidation.decisionNumber ? `• QĐ/TTr: ${liquidation.decisionNumber}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Printer className="w-4 h-4" /> In phiếu đề xuất
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div 
          ref={printAreaRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-inner font-serif leading-relaxed text-sm print:p-0 print:border-none print:shadow-none print:text-black"
        >
          {/* Header Quốc hiệu & Đơn vị */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300">
            <div className="text-center font-sans">
              <p className="text-xs uppercase font-semibold">TRUNG TÂM Y TẾ KHU VỰC LIÊN CHIỂU</p>
              <p className="text-xs uppercase font-extrabold text-blue-800">KHOA XÉT NGHIỆM</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Số: {liquidation.liquidationCode}</p>
            </div>
            <div className="text-center font-sans">
              <p className="text-xs uppercase font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-xs font-bold underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-[11px] text-slate-500 italic mt-1">
                Liên Chiểu, ngày {new Date(liquidation.requestDate).getDate()} tháng {new Date(liquidation.requestDate).getMonth() + 1} năm {new Date(liquidation.requestDate).getFullYear()}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-6">
            <h2 className="text-lg font-black uppercase tracking-wide">
              PHIẾU ĐỀ XUẤT THANH LÝ TRANG THIẾT BỊ Y TẾ
            </h2>
            <p className="text-xs font-sans text-slate-600 mt-1">
              Kính gửi: Ban Giám đốc Trung tâm Y tế khu vực Liên Chiểu
            </p>
            {liquidation.decisionNumber && (
              <p className="text-xs italic text-slate-600 mt-1 font-sans">
                (Căn cứ Tờ trình/Quyết định số: {liquidation.decisionNumber})
              </p>
            )}
          </div>

          {/* I. Thành phần đề xuất / Hội đồng thẩm định */}
          <div className="space-y-2 mb-6">
            <h4 className="font-bold text-sm uppercase">I. THÀNH PHẦN HỘI ĐỒNG / BAN THẨM ĐỊNH KỸ THUẬT:</h4>
            {liquidation.councilMembers ? (
              <div className="whitespace-pre-line text-xs pl-4 border-l-2 border-slate-300 font-sans">
                {liquidation.councilMembers}
              </div>
            ) : (
              <p className="text-xs italic pl-4 font-sans text-slate-500">
                1. Đại diện Ban Giám đốc TTYT (Chủ tịch Hội đồng)<br />
                2. Trưởng khoa Xét nghiệm<br />
                3. Trưởng phòng Kế hoạch - Tài chính<br />
                4. Phụ trách Trang thiết bị y tế
              </p>
            )}
          </div>

          {/* II. Thông tin thiết bị */}
          <div className="space-y-3 mb-6">
            <h4 className="font-bold text-sm uppercase">II. THÔNG TIN THIẾT BỊ ĐỀ XUẤT THANH LÝ:</h4>
            <div className="border border-slate-300 rounded-lg overflow-hidden font-sans text-xs">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50 w-1/4 border-r border-slate-200">Tên trang thiết bị:</td>
                    <td className="p-2.5 font-extrabold uppercase text-slate-900 w-3/4">{liquidation.equipment.name}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-200">Mã định danh (Code):</td>
                    <td className="p-2.5 font-mono font-bold">{liquidation.equipment.code}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-200">Model / Ký hiệu:</td>
                    <td className="p-2.5 font-bold">{liquidation.equipment.model || "--"}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-200">Số Serial:</td>
                    <td className="p-2.5 font-mono">{liquidation.equipment.serialNumber || "--"}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-200">Hãng & Nước sản xuất:</td>
                    <td className="p-2.5">{liquidation.equipment.brand || "--"} {liquidation.equipment.origin ? `(${liquidation.equipment.origin})` : ""}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-200">Khoa / Bộ phận quản lý:</td>
                    <td className="p-2.5 font-bold">Khoa Xét nghiệm (XN)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-200">Ngày đưa vào sử dụng:</td>
                    <td className="p-2.5">{formatDateVN(liquidation.equipment.purchaseDate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* III. Hiện trạng kỹ thuật & Lý do */}
          <div className="space-y-2 mb-6">
            <h4 className="font-bold text-sm uppercase">III. HIỆN TRẠNG KỸ THUẬT VÀ LÝ DO ĐỀ XUẤT THANH LÝ:</h4>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg font-sans text-xs space-y-1.5">
              <p><strong>Lý do cụ thể:</strong> {liquidation.reason}</p>
              {liquidation.notes && (
                <p><strong>Ghi chú bổ sung:</strong> {liquidation.notes}</p>
              )}
            </div>
          </div>

          {/* IV. Hình ảnh thiết bị lúc làm đề xuất thanh lý */}
          {liquidation.imageUrl && (
            <div className="space-y-2 mb-6">
              <h4 className="font-bold text-sm uppercase flex items-center gap-1.5">
                <span>IV. HÌNH ẢNH HIỆN TRẠNG THIẾT BỊ LÚC LÀM ĐỀ XUẤT:</span>
              </h4>
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 flex flex-col items-center justify-center max-w-md mx-auto">
                <img
                  src={liquidation.imageUrl}
                  alt="Hiện trạng máy lúc đề xuất thanh lý"
                  className="max-h-60 w-auto object-contain rounded border border-slate-200"
                />
                <span className="text-[10px] text-slate-500 italic mt-1 font-sans">
                  Ảnh chụp hiện trạng máy xét nghiệm tại thời điểm lập phiếu đề xuất
                </span>
              </div>
            </div>
          )}

          {/* V. Phương án thanh lý & Giá trị */}
          <div className="space-y-2 mb-8">
            <h4 className="font-bold text-sm uppercase">
              {liquidation.imageUrl ? "V." : "IV."} PHƯƠNG ÁN XỬ LÝ VÀ DỰ TOÁN THU HỒI:
            </h4>
            <div className="border border-slate-300 rounded-lg p-3 font-sans text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-semibold">Hình thức thanh lý đề xuất:</span>
                <span className="font-bold text-blue-800">{getMethodText(liquidation.method)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-semibold">Giá trị còn lại ước tính (nguyên giá/sổ sách):</span>
                <span className="font-bold">{formatCurrency(liquidation.estimatedValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Giá trị thu hồi dự kiến / thực tế:</span>
                <span className="font-extrabold text-green-700">{formatCurrency(liquidation.recoveryValue)}</span>
              </div>
            </div>
          </div>

          {/* Đề xuất kiến nghị */}
          <div className="mb-8 font-sans text-xs leading-relaxed">
            <p>
              <strong>KÍNH ĐỀ NGHỊ:</strong> Khoa Xét nghiệm kính đề nghị Ban Giám đốc Trung tâm Y tế xem xét và phê duyệt phiếu đề xuất thanh lý đối với trang thiết bị y tế nêu trên để đơn vị tiến hành các thủ tục xử lý tài sản công theo đúng quy định pháp luật.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-4 gap-2 text-center font-sans text-xs pt-4 border-t border-slate-300">
            <div>
              <p className="font-bold uppercase">Người lập phiếu</p>
              <p className="text-[10px] italic text-slate-500">(Ký, ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold">{liquidation.user?.name || "KTV Lập biểu"}</p>
            </div>
            <div>
              <p className="font-bold uppercase">Phụ trách TTB</p>
              <p className="text-[10px] italic text-slate-500">(Ký, ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold">KTV. Phụ trách máy</p>
            </div>
            <div>
              <p className="font-bold uppercase">Trưởng Khoa XN</p>
              <p className="text-[10px] italic text-slate-500">(Ký, ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold">BS. Trưởng khoa</p>
            </div>
            <div>
              <p className="font-bold uppercase">Ban Giám Đốc</p>
              <p className="text-[10px] italic text-slate-500">(Phê duyệt đề xuất)</p>
              <div className="h-16"></div>
              <p className="font-bold">Giám Đốc TTYT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
