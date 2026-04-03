import Link from "next/link";
import { ActivitySquare, ShieldCheck, QrCode, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Navbar segment */}
      <header className="px-6 lg:px-14 h-20 flex items-center shadow-sm bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <Link className="flex items-center justify-center gap-2" href="#">
          <ActivitySquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-xl text-slate-900 dark:text-white hidden sm:block">
            MedEquip Manager
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            className="text-sm font-medium hover:text-blue-600 transition-colors text-slate-600 dark:text-slate-300"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-sm font-medium hover:text-blue-600 transition-colors text-slate-600 dark:text-slate-300"
            href="/scanner"
          >
            Quét mã QR
          </Link>
          <Link
            className="text-sm font-medium bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition"
            href="/login"
          >
            Đăng nhập
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-20 text-center">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 dark:border-blue-800/30 dark:bg-blue-900/30 dark:text-blue-300">
            <span className="flex w-2 h-2 rounded-full bg-blue-600 mr-2"></span>
            Hệ thống quản lý thông minh
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quản lý Thiết bị Y tế <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Trung tâm Y tế Liên Chiểu
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Giải pháp số hóa toàn diện giúp theo dõi, bảo trì và quản lý trạng thái thiết bị y tế một cách nhanh chóng, chính xác qua mã QR.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-full transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
            >
              Vào bảng điều khiển
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/scanner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 font-medium px-8 py-3.5 rounded-full transition-all"
            >
              <QrCode className="w-5 h-5" />
              Quét thiết bị
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto text-left">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl w-fit mb-6">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Quét QR thông minh</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Truy xuất thông tin trạng thái, lịch sử sửa chữa của thiết bị tức thì chỉ với một lần quét qua camera điện thoại.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
            <div className="p-3 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-xl w-fit mb-6">
              <ActivitySquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Theo dõi thời gian thực</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Cập nhật trạng thái từng máy móc liên tục từ "Hệ thống hoạt động tốt" đến "Cần bảo trì khẩn cấp".
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Phân quyền chặt chẽ</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hệ thống tài khoản phân loại quyền truy cập theo chức vụ: Quản trị viên, Kỹ thuật viên bảo trì và Y bác sĩ sử dụng.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} TTYT Liên Chiểu. All rights reserved.
      </footer>
    </div>
  );
}
