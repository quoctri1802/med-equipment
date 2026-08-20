"use client"

import { useState } from "react"
import { Wrench, Award, Activity, BarChart3, Plus, Download, AlertCircle, CheckCircle2, Loader2, Calendar } from "lucide-react"
import { addCalibration, addQualityControl, addSampleRun } from "@/app/actions/quality"
import { formatDateVN } from "@/lib/date"

interface Maintenance {
  id: string
  description: string
  cost: number | null
  status: string
  date: Date | string
  technician: { name: string | null; email: string | null } | null
}

interface Calibration {
  id: string
  date: Date | string
  expireDate: Date | string
  organization: string
  certificateUrl: string | null
  notes: string | null
}

interface QCLog {
  id: string
  type: string
  controlName: string
  lotNumber: string
  parameterName: string
  measuredValue: number
  targetValue: number
  sdValue: number
  resultStatus: string
  runDate: Date | string
  user: { name: string | null; email: string | null }
}

interface SampleRun {
  id: string
  runDate: Date | string
  sampleCount: number
  notes: string | null
  user: { name: string | null; email: string | null }
}

interface Props {
  equipmentId: string
  initialTotalSamples: number
  initialMaintenances: Maintenance[]
  initialCalibrations: Calibration[]
  initialQcs: QCLog[]
  initialSampleRuns: SampleRun[]
  currentUser: { id: string; role: string; name: string | null } | null
}

