"use client"

import React, { useState } from "react"
import { Camera, Calendar, User, Eye, Download, X, AlertTriangle, CheckCircle2, Wrench, Image as ImageIcon, Filter } from "lucide-react"
import { formatDateTimeVN } from "@/lib/date"

export interface LogImageItem {
  id: string
  imageUrl: string
  status: string
  note?: string | null
  reporterName?: string | null
  userName?: string | null
  createdAt: string | Date
}

interface DevicePhotoGalleryProps {
  images: LogImageItem[]
  equipmentName: string
  equipmentCode: string
  onSwitchToReport?: () => void
}

export default function DevicePhotoGallery({
  images,
  equipmentName,
  equipmentCode,
  onSwitchToReport
}: DevicePhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<LogImageItem | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  const filteredImages = images.filter(item => {
    if (filterStatus === "ALL") return true
    return item.status === filterStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WORKING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
            <CheckCircle2 className="w-3 h-3" /> Vận hành tốt
          </span>
        )
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500/10 text-yellow-750 dark:text-yellow-400 border border-yellow-500/20">
            <AlertTriangle className="w-3 h-3" /> Cần hiệu chuẩn
          </span>
        )
      case "BROKEN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20">
            <Wrench className="w-3 h-3" /> Sự cố / Hỏng
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-650 dark:text-slate-400 border border-slate-500/20">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div>
          <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            Hình ảnh hiện trạng đã ghi nhận
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              {images.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Lịch sử ảnh chụp kiểm tra ngoại quan & biên bản sự cố của thiết bị
          </p>
        </div>

        {/* Filter */}
        {images.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-bold text-xs outline-none py-1 px-2 cursor-pointer"
            >
              <option value="ALL">Tất cả ảnh ({images.length})</option>
              <option value="BROKEN">Ảnh sự cố ({images.filter(i => i.status === "BROKEN").length})</option>
              <option value="WARNING">Ảnh hiệu chuẩn ({images.filter(i => i.status === "WARNING").length})</option>
              <option value="WORKING">Ảnh hoạt động tốt ({images.filter(i => i.status === "WORKING").length})</option>
            </select>
          </div>
        )}
      </div>

      {/* Gallery List */}
      {images.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
            <Camera className="w-8 h-8 opacity-80" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase">
            Chưa có hình ảnh hiện trạng nào
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Thiết bị này chưa được chụp ảnh lưu lại hiện trạng khi báo cáo.
          </p>
          {onSwitchToReport && (
            <button
              type="button"
              onClick={onSwitchToReport}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" /> Chụp ảnh hiện trạng ngay
            </button>
          )}
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs italic">
          Không có hình ảnh nào phù hợp với bộ lọc đã chọn.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredImages.map((item) => (
            <div
              key={item.id}
              className="group bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Image Preview Container */}
              <div 
                className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.note || "Ảnh hiện trạng thiết bị"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <span className="p-2 bg-white/90 text-slate-900 rounded-full shadow-lg">
                    <Eye className="w-4 h-4" />
                  </span>
                  <span className="text-white text-xs font-bold">Xem ảnh lớn</span>
                </div>

                {/* Status Badge Over Image */}
                <div className="absolute top-2.5 left-2.5">
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Info Container */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{formatDateTimeVN(item.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Người chụp: {item.reporterName || item.userName || "Nhân viên"}</span>
                  </div>

                  {item.note && (
                    <p className="text-xs text-slate-650 dark:text-slate-300 mt-2 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 leading-relaxed font-medium line-clamp-2">
                      {item.note}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedImage(item)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                  </button>
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                    title="Tải ảnh gốc"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                {getStatusBadge(selectedImage.status)}
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase leading-tight">
                    {equipmentName}
                  </h4>
                  <p className="text-[10px] font-mono font-bold text-slate-400">
                    {equipmentCode} • {formatDateTimeVN(selectedImage.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <a
                  href={selectedImage.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  title="Mở ảnh gốc trong tab mới"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image View */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-auto max-h-[60vh]">
              <img
                src={selectedImage.imageUrl}
                alt="Chi tiết ảnh hiện trạng"
                className="max-h-[58vh] w-auto object-contain rounded-lg"
              />
            </div>

            {/* Modal Footer Details */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Người ghi nhận:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedImage.reporterName || selectedImage.userName || "Kỹ thuật viên"}
                </span>
              </div>
              {selectedImage.note && (
                <div className="text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="font-bold text-slate-500 block mb-1 uppercase text-[10px]">Ghi chú hiện trạng:</span>
                  <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                    {selectedImage.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
