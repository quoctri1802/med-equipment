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
      from: `"Med-Equipment System" <${process.env.SMTP_USER}>`,
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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-top: 4px solid #ef4444; border-radius: 8px;">
      <h2 style="color: #ef4444;">Lệnh nhắc lịch bảo trì tự động</h2>
      <p>Chào bạn, hệ thống ghi nhận phiếu bảo trì của bạn phụ trách đã đến hạn (còn <= 1 ngày).</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Thiết bị:</strong> ${data.eqName}</p>
        <p><strong>Mã máy:</strong> <span style="font-family: monospace;">${data.eqCode}</span></p>
        <p><strong>Ngày thực hiện kế hoạch:</strong> ${new Date(data.date).toLocaleDateString("vi-VN")}</p>
        <p><strong>Nội dung sự cố / bảo trì:</strong></p>
        <p style="background-color: white; padding: 10px; border: 1px solid #eee;">${data.description}</p>
      </div>
      
      <p>Vui lòng đăng nhập vào hệ thống để cập nhật tiến độ công việc hoặc báo cáo kết quả sau khi thực hiện.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">Email được tự động gửi từ hệ thống quản lý thiết bị y tế Med-Equipment.</p>
    </div>
  `

  return sendEmail({
    to: toEmail,
    subject: `🚨 [Hệ thống] Nhắc nhở bảo trì: ${data.eqName} (${data.eqCode}) sắp đến hạn!`,
    html
  })
}
