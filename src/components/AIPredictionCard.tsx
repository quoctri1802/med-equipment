"use client"

import { useState } from "react"
import { BrainCircuit, Sparkles, X, Activity, Cpu, ThermometerSun, CheckCircle2 } from "lucide-react"

export default function AIPredictionCard() {
  const [isVisible, setIsVisible] = useState(true)
  const [showModal, setShowModal] = useState(false)

  if (!isVisible) return null

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <BrainCircuit className="w-32 h-32 animate-pulse" />
        </div>
        <div className="bg-white/20 p-4 rounded-full shadow-inner backdrop-blur-md relative">
          <Sparkles className="w-8 h-8 text-white relative z-10" />
          <div className="absolute inset-0 bg-white/40 rounded-full animate-ping opacity-75"></div>
        </div>
        <div className="flex-1 z-10">
          <h3 className="font-bold text-xl flex items-center gap-2">
            MedEquip AI Agent <span className="px-2 py-0.5 text-xs bg-indigo-900/40 rounded-full border border-white/20">Beta</span>
          </h3>
          <p className="mt-2 text-blue-100 max-w-2xl text-sm leading-relaxed">
            Hệ thống phân tích dự đoán AI đã quét 1.200 log hoạt động 24h qua. Nhận thấy <strong>Máy Đo Điện Tâm Đồ (Khoa Tim Mạch)</strong> có rủi ro quá tải 80% công suất trong tuần tới. Khuyến nghị cử kỹ thuật viên bảo dưỡng phụ tùng cảm biến ngay lập tức.
          </p>
          <div className="mt-4 flex gap-3">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              Chi tiết báo cáo AI
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="bg-indigo-700/50 hover:bg-indigo-700/70 text-white border border-indigo-400/30 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 rounded-xl">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Báo cáo chuẩn đoán AI</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Timestamp: {new Date().toLocaleString('vi-VN')}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                  <Activity className="w-5 h-5 text-blue-500 mb-2"/>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Độ ổn định</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">42%</span>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center text-center">
                  <ThermometerSun className="w-5 h-5 text-red-500 mb-2"/>
                  <span className="text-xs text-red-600 dark:text-red-400">Nhiệt độ lỗi</span>
                  <span className="font-bold text-red-700 dark:text-red-300">85°C</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                  <Cpu className="w-5 h-5 text-purple-500 mb-2"/>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Chip AI model</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">v4.0.2</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mb-2"/>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Dự đoán đúng</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">96.8%</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-white">Phân tích chuyên sâu:</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Dữ liệu viễn thâm đo được từ <strong>Máy Đo Điện Tâm Đồ</strong> cho thấy biểu đồ nhiễu sóng PQRST bắt đầu mất đồng bộ liên tục trong 72h qua. Nhiệt độ bảng mạch xử lý số tín hiệu (DSP) tăng vọt vượt ngưỡng cho phép 15% vào các giờ cao điểm (8h-11h sáng). 
                </p>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                  <span className="font-bold">Hậu quả có thể xảy ra:</span> Nếu không thay keo tản nhiệt và cân chỉnh lại chip cảm biến, thiết bị có nguy cơ cháy bo mạch hoàn toàn trong khoảng 4-5 ngày tới.
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition">
                Đóng
              </button>
              <button 
                onClick={() => {
                  window.location.href = '/dashboard/maintenance'
                }} 
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                Chuyển qua Thiết lập Bảo trì
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
