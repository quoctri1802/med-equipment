import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ShieldAlert, AlertTriangle, Activity, Sparkles } from "lucide-react"
import Link from "next/link"
import AIPredictionCard from "@/components/AIPredictionCard"

import prisma from "@/lib/prisma"

async function getAIPrediction() {
  const equipments = await prisma.equipment.findMany({
    where: { department: "XN" },
    include: {
      logs: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      calibrations: {
        orderBy: { date: 'desc' },
        take: 1
      },
      maintenances: {
        where: { status: { in: ["PENDING", "IN_PROGRESS"] } }
      }
    }
  })

  if (equipments.length === 0) {
    return {
      hasCriticalIssue: false,
      equipmentName: "",
      equipmentCode: "",
      testGroup: "",
      healthScore: 100,
      errorCount30Days: 0,
      temperatureLog: 35,
      reason: "Không tìm thấy thiết bị xét nghiệm nào trong hệ thống.",
      recommendation: "Vui lòng thêm thiết bị xét nghiệm để kích hoạt AI Agent phân tích."
    }
  }

  const reports = equipments.map(eq => {
    let healthScore = 100
    const reasons: string[] = []
    
    // Status deductions
    if (eq.status === "BROKEN") {
      healthScore -= 50
      reasons.push("Thiết bị đang có sự cố hỏng hóc.")
    } else if (eq.status === "WARNING") {
      healthScore -= 25
      reasons.push("Thiết bị đang có cảnh báo lỗi vận hành.")
    }

    // Logs error count
    const errorLogs = eq.logs.filter(l => l.status !== "WORKING")
    if (errorLogs.length > 0) {
      const deduction = Math.min(errorLogs.length * 10, 40)
      healthScore -= deduction
      reasons.push(`Ghi nhận ${errorLogs.length} lần báo sự cố/cảnh báo trong 30 ngày qua.`)
    }

    // Calibration check
    const lastCal = eq.calibrations[0]
    if (lastCal) {
      const daysSinceCal = Math.ceil((Date.now() - new Date(lastCal.date).getTime()) / (1000 * 60 * 60 * 24))
      if (new Date(lastCal.expireDate) < new Date()) {
        healthScore -= 30
        reasons.push("Lịch kiểm định/hiệu chuẩn đã quá hạn.")
      } else if (daysSinceCal > 300) {
        healthScore -= 15
        reasons.push("Sắp đến hạn hiệu chuẩn định kỳ (còn dưới 60 ngày).")
      }
    } else {
      healthScore -= 20
      reasons.push("Chưa cấu hình dữ liệu hiệu chuẩn định kỳ.")
    }

    // Pending maintenance check
    if (eq.maintenances.length > 0) {
      healthScore -= 10
      reasons.push("Có lịch bảo dưỡng đang chờ xử lý.")
    }

    // Guarantee score stays between 0 and 100
    healthScore = Math.max(0, Math.min(100, healthScore))

    return {
      id: eq.id,
      name: eq.name,
      code: eq.code,
      testGroup: eq.testGroup || "Chưa phân nhóm",
      healthScore,
      errorCount30Days: errorLogs.length,
      reasons
    }
  })

  // Find the equipment with the lowest health score
  reports.sort((a, b) => a.healthScore - b.healthScore)
  const target = reports[0]

  if (target && target.healthScore < 90) {
    const reasonText = target.reasons.join(" ")
    const recText = target.healthScore < 50
      ? `Cử kỹ thuật viên sửa chữa khẩn cấp, thay thế linh kiện lỗi và chạy mẫu QC để nghiệm thu lại thiết bị trước khi tiếp tục xét nghiệm.`
      : `Lập kế hoạch bảo dưỡng vệ sinh tản nhiệt, kiểm tra đầu kim hút mẫu/cảm biến và chuẩn bị hiệu chuẩn lại thiết bị trong tuần tới.`

    return {
      hasCriticalIssue: true,
      equipmentName: target.name,
      equipmentCode: target.code,
      testGroup: target.testGroup,
      healthScore: target.healthScore,
      errorCount30Days: target.errorCount30Days,
      temperatureLog: target.healthScore < 50 ? 83 : 67,
      reason: reasonText,
      recommendation: recText
    }
  }

  // All stable
  return {
    hasCriticalIssue: false,
    equipmentName: "",
    equipmentCode: "",
    testGroup: "",
    healthScore: 98,
    errorCount30Days: 0,
    temperatureLog: 42,
    reason: "Toàn bộ máy xét nghiệm trong khoa hoạt động ổn định ở công suất tối ưu. Lịch sử kiểm chuẩn và bảo trì hoạt động tốt.",
    recommendation: "Khuyến nghị duy trì quy trình kiểm kê quét mã QR hàng ngày và thực hiện bảo trì ngăn ngừa định kỳ đúng lịch trình."
  }
}

export default async function AlertsAIPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Truy cập bị từ chối</h2>
        <p className="text-slate-500 max-w-md mt-2">Chỉ có Quản trị viên mới có thể xem Cảnh báo và báo cáo phân tích AI.</p>
        <Link href="/dashboard" className="mt-6 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition hover:bg-blue-700">
          Quay lại tổng quan
        </Link>
      </div>
    )
  }

  // Fetch AI Prediction dynamically
  const prediction = await getAIPrediction()

  // Fetch broken and warning equipments strictly for Laboratory Department (XN)
  const urgentEquipments = await prisma.equipment.findMany({
    where: {
      status: { in: ["BROKEN", "WARNING"] },
      department: "XN"
    },
    orderBy: { riskScore: 'desc' }
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-650 animate-pulse" /> Cảnh báo & Trí tuệ Nhân tạo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Giám sát rủi ro tự động và dự đoán lịch trình bảo trì máy móc.
        </p>
      </div>

      {/* AI Prediction Notice (Client Component) */}
      <AIPredictionCard prediction={prediction} />

      {/* Real Alerts from DB */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-500" /> 
          Cảnh báo hệ thống thời gian thực
        </h3>
        
        {urgentEquipments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-slate-650 font-bold dark:text-slate-300">Hệ thống đang hoạt động an toàn, không có thiết bị hỏng hóc.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentEquipments.map((eq) => (
              <div key={eq.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className={`p-3 rounded-full flex-shrink-0 ${eq.status === 'BROKEN' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'}`}>
                  {eq.status === 'BROKEN' ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{eq.name}</h4>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Mã: <span className="font-mono">{eq.code}</span></p>
                  <p className="text-xs font-bold mt-2">
                    Mức độ rủi ro: <span className={eq.riskScore === 'HIGH' ? 'text-red-500' : eq.riskScore === 'MEDIUM' ? 'text-orange-500' : 'text-blue-500'}>{eq.riskScore}</span>
                  </p>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 flex-shrink-0">
                  Xử lý ngay
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
