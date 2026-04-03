import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar userRole={session.user.role} userPermissions={session.user.permissions || ""} />
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
        {children}
      </main>
    </div>
  )
}
