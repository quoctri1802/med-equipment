"use server"

import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

// Check Authorization Wrapper
async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Only ADMIN can perform this action.")
  }
}

export async function createUser(data: any) {
  await checkAdmin()
  
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })
  if (existingUser) {
    throw new Error("Email đã tồn tại!")
  }

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password, // Simple string storage for MVP purposes
      role: data.role,
      permissions: data.permissions || ""
    }
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateUser(id: string, data: any) {
  await checkAdmin()
  
  // check if updating email to an existing one
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing && existing.id !== id) {
      throw new Error("Email đã tồn tại ở tài khoản khác!")
    }
  }

  // Update object preparation (so we don't accidentally blank out passwords if left empty in form)
  const updateData: any = {
    name: data.name,
    email: data.email,
    role: data.role,
    permissions: typeof data.permissions === 'string' ? data.permissions : ""
  }

  if (data.password && data.password.trim() !== '') {
    updateData.password = data.password
  }

  await prisma.user.update({
    where: { id },
    data: updateData
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function deleteUser(id: string) {
  await checkAdmin()

  await prisma.user.delete({
    where: { id }
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}
