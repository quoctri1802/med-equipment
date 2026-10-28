import Link from "next/link";
import { ShieldCheck, QrCode, ArrowRight, ClipboardList, FlaskConical, MapPin, Phone, Mail, Smartphone, Lock, Clock } from "lucide-react";

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
        
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            href="/scanner"
          >
            <QrCode className="w-4 h-4" />
            <span>Quét QR</span>
          </Link>
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
              <Link
                href="/scanner"
                className="inline-flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm px-7 py-3.5 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 active:scale-98"
              >
                <QrCode className="w-4 h-4 text-cyan-400" />
                Quét mã QR thiết bị
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
      <footer className="relative bg-slate-950/90 border-t border-slate-900/80 text-slate-400 text-xs py-14 px-6 lg:px-14 backdrop-blur-xl z-10 mt-auto overflow-hidden">
        {/* Subtle Ambient Glow Effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 items-start">
          {/* Cột 1: Thương hiệu & Giới thiệu (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="p-3 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white rounded-2xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                <FlaskConical className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-white uppercase">
                    LabEquip <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Center</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-950/80 text-cyan-300 border border-cyan-500/30">
                    v2.5 Pro
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  Hệ thống số hóa trang thiết bị y tế
                </p>
              </div>
            </div>

            <div className="space-y-1 bg-slate-900/50 p-3.5 rounded-2xl border border-white/5">
              <p className="text-[12px] font-black text-white uppercase tracking-wider">
                Trung tâm Y tế khu vực Liên Chiểu
              </p>
              <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Khoa Xét Nghiệm • Chẩn đoán & Kiểm định
              </p>
            </div>

            <p className="text-slate-400 leading-relaxed font-medium text-[11px] max-w-md">
              Giải pháp số hóa toàn diện giúp giám sát tình trạng vận hành, kiểm định chất lượng IQC/EQC, hiệu chuẩn định kỳ và theo dõi trang thiết bị xét nghiệm y khoa theo chuẩn mực an toàn sinh học.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Hệ thống trực tuyến 24/7
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-950/50 text-cyan-300 border border-blue-500/30 shadow-sm">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Hỗ trợ PWA Mobile & Tablet
              </span>
            </div>
          </div>

          {/* Cột 2: Hỗ trợ kỹ thuật & Liên hệ (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-[11px] font-black uppercase text-white tracking-widest border-b border-slate-900 pb-2.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Hỗ trợ kỹ thuật & Trực ban 24/7
            </h4>

            {/* Hotline Highlight Card */}
            <div className="bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-transparent border border-blue-500/20 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Đường dây nóng kỹ thuật
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sẵn sàng
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <a
                    href="tel:0906440970"
                    className="font-mono font-black text-white hover:text-cyan-300 transition text-base tracking-wide"
                  >
                    0906.440.970
                  </a>
                  <p className="text-[10px] text-slate-400 font-medium">Bấm gọi hỗ trợ khẩn cấp</p>
                </div>
              </div>
            </div>

            <ul className="space-y-3 font-medium text-slate-400 text-[11px]">
              <li className="flex gap-2.5 items-start">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Trung tâm Y tế khu vực Liên Chiểu: 525 Tôn Đức Thắng, phường Hòa Khánh, TP. Đà Nẵng
                </span>
              </li>

              <li className="flex gap-2.5 items-center">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase">Email:</span>
                  <a href="mailto:tranquangvu230789@gmail.com" className="font-mono text-slate-300 hover:text-cyan-400 transition truncate">
                    tranquangvu230789@gmail.com
                  </a>
                </div>
              </li>

              <li className="pt-1 text-[10px] text-slate-500 italic">
                * Tiếp nhận báo cáo sự cố máy móc, phiếu bảo dưỡng & kiểm định hiệu chuẩn thiết bị.
              </li>
            </ul>
          </div>

          {/* Cột 3: Tiêu chuẩn kỹ thuật (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[11px] font-black uppercase text-white tracking-widest border-b border-slate-900 pb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tiêu chuẩn & Kiểm định
            </h4>
            <div className="space-y-2.5 font-medium">
              <div className="group flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">
                      ISO 15189:2022
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium truncate mt-0.5">
                    Quản lý chất lượng xét nghiệm y khoa
                  </p>
                </div>
              </div>

              <div className="group flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/5 transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">
                      QR IDENTIFIER
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-cyan-950 text-cyan-400 border border-cyan-800">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium truncate mt-0.5">
                    Tem định danh số hóa máy xét nghiệm
                  </p>
                </div>
              </div>

              <div className="group flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">
                      BẢO MẬT RBAC
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-indigo-950 text-indigo-400 border border-indigo-800">
                      SECURE
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium truncate mt-0.5">
                    Phân quyền đa tầng & kiểm soát truy cập
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="relative z-10 max-w-7xl mx-auto border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 font-bold text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>&copy; {new Date().getFullYear()} Trung tâm Y tế khu vực Liên Chiểu - Khoa Xét nghiệm. Bảo lưu mọi quyền.</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5">
            <span>Phát triển bởi</span>
            <span className="text-cyan-400 font-black">QUỐC TRÍ</span>
            <span className="text-slate-800">|</span>
            <span className="text-slate-400 font-medium normal-case">
              Hỗ trợ kỹ thuật: <strong className="font-mono text-slate-200">0906440970</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
