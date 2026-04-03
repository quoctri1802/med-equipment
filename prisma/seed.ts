import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding data...")

  // --- Seed Admin User ---
  const adminEmail = "admin@med.com"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  let adminUser;
  if (!existingAdmin) {
    adminUser = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: "password123", // MVP string password
        role: "ADMIN"
      }
    })
    console.log("Admin user created:", adminUser.email)
  } else {
    adminUser = existingAdmin;
    console.log("Admin user already exists")
  }

  // --- Seed Technician User ---
  const techEmail = "tech@med.com"
  const existingTech = await prisma.user.findUnique({
    where: { email: techEmail }
  })

  let techUser;
  if (!existingTech) {
    techUser = await prisma.user.create({
      data: {
        name: "Kỹ thuật viên Nguyễn Văn A",
        email: techEmail,
        password: "password123",
        role: "TECHNICIAN"
      }
    })
    console.log("Technician user created:", techUser.email)
  } else {
    techUser = existingTech;
  }

  // --- Seed Equipment ---
  const equipmentCount = await prisma.equipment.count()
  if (equipmentCount === 0) {
    console.log("Seeding mock equipment...")
    await prisma.equipment.createMany({
      data: [
        {
          name: "Máy Chụp X-Quang Kỹ Thuật Số",
          code: "KHOA-20260401-001",
          department: "Khoa Chẩn Đoán Hình Ảnh",
          status: "WORKING",
          purchaseDate: new Date('2023-01-15'),
          riskScore: "LOW"
        },
        {
          name: "Máy Siêu Âm 4D",
          code: "KHOA-20260401-002",
          department: "Khoa Sản",
          status: "WORKING",
          purchaseDate: new Date('2024-05-20'),
          riskScore: "LOW"
        },
        {
          name: "Máy Trợ Thở",
          code: "KHOA-20260401-003",
          department: "Khoa Cấp Cứu",
          status: "WARNING",
          purchaseDate: new Date('2022-11-10'),
          riskScore: "HIGH"
        },
        {
          name: "Máy Đo Điện Tâm Đồ",
          code: "KHOA-20260401-004",
          department: "Khoa Tim Mạch",
          status: "BROKEN",
          purchaseDate: new Date('2021-08-05'),
          riskScore: "MEDIUM"
        }
      ]
    });
  }

  // --- Seed Maintenance Records ---
  const maintenanceCount = await prisma.maintenance.count()
  if (maintenanceCount === 0) {
    console.log("Seeding mock maintenance records...")
    const brokenEq = await prisma.equipment.findFirst({ where: { status: "BROKEN" } })
    const warningEq = await prisma.equipment.findFirst({ where: { status: "WARNING" } })

    if (brokenEq && techUser) {
      await prisma.maintenance.create({
        data: {
          equipmentId: brokenEq.id,
          technicianId: techUser.id,
          description: "Thay thế bo mạch chủ màn hình hiển thị.",
          cost: 1500000,
          status: "IN_PROGRESS",
          date: new Date()
        }
      })
    }

    if (warningEq && techUser) {
      await prisma.maintenance.create({
        data: {
          equipmentId: warningEq.id,
          technicianId: techUser.id,
          description: "Kiểm tra định kỳ van bơm hơi.",
          cost: 200000,
          status: "PENDING",
          date: new Date()
        }
      })
    }
  }

  console.log("Seeding complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