export default function EquipmentTabs({
  equipmentId,
  initialTotalSamples,
  initialMaintenances,
  initialCalibrations,
  initialQcs,
  initialSampleRuns,
  currentUser
}: Props) {
  const [activeTab, setActiveTab] = useState<"maintenance" | "calibration" | "qc" | "samples">("maintenance")
  const [totalSamples, setTotalSamples] = useState(initialTotalSamples)

  // Sub-data states
  const [maintenances, setMaintenances] = useState(initialMaintenances)
  const [calibrations, setCalibrations] = useState(initialCalibrations)
  const [qcs, setQcs] = useState(initialQcs)
  const [sampleRuns, setSampleRuns] = useState(initialSampleRuns)

  // Loading & Messages
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  // 1. Calibration
  const [calDate, setCalDate] = useState("")
  const [calExpire, setCalExpire] = useState("")
  const [calOrg, setCalOrg] = useState("")
  const [calFile, setCalFile] = useState<File | null>(null)
  const [calNotes, setCalNotes] = useState("")

  // 2. QC
  const [qcType, setQcType] = useState("IQC")
  const [qcControlName, setQcControlName] = useState("")
  const [qcLot, setQcLot] = useState("")
  const [qcParam, setQcParam] = useState("Glucose")
  const [qcMeasured, setQcMeasured] = useState("")
  const [qcTarget, setQcTarget] = useState("")
  const [qcSd, setQcSd] = useState("")
  const [qcNotes, setQcNotes] = useState("")

  // 3. Samples
  const [sampleCount, setSampleCount] = useState("")
  const [sampleNotes, setSampleNotes] = useState("")

  const canEdit = currentUser && (currentUser.role === "ADMIN" || currentUser.role === "TECHNICIAN")

  const handleAddCalibration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!calDate || !calExpire || !calOrg) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      let certificateUrl = ""
      if (calFile) {
        const formData = new FormData()
        formData.append("file", calFile)
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (uploadRes.ok) {
          certificateUrl = uploadData.url
        } else {
          throw new Error(uploadData.error || "Tải tệp chứng nhận thất bại.")
        }
      }

      const res = await addCalibration({
        equipmentId,
        date: calDate,
        expireDate: calExpire,
        organization: calOrg,
        certificateUrl,
        notes: calNotes
      })

      if (res.success && res.calibration) {
        setCalibrations(prev => [res.calibration as any, ...prev])
        setCalDate("")
        setCalExpire("")
        setCalOrg("")
        setCalFile(null)
        setCalNotes("")
        setSuccess("Đã lưu chứng nhận kiểm định mới!")
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || "Không thể lưu kiểm định.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddQC = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qcControlName || !qcLot || !qcParam || !qcMeasured || !qcTarget || !qcSd) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const res = await addQualityControl({
        equipmentId,
        type: qcType,
        controlName: qcControlName,
        lotNumber: qcLot,
        parameterName: qcParam,
        measuredValue: Number(qcMeasured),
        targetValue: Number(qcTarget),
        sdValue: Number(qcSd),
        notes: qcNotes
      })

      if (res.success && res.qc) {
        setQcs(prev => [res.qc as any, ...prev])
        setQcMeasured("")
        setQcNotes("")
        setSuccess("Đã ghi nhận kết quả QC thành công!")
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || "Không thể lưu kết quả QC.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSampleRun = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sampleCount) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const countNum = Number(sampleCount)
      const res = await addSampleRun({
        equipmentId,
        sampleCount: countNum,
        notes: sampleNotes
      })

      if (res.success && res.run) {
        setSampleRuns(prev => [res.run as any, ...prev])
        setTotalSamples(prev => prev + countNum)
        setSampleCount("")
        setSampleNotes("")
        setSuccess("Đã cập nhật số ca mẫu chạy!")
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || "Không thể lưu số mẫu chạy.")
    } finally {
      setLoading(false)
    }
  }

  // Draw Levey-Jennings SVG Chart for the selected parameter
  const renderLeveyJennings = () => {
    // Filter QCs for the selected parameter name (dynamic filter based on user selection)
    const parameterQCs = qcs
      .filter(q => q.parameterName === qcParam)
      .sort((a, b) => new Date(a.runDate).getTime() - new Date(b.runDate).getTime())
      .slice(-15) // Plot last 15 points

    if (parameterQCs.length === 0) {
      return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl text-center text-slate-500 text-sm">
          Chưa có dữ liệu chạy QC cho chỉ số <strong>{qcParam}</strong> để vẽ biểu đồ Levey-Jennings.
        </div>
      )
    }

    const target = parameterQCs[0].targetValue
    const sd = parameterQCs[0].sdValue

    // SVG Layout Constants
    const width = 600
    const height = 280
    const paddingLeft = 50
    const paddingRight = 30
    const paddingTop = 30
    const paddingBottom = 40

    const graphWidth = width - paddingLeft - paddingRight
    const graphHeight = height - paddingTop - paddingBottom

    // Y values mapping
    const getPercentageY = (value: number) => {
      // Scale from -4SD to +4SD
      const sdDiff = (value - target) / sd
      const normalized = (sdDiff + 4) / 8 // 0 to 1
      const reversed = 1 - normalized // 0 = top, 1 = bottom
      return paddingTop + reversed * graphHeight
    }

    // Grid SD line definitions
    const sdLines = [
      { label: "+3 SD", value: target + 3 * sd, color: "#ef4444", stroke: "2,2" },
      { label: "+2 SD", value: target + 2 * sd, color: "#f59e0b", stroke: "4,4" },
      { label: "+1 SD", value: target + 1 * sd, color: "#94a3b8", stroke: "2,2" },
      { label: "MEAN", value: target, color: "#10b981", stroke: "none" },
      { label: "-1 SD", value: target - 1 * sd, color: "#94a3b8", stroke: "2,2" },
      { label: "-2 SD", value: target - 2 * sd, color: "#f59e0b", stroke: "4,4" },
      { label: "-3 SD", value: target - 3 * sd, color: "#ef4444", stroke: "2,2" }
    ]

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Biểu đồ Levey-Jennings ({qcParam})</p>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" /> Mean (Đạt)
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" /> 2SD (Cảnh báo)
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" /> 3SD (Vi phạm)
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-auto">
            {/* Draw SD Lines & Labels */}
            {sdLines.map((line, idx) => {
              const y = getPercentageY(line.value)
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke={line.color}
                    strokeWidth={line.label === "MEAN" ? 2 : 1}
                    strokeDasharray={line.stroke}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    fill={line.color}
                    className="text-[9px] font-black text-right"
                    textAnchor="end"
                  >
                    {line.label}
                  </text>
                  <text
                    x={width - paddingRight + 4}
                    y={y + 4}
                    fill="#94a3b8"
                    className="text-[8px] font-mono"
                  >
                    {line.value.toFixed(2)}
                  </text>
                </g>
              )
            })}

            {/* Plot Points and Line Connector */}
            {parameterQCs.map((point, idx) => {
              const x = paddingLeft + (idx / Math.max(1, parameterQCs.length - 1)) * graphWidth
              const y = getPercentageY(point.measuredValue)

              // Connect to next point
              let nextLine = null
              if (idx < parameterQCs.length - 1) {
                const nextPoint = parameterQCs[idx + 1]
                const nextX = paddingLeft + ((idx + 1) / Math.max(1, parameterQCs.length - 1)) * graphWidth
                const nextY = getPercentageY(nextPoint.measuredValue)
                nextLine = (
                  <line
                    x1={x}
                    y1={y}
                    x2={nextX}
                    y2={nextY}
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                  />
                )
              }

              // Color point based on status
              const dotColor =
                point.resultStatus === "FAIL" ? "#ef4444" :
                point.resultStatus === "WARNING" ? "#f59e0b" :
                "#10b981"

              return (
                <g key={point.id}>
                  {nextLine}
                  <circle
                    cx={x}
                    cy={y}
                    r={point.resultStatus === "FAIL" ? 5 : 4}
                    fill={dotColor}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className={point.resultStatus === "FAIL" ? "animate-pulse" : ""}
                  />
                  {/* Point Tooltip/Value */}
                  <text
                    x={x}
                    y={y - 8}
                    fill="#64748b"
                    className="text-[8px] font-mono font-bold"
                    textAnchor="middle"
                  >
                    {point.measuredValue.toFixed(1)}
                  </text>
                  {/* X Axis Date labels */}
                  {idx % Math.ceil(parameterQCs.length / 5) === 0 && (
                    <text
                      x={x}
                      y={height - paddingBottom + 18}
                      fill="#94a3b8"
                      className="text-[8px] font-semibold"
                      textAnchor="middle"
                    >
                      {new Date(point.runDate).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden">
      {/* Tabs list */}
      <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 px-4 py-3 gap-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab("maintenance"); setError(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "maintenance"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-250"
          }`}
        >
          <Wrench className="w-4 h-4" /> Bảo trì
        </button>
        <button
          onClick={() => { setActiveTab("calibration"); setError(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "calibration"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-250"
          }`}
        >
          <Award className="w-4 h-4" /> Kiểm định
        </button>
        <button
          onClick={() => { setActiveTab("qc"); setError(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "qc"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-250"
          }`}
        >
          <Activity className="w-4 h-4" /> Nội/Ngoại kiểm (QC)
        </button>
        <button
          onClick={() => { setActiveTab("samples"); setError(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "samples"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-250"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Số mẫu chạy
        </button>
      </div>

      {/* Messages */}
      <div className="px-5 pt-4">
        {error && (
          <div className="flex items-center gap-2 text-sm bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 p-3.5 rounded-xl border border-green-100 dark:border-green-900/30">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Tab contents */}
      <div className="p-5">
        {/* Tab 1: Maintenance */}
        {activeTab === "maintenance" && (
          <div className="space-y-4">
            {maintenances.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm italic">Chưa có lịch sử bảo trì.</p>
            ) : (
              <div className="space-y-4">
                {maintenances.map(m => (
                  <div key={m.id} className="p-4 border border-slate-150 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{m.description}</h4>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                        m.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800' :
                        m.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>{m.status === 'COMPLETED' ? 'HOÀN THÀNH' : m.status === 'IN_PROGRESS' ? 'ĐANG SỬA CHỮA' : 'CHỜ XỬ LÝ'}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-2 font-medium">
                      <span>KTV: <span className="font-bold text-slate-700 dark:text-slate-350">{m.technician?.name || 'N/A'}</span></span>
                      <span>Chi phí: <span className="font-bold text-slate-700 dark:text-slate-350">{m.cost ? m.cost.toLocaleString() + ' đ' : '--'}</span></span>
                      <span>Ngày thực hiện: <span className="font-bold text-slate-700 dark:text-slate-350">{formatDateVN(m.date)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Calibration */}
        {activeTab === "calibration" && (
          <div className="space-y-6">
            {/* Calibration Warning Panel */}
            {calibrations.length > 0 && (
              (() => {
                const latest = calibrations[0]
                const daysDiff = Math.ceil((new Date(latest.expireDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                const isExpired = daysDiff <= 0
                return (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                    isExpired ? "bg-red-50 border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400" :
                    daysDiff <= 30 ? "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400" :
                    "bg-green-50 border-green-100 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400"
                  }`}>
                    <Calendar className="w-5 h-5" />
                    <div className="text-xs font-semibold">
                      {isExpired ? (
                        <span><strong>Cảnh báo:</strong> Giấy kiểm định y tế đã hết hạn từ ngày {formatDateVN(latest.expireDate)}! Cần đặt lịch hiệu chuẩn ngay.</span>
                      ) : (
                        <span>Hồ sơ hiệu chuẩn hiện tại có giá trị đến {formatDateVN(latest.expireDate)} (Còn lại <strong>{daysDiff} ngày</strong>).</span>
                      )}
                    </div>
                  </div>
                )
              })()
            )}

            {/* Add Calibration Form */}
            {canEdit && (
              <form onSubmit={handleAddCalibration} className="bg-slate-50/50 dark:bg-slate-900/20 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Cập nhật Giấy hiệu chuẩn mới</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Đơn vị kiểm định *</label>
                    <input
                      required
                      type="text"
                      value={calOrg}
                      onChange={(e) => setCalOrg(e.target.value)}
                      placeholder="VD: Trung tâm Đo lường Đà Nẵng"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Tệp chứng nhận PDF/Ảnh</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setCalFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Ngày thực hiện hiệu chuẩn *</label>
                    <input
                      required
                      type="date"
                      value={calDate}
                      onChange={(e) => setCalDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Ngày hết hạn hiệu chuẩn *</label>
                    <input
                      required
                      type="date"
                      value={calExpire}
                      onChange={(e) => setCalExpire(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Ghi chú kiểm định</label>
                  <input
                    type="text"
                    value={calNotes}
                    onChange={(e) => setCalNotes(e.target.value)}
                    placeholder="Nhập ghi chú nếu có..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Lưu chứng nhận
                  </button>
                </div>
              </form>
            )}

            {/* Calibrations History list */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hồ sơ lịch sử hiệu chuẩn</p>
              {calibrations.length === 0 ? (
                <p className="text-slate-500 text-center py-6 text-sm italic">Chưa có lịch sử hiệu chuẩn y tế.</p>
              ) : (
                <div className="space-y-3">
                  {calibrations.map((cal) => (
                    <div key={cal.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{cal.organization}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Ngày hiệu chuẩn: <strong>{formatDateVN(cal.date)}</strong> | Hết hạn: <strong className="text-red-500">{formatDateVN(cal.expireDate)}</strong>
                        </p>
                        {cal.notes && <p className="text-xs text-slate-500 italic mt-1.5">"{cal.notes}"</p>}
                      </div>
                      {cal.certificateUrl && (
                        <a
                          href={cal.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-350 flex items-center gap-1 transition-all shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" /> Xem chứng nhận
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: QC */}
        {activeTab === "qc" && (
          <div className="space-y-6">
            {/* Filter and SVG Chart */}
            <div className="bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Chọn chỉ số QC hiển thị</h4>
                <select
                  value={qcParam}
                  onChange={(e) => setQcParam(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs dark:bg-slate-900 dark:text-white transition-all outline-none font-bold"
                >
                  <option value="Glucose">Glucose (Sinh hóa)</option>
                  <option value="WBC">WBC (Huyết học - Bạch cầu)</option>
                  <option value="RBC">RBC (Huyết học - Hồng cầu)</option>
                  <option value="PLT">PLT (Huyết học - Tiểu cầu)</option>
                  <option value="Creatinine">Creatinine (Sinh hóa)</option>
                  <option value="Urea">Urea (Sinh hóa)</option>
                </select>
              </div>

              {renderLeveyJennings()}
            </div>

            {/* Add QC Result Form */}
            {canEdit && (
              <form onSubmit={handleAddQC} className="bg-slate-50/50 dark:bg-slate-900/20 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Ghi nhận phiên kiểm tra chất lượng (QC Run)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Loại kiểm định</label>
                    <select
                      value={qcType}
                      onChange={(e) => setQcType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs dark:bg-slate-900 dark:text-white transition-all outline-none font-bold"
                    >
                      <option value="IQC">Nội kiểm (IQC)</option>
                      <option value="EQC">Ngoại kiểm (EQC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Tên mẫu chuẩn *</label>
                    <input
                      required
                      type="text"
                      value={qcControlName}
                      onChange={(e) => setQcControlName(e.target.value)}
                      placeholder="VD: Lyphochek Level 1"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Số lô (Lot) *</label>
                    <input
                      required
                      type="text"
                      value={qcLot}
                      onChange={(e) => setQcLot(e.target.value)}
                      placeholder="VD: Lot 12345"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Chỉ số xét nghiệm</label>
                    <select
                      value={qcParam}
                      onChange={(e) => setQcParam(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs dark:bg-slate-900 dark:text-white transition-all outline-none font-bold"
                    >
                      <option value="Glucose">Glucose</option>
                      <option value="WBC">WBC</option>
                      <option value="RBC">RBC</option>
                      <option value="PLT">PLT</option>
                      <option value="Creatinine">Creatinine</option>
                      <option value="Urea">Urea</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Giá trị đo *</label>
                    <input
                      required
                      type="number"
                      step="any"
                      value={qcMeasured}
                      onChange={(e) => setQcMeasured(e.target.value)}
                      placeholder="Measured"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Giá trị Target (Mean) *</label>
                    <input
                      required
                      type="number"
                      step="any"
                      value={qcTarget}
                      onChange={(e) => setQcTarget(e.target.value)}
                      placeholder="Target Mean"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Độ lệch chuẩn (SD) *</label>
                    <input
                      required
                      type="number"
                      step="any"
                      value={qcSd}
                      onChange={(e) => setQcSd(e.target.value)}
                      placeholder="Target SD"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Ghi chú QC</label>
                  <input
                    type="text"
                    value={qcNotes}
                    onChange={(e) => setQcNotes(e.target.value)}
                    placeholder="Nhập ghi chú nếu có (VD: Vi phạm luật Westgard 13s, chạy lại)..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Lưu phiên QC
                  </button>
                </div>
              </form>
            )}

            {/* List of recent QCs */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh sách kết quả chạy QC gần đây</p>
              {qcs.length === 0 ? (
                <p className="text-slate-500 text-center py-6 text-sm italic">Chưa có nhật ký chạy nội kiểm/ngoại kiểm.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto pr-1 space-y-2.5">
                  {qcs.map((log) => {
                    const zScore = (log.measuredValue - log.targetValue) / log.sdValue
                    return (
                      <div key={log.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/10 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                              log.type === 'IQC' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400' :
                              'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400'
                            }`}>{log.type}</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{log.parameterName}</span>
                            <span className="text-[10px] text-slate-500">({log.controlName} - Lot: {log.lotNumber})</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Người chạy: <strong className="text-slate-700 dark:text-slate-350">{log.user?.name || log.user?.email}</strong> | Ngày: {new Date(log.runDate).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="font-bold font-mono">Val: {log.measuredValue}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black border ${
                              log.resultStatus === 'FAIL' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400' :
                              log.resultStatus === 'WARNING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400' :
                              'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400'
                            }`}>
                              {log.resultStatus === 'FAIL' ? 'FAIL (3SD)' : log.resultStatus === 'WARNING' ? 'WARN (2SD)' : 'ĐẠT (1SD)'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">Z-Score: {zScore > 0 ? `+${zScore.toFixed(2)}` : zScore.toFixed(2)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Samples */}
        {activeTab === "samples" && (
          <div className="space-y-6">
            {/* Total Samples Stats Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white flex items-center justify-between border border-white/5 shadow-xl">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng số mẫu xét nghiệm tích lũy</p>
                <p className="text-4xl font-black tabular-nums tracking-tight text-blue-300">{totalSamples.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-2">Dựa trên dữ liệu ghi nhận chạy mẫu hàng ngày</p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-500/20" />
            </div>

            {/* Add Sample Run Form */}
            {canEdit && (
              <form onSubmit={handleAddSampleRun} className="bg-slate-50/50 dark:bg-slate-900/20 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Cập nhật số ca mẫu chạy trong ngày</h4>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      required
                      type="number"
                      min="0"
                      value={sampleCount}
                      onChange={(e) => setSampleCount(e.target.value)}
                      placeholder="Nhập số mẫu đã chạy (VD: 150)..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={sampleNotes}
                      onChange={(e) => setSampleNotes(e.target.value)}
                      placeholder="Ghi chú thêm (nếu có)..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white transition-all outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !sampleCount}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Cập nhật
                  </button>
                </div>
              </form>
            )}

            {/* List of recent sample runs */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lịch sử chạy mẫu hàng ngày</p>
              {sampleRuns.length === 0 ? (
                <p className="text-slate-500 text-center py-6 text-sm italic">Chưa có dữ liệu ghi nhận hàng ngày.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {sampleRuns.map((run) => (
                    <div key={run.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">+{run.sampleCount.toLocaleString()} mẫu</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          KTV: {run.user?.name || run.user?.email} | {new Date(run.runDate).toLocaleString("vi-VN")}
                        </p>
                        {run.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">"{run.notes}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
