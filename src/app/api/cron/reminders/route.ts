export const dynamic = "force-dynamic"
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const url = new URL(req.url)
    const secretParam = url.searchParams.get("secret")
    const expectedSecret = process.env.CRON_SECRET

    const isAuthorized = 
      (authHeader === `Bearer ${expectedSecret}`) || 
      (secretParam && secretParam === expectedSecret) ||
      (!expectedSecret) || // If CRON_SECRET is not set in Env, allow bypass for testing
      (process.env.NODE_ENV === "development")

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const VIETNAM_OFFSET = 7
    const now = new Date()
    const nowLocal = new Date(now.getTime() + (VIETNAM_OFFSET * 60 * 60 * 1000))
    const todayStr = nowLocal.toISOString().split('T')[0]

    const yesterdayLocal = new Date(nowLocal.getTime() - (24 * 60 * 60 * 1000))
    const yesterdayStr = yesterdayLocal.toISOString().split('T')[0]

    const threeDaysLaterLocal = new Date(nowLocal.getTime() + (3 * 24 * 60 * 60 * 1000))
    const threeDaysLaterStr = threeDaysLaterLocal.toISOString().split('T')[0]

    const yesterdayStart = new Date(yesterdayStr + 'T00:00:00+07:00')
    const yesterdayEnd = new Date(yesterdayStr + 'T23:59:59+07:00')

    // 1. Lấy danh sách Người dùng nhận tin (Technician và Admin)
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["TECHNICIAN", "ADMIN"] },
        email: { not: null },
      }
    })

    // 2. Lấy thông tin chung - Chỉ kiểm kê Khoa Xét Nghiệm
    const allDepartments = ["XN"]
    const reportedDepts = await prisma.log.findMany({
      where: {
        createdAt: { gte: yesterdayStart, lte: yesterdayEnd }
      },
      select: { equipment: { select: { department: true } } },
      distinct: ['equipmentId']
    })
    const summarizedDepts = Array.from(new Set(reportedDepts.map(r => r.equipment.department)))
    const missingDepts = allDepartments.filter(d => !summarizedDepts.includes(d))

    const results = []
    const siteUrl = process.env.NEXTAUTH_URL || "https://med-lienchieu.io.vn"

    for (const user of users) {
      if (!user.email) continue

      const deptFilter = { department: "XN" }

      // A. Thiết bị hỏng/cảnh báo
      const issues = await prisma.equipment.findMany({
        where: {
          ...deptFilter,
          status: { in: ["WARNING", "BROKEN"] }
        }
      })

      // B. Bảo trì sắp tới (3 ngày tới)
      const upcomingMaintenances = await prisma.maintenance.findMany({
        where: {
          equipment: deptFilter,
          status: { in: ["PENDING", "IN_PROGRESS"] },
          date: {
            gte: new Date(todayStr + 'T00:00:00+07:00'),
            lte: new Date(threeDaysLaterStr + 'T23:59:59+07:00')
          }
        },
        include: { equipment: true }
      })

      // C. Bảo trì QUÁ HẠN
      const overdueMaintenances = await prisma.maintenance.findMany({
        where: {
          equipment: deptFilter,
          status: { in: ["PENDING", "IN_PROGRESS"] },
          date: {
            lt: new Date(todayStr + 'T00:00:00+07:00')
          }
        },
        include: { equipment: true }
      })

      // D. Hiệu chuẩn / Kiểm định sắp/đã hết hạn (trong 30 ngày)
      const expiringCalibrations = await prisma.calibration.findMany({
        where: {
          equipment: deptFilter,
          expireDate: {
            lte: new Date(nowLocal.getTime() + (30 * 24 * 60 * 60 * 1000))
          }
        },
        include: { equipment: true },
        orderBy: { expireDate: 'asc' }
      })

      const hasAlerts = issues.length > 0 || upcomingMaintenances.length > 0 || overdueMaintenances.length > 0 || expiringCalibrations.length > 0 || (user.role === 'ADMIN' && missingDepts.length > 0);

      // 3. Gửi Email với Template thiết kế lại đẹp mắt
      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 20px auto; color: #1e293b; line-height: 1.6; background-color: #f8fafc; padding: 15px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a8a, #0f172a); padding: 35px; border-radius: 20px 20px 0 0; text-align: center; color: white; box-shadow: 0 4px 10px rgba(15,23,42,0.15);">
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">LabEquip Center</h2>
            <p style="color: #38bdf8; font-size: 12px; margin: 8px 0 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Báo cáo giám sát thiết bị xét nghiệm hàng ngày</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 5px 0 0 0; font-style: italic;">Ngày ${nowLocal.toLocaleDateString('vi-VN')}</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 20px 20px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <p style="margin-top: 0; font-size: 15px;">Kính chào <strong>${user.name || user.email}</strong>,</p>
            <p style="font-size: 14px; color: #475569;">Hệ thống ghi nhận bản tin cập nhật tình trạng kỹ thuật của các máy xét nghiệm y khoa tại khoa xét nghiệm như sau:</p>

            ${!hasAlerts ? `
              <div style="margin-top: 25px; padding: 25px; text-align: center; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px;">
                <span style="font-size: 32px; display: block; margin-bottom: 10px;">✅</span>
                <h3 style="color: #065f46; margin: 0 0 5px 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">Mọi thiết bị hoạt động tốt</h3>
                <p style="font-size: 13px; color: #047857; margin: 0; font-weight: 500;">Khoa xét nghiệm không ghi nhận bất kỳ sự cố, cảnh báo hoặc lịch bảo trì quá hạn nào trong hôm nay.</p>
              </div>
            ` : ''}

            ${issues.length > 0 ? `
              <div style="margin-top: 25px; padding: 20px; border-left: 4px solid #ef4444; background: #fef2f2; border-radius: 8px;">
                <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Thiết bị đang gặp sự cố (${issues.length})</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;">
                  <thead>
                    <tr style="background: #fee2e2; text-align: left; font-weight: bold; color: #991b1b;">
                      <th style="padding: 10px; border: 1px solid #fecaca;">Tên thiết bị</th>
                      <th style="padding: 10px; border: 1px solid #fecaca; width: 120px;">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${issues.map(i => `
                      <tr style="background: #ffffff;">
                        <td style="padding: 10px; border: 1px solid #fee2e2; font-weight: bold;">${i.name} (${i.code})</td>
                        <td style="padding: 10px; border: 1px solid #fee2e2; color: ${i.status === 'BROKEN' ? '#dc2626' : '#d97706'}; font-weight: bold; text-align: center;">${i.status === 'BROKEN' ? 'SỰ CỐ' : 'CẦN HIỆU CHUẨN'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            ${overdueMaintenances.length > 0 ? `
              <div style="margin-top: 25px; padding: 20px; border-left: 4px solid #b91c1c; background: #fff5f5; border-radius: 8px;">
                <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">🚨 Lịch bảo trì quá hạn (${overdueMaintenances.length})</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;">
                  <thead>
                    <tr style="background: #ffe4e6; text-align: left; font-weight: bold; color: #991b1b;">
                      <th style="padding: 10px; border: 1px solid #fecdd3;">Thiết bị xét nghiệm</th>
                      <th style="padding: 10px; border: 1px solid #fecdd3; width: 110px;">Hạn lịch</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${overdueMaintenances.map(m => `
                      <tr style="background: #ffffff;">
                        <td style="padding: 10px; border: 1px solid #fecdd3; font-weight: bold;">${m.equipment.name}</td>
                        <td style="padding: 10px; border: 1px solid #fecdd3; color: #dc2626; font-weight: bold; text-align: center;">${new Date(m.date).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            ${upcomingMaintenances.length > 0 ? `
              <div style="margin-top: 25px; padding: 20px; border-left: 4px solid #0891b2; background: #ecfeff; border-radius: 8px;">
                <h3 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">📅 Lịch bảo trì sắp tới (3 ngày)</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;">
                  <thead>
                    <tr style="background: #cffafe; text-align: left; font-weight: bold; color: #0c4a6e;">
                      <th style="padding: 10px; border: 1px solid #a5f3fc;">Thiết bị xét nghiệm</th>
                      <th style="padding: 10px; border: 1px solid #a5f3fc; width: 110px;">Ngày thực hiện</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${upcomingMaintenances.map(m => `
                      <tr style="background: #ffffff;">
                        <td style="padding: 10px; border: 1px solid #cffafe; font-weight: bold;">${m.equipment.name}</td>
                        <td style="padding: 10px; border: 1px solid #cffafe; color: #0891b2; font-weight: bold; text-align: center;">${new Date(m.date).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            ${expiringCalibrations.length > 0 ? `
              <div style="margin-top: 25px; padding: 20px; border-left: 4px solid #ea580c; background: #fff7ed; border-radius: 8px;">
                <h3 style="color: #c2410c; margin: 0 0 10px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">📅 Thiết bị sắp/đã hết hạn kiểm định (${expiringCalibrations.length})</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;">
                  <thead>
                    <tr style="background: #ffedd5; text-align: left; font-weight: bold; color: #c2410c;">
                      <th style="padding: 10px; border: 1px solid #fed7aa;">Thiết bị xét nghiệm</th>
                      <th style="padding: 10px; border: 1px solid #fed7aa; width: 110px;">Hạn kiểm định</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${expiringCalibrations.map(c => {
                      const daysLeft = Math.ceil((new Date(c.expireDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const text = daysLeft <= 0 ? 'Đã hết hạn' : `Còn ${daysLeft} ngày`;
                      const color = daysLeft <= 0 ? '#ef4444' : '#ea580c';
                      return `
                        <tr style="background: #ffffff;">
                          <td style="padding: 10px; border: 1px solid #fed7aa; font-weight: bold;">${c.equipment.name} (${c.equipment.code})</td>
                          <td style="padding: 10px; border: 1px solid #fed7aa; color: ${color}; font-weight: bold; text-align: center;">${new Date(c.expireDate).toLocaleDateString('vi-VN')}<br><span style="font-size: 10px; font-weight: normal;">(${text})</span></td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            ${(user.role === 'ADMIN' && missingDepts.length > 0) ? `
              <div style="margin-top: 25px; padding: 20px; background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 8px;">
                <h3 style="color: #7c2d12; margin: 0 0 5px 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">🔍 Cảnh báo kiểm kê</h3>
                <p style="font-size: 13px; color: #7c2d12; margin: 0;">Khoa chưa thực hiện quét báo cáo tình trạng ngày hôm qua: 
                  <strong style="color: #ea580c;">Khoa Xét Nghiệm (XN)</strong>
                </p>
              </div>
            ` : ''}
            
            <!-- CTA Button -->
            <div style="margin-top: 35px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 25px;">
              <a href="${siteUrl}/dashboard" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 10px rgba(30,58,138,0.25); text-transform: uppercase; letter-spacing: 0.5px;">Truy cập bảng điều khiển</a>
            </div>
            
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px; font-style: italic;">Đây là email tự động gửi từ LabEquip Center. Vui lòng không phản hồi email này.</p>
          </div>
        </div>
      `

      const sendRes = await sendEmail({
        to: user.email,
        subject: `[LabEquip Center] Báo cáo tình trạng thiết bị ngày ${nowLocal.toLocaleDateString('vi-VN')}`,
        html
      })

      results.push({ 
        email: user.email, 
        role: user.role, 
        success: sendRes.success,
        ...(sendRes.success ? {} : { error: sendRes.error?.message || JSON.stringify(sendRes.error) })
      })
    }

    return NextResponse.json({ success: true, processed: results })
  } catch (error) {
    console.error("Cron Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
