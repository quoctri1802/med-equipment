/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { formatDateVN, formatTimeVN, formatDateTimeVN } from '@/lib/date'
import { getReportData, getEquipmentSelectList, getIsoExportData } from "@/app/actions/export"
import { getDailyStatus } from "@/app/actions/dailyReport"
import { saveAs } from "file-saver"
import ExcelJS from "exceljs"
import { Download, Filter, FileSpreadsheet, Clock, AlertTriangle, ShieldCheck, ClipboardList, ShieldAlert, Award } from "lucide-react"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("EXPORT")

  // --- GENERAL STATE ---
  const [equipmentList, setEquipmentList] = useState<{id: string, name: string, code: string}[]>([])

  // --- TAB 1: EXPORT STATES ---
  const [loadingExport, setLoadingExport] = useState(false)
  const [filters, setFilters] = useState({
    status: "ALL",
    startDate: "",
    endDate: ""
  })
  const [previewData, setPreviewData] = useState<any>(null)

  // --- TAB 2: DAILY STATUS STATES ---
  const [loadingDaily, setLoadingDaily] = useState(false)
  const [dailyData, setDailyData] = useState<any>(null)
  const [dailyFilters, setDailyFilters] = useState({
    status: "ALL",
    startDate: new Date().toLocaleDateString('en-CA'), // "YYYY-MM-DD"
    endDate: new Date().toLocaleDateString('en-CA')
  })

  // --- TAB 3: ISO 15189 STATES ---
  const [loadingIso, setLoadingIso] = useState(false)
  const [isoFilters, setIsoFilters] = useState({
    equipmentId: "ALL",
    startDate: (() => {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      return d.toLocaleDateString('en-CA')
    })(),
    endDate: new Date().toLocaleDateString('en-CA')
  })

  // Load equipment select list on mount
  useEffect(() => {
    async function loadSelectData() {
      try {
        const list = await getEquipmentSelectList()
        setEquipmentList(list)
      } catch (e: any) {
        console.error("Lỗi tải danh sách thiết bị:", e.message)
      }
    }
    loadSelectData()
  }, [])

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
    let dataToExport = previewData
    if (!dataToExport) {
      setLoadingExport(true)
      try {
        dataToExport = await getReportData(filters)
      } catch (error: any) {
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

      // Define Columns
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
      dataToExport.forEach((item: any) => {
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

      dailyData.reported.forEach((log: any) => {
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

      dailyData.missing.forEach((eq: any) => {
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
    } catch (e: any) {
      alert("Lỗi xuất Excel kiểm kê: " + e.message)
    }
  }

  // CHỨC NĂNG TAB 3: XUẤT ISO 15189
  const applyStylesToIsoSheet = (sheet: ExcelJS.Worksheet, maxCol: number, title: string, subtitle: string) => {
    // Set column dimensions
    sheet.getRow(1).height = 18
    sheet.getRow(2).height = 18
    sheet.getRow(3).height = 12
    sheet.getRow(4).height = 28
    sheet.getRow(5).height = 18
    sheet.getRow(6).height = 12

    // Header info
    sheet.mergeCells(1, 1, 1, maxCol)
    sheet.mergeCells(2, 2, 2, maxCol)
    
    const cellHeader1 = sheet.getCell(1, 1)
    cellHeader1.value = "SỞ Y TẾ THÀNH PHỐ ĐÀ NẴNG — TRUNG TÂM Y TẾ KHU VỰC LIÊN CHIỂU"
    cellHeader1.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF374151" } }

    const cellHeader2 = sheet.getCell(2, 1)
    cellHeader2.value = "KHOA XÉT NGHIỆM — HỆ THỐNG QUẢN LÝ CHẤT LƯỢNG TIÊU CHUẨN ISO 15189"
    cellHeader2.font = { name: "Arial", size: 9, bold: true, italic: true, color: { argb: "FF4B5563" } }

    // Main Title
    sheet.mergeCells(4, 1, 4, maxCol)
    const titleCell = sheet.getCell(4, 1)
    titleCell.value = title.toUpperCase()
    titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF1E3A8A" } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }

    // Subtitle / Date range
    sheet.mergeCells(5, 1, 5, maxCol)
    const subCell = sheet.getCell(5, 1)
    subCell.value = subtitle
    subCell.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF4B5563" } }
    subCell.alignment = { vertical: 'middle', horizontal: 'center' }
  }

  const applyTableBorders = (sheet: ExcelJS.Worksheet, startRow: number, endRow: number, maxCol: number) => {
    const borderStyle: ExcelJS.Borders = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
    }

    for (let r = startRow; r <= endRow; r++) {
      const row = sheet.getRow(r)
      row.height = 22
      for (let c = 1; c <= maxCol; c++) {
        const cell = row.getCell(c)
        cell.border = borderStyle
        cell.font = { name: "Arial", size: 10 }
        
        // Align text left, code/date center
        if (c === 1 || c === 2 || c === 6 || c === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        }
      }
    }
  }

  const addSignaturesSection = (sheet: ExcelJS.Worksheet, rowStart: number, colMax: number) => {
    sheet.getRow(rowStart).height = 15
    sheet.getRow(rowStart + 1).height = 20
    sheet.getRow(rowStart + 2).height = 15
    sheet.getRow(rowStart + 6).height = 18

    // Date of report signing
    sheet.mergeCells(rowStart + 1, colMax - 2, rowStart + 1, colMax)
    const dateCell = sheet.getCell(rowStart + 1, colMax - 2)
    dateCell.value = `Đà Nẵng, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`
    dateCell.font = { name: "Arial", size: 10, italic: true }
    dateCell.alignment = { horizontal: "center" }

    // Signatures titles
    sheet.mergeCells(rowStart + 2, 1, rowStart + 2, 3)
    const signLeft = sheet.getCell(rowStart + 2, 1)
    signLeft.value = "NGƯỜI LẬP BÁO CÁO"
    signLeft.font = { name: "Arial", size: 10, bold: true }
    signLeft.alignment = { horizontal: "center" }

    sheet.mergeCells(rowStart + 2, colMax - 2, rowStart + 2, colMax)
    const signRight = sheet.getCell(rowStart + 2, colMax - 2)
    signRight.value = "TRƯỞNG KHOA XÉT NGHIỆM"
    signRight.font = { name: "Arial", size: 10, bold: true }
    signRight.alignment = { horizontal: "center" }

    // Signatures descriptions
    sheet.mergeCells(rowStart + 3, 1, rowStart + 3, 3)
    const descLeft = sheet.getCell(rowStart + 3, 1)
    descLeft.value = "(Ký và ghi rõ họ tên)"
    descLeft.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF6B7280" } }
    descLeft.alignment = { horizontal: "center" }

    sheet.mergeCells(rowStart + 3, colMax - 2, rowStart + 3, colMax)
    const descRight = sheet.getCell(rowStart + 3, colMax - 2)
    descRight.value = "(Ký tên và đóng dấu)"
    descRight.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF6B7280" } }
    descRight.alignment = { horizontal: "center" }

    // Placeholder name for KTV
    sheet.mergeCells(rowStart + 6, 1, rowStart + 6, 3)
    const nameLeft = sheet.getCell(rowStart + 6, 1)
    nameLeft.value = "KTV. Nguyễn Văn A"
    nameLeft.font = { name: "Arial", size: 10, bold: true }
    nameLeft.alignment = { horizontal: "center" }

    // Placeholder name for Lab Head
    sheet.mergeCells(rowStart + 6, colMax - 2, rowStart + 6, colMax)
    const nameRight = sheet.getCell(rowStart + 6, colMax - 2)
    nameRight.value = "TS. BS. Nguyễn Thị B"
    nameRight.font = { name: "Arial", size: 10, bold: true }
    nameRight.alignment = { horizontal: "center" }
  }

  // 1. NHẬT KÝ VẬN HÀNH HÀNG NGÀY EXPORT
  const handleExportDailyChecklist = async () => {
    setLoadingIso(true)
    try {
      const data = await getIsoExportData(isoFilters)
      const logs = data.logs
      if (!logs || logs.length === 0) {
        alert("Không tìm thấy nhật ký vận hành nào trong thời gian được chọn.")
        return
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("NhatKyVanHanh");

      const colMax = 9
      applyStylesToIsoSheet(
        sheet, 
        colMax, 
        "BẢNG KIỂM NHẬT KÝ VẬN HÀNH MÁY XÉT NGHIỆM HÀNG NGÀY",
        `Thời điểm theo dõi: Từ ngày ${formatDateVN(isoFilters.startDate)} đến ngày ${formatDateVN(isoFilters.endDate)}`
      );

      // Setup Headers
      const headerRowIndex = 7
      sheet.getRow(headerRowIndex).values = [
        "STT",
        "Mã Thiết Bị",
        "Tên Thiết Bị",
        "Model",
        "Số Serial",
        "Người Kiểm Tra",
        "Thời Điểm Quét",
        "Trạng Thái Ghi Nhận",
        "Ghi Chú Chi Tiết"
      ];

      sheet.columns = [
        { key: "stt", width: 6 },
        { key: "code", width: 18 },
        { key: "name", width: 28 },
        { key: "model", width: 14 },
        { key: "serialNumber", width: 16 },
        { key: "checker", width: 20 },
        { key: "datetime", width: 20 },
        { key: "status", width: 22 },
        { key: "notes", width: 32 }
      ];

      // Format Header Row
      const hRow = sheet.getRow(headerRowIndex)
      hRow.height = 26
      for (let c = 1; c <= colMax; c++) {
        const cell = hRow.getCell(c)
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } } // Navy Blue
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      }

      // Add Data
      let currentIdx = 8
      logs.forEach((log: any, idx: number) => {
        let statusText = "Sẵn sàng / Vận hành tốt"
        if (log.status === "WARNING") statusText = "Cần hiệu chuẩn"
        if (log.status === "BROKEN") statusText = "Sự cố / Hỏng hóc"

        sheet.addRow({
          stt: idx + 1,
          code: log.equipment.code,
          name: log.equipment.name,
          model: log.equipment.model || "--",
          serialNumber: log.equipment.serialNumber || "--",
          checker: log.reporterName || log.user?.name || log.user?.email || "KTV",
          datetime: formatDateTimeVN(log.createdAt),
          status: statusText,
          notes: log.note || ""
        });

        // Specific cell styling for status text
        const cellStatus = sheet.getCell(currentIdx, 8)
        if (log.status === "WARNING") {
          cellStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE047' } } // Yellow background
          cellStatus.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF854D0E" } }
        } else if (log.status === "BROKEN") {
          cellStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } } // Red background
          cellStatus.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF991B1B" } }
        } else {
          cellStatus.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF166534" } }
        }

        currentIdx++
      });

      applyTableBorders(sheet, 8, currentIdx - 1, colMax);
      addSignaturesSection(sheet, currentIdx + 1, colMax);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `ISO_15189_NhatKyVanHanh_${new Date().toLocaleDateString('en-CA')}.xlsx`);
    } catch (e: any) {
      alert("Lỗi xuất nhật ký vận hành: " + e.message)
    } finally {
      setLoadingIso(false)
    }
  }

  // 2. HỒ SƠ LỊCH SỬ BẢO TRÌ & HIỆU CHUẨN EXPORT
  const handleExportHistory = async () => {
    setLoadingIso(true)
    try {
      const data = await getIsoExportData(isoFilters)
      const equipments = data.equipments
      if (!equipments || equipments.length === 0) {
        alert("Không tìm thấy dữ liệu hồ sơ máy xét nghiệm.")
        return
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("LichSuBaoTri_HieuChuan");

      const colMax = 8
      applyStylesToIsoSheet(
        sheet, 
        colMax, 
        "HỒ SƠ THEO DÕI LỊCH SỬ BẢO DƯỠNG VÀ HIỆU CHUẨN MÁY XÉT NGHIỆM",
        `Định kỳ kiểm tra thiết bị: Ngày xuất ${formatDateVN(new Date().toLocaleDateString('en-CA'))}`
      );

      // Style border definitions
      const thinBorder: ExcelJS.Borders = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      }

      let currentRow = 7
      equipments.forEach((eq: any) => {
        currentRow++
        // Equipment header block
        sheet.mergeCells(currentRow, 1, currentRow, colMax)
        const blockHeader = sheet.getCell(currentRow, 1)
        blockHeader.value = `THIẾT BỊ: ${eq.name.toUpperCase()}  |  MÃ SỐ: ${eq.code}  |  SỐ SERIAL: ${eq.serialNumber || '--'}  |  HÃNG: ${eq.brand || '--'}  |  VẬN HÀNH: ${formatDateVN(eq.purchaseDate)}`
        blockHeader.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } }
        blockHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } } // Slate Gray
        blockHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
        sheet.getRow(currentRow).height = 24

        // Setup Headers for this equipment history
        currentRow++
        sheet.getRow(currentRow).values = [
          "Ngày Thực Hiện",
          "Loại Hành Động",
          "Đơn Vị / Người Phụ Trách",
          "Mô Tả Nội Dung Chi Tiết",
          "Chi Phí (VND)",
          "Thời Hạn / Trạng Thái",
          "",
          ""
        ];
        // Merge columns 6, 7, 8 for description structure
        sheet.mergeCells(currentRow, 6, currentRow, 8)
        
        const subHRow = sheet.getRow(currentRow)
        subHRow.height = 22
        for (let c = 1; c <= 6; c++) {
          const cell = subHRow.getCell(c)
          cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF1E293B" } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } } // Slate 200
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
          cell.border = thinBorder
        }
        sheet.getCell(currentRow, 7).border = thinBorder
        sheet.getCell(currentRow, 8).border = thinBorder

        const actions: any[] = []
        // Collect maintenance records
        eq.maintenances.forEach((m: any) => {
          let statusText = "Hoàn thành"
          if (m.status === "PENDING") statusText = "Chờ bảo dưỡng"
          if (m.status === "IN_PROGRESS") statusText = "Đang xử lý"

          actions.push({
            date: m.date,
            type: "Bảo trì / Bảo dưỡng",
            organization: m.technician?.name || "Kỹ thuật viên",
            desc: m.description,
            cost: m.cost || 0,
            statusOrExp: statusText
          })
        })

        // Collect calibration records
        eq.calibrations.forEach((c: any) => {
          actions.push({
            date: c.date,
            type: "Hiệu chuẩn định kỳ",
            organization: c.organization,
            desc: c.notes || "Hiệu chuẩn định kỳ máy xét nghiệm",
            cost: 0,
            statusOrExp: `Hạn dùng: ${formatDateVN(c.expireDate)}`
          })
        })

        // Sort by date desc
        actions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (actions.length === 0) {
          currentRow++
          sheet.mergeCells(currentRow, 1, currentRow, colMax)
          const emptyCell = sheet.getCell(currentRow, 1)
          emptyCell.value = "Chưa ghi nhận lịch sử bảo dưỡng hoặc hiệu chuẩn định kỳ nào."
          emptyCell.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF9CA3AF" } }
          emptyCell.alignment = { vertical: 'middle', horizontal: 'center' }
          sheet.getRow(currentRow).height = 20
          
          for (let c = 1; c <= colMax; c++) {
            sheet.getCell(currentRow, c).border = thinBorder
          }
        } else {
          actions.forEach(action => {
            currentRow++
            sheet.getRow(currentRow).values = [
              formatDateVN(action.date),
              action.type,
              action.organization,
              action.desc,
              action.cost,
              action.statusOrExp,
              "",
              ""
            ];
            sheet.mergeCells(currentRow, 6, currentRow, 8)
            
            const dataRow = sheet.getRow(currentRow)
            dataRow.height = 20
            for (let c = 1; c <= 6; c++) {
              const cell = dataRow.getCell(c)
              cell.font = { name: "Arial", size: 9 }
              cell.border = thinBorder
              
              if (c === 1 || c === 2 || c === 6) {
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
              } else if (c === 5) {
                cell.alignment = { vertical: 'middle', horizontal: 'right' }
                cell.numFmt = '#,##0'
              } else {
                cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
              }
            }
            sheet.getCell(currentRow, 7).border = thinBorder
            sheet.getCell(currentRow, 8).border = thinBorder
          })
        }
        currentRow += 1 // Spacer row
      })

      addSignaturesSection(sheet, currentRow + 2, colMax);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `ISO_15189_LichSuBaoTri_${new Date().toLocaleDateString('en-CA')}.xlsx`);
    } catch (e: any) {
      alert("Lỗi xuất lịch sử thiết bị: " + e.message)
    } finally {
      setLoadingIso(false)
    }
  }

  // 3. SỔ THEO DÕI SỰ CỐ & KHẮC PHỤC EXPORT
  const handleExportIncidents = async () => {
    setLoadingIso(true)
    try {
      const data = await getIsoExportData(isoFilters)
      const incidents = data.incidents
      if (!incidents || incidents.length === 0) {
        alert("Không tìm thấy sự cố thiết bị nào trong thời gian được chọn.")
        return
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("SoTheoDoiSuCo");

      const colMax = 11
      applyStylesToIsoSheet(
        sheet, 
        colMax, 
        "SỔ THEO DÕI SỰ CỐ VÀ HÀNH ĐỘNG KHẮC PHỤC THIẾT BỊ XÉT NGHIỆM",
        `Khoảng thời gian: Từ ngày ${formatDateVN(isoFilters.startDate)} đến ngày ${formatDateVN(isoFilters.endDate)}`
      );

      // Setup Headers
      const headerRowIndex = 7
      sheet.getRow(headerRowIndex).values = [
        "STT",
        "Mã Thiết Bị",
        "Tên Thiết Bị",
        "Ngày Xảy Ra",
        "Chi Tiết Sự Cố",
        "Người Phát Hiện",
        "Hành Động Khắc Phục",
        "KTV Thực Hiện",
        "Ngày Khắc Phục",
        "Chi Phí (VND)",
        "Trạng Thái Hiện Tại"
      ];

      sheet.columns = [
        { key: "stt", width: 5 },
        { key: "code", width: 16 },
        { key: "name", width: 24 },
        { key: "date", width: 14 },
        { key: "desc", width: 26 },
        { key: "reporter", width: 18 },
        { key: "action", width: 26 },
        { key: "tech", width: 18 },
        { key: "fixdate", width: 14 },
        { key: "cost", width: 14 },
        { key: "status", width: 18 }
      ];

      // Format Header
      const hRow = sheet.getRow(headerRowIndex)
      hRow.height = 26
      for (let c = 1; c <= colMax; c++) {
        const cell = hRow.getCell(c)
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
      }

      // Add data
      let currentIdx = 8
      incidents.forEach((log: any, idx: number) => {
        // Find corresponding maintenance actions (same equipment, on/after incident log date)
        const linkedMaintenances = log.equipment.maintenances.filter((m: any) => 
          new Date(m.date).getTime() >= new Date(log.createdAt).getTime()
        )

        let actionDescription = "Chưa xử lý"
        let technicianName = "--"
        let repairDate = "--"
        let cost = 0
        let currentStatus = log.status === "WARNING" ? "Cần hiệu chuẩn" : "Sự cố / Hỏng"

        if (linkedMaintenances.length > 0) {
          // Get the latest or matching maintenance record
          const mainRec = linkedMaintenances[0]
          actionDescription = mainRec.description
          technicianName = mainRec.technician?.name || "KTV Bảo Trì"
          repairDate = formatDateVN(mainRec.date)
          cost = mainRec.cost || 0
          
          if (mainRec.status === "COMPLETED") {
             currentStatus = "Đã khắc phục"
          } else {
             currentStatus = mainRec.status === "PENDING" ? "Chờ xử lý" : "Đang sửa chữa"
          }
        }

        sheet.addRow({
          stt: idx + 1,
          code: log.equipment.code,
          name: log.equipment.name,
          date: formatDateVN(log.createdAt),
          desc: log.note || "Báo lỗi vận hành",
          reporter: log.reporterName || log.user?.name || log.user?.email || "N/A",
          action: actionDescription,
          tech: technicianName,
          fixdate: repairDate,
          cost: cost,
          status: currentStatus
        });

        // Style the current status cell
        const cellStatus = sheet.getCell(currentIdx, 11)
        if (currentStatus === "Đã khắc phục") {
          cellStatus.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF166534" } }
        } else {
          cellStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } } // Red background
          cellStatus.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF991B1B" } }
        }

        currentIdx++
      });

      // Apply borders to table
      const borderStyle: ExcelJS.Borders = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      }

      for (let r = 8; r <= currentIdx - 1; r++) {
        const row = sheet.getRow(r)
        row.height = 24
        for (let c = 1; c <= colMax; c++) {
          const cell = row.getCell(c)
          cell.border = borderStyle
          cell.font = { name: "Arial", size: 9 }
          
          if (c === 1 || c === 2 || c === 4 || c === 9 || c === 11) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' }
          } else if (c === 10) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' }
            cell.numFmt = '#,##0'
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
          }
        }
      }

      addSignaturesSection(sheet, currentIdx + 1, colMax);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `ISO_15189_SoTheoDoiSuCo_${new Date().toLocaleDateString('en-CA')}.xlsx`);
    } catch (e: any) {
      alert("Lỗi xuất sổ theo dõi sự cố: " + e.message)
    } finally {
      setLoadingIso(false)
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
        <button
          onClick={() => setActiveTab("ISO15189")}
          className={"py-3 px-6 font-bold text-sm border-b-2 transition-all uppercase tracking-wider " + (
            activeTab === "ISO15189" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
          )}
        >
          Báo cáo chất lượng ISO 15189
        </button>
      </div>

      {/* TAB CONTENT 1 */}
      {activeTab === "EXPORT" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-md">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" /> Bộ lọc xuất dữ liệu thiết bị
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Trạng thái thiết bị</label>
                <select
                  value={filters.status}
                  onChange={e => setFilters({...filters, status: e.target.value})}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="WORKING">Sẵn sàng / Vận hành tốt</option>
                  <option value="WARNING">Cần hiệu chuẩn</option>
                  <option value="BROKEN">Sự cố / Hỏng</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ngày nhập hệ thống (Từ - Đến)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={e => setFilters({...filters, startDate: e.target.value})}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all text-slate-750 dark:text-slate-200"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={e => setFilters({...filters, endDate: e.target.value})}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all text-slate-750 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handlePreview}
                  disabled={loadingExport}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  {loadingExport ? "Đang tải..." : "Xem trước"}
                </button>
                <button
                  onClick={handleExport}
                  disabled={loadingExport}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/10"
                >
                  <Download className="w-4.5 h-4.5 inline mr-1.5" /> Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {previewData && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700/60 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Bảng xem trước dữ liệu ({previewData.length} kết quả)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50/20 dark:bg-slate-900/20 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-150 dark:border-slate-700">
                    <tr>
                      <th className="px-5 py-4">Mã</th>
                      <th className="px-5 py-4">Tên thiết bị</th>
                      <th className="px-5 py-4">Model / Serial</th>
                      <th className="px-5 py-4">Trạng thái</th>
                      <th className="px-5 py-4">Lịch bảo trì kế</th>
                      <th className="px-5 py-4 text-right">Chi phí bảo trì</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewData.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{item["Mã Thiết Bị"]}</td>
                        <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-white uppercase">{item["Tên Thiết Bị"]}</td>
                        <td className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-350">
                          {item["Model"]} / <span className="text-[11px] opacity-75">{item["Số Serial"]}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            item["Trạng Thái"] === "Sẵn sàng" ? "bg-green-50 text-green-700 border-green-200" :
                            item["Trạng Thái"] === "Cần hiệu chuẩn" ? "bg-yellow-50 text-yellow-750 border-yellow-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          }`}>{item["Trạng Thái"].toUpperCase()}</span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-350">
                          {item["Lịch Bảo Trì Tới"]} {item["isOverdue"] && <span className="text-[10px] text-red-500 font-extrabold ml-1 uppercase">(Quá hạn)</span>}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                          {item["Tổng Chi Phí Bảo Trì (VND)"].toLocaleString("vi-VN")} VND
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

      {/* TAB CONTENT 2 */}
      {activeTab === "DAILY" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" /> Báo cáo kiểm kê quét mã QR hàng ngày
                </h2>
                <p className="text-slate-450 dark:text-slate-500 text-xs mt-1 font-medium">Chọn ngày kiểm tra để kết xuất bảng kiểm thiết bị đã quét và bỏ sót</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={dailyFilters.status}
                  onChange={e => setDailyFilters({...dailyFilters, status: e.target.value})}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200"
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
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all text-slate-750 dark:text-slate-200"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="date"
                    value={dailyFilters.endDate}
                    onChange={e => setDailyFilters({...dailyFilters, endDate: e.target.value})}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all text-slate-750 dark:text-slate-200"
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
                      {dailyData.reported.map((log: any) => (
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
                            {log.note || <span className="text-slate-355 italic">Không có</span>}
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
                {dailyData.missing.map((eq: any) => (
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

      {/* TAB CONTENT 3: ISO 15189 */}
      {activeTab === "ISO15189" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Filters card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-md">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> BỘ LỌC XUẤT BÁO CÁO KIỂM ĐỊNH ISO 15189
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Thiết bị xét nghiệm cụ thể</label>
                <select
                  value={isoFilters.equipmentId}
                  onChange={e => setIsoFilters({...isoFilters, equipmentId: e.target.value})}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200"
                >
                  <option value="ALL">Tất cả thiết bị trong khoa</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Khoảng thời gian báo cáo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={isoFilters.startDate}
                    onChange={e => setIsoFilters({...isoFilters, startDate: e.target.value})}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all text-slate-750 dark:text-slate-200"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="date"
                    value={isoFilters.endDate}
                    onChange={e => setIsoFilters({...isoFilters, endDate: e.target.value})}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold dark:bg-slate-900 outline-none focus:border-blue-500 transition-all text-slate-750 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="text-slate-400 text-xs italic font-medium pb-2 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                Các biểu mẫu được thiết kế chuẩn hóa theo Thông tư/Quy chuẩn kiểm định của Bộ Y tế phục vụ công tác đánh giá quản lý chất lượng phòng xét nghiệm.
              </div>
            </div>
          </div>

          {/* Export templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Template 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-sm">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Bảng kiểm Nhật ký Vận hành Máy hàng ngày
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                  Kết xuất toàn bộ nhật ký ghi nhận hàng ngày từ việc quét mã QR. Kiểm tra trạng thái sẵn sàng, người kiểm tra, thời điểm quét và ghi chú sự cố chi tiết của thiết bị.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700">
                <button
                  onClick={handleExportDailyChecklist}
                  disabled={loadingIso}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/10 transition-all"
                >
                  {loadingIso ? "Đang tải dữ liệu..." : "Tải Excel Nhật Ký"}
                </button>
              </div>
            </div>

            {/* Template 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-3.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Lịch sử Bảo dưỡng & Hiệu chuẩn định kỳ
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                  Hồ sơ tổng hợp toàn bộ các đợt bảo trì máy, bảo dưỡng linh phụ kiện và chứng nhận hiệu chuẩn định kỳ kèm thời hạn, đơn vị thực hiện, chi phí và nội dung chi tiết.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700">
                <button
                  onClick={handleExportHistory}
                  disabled={loadingIso}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-500/10 transition-all"
                >
                  {loadingIso ? "Đang tải dữ liệu..." : "Tải Excel Lịch Sử"}
                </button>
              </div>
            </div>

            {/* Template 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-3.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-2xl w-fit group-hover:scale-110 transition-transform shadow-sm">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Sổ theo dõi Sự cố và Hành động Khắc phục
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                  Lịch sử ghi chép toàn bộ lỗi máy (BROKEN/WARNING) được báo cáo, liên kết trực tiếp với các hành động bảo dưỡng khắc phục sự cố, kỹ thuật viên phụ trách sửa chữa và tiến độ.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700">
                <button
                  onClick={handleExportIncidents}
                  disabled={loadingIso}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-red-500/10 transition-all"
                >
                  {loadingIso ? "Đang tải dữ liệu..." : "Tải Excel Sổ Sự Cố"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
