import ReagentsInventory from "@/components/ReagentsInventory"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function ReagentsPage() {
  const session = await getServerSession(authOptions)
  
  // Fetch all reagents in the laboratory
  const reagents = await prisma.reagent.findMany({
    include: {
      equipment: true
    },
    orderBy: {
      expiryDate: 'asc'
    }
  })

  // Fetch all laboratory equipments to choose from when linking a chemical
  const equipments = await prisma.equipment.findMany({
    where: {
      department: "XN"
    },
    orderBy: {
      name: 'asc'
    }
  })

  const currentUser = session?.user ? {
    id: session.user.id,
    role: session.user.role,
    name: session.user.name || null
  } : null

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Kho Hóa Chất & Vật Tư</h1>
          <p className="text-slate-500 text-sm mt-0.5">Quản lý lô hóa chất, định mức hao mòn và cảnh báo tồn kho an toàn.</p>
        </div>
      </div>

      <ReagentsInventory 
        initialReagents={reagents as any} 
        equipments={equipments as any}
        currentUser={currentUser}
      />
    </div>
  )
}
