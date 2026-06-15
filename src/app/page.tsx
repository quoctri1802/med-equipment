import Link from "next/link";
import { ActivitySquare, ShieldCheck, QrCode, ArrowRight, ClipboardList, CheckCircle2, ShieldAlert } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="px-6 lg:px-14 h-20 flex items-center border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2 group" href="#">
          <div className="p-2 bg-blue-600/10 rounded-xl group-hover:bg-blue-600/20 transition-all border border-blue-500/20">
            <ActivitySquare className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white hidden sm:block">
            LabEquip <span className="text-blue-500">Manager</span>
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-8 items-center">
          <Link
            className="text-sm font-semibold hover:text-blue-400 transition-colors text-slate-300"
            href="/dashboard"
          >
            Bảng điều khiển
          </Link>
          <Link
            className="text-sm font-semibold hover:text-blue-400 transition-colors text-slate-300"
            href="/scanner"
          >
            Quét mã QR
          </Link>
          <Link
            className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            href="/login"
          >
            Đăng nhập
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-24 text-center z-10">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-950/50 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-sm">
            <span className="flex w-2 h-2 rounded-full bg-blue-500 mr-2 animate-ping"></span>
            Hệ thống quản lý thông minh v2.0
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
            Quản Lý Thiết Bị Khoa Xét Nghiệm <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600">
              TTYT Khu vực Liên Chiểu
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Giải pháp số hóa toàn diện giúp theo dõi, bảo trì, hiệu chuẩn, quản lý trạng thái và giám sát người sử dụng/bảo quản thiết bị xét nghiệm tức thời qua mã QR. Tối ưu hiệu suất và đảm bảo chất lượng kết quả xét nghiệm.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              Vào bảng điều khiển
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/scanner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-white font-bold px-8 py-4 rounded-xl transition-all"
            >
              <QrCode className="w-5 h-5 text-cyan-400" />
              Quét QR Thiết bị
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto text-left">
          <div className="bg-slate-900/40 border border-slate-900 hover:border-blue-500/20 p-8 rounded-2xl backdrop-blur-sm transition-all hover:bg-slate-900/60 duration-300 group">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform border border-blue-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Quét QR & Báo lỗi nhanh</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Tra cứu hồ sơ, lịch sử hiệu chuẩn, sửa chữa và lập báo cáo sự cố ngay lập tức bằng điện thoại thông minh thông qua quét mã QR tích hợp sẵn.
            </p>
          </div>
          
          <div className="bg-slate-900/40 border border-slate-900 hover:border-cyan-500/20 p-8 rounded-2xl backdrop-blur-sm transition-all hover:bg-slate-900/60 duration-300 group">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform border border-cyan-500/20">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Theo dõi Vận hành & QC</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Theo dõi chính xác ai đang vận hành hoặc chịu trách nhiệm bảo quản thiết bị xét nghiệm, thời gian sử dụng, mục đích cụ thể và KTV hiệu chuẩn QC.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 hover:border-blue-500/20 p-8 rounded-2xl backdrop-blur-sm transition-all hover:bg-slate-900/60 duration-300 group">
            <div className="p-3 bg-blue-500/10 text-blue-450 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform border border-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Phân quyền chặt chẽ</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Hệ thống phân quyền chi tiết cho Quản trị viên (Admin), Kỹ thuật viên bảo trì (Technician) và Nhân viên xét nghiệm sử dụng máy.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center text-xs text-slate-600 border-t border-slate-900 z-10 mt-auto bg-slate-950">
        &copy; {new Date().getFullYear()} TTYT Khu vực Liên Chiểu - Khoa Xét nghiệm. Tất cả các quyền được bảo lưu.
      </footer>
    </div>
  );
}
