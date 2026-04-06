import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { sendMaintenanceAlert } from '@/lib/email'

export async function GET(request: Request) {
  try {
    // 1. Phân tích khoảng thời gian ranh giới. 
    // Theo yêu cầu: <= 1 ngày kể từ bây giờ (giờ Việt Nam)
    const VIETNAM_OFFSET = 7;
    const nowLocal = new Date(new Date().getTime() + (VIETNAM_OFFSET * 60 * 60 * 1000));
    
    const targetDate = new Date(nowLocal);
    targetDate.setDate(nowLocal.getDate() + 1);
    
    // 2. Tìm tất cả các phiếu PENDING, chưa gửi báo (isNotified == false) 
    // và date <= targetDate 
    const dueMaintenances = await prisma.maintenance.findMany({
      where: {
        status: "PENDING",
        isNotified: false,
        date: {
          lte: targetDate
        }
      },
      include: {
        equipment: true,
        technician: true
      }
    })

    if (dueMaintenances.length === 0) {
      return NextResponse.json({ success: true, message: "Không có phiếu bảo trì nào sắp đến hạn cần nhắc nhở." })
    }

    const emailPromises = dueMaintenances.map(async (record) => {
      // Bỏ qua nếu user không có email (hoặc dùng một email Admin chung làm dự phòng)
      const targetEmail = record.technician?.email || process.env.ADMIN_EMAIL || ""
      
      if (targetEmail) {
        const result = await sendMaintenanceAlert(targetEmail, {
          eqName: record.equipment.name,
          eqCode: record.equipment.code,
          date: record.date,
          description: record.description
        })

        // Nếu gửi thành công mới chốt cập nhật Database (không lặp lại cảnh báo)
        if (result.success) {
          await prisma.maintenance.update({
            where: { id: record.id },
            data: { isNotified: true }
          })
        }
        return { id: record.id, success: result.success }
      }
      return { id: record.id, success: false, reason: "No target email" }
    })

    const results = await Promise.all(emailPromises)

    return NextResponse.json({
      success: true,
      message: `Đã xử lý quét ${dueMaintenances.length} phiếu hẹn.`,
      details: results
    })

  } catch (error: any) {
    console.error("Cron Error: ", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

