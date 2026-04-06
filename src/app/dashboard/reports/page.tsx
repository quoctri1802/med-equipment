"use client"

import { useState, useEffect } from "react"
import { getReportData } from "@/app/actions/export"
import { getDailyStatus } from "@/app/actions/dailyReport"
import { Download, Filter, FileSpreadsheet, Search, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"EXPORT" | "DAILY">("EXPORT")

  // --- TAB 1: EXPORT STATES ---
  const [loadingExport, setLoadingExport] = useState(false)
  const [filters, setFilters] = useState({
    status: "ALL",
    department: "ALL",
    startDate: "",
    endDate: ""
  })
  const [previewData, setPreviewData] = useState<any[] | null>(null)

  // --- TAB 2: DAILY STATUS STATES ---
  const [loadingDaily, setLoadingDaily] = useState(false)
  const [dailyData, setDailyData] = useState<{ reported: any[], missing: any[] } | null>(null)
  const [dailyFilters, setDailyFilters] = useState({
    department: "ALL",
    status: "ALL",
    // Sử dụng chuỗi ngày tháng địa phương (Việt Nam) thay vì UTC ISOString
    startDate: new Date().toLocaleDateString('en-CA'), // "YYYY-MM-DD"
    endDate: new Date().toLocaleDateString('en-CA')
  })

  // CHỨC NĂNG TAB 1
  const handlePreview = async () => {
    setLoadingExport(true)
    try {
      const data = await getReportData(filters)
      setPreviewData(data)
      if (!data || data.length === 0) {
        alert("Không có dữ liệu trong khoảng thời gian hoặc bộ lọc này.")
      }
    } catch (error: any) {
      alert("Lỗi tải dữ liệu: " + error.message)
    } finally {
      setLoadingExport(false)
    }
  }

  const handleExport = async () => {
    // Ưu tiên dùng dữ liệu preview nếu có, nếu chưa ấn tìm kiếm thì fetch mới
    let dataToExport = previewData
    if (!dataToExport) {
      setLoadingExport(true)
      try {
        dataToExport = await getReportData(filters)
      } catch (error: any) {
        alert("Lỗi lấy dữ liệu export: " + error.message)
        setLoadingExport(false)
        return
      }
    }
    
    if (!dataToExport || dataToExport.length === 0) {
      alert("Không có dữ liệu để xuất Excel.")
      setLoadingExport(false)
      return
    }

    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCao_ThietBi")

      const wscols = [
        {wch: 20}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 25}
      ]
      worksheet['!cols'] = wscols

      XLSX.writeFile(workbook, `BaoCao_ThietBi_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (e: any) {
      alert("Lỗi xuất Excel: " + e.message)
    } finally {
      setLoadingExport(false)
    }
  }

  // CHỨC NĂNG TAB 2
  const fetchDailyReport = async () => {
    setLoadingDaily(true)
    try {
      const data = await getDailyStatus(dailyFilters)
      setDailyData(data)
    } catch (e: any) {
      alert("Lỗi tải báo cáo hằng ngày: " + e.message)
    } finally {
      setLoadingDaily(false)
    }
  }

  const handleDailyExport = async () => {
    if (!dailyData) return;

    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      // Sheet 1: Đã báo cáo
      const reportedData = dailyData.reported.map(log => ({
        "Mã Thiết Bị": log.equipment.code,
        "Tên Thiết Bị": log.equipment.name,
        "Khoa / Phòng": log.equipment.department,
        "Trạng Thái Ghi Nhận": log.status,
        "Người Báo Cáo": log.reporterName || log.user?.name || log.user?.email || "Hệ thống",
        "Thời Điểm": new Date(log.createdAt).toLocaleString('vi-VN', { hour12: false }),
        "Ghi Chú": log.note || ""
      }));
      const ws1 = XLSX.utils.json_to_sheet(reportedData);
      XLSX.utils.book_append_sheet(wb, ws1, "DA_KIEM_TRA");

      // Sheet 2: Chưa báo cáo
      const missingData = dailyData.missing.map(eq => ({
        "Mã Thiết Bị": eq.code,
        "Tên Thiết Bị": eq.name,
        "Khoa / Phòng": eq.department,
        "Trạng Thái Hiện Tại": eq.status,
        "Mức Độ Rủi Ro": eq.riskScore
      }));
      const ws2 = XLSX.utils.json_to_sheet(missingData);
      XLSX.utils.book_append_sheet(wb, ws2, "CHUA_KIEM_TRA");

      XLSX.writeFile(wb, `BaoCao_HangNgay_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e: any) {
      alert("Lỗi xuất Excel: " + e.message);
    }
  };

  useEffect(() => {
    if (activeTab === "DAILY") {
      fetchDailyReport()
    }
  }, [activeTab, dailyFilters])

  useEffect(() => {
    if (activeTab === "EXPORT" && !previewData) {
       // Optional: load initial export preview
    }
  }, [activeTab])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-green-600" /> Báo cáo & Kiểm kê
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Quản lý báo cáo kiểm tra hằng ngày và xuất dữ liệu thông kê hệ thống.
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("EXPORT")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "EXPORT" 
              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Trích xuất Báo cáo (Excel)
        </button>
        <button
          onClick={() => setActiveTab("DAILY")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "DAILY" 
              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Danh sách Báo cáo Hôm nay
        </button>
      </div>

      {/* --- PHẦN GIAO DIỆN TAB 1 --- */}
      {activeTab === "EXPORT" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Filter className="w-5 h-5 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bộ lọc dữ liệu</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Khoa / Phòng
                </label>
                <select
                  value={filters.department}
                  onChange={e => setFilters({...filters, department: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
                >
                  <option value="ALL">Tất cả các khoa</option>
                  <option value="CC">Cấp Cứu</option>
                  <option value="HSTC">Hồi sức tích cực</option>
                  <option value="NTH">Nội Tổng hợp</option>
                  <option value="XN">Xét nghiệm</option>
                  <option value="CDHA">Chẩn đoán hình ảnh</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Trạng thái
                </label>
                <select
                  value={filters.status}
                  onChange={e => setFilters({...filters, status: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="WORKING">Hoạt động bình thường</option>
                  <option value="WARNING">Đang cảnh báo</option>
                  <option value="BROKEN">Đang hỏng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Từ ngày (Bảo trì)
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => setFilters({...filters, startDate: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Đến ngày (Bảo trì)
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => setFilters({...filters, endDate: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Hãy click "Xem trước" để duyệt danh sách, hoặc tải thẳng xuống file Excel. 
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handlePreview}
                  disabled={loadingExport}
                  className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 dark:border-slate-600 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-70 text-slate-800 dark:text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Search className="w-5 h-5" />
                  Xem trước
                </button>
                <button
                  onClick={handleExport}
                  disabled={loadingExport}
                  className="flex flex-1 sm:flex-none justify-center items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {/* Dữ liệu Xem trước (Preview) */}
          {previewData && (
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Mã Thiết Bị</th>
                    <th className="px-6 py-4">Tên Thiết Bị</th>
                    <th className="px-6 py-4">Khoa / Phòng</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4">Mức Rủi Ro</th>
                    <th className="px-6 py-4">Tổng Phí Nhận (VND)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewData.slice(0, 100).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-3 font-mono text-blue-600 dark:text-blue-400">{row["Mã Thiết Bị"]}</td>
                      <td className="px-6 py-3 font-medium dark:text-white">{row["Tên Thiết Bị"]}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{row["Khoa / Phòng"]}</td>
                      <td className="px-6 py-3">
                        <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 dark:text-white font-medium">{row["Trạng Thái"]}</span>
                      </td>
                      <td className="px-6 py-3">{row["Mức Rủi Ro"]}</td>
                      <td className="px-6 py-3 font-medium text-slate-900 dark:text-white text-right">
                        {(row["Tổng Chi Phí Bảo Trì (VND)"] || 0).toLocaleString()}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 100 && (
                <div className="p-4 text-center text-sm text-slate-500 border-t border-slate-100 dark:border-slate-700">
                  Chỉ hiển thị 100 dòng đầu tiên. Hãy nhấn Xuất Excel để tải toàn bộ {previewData.length} kết quả.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- PHẦN GIAO DIỆN TAB 2 --- */}
      {activeTab === "DAILY" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> 
                <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Trạng thái kiểm tra hôm nay</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={dailyFilters.department}
                  onChange={e => setDailyFilters({...dailyFilters, department: e.target.value})}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold dark:bg-slate-900 dark:border-slate-600"
                >
                  <option value="ALL">Tất cả Khoa</option>
                  <option value="CC">Cấp Cứu</option>
                  <option value="HSTC">Hồi sức</option>
                  <option value="NTH">Nội TH</option>
                  <option value="XN">Xét nghiệm</option>
                  <option value="CDHA">SĐ/CĐHA</option>
                </select>
                <select
                  value={dailyFilters.status}
                  onChange={e => setDailyFilters({...dailyFilters, status: e.target.value})}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold dark:bg-slate-900 dark:border-slate-600"
                >
                  <option value="ALL">Tất cả TT</option>
                  <option value="WORKING">Bình thường</option>
                  <option value="WARNING">Cảnh báo</option>
                  <option value="BROKEN">Hỏng</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dailyFilters.startDate}
                    onChange={e => setDailyFilters({...dailyFilters, startDate: e.target.value})}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] font-bold dark:bg-slate-900 border-none outline-none"
                  />
                  <span className="text-slate-400 text-[10px]">→</span>
                  <input
                    type="date"
                    value={dailyFilters.endDate}
                    onChange={e => setDailyFilters({...dailyFilters, endDate: e.target.value})}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] font-bold dark:bg-slate-900 border-none outline-none"
                  />
                </div>
                <button 
                  onClick={handleDailyExport}
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" /> Xuất Excel
                </button>
              </div>
            </div>
            
            {loadingDaily ? (
              <div className="text-slate-500 py-6 text-center">Đang tải biểu mẫu...</div>
            ) : dailyData?.reported.length === 0 ? (
              <div className="text-slate-500 py-6 text-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                Chưa có thiết bị nào được quét kiểm tra trong hôm nay.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-medium">
                    <tr>
                      <th className="px-4 py-3">Thiết bị</th>
                      <th className="px-4 py-3">Người báo cáo</th>
                      <th className="px-4 py-3">Trạng thái ghi nhận</th>
                      <th className="px-4 py-3">Thời điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dailyData?.reported.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          <div>{log.equipment.name}</div>
                          <div className="text-xs font-normal text-slate-500">{log.equipment.code}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{log.reporterName || "N/A"}</div>
                          <div className="text-[10px] text-slate-400">Account: {log.user?.name || log.user?.email || 'Hệ thống'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            log.status === "WORKING" ? "bg-green-100 text-green-700" :
                            log.status === "WARNING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                          }`}>{log.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour12: false })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/30 p-6">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" /> Thiết bị CHƯA báo cáo hôm nay 
              <span className="text-sm font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2.5 py-0.5 rounded-full ml-2">
                {dailyData?.missing.length || 0}
              </span>
            </h2>
            
            {loadingDaily ? (
              <div className="text-slate-500 py-6 text-center">Đang tải...</div>
            ) : dailyData?.missing.length === 0 ? (
              <div className="text-green-600 py-6 text-center bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/50 font-medium">
                Tuyệt vời! Toàn bộ thiết bị trong hệ thống đã được kiểm tra hôm nay.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyData?.missing.map(eq => (
                  <div key={eq.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700/50 bg-slate-50 dark:bg-slate-900/40 transition-colors">
                    <p className="font-mono text-xs text-red-500 font-semibold mb-1">{eq.code}</p>
                    <h4 className="font-medium text-slate-900 dark:text-white leading-tight mb-2">{eq.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                       Khoa: {eq.department}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
