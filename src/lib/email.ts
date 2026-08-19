import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"LabEquip Center" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    console.log("Email sent: %s", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

/**
 * Gửi cảnh báo bảo trì cụ thể cho thiết bị
 */
export async function sendMaintenanceAlert(toEmail: string, data: { eqName: string, eqCode: string, date: Date, description: string }) {
  const siteUrl = process.env.NEXTAUTH_URL || "https://med-lienchieu.io.vn";

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; color: #1e293b; line-height: 1.6; background-color: #f8fafc; padding: 15px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Thông báo Lịch Bảo Trì</h2>
        <p style="color: #e0f2fe; font-size: 12px; margin: 5px 0 0 0;">Hệ thống giám sát LabEquip Center - TTYT Liên Chiểu</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 25px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
        <p style="margin-top: 0; font-size: 14px;">Kính chào kỹ thuật viên,</p>
        <p style="font-size: 14px; color: #475569;">Hệ thống ghi nhận phiếu bảo trì thiết bị do bạn phụ trách đã đến hạn thực hiện (còn dưới 1 ngày):</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Thiết bị xét nghiệm:</strong> <span style="color: #1e3a8a; font-weight: bold;">${data.eqName}</span></p>
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Mã máy:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px; color: #0f172a;">${data.eqCode}</span></p>
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Ngày thực hiện kế hoạch:</strong> <span style="color: #dc2626; font-weight: bold;">${new Date(data.date).toLocaleDateString("vi-VN")}</span></p>
          <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>Nội dung bảo trì / sửa chữa:</strong></p>
          <p style="background-color: #ffffff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; margin: 5px 0 0 0; color: #334155; font-style: italic; leading-relaxed: true;">${data.description}</p>
        </div>
        
        <p style="font-size: 14px; color: #475569;">Vui lòng truy cập hệ thống để cập nhật tiến độ công việc hoặc báo cáo kết quả sau khi thực hiện bảo trì thành công.</p>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${siteUrl}/dashboard" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(30,58,138,0.2);">Cập nhật tiến độ bảo trì</a>
        </div>
        
        <p style="color: #94a3b8; font-size: 11px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; font-style: italic;">Email được tự động gửi từ hệ thống quản lý thiết bị y tế LabEquip Center.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `[LabEquip Center] Nhắc nhở bảo trì: ${data.eqName} (${data.eqCode}) sắp đến hạn!`,
    html
  })
}
