"use client"

import { useState, useEffect } from "react"
import { formatDateVN, formatTimeVN, formatDateTimeVN } from '@/lib/date'
import { getReportData } from "@/app/actions/export"
import { getDailyStatus } from "@/app/actions/dailyReport"
import { saveAs } from "file-saver"
import ExcelJS from "exceljs"
import { Download, Filter, FileSpreadsheet, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("EXPORT")

  // --- TAB 1: EXPORT STATES ---
  const [loadingExport, setLoadingExport] = useState(false)
  const [filters, setFilters] = useState({
    status: "ALL",
    startDate: "",
    endDate: ""
  })
  const [previewData, setPreviewData] = useState(null)

  // --- TAB 2: DAILY STATUS STATES ---
  const [loadingDaily, setLoadingDaily] = useState(false)
  const [dailyData, setDailyData] = useState(null)
  const [dailyFilters, setDailyFilters] = useState({
    status: "ALL",
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
    } catch (error) {
      alert("Lỗi tải dữ liệu: " + error.message)
    } finally {
      setLoadingExport(false)
    }
  }

  const handleExport = async () => {
    let dataToExport = previewData
    if (!dataToExport) {
      setLoadingExport(true)
      try {
        dataToExport = await getReportData(filters)
      } catch (error) {
        alert("Lỗi lấy dữ liệu xuất: " + error.message)
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
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("BaoCao_ThietBi_XetNghiem");

      // Define Columns tailored for Lab Equipment
      sheet.columns = [
        { header: "Mã Thiết Bị", key: "code", width: 20 },
        { header: "Tên Thiết Bị", key: "name", width: 30 },
        { header: "Model", key: "model", width: 15 },
        { header: "Số Serial", key: "serialNumber", width: 15 },
        { header: "Hãng Sản Xuất", key: "brand", width: 20 },
        { header: "Nước Sản Xuất", key: "origin", width: 15 },
        { header: "QC / Hiệu Chuẩn", key: "qcTechnician", width: 20 },
        { header: "Trạng Thái", key: "status", width: 20 },
        { header: "Mức Rủi Ro", key: "riskScore", width: 12 },
        { header: "Ngày Vận Hành", key: "purchaseDate", width: 15 },
        { header: "Số Lần Bảo Trì", key: "maintenanceCount", width: 15 },
        { header: "Tổng Chi Phí Bảo Trì (VND)", key: "totalCost", width: 25 },
        { header: "Lịch Bảo Trì Tới", key: "nextMaintenance", width: 18 },
        { header: "Trạng Thái Bảo Trì", key: "maintenanceStatus", width: 18 },
      ];

      // Add Data & Apply Styling
      dataToExport.forEach((item) => {
        const row = sheet.addRow({
          code: item["Mã Thiết Bị"],
          name: item["Tên Thiết Bị"],
          model: item["Model"],
          serialNumber: item["Số Serial"],
          brand: item["Hãng Sản Xuất"],
          origin: item["Nước Sản Xuất"],
          qcTechnician: item["KTV Hiệu Chuẩn QC"],
          status: item["Trạng Thái"],
          riskScore: item["Mức Rủi Ro"],
          purchaseDate: item["Ngày Vận Hành"],
          nextMaintenance: item["Lịch Bảo Trì Tới"],
          maintenanceStatus: item["Trạng Thái Bảo Trì"],
          maintenanceCount: item["Số Lần Bảo Trì"],
          totalCost: item["Tổng Chi Phí Bảo Trì (VND)"]
        });

        // Highlight abnormal status or overdue maintenance
        if (item["Trạng Thái"] !== "Sẵn sàng" || item["isOverdue"] === true) {
          row.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFF0000" } }; // Red
          });
        }
      });

      // Format Header
      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'FF1E3A8A' } // Deep blue header
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "BaoCao_ThietBi_XetNghiem_" + new Date().toLocaleDateString('en-CA') + ".xlsx");
    } catch (e) {
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
    } catch (e) {
      alert("Lỗi tải báo cáo hàng ngày: " + e.message)
    } finally {
      setLoadingDaily(false)
    }
  }

  const handleDailyExport = async () => {
    if (!dailyData) return;

    try {
      const workbook = new ExcelJS.Workbook();
      
      // Sheet 1: Đã kiểm tra
      const sheet1 = workbook.addWorksheet("DA_KIEM_TRA");
      sheet1.columns = [
        { header: "Mã Thiết Bị", key: "code", width: 20 },
        { header: "Tên Thiết Bị", key: "name", width: 30 },
        { header: "Model", key: "model", width: 15 },
        { header: "Số Serial", key: "serialNumber", width: 15 },
        { header: "Trạng Thái Ghi Nhận", key: "status", width: 20 },
        { header: "Người Báo Cáo", key: "reporter", width: 20 },
        { header: "Ngày", key: "date", width: 15 },
        { header: "Giờ", key: "time", width: 12 },
        { header: "Ghi Chú", key: "note", width: 30 },
      ];

      dailyData.reported.forEach(log => {
        const row = sheet1.addRow({
          code: log.equipment.code,
          name: log.equipment.name,
          model: log.equipment.model || "--",
          serialNumber: log.equipment.serialNumber || "--",
          status: log.status === "WORKING" ? "Vận hành tốt" : log.status === "WARNING" ? "Cần hiệu chuẩn" : "Sự cố / Hỏng",
          reporter: log.reporterName || log.user?.name || log.user?.email || "Hệ thống",
          date: formatDateVN(log.createdAt),
          time: formatTimeVN(log.createdAt),
          note: log.note || ""
        });

        if (log.status !== "WORKING") {
          row.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFF0000" } };
          });
        }
      });

      sheet1.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; // Green for checked

      // Sheet 2: Chưa kiểm tra
      const sheet2 = workbook.addWorksheet("CHUA_KIEM_TRA");
      sheet2.columns = [
        { header: "Mã Thiết Bị", key: "code", width: 20 },
        { header: "Tên Thiết Bị", key: "name", width: 30 },
        { header: "Model", key: "model", width: 15 },
        { header: "Số Serial", key: "serialNumber", width: 15 },
        { header: "QC / Hiệu Chuẩn", key: "qcTechnician", width: 20 },
        { header: "Trạng Thái Hiện Tại", key: "status", width: 20 },
      ];

      dailyData.missing.forEach(eq => {
        sheet2.addRow({
          code: eq.code,
          name: eq.name,
          model: eq.model || "--",
          serialNumber: eq.serialNumber || "--",
          qcTechnician: eq.qcTechnician || "--",
          status: eq.status === "WORKING" ? "Vận hành tốt" : eq.status === "WARNING" ? "Cần hiệu chuẩn" : "Sự cố / Hỏng"
        });
      });

      sheet2.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; // Red for missing

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "BaoCao_KiemKe_HangNgay_" + new Date().toLocaleDateString('en-CA') + ".xlsx");
    } catch (e) {
      alert("Lỗi xuất Excel kiểm kê: " + e.message)
    }
  }

  // Trigger search on filter change for Daily report tab
  useEffect(() => {
    if (activeTab === "DAILY") {
      fetchDailyReport()
    }
  }, [dailyFilters.status, dailyFilters.startDate, dailyFilters.endDate, activeTab])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Thống kê & Xuất Báo Cáo</h1>
        <p className="text-slate-500 dark:text-slate-400">Xuất dữ liệu lịch sử bảo trì hoặc báo cáo kiểm kê hoạt động hàng ngày của khoa xét nghiệm</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("EXPORT")}
          className={"py-3 px-6 font-bold text-sm border-b-2 transition-all uppercase tracking-wider " + (
            activeTab === "EXPORT" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
          )}
        >
          Xuất dữ liệu thiết bị
        </button>
        <button
          onClick={() => setActiveTab("DAILY")}
          className={"py-3 px-6 font-bold text-sm border-b-2 transition-all uppercase tracking-wider " + (
            activeTab === "DAILY" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
          )}
        >
          Báo cáo kiểm kê hàng ngày
        </button>
      </div>

      {activeTab === "EXPORT" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700 space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" /> Bộ lọc xuất dữ liệu
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Trạng thái vận hành</label>
                <select
                  value={filters.status}
                  onChange={e => setFilters({...filters, status: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 dark:bg-slate-900 dark:text-white outline-none transition-all font-semibold"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="WORKING">Vận hành tốt (WORKING)</option>
                  <option value="WARNING">Cần hiệu chuẩn (WARNING)</option>
                  <option value="BROKEN">Sự cố / Hỏng (BROKEN)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Từ ngày (Ngày tạo hồ sơ)</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => setFilters({...filters, startDate: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 dark:bg-slate-900 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Đến ngày (Ngày tạo hồ sơ)</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => setFilters({...filters, endDate: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 focus:border-blue-500 dark:bg-slate-900 dark:text-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={handlePreview}
                disabled={loadingExport}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm dark:bg-slate-750 dark:text-slate-350 dark:hover:bg-slate-700"
              >
                {loadingExport ? "Đang tải..." : "Xem trước"}
              </button>
              <button
                onClick={handleExport}
                disabled={loadingExport}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" /> Xuất File Excel (.xlsx)
              </button>
            </div>
          </div>

          {previewData && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/60 overflow-hidden">
              <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-155 dark:border-slate-700">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">Xem trước dữ liệu ({previewData.length} kết quả)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50/70 dark:bg-slate-900/40 text-slate-500 font-bold uppercase tracking-wide">
                    <tr>
                      <th className="px-5 py-4">Mã số</th>
                      <th className="px-5 py-4">Tên thiết bị</th>
                      <th className="px-5 py-4">Model</th>
                      <th className="px-5 py-4">Serial</th>
                      <th className="px-5 py-4">QC / Hiệu Chuẩn</th>
                      <th className="px-5 py-4">Trạng thái</th>
                      <th className="px-5 py-4">Rủi ro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{row["Mã Thiết Bị"]}</td>
                        <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-white uppercase">{row["Tên Thiết Bị"]}</td>
                        <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-355">{row["Model"]}</td>
                        <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-355">{row["Số Serial"]}</td>
                        <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-355">{row["KTV Hiệu Chuẩn QC"]}</td>
                        <td className="px-5 py-4">
                          <span className={"px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (
                            row["Trạng Thái"] === "Sẵn sàng" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400" :
                            row["Trạng Thái"] === "Cần hiệu chuẩn" ? "bg-yellow-50 text-yellow-750 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-455" :
                            "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400"
                          )}>{row["Trạng Thái"]}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={"px-2.5 py-0.5 rounded text-[9px] font-black border " + (
                            row["Mức Rủi Ro"] === "LOW" ? "bg-blue-50 text-blue-600 border-blue-200" :
                            row["Mức Rủi Ro"] === "MEDIUM" ? "bg-orange-50 text-orange-600 border-orange-200" :
                            "bg-red-50 text-red-600 border-red-200"
                          )}>{row["Mức Rủi Ro"]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "DAILY" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white uppercase flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" /> 
                  Tình trạng kiểm tra {dailyFilters.startDate === dailyFilters.endDate 
                    ? "ngày " + formatDateVN(dailyFilters.startDate)
                    : "từ " + formatDateVN(dailyFilters.startDate) + " đến " + formatDateVN(dailyFilters.endDate)}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={dailyFilters.status}
                  onChange={e => setDailyFilters({...dailyFilters, status: e.target.value})}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="WORKING">Vận hành tốt (WORKING)</option>
                  <option value="WARNING">Cần hiệu chuẩn (WARNING)</option>
                  <option value="BROKEN">Sự cố / Hỏng (BROKEN)</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dailyFilters.startDate}
                    onChange={e => setDailyFilters({...dailyFilters, startDate: e.target.value})}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="date"
                    value={dailyFilters.endDate}
                    onChange={e => setDailyFilters({...dailyFilters, endDate: e.target.value})}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <button 
                  onClick={handleDailyExport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-all text-xs font-bold uppercase tracking-wider shadow-md shadow-green-500/10"
                >
                  <Download className="w-4 h-4" /> Xuất Excel
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              {loadingDaily ? (
                <div className="text-slate-500 py-6 text-center font-medium">Đang tải biểu mẫu báo cáo...</div>
              ) : !dailyData || dailyData.reported.length === 0 ? (
                <div className="text-slate-500 py-10 text-center bg-slate-50/50 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-350 dark:border-slate-700">
                  Không tìm thấy nhật ký kiểm tra nào trong khoảng thời gian này.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-150 dark:border-slate-755">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50/70 dark:bg-slate-900/40 text-slate-500 font-bold uppercase tracking-wide border-b border-slate-155 dark:border-slate-700">
                      <tr>
                        <th className="px-5 py-4">Máy xét nghiệm</th>
                        <th className="px-5 py-4">Model</th>
                        <th className="px-5 py-4">Người ghi nhận</th>
                        <th className="px-5 py-4">Kết quả quét</th>
                        <th className="px-5 py-4">Thời điểm</th>
                        <th className="px-5 py-4">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {dailyData.reported.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-extrabold text-slate-900 dark:text-white uppercase">{log.equipment.name}</div>
                            <div className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{log.equipment.code}</div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-355">
                            {log.equipment.model || '--'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">{log.reporterName || "N/A"}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.user?.name || log.user?.email || 'N/A'}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={"px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (
                              log.status === "WORKING" ? "bg-green-50 text-green-700 border-green-200" :
                              log.status === "WARNING" ? "bg-yellow-50 text-yellow-750 border-yellow-200" : 
                              "bg-red-50 text-red-700 border-red-200"
                            )}>{log.status === "WORKING" ? "VẬN HÀNH TỐT" : log.status === "WARNING" ? "CẦN HIỆU CHUẨN" : "SỰ CỐ / HỎNG"}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 font-semibold">
                            <div className="text-slate-700 dark:text-slate-300">
                              {formatTimeVN(log.createdAt)}
                            </div>
                            <div className="text-[10px] opacity-75 mt-0.5">{formatDateVN(log.createdAt)}</div>
                          </td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate font-medium">
                            {log.note || <span className="text-slate-350 italic">Không có</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-md border border-red-105 dark:border-red-955/20 p-6">
            <h2 className="text-base font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Thiết bị CHƯA quét kiểm tra 
              <span className="text-xs font-semibold text-slate-400 normal-case ml-1">
                {dailyFilters.startDate === dailyFilters.endDate 
                  ? "ngày " + formatDateVN(dailyFilters.startDate)
                  : "khoảng thời gian này"}
              </span>
              <span className="text-xs font-bold bg-red-50 dark:bg-red-955/40 text-red-700 dark:text-red-400 px-3 py-1 rounded-full ml-auto">
                {(dailyData && dailyData.missing ? dailyData.missing.length : 0)}
              </span>
            </h2>
            
            {loadingDaily ? (
              <div className="text-slate-500 py-6 text-center font-medium">Đang tải danh sách chưa kiểm kê...</div>
            ) : !dailyData || dailyData.missing.length === 0 ? (
              <div className="text-green-700 py-8 text-center bg-green-50/50 dark:bg-green-955/10 rounded-2xl border border-green-200 dark:border-green-955/30 font-bold text-sm">
                Tuyệt vời! Toàn bộ máy xét nghiệm trong khoa đã được quét kiểm kê.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyData.missing.map(eq => (
                  <div key={eq.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 hover:border-red-300 dark:hover:border-red-800 bg-slate-50/30 dark:bg-slate-900/20 transition-all">
                    <p className="font-mono text-[10px] text-red-500 font-bold mb-1">{eq.code}</p>
                    <h4 className="font-extrabold text-slate-800 dark:text-white leading-tight mb-2 uppercase text-[12px]">{eq.name}</h4>
                    <div className="text-xs text-slate-500 font-medium space-y-0.5 mt-1 border-t border-slate-100 dark:border-slate-800/80 pt-1.5">
                      <p>Model: <span className="font-bold text-slate-700 dark:text-slate-355">{eq.model || '--'}</span></p>
                      <p>QC KTV: <span className="font-bold text-slate-700 dark:text-slate-355">{eq.qcTechnician || '--'}</span></p>
                    </div>
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
