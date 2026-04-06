import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Xác thực đơn giản cho Cron (Tránh việc ai đó gọi bưa bãi)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const VIETNAM_OFFSET = 7;
    const nowLocal = new Date(new Date().getTime() + (VIETNAM_OFFSET * 60 * 60 * 1000));
    const todayStr = nowLocal.toISOString().split('T')[0];
    
    // Ngưỡng 3 ngày tới cho bảo trì sắp tới
    const threeDaysLater = new Date(nowLocal.getTime() + (3 * 24 * 60 * 60 * 1000));
    const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];

    // Ngày hôm qua để check báo cáo định kỳ
    const yesterday = new Date(nowLocal.getTime() - (24 * 60 * 60 * 1000));
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayStart = new Date(yesterdayStr + 'T00:00:00+07:00');
    const yesterdayEnd = new Date(yesterdayStr + 'T23:59:59+07:00');

    // 1. Lấy danh sách Người dùng
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["TECHNICIAN", "ADMIN"] },
        email: { not: null },
      }
    });

    // 2. Lấy thông tin chung (dùng cho Admin) - Các khoa chưa báo cáo hôm qua
    const allDepartments = ["CC", "HSTC", "NTH", "XN", "CDHA"];
    const reportedDepts = await prisma.log.findMany({
      where: {
        createdAt: { gte: yesterdayStart, lte: yesterdayEnd }
      },
      select: { equipment: { select: { department: true } } },
      distinct: ['equipmentId'] // Thực tế nên check theo department, nhưng Log tree phức tạp hơn chút
    });
    const summarizedDepts = Array.from(new Set(reportedDepts.map(r => r.equipment.department)));
    const missingDepts = allDepartments.filter(d => !summarizedDepts.includes(d));

    const results = [];

    for (const user of users) {
      if (!user.email) continue;

      // --- LỌC DỮ LIỆU THEO KHOA ---
      const deptFilter = (user as any).department && (user as any).department !== "ALL" 
        ? { department: (user as any).department } 
        : {};

      // A. Thiết bị hỏng/cảnh báo
      const issues = await prisma.equipment.findMany({
        where: {
          ...deptFilter,
          status: { in: ["WARNING", "BROKEN"] }
        }
      });

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
      });

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
      });

      if (issues.length > 0 || upcomingMaintenances.length > 0 || overdueMaintenances.length > 0 || (user.role === 'ADMIN' && missingDepts.length > 0)) {
        // 3. Gửi Email với Template mới
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 20px;">BÁO CÁO TỔNG HỢP SÁNG</h1>
              <p style="color: #64748b; font-size: 14px;">Hệ thống Med-Equipment - Ngày ${nowLocal.toLocaleDateString('vi-VN')}</p>
            </div>

            <p>Chào <strong>${user.name || user.email}</strong>,</p>
            <p>Đây là bản tin cập nhật trạng thái thiết bị y tế tại khoa <strong>${(user as any).department || 'Tổng hợp'}</strong>:</p>

            ${issues.length > 0 ? `
              <div style="margin-top: 20px;">
                <h3 style="color: #ef4444; border-left: 4px solid #ef4444; padding-left: 10px; font-size: 16px;">⚠️ THIẾT BỊ ĐANG GẶP SỰ CỐ (${issues.length})</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
                  <tr style="background: #fef2f2; font-weight: bold;">
                    <td style="padding: 8px; border: 1px solid #fee2e2;">Tên thiết bị</td>
                    <td style="padding: 8px; border: 1px solid #fee2e2;">Trạng thái</td>
                  </tr>
                  ${issues.map(i => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #f1f5f9;">${i.name} (${i.code})</td>
                      <td style="padding: 8px; border: 1px solid #f1f5f9; color: ${i.status === 'BROKEN' ? '#ef4444' : '#f59e0b'}; font-weight: bold;">${i.status}</td>
                    </tr>
                  `).join('')}
                </table>
              </div>
            ` : ''}

            ${overdueMaintenances.length > 0 ? `
              <div style="margin-top: 20px;">
                <h3 style="color: #991b1b; border-left: 4px solid #991b1b; padding-left: 10px; font-size: 16px;">🛑 LỊCH BẢO TRÌ QUÁ HẠN (${overdueMaintenances.length})</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
                  <tr style="background: #fff1f2; font-weight: bold;">
                    <td style="padding: 8px; border: 1px solid #fb7185;">Thiết bị</td>
                    <td style="padding: 8px; border: 1px solid #fb7185;">Ngày hẹn</td>
                  </tr>
                  ${overdueMaintenances.map(m => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #f1f5f9;">${m.equipment.name}</td>
                      <td style="padding: 8px; border: 1px solid #f1f5f9; color: #ef4444; font-weight: bold;">${new Date(m.date).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  `).join('')}
                </table>
              </div>
            ` : ''}

            ${upcomingMaintenances.length > 0 ? `
              <div style="margin-top: 20px;">
                <h3 style="color: #0891b2; border-left: 4px solid #0891b2; padding-left: 10px; font-size: 16px;">🗓️ LỊCH BẢO TRÌ SẮP TỚI (3 ngày)</h3>
                <ul style="font-size: 13px; color: #475569;">
                  ${upcomingMaintenances.map(m => `
                    <li><strong>${new Date(m.date).toLocaleDateString('vi-VN')}</strong>: ${m.equipment.name} (${m.status})</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            ${(user.role === 'ADMIN' && missingDepts.length > 0) ? `
              <div style="margin-top: 25px; padding: 15px; background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px;">
                <h3 style="color: #9a3412; margin-top: 0; font-size: 15px;">📋 QUẢN TRỊ: CÁC KHOA CHƯA BÁO CÁO HÔM QUA</h3>
                <p style="font-size: 13px; color: #7c2d12; margin-bottom: 0;">Các khoa sau chưa có dữ liệu kiểm kê ngày ${yesterdayStr}: 
                  <strong style="color: #ea580c;">${missingDepts.join(', ')}</strong>
                </p>
              </div>
            ` : ''}
            
            <div style="margin-top: 35px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">TRUY CẬP HỆ THỐNG</a>
            </div>
            
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">Đây là email tự động từ Med-Equipment Pro. Vui lòng không phản hồi email này.</p>
          </div>
        `;

        await sendEmail({
          to: user.email,
          subject: `[PRO] Báo cáo tình trạng thiết bị ${nowLocal.toLocaleDateString('vi-VN')} - ${(user as any).department || 'Toàn khoa'}`,
          html
        });

        results.push({ email: user.email, role: user.role });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
