"use client"

import React, { useState } from "react"
import { Activity, Camera, Clock, Images, FileSpreadsheet } from "lucide-react"
import ReportForm from "./ReportForm"
import DevicePhotoGallery, { LogImageItem } from "./DevicePhotoGallery"
import UsageManager from "./UsageManager"

interface ScanTabsProps {
  equipmentId: string
  equipmentName: string
  equipmentCode: string
  images: LogImageItem[]
  activeUsage: any
  usageHistory: any[]
}

export default function ScanTabs({
  equipmentId,
  equipmentName,
  equipmentCode,
  images,
  activeUsage,
  usageHistory
}: ScanTabsProps) {
  const [activeTab, setActiveTab] = useState<"report" | "gallery" | "usage">("report")

  return (
    <div className="space-y-4">
      {/* Tab Navigation Buttons */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-md flex gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === "report"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Khai báo trạng thái</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative ${
            activeTab === "gallery"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Ảnh hiện trạng</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === "gallery"
                ? "bg-white text-blue-600"
                : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
            }`}
          >
            {images.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("usage")}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === "usage"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Sử dụng</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "report" && (
        <ReportForm
          equipmentId={equipmentId}
          photoCount={images.length}
          onViewGallery={() => setActiveTab("gallery")}
        />
      )}

      {activeTab === "gallery" && (
        <DevicePhotoGallery
          images={images}
          equipmentName={equipmentName}
          equipmentCode={equipmentCode}
          onSwitchToReport={() => setActiveTab("report")}
        />
      )}

      {activeTab === "usage" && (
        <UsageManager
          equipmentId={equipmentId}
          initialActiveUsage={activeUsage}
          initialHistory={usageHistory}
        />
      )}
    </div>
  )
}
