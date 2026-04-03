"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

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
      password: data.password,
      role: data.role,
      permissions: data.permissions || "",
      department: data.department || ""
    } as any
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateUser(id: string, data: any) {
  await checkAdmin()
  
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing && existing.id !== id) {
      throw new Error("Email đã tồn tại ở tài khoản khác!")
    }
  }

  const updateData: any = {
    name: data.name,
    email: data.email,
    role: data.role,
    permissions: typeof data.permissions === 'string' ? data.permissions : "",
    department: data.department || ""
  }

  if (data.password && data.password.trim() !== '') {
    updateData.password = data.password
  }

  await prisma.user.update({
    where: { id },
    data: updateData as any
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
