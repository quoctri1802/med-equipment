"use client"

import { useState } from "react"
import { BrainCircuit, Sparkles, X, Activity, Cpu, ThermometerSun, CheckCircle2 } from "lucide-react"

type AIPredictionProps = {
  prediction: {
    hasCriticalIssue: boolean
    equipmentName: string
    equipmentCode: string
    testGroup: string
    healthScore: number
    errorCount30Days: number
    temperatureLog: number
    reason: string
    recommendation: string
  }
}

export default function AIPredictionCard({ prediction }: AIPredictionProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showModal, setShowModal] = useState(false)

  if (!isVisible || !prediction) return null

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
            {prediction.hasCriticalIssue ? (
              <>
                Hệ thống phân tích dự đoán AI đã quét các log hoạt động trong 30 ngày qua. Nhận thấy <strong>{prediction.equipmentName} ({prediction.testGroup})</strong> có rủi ro sự cố/quá tải cao (Điểm ổn định: {prediction.healthScore}%). Khuyến nghị: {prediction.recommendation}
              </>
            ) : (
              <>
                Hệ thống phân tích dự đoán AI đã quét toàn bộ log hoạt động trong 30 ngày qua. {prediction.reason} {prediction.recommendation}
              </>
            )}
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
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Báo cáo chẩn đoán AI</h2>
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
                  <span className="font-bold text-slate-700 dark:text-slate-200">{prediction.healthScore}%</span>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center text-center">
                  <ThermometerSun className="w-5 h-5 text-red-500 mb-2"/>
                  <span className="text-xs text-red-650 dark:text-red-400">Nhiệt độ bo mạch</span>
                  <span className="font-bold text-red-750 dark:text-red-350">{prediction.temperatureLog}°C</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                  <Cpu className="w-5 h-5 text-purple-500 mb-2"/>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Chip AI model</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">v4.2.0</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mb-2"/>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Độ chính xác AI</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">98.2%</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-white">Phân tích chuyên sâu từ AI:</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {prediction.hasCriticalIssue ? (
                    <>
                      Dữ liệu hệ thống ghi nhận thiết bị <strong>{prediction.equipmentName} ({prediction.equipmentCode})</strong> có dấu hiệu suy giảm độ tin cậy vận hành: {prediction.reason} Nhiệt độ cảm biến bo mạch đo được là {prediction.temperatureLog}°C.
                    </>
                  ) : (
                    <>
                      Mọi thông số đo lường từ logs hoạt động, hiệu chuẩn và bảo dưỡng của toàn bộ các máy xét nghiệm trong khoa đều nằm trong ngưỡng an toàn tối ưu. Không phát hiện bất kỳ dấu hiệu lỗi hay suy giảm linh kiện nào.
                    </>
                  )}
                </p>
                <div className={`p-4 border rounded-lg text-sm ${
                  prediction.hasCriticalIssue 
                    ? "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-250 text-yellow-800 dark:text-yellow-350" 
                    : "bg-green-50/50 dark:bg-green-900/10 border-green-200 text-green-800 dark:text-green-350"
                }`}>
                  <span className="font-bold font-sans">Đánh giá hệ quả: </span>
                  {prediction.hasCriticalIssue ? (
                    <>Thiết bị có rủi ro phát sinh sự cố làm ngưng trệ hoạt động xét nghiệm nếu không được bảo dưỡng sớm.</>
                  ) : (
                    <>Tất cả hệ thống hoạt động hoàn hảo, không cần can thiệp kỹ thuật khẩn cấp.</>
                  )}
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
                Chuyển qua Lịch Bảo trì
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
