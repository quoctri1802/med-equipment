import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy tệp tải lên" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || "image/jpeg"

    // Thử lưu vào ổ đĩa cục bộ (khi chạy Localhost hoặc VPS)
    try {
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")}`
      const uploadDir = path.join(process.cwd(), "public", "uploads")

      await mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, filename)
      await writeFile(filePath, buffer)

      return NextResponse.json({ success: true, url: `/uploads/${filename}` })
    } catch (fsError: any) {
      // Khi chạy trên Serverless (Vercel) có hệ thống tệp Read-Only:
      // Tự động chuyển đổi thành Data URL Base64 để lưu trữ an toàn trong Database PostgreSQL
      console.warn("Môi trường máy chủ Read-Only, tự động chuyển đổi sang Data URL Base64:", fsError?.message)
      const base64Data = buffer.toString("base64")
      const dataUrl = `data:${mimeType};base64,${base64Data}`

      return NextResponse.json({ success: true, url: dataUrl })
    }
  } catch (error: any) {
    console.error("Lỗi xử lý tệp tải lên:", error)
    return NextResponse.json({ error: error.message || "Tải tệp thất bại" }, { status: 500 })
  }
}
