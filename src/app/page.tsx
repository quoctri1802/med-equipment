import Link from "next/link";
import { ActivitySquare, ShieldCheck, QrCode, ArrowRight, ClipboardList, Thermometer, FlaskConical } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Laboratory Grid Background Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Cyber Glowing Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="px-6 lg:px-14 h-20 flex items-center border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2.5 group" href="/">
          <div className="p-2.5 bg-blue-600/10 rounded-2xl group-hover:bg-blue-600/20 transition-all border border-blue-500/20 shadow-inner">
            <FlaskConical className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
          <span className="font-black text-lg tracking-tight text-white hidden sm:block uppercase">
            LabEquip <span className="text-blue-500">Center</span>
          </span>
        </Link>
        
        <nav className="ml-auto flex gap-4 sm:gap-8 items-center">
          <Link
            className="text-xs font-bold uppercase tracking-wider hover:text-blue-400 transition-colors text-slate-350"
            href="/dashboard"
          >
            Bảng điều khiển
          </Link>
          
          <Link
            className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-550 hover:from-blue-700 hover:to-cyan-600 text-white px-5 py-2.5 rounded-2xl transition shadow-lg shadow-blue-500/15 hover:shadow-blue-500/35 border border-white/5 active:scale-95"
            href="/login"
          >
            Đăng nhập
          </Link>
        </nav>
      </header>

      {/* Split Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-6 lg:px-14 py-12 lg:py-20 z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column - Information */}
          <div className="lg:col-span-7 space-y-8 text-left animate-in fade-in slide-in-from-left-6 duration-1000">
            <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-[10px] font-black text-cyan-300 backdrop-blur-sm uppercase tracking-widest">
              <span className="flex w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-ping"></span>
              Hệ thống giám sát Lab v2.0
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Quản Lý Thiết Bị <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                  Khoa Xét Nghiệm
                </span>
              </h1>
              <h2 className="text-lg sm:text-xl font-bold text-slate-400 border-l-4 border-cyan-500 pl-3">
                TTYT Khu vực Liên Chiểu
              </h2>
            </div>
            
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Giải pháp số hóa toàn diện giúp giám sát, kiểm định, hiệu chuẩn QC và cập nhật nhật ký vận hành máy móc xét nghiệm tức thời qua mã QR. Đảm bảo độ chính xác tối đa và tuân thủ các quy chuẩn ISO phòng xét nghiệm y khoa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-550 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/15 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:scale-98"
              >
                Vào bảng điều khiển
                <ArrowRight className="w-4 h-4" />
              </Link>
              
            </div>
          </div>

          {/* Right Column - Lab 3D Graphic */}
          <div className="lg:col-span-5 flex justify-center items-center animate-in fade-in slide-in-from-right-6 duration-1000 delay-100">
            <div className="relative group w-full max-w-[460px]">
              {/* Background Glow Ring */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-20 blur-xl group-hover:opacity-30 transition-all duration-700 pointer-events-none" />
              
              {/* High-Tech Container */}
              <div className="relative p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-[2rem] backdrop-blur-md shadow-2xl shadow-blue-500/5 group-hover:border-cyan-500/20 transition-all duration-500">
                <div className="relative rounded-[1.5rem] overflow-hidden aspect-[16/9] border border-slate-950 shadow-inner">
                  {/* Hero Image */}
                  <img 
                    src="/lab_hero.jpg" 
                    alt="Phòng Lab Xét Nghiệm TTYT Liên Chiểu" 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  {/* Overlay scan line */}
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent h-1/2 w-full animate-[pulse_3s_infinite] pointer-events-none" />
                </div>
                
                {/* Tech specifications tag */}
                <div className="mt-3.5 flex items-center justify-between px-3 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    STATUS: SECURE
                  </span>
                  <span>QC COMPLIANCE OK</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto w-full text-left">
          {/* Card 1 */}
          <div className="bg-slate-900/30 border border-slate-900/80 hover:border-blue-500/20 p-8 rounded-[2rem] backdrop-blur-sm transition-all hover:bg-slate-900/60 duration-300 group shadow-sm hover:shadow-blue-500/5">
            <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform border border-blue-500/20 shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold mb-3 text-white uppercase tracking-wide">Quét QR & Báo lỗi nhanh</h3>
            <p className="text-slate-450 leading-relaxed text-xs font-medium">
              Tra cứu hồ sơ, lịch sử hiệu chuẩn, bảo trì máy và lập báo cáo sự cố ngay lập tức bằng điện thoại thông minh thông qua quét mã QR tích hợp trên máy xét nghiệm.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-slate-900/30 border border-slate-900/80 hover:border-cyan-500/20 p-8 rounded-[2rem] backdrop-blur-sm transition-all hover:bg-slate-900/60 duration-300 group shadow-sm hover:shadow-cyan-500/5">
            <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform border border-cyan-500/20 shadow-md">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold mb-3 text-white uppercase tracking-wide">Theo dõi Vận hành & QC</h3>
            <p className="text-slate-450 leading-relaxed text-xs font-medium">
              Theo dõi chi tiết cán bộ đang vận hành máy hoặc chịu trách nhiệm bảo quản, mục đích cụ thể, thời gian bàn giao và kỹ thuật viên phụ trách hiệu chuẩn QC.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/30 border border-slate-900/80 hover:border-indigo-500/20 p-8 rounded-[2rem] backdrop-blur-sm transition-all hover:bg-slate-900/60 duration-300 group shadow-sm hover:shadow-indigo-500/5">
            <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform border border-indigo-500/20 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold mb-3 text-white uppercase tracking-wide">Phân quyền chặt chẽ</h3>
            <p className="text-slate-450 leading-relaxed text-xs font-medium">
              Hệ thống phân quyền chi tiết cho Quản trị viên (Admin), Kỹ thuật viên bảo trì máy (Technician) và Nhân viên xét nghiệm vận hành thiết bị hàng ngày.
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-650 border-t border-slate-900/60 z-10 mt-auto bg-slate-950/40 backdrop-blur-md font-semibold">
        &copy; {new Date().getFullYear()} TTYT Khu vực Liên Chiểu - Khoa Xét nghiệm. Tất cả các quyền được bảo lưu.
      </footer>
    </div>
  );
}
