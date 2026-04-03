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
    // 1. Lấy danh sách Kỹ thuật viên có email và khoa phụ trách
    const technicians = await prisma.user.findMany({
      where: {
        role: { in: ["TECHNICIAN", "ADMIN"] },
        email: { not: null },
      }
    });

    const results = [];

    for (const tech of technicians) {
      if (!tech.email) continue;

      // 2. Tìm thiết bị hỏng/cảnh báo trong khoa phụ trách (hoặc tất cả nếu là ADMIN không gắn khoa)
      const whereClause: any = {
        status: { in: ["WARNING", "BROKEN"] }
      };

      if ((tech as any).department && (tech as any).department !== "ALL") {
        whereClause.department = (tech as any).department;
      }

      const issues = await prisma.equipment.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' }
      });

      if (issues.length > 0) {
        // 3. Gửi Email
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">BÁO CÁO NHẮC LỊCH SÁNG 7:00 AM</h2>
            <p>Chào <strong>${tech.name || tech.email}</strong>,</p>
            <p>Dưới đây là danh sách các thiết bị y tế đang gặp sự cố tại khoa <strong>${(tech as any).department || 'Tổng hợp'}</strong> cần xử lý trong hôm nay:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Thiết bị</th>
                  <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Trạng thái</th>
                  <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Khoa</th>
                </tr>
              </thead>
              <tbody>
                ${issues.map(item => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #cbd5e1;"><strong>${item.name}</strong><br/><small style="color: #64748b;">${item.code}</small></td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1; color: ${item.status === 'BROKEN' ? '#ef4444' : '#f59e0b'}; font-weight: bold;">${item.status}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1;">${item.department}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <p style="margin-top: 20px; font-size: 14px; color: #64748b;">Vui lòng truy cập hệ thống <a href="${process.env.NEXTAUTH_URL}/dashboard" style="color: #2563eb; text-decoration: none;">Med-Equipment Pro</a> để biết thêm chi tiết.</p>
            <div style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              Hệ thống quản lý trang thiết bị TTYT Liên Chiểu
            </div>
          </div>
        `;

        await sendEmail({
          to: tech.email,
          subject: `[Med-Equipment] Nhắc lịch xử lý thiết bị - ${new Date().toLocaleDateString('vi-VN')}`,
          html
        });

        results.push({ email: tech.email, count: issues.length });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
