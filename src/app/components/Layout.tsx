import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp, SUBBAG_MASTER } from "../context";
import {
  Home,
  FileText,
  Layers,
  Inbox,
  CheckSquare,
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  LogOut,
  User as UserIcon,
  HelpCircle,
  Clock,
  ShieldCheck,
  Building,
  Menu,
  X,
  AlertTriangle
} from "lucide-react";

// --- STATUS BADGE COMPONENT ---
interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let bg = "bg-gray-100 text-gray-800";

  switch (status) {
    case "Pending":
      bg = "bg-[#fef3c7] text-[#92400e] border border-[#fde8d0]";
      break;
    case "Diterima":
      bg = "bg-[#fefaec] text-[#78430e] border border-[#e8ceab]";
      break;
    case "Ditugaskan":
      bg = "bg-[#ede9fe] text-[#5b21b6] border border-[#ddd6fe]";
      break;
    case "Dikerjakan":
      bg = "bg-[#fce7f3] text-[#9d174d] border border-[#fbcfe8]";
      break;
    case "Dieskalasi":
      bg = "bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa]";
      break;
    case "Selesai":
      bg = "bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]";
      break;
    case "Kembalikan tiket ke operator":
      bg = "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]";
      break;
    case "Kembalikan tiket ke operator Kasubbag":
      bg = "bg-[#ffedd5] text-[#b45309] border border-[#fde68a]";
      break;
    case "Eskalasi":
      bg = "bg-[#fef3c7] text-[#92400e] border border-[#fde8d0]";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${bg}`}>
      {status}
    </span>
  );
}

// --- MAIN LAYOUT COMPONENT ---
interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentUser, logout, dbError } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!currentUser) {
    return <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">{children}</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Define navigation items based on User Role
  const navItems: { label: string; path: string; icon: React.ReactNode }[] = [];

  if (currentUser.role === "pengguna") {
    navItems.push(
      { label: "Home", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Lapor Insiden/Layanan", path: "/dashboard/lapor", icon: <FileText className="w-5 h-5" /> },
      { label: "Tiket Saya", path: "/dashboard/tiket", icon: <Layers className="w-5 h-5" /> }
    );
  } else if (currentUser.role === "kasubbag") {
    navItems.push(
      { label: "Inbox Tiket", path: "/kasubbag", icon: <Inbox className="w-5 h-5" /> }
    );
  } else if (currentUser.role === "solver") {
    navItems.push(
      { label: "Tugas Saya", path: "/solver", icon: <CheckSquare className="w-5 h-5" /> }
    );
  } else if (currentUser.role === "operator") {
    navItems.push(
      { label: "Overview", path: "/operator", icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: "Semua Tiket", path: "/operator/tiket", icon: <FileSpreadsheet className="w-5 h-5" /> },
      { label: "Analitik", path: "/operator/analitik", icon: <BarChart3 className="w-5 h-5" /> }
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "pengguna": return "Pegawai (Pelapor)";
      case "kasubbag": return "Kasubbag TI";
      case "solver": return "Solver TI";
      case "operator": return "Operator Biro TI";
      default: return role;
    }
  };

  const getSubbagName = (subbagId?: string) => {
    if (!subbagId) return "";
    return SUBBAG_MASTER[subbagId] || "";
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#fefaec] text-gray-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#e4cbab] flex items-center gap-3">
        <div className="w-10 h-10 bg-[#b26d27] rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
          BPK
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight font-display text-gray-900">Portal Layanan TI</h1>
          <p className="text-[10px] text-gray-600 font-mono font-semibold">BIRO TI BPK RI</p>
        </div>
      </div>

      {/* User Card */}
      <div className="p-4 mx-3 my-4 bg-[#fffbeb]/60 border border-[#e8ceab]/80 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f7e3ce] text-[#b26d27] flex items-center justify-center font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold truncate text-gray-900">{currentUser.name}</h2>
            <p className="text-xs text-[#b26d27] font-medium">{getRoleDisplayName(currentUser.role)}</p>
          </div>
        </div>
        {currentUser.subbagId && (
          <div className="mt-3 pt-2.5 border-t border-[#e8ceab]/60 flex items-start gap-1.5 text-[11px] text-gray-700">
            <Building className="w-3.5 h-3.5 mt-0.5 text-gray-500 shrink-0" />
            <span className="leading-tight truncate" title={getSubbagName(currentUser.subbagId)}>
              {getSubbagName(currentUser.subbagId)}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-[#b26d27] text-white"
                  : "text-[#78430e] hover:bg-[#e4cbab] hover:text-[#78430e]"
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / Logout */}
      <div className="p-4 border-t border-[#e4cbab]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">
      {/* Desktop Sidebar (224px width) */}
      <aside className="hidden md:flex md:w-[224px] md:flex-col md:fixed md:inset-y-0 shadow-lg z-20">
        {sidebarContent}
      </aside>

      {/* Main Container */}
      <div className="flex-1 md:pl-[224px] flex flex-col">
        {/* Header / Top Bar */}
        <header className="sticky top-0 bg-white border-b border-[#e2e6ea] h-16 flex items-center justify-between px-4 md:px-6 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <span className="text-[11px] font-bold text-[#b26d27] uppercase tracking-wider font-mono">
                Sistem Manajemen Tiket Terpadu
              </span>
              <h2 className="text-sm md:text-base font-semibold text-gray-800">
                {currentUser.role === "pengguna" && "Portal Pegawai BPK"}
                {currentUser.role === "kasubbag" && "Portal Kasubbag TI"}
                {currentUser.role === "solver" && "Portal Solver TI"}
                {currentUser.role === "operator" && "Portal Operator & Analitik"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-[#b26d27]" />
              <span>Sesi Aktif: {currentUser.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700 font-semibold hidden sm:inline">{currentUser.name}</span>
              <div className="w-8 h-8 rounded-full bg-[#fcf4ec] border border-[#f7e3ce] text-[#b26d27] flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative flex flex-col w-[240px] max-w-xs bg-[#fefaec] text-gray-800 animate-in slide-in-from-left duration-200">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800 rounded-lg cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              {sidebarContent}
            </div>
          </div>
        )}

        {dbError && (
          <div className="mx-4 md:mx-6 mt-4 md:mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-3">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 mb-0.5">Database Offline (Mode Simulasi Aktif)</p>
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">{dbError}</p>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
