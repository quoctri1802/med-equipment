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
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8 flex flex-col justify-between">
        <div className="flex-1">
          {children}
        </div>
        <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            &copy; {new Date().getFullYear()} TTYT Khu vực Liên Chiểu - Khoa Xét nghiệm.
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-350">
            <span>Hỗ trợ kỹ thuật: <span className="font-mono text-blue-600 dark:text-blue-400">0905924194</span></span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-normal text-slate-500 dark:text-slate-500">Design by tritnq</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
