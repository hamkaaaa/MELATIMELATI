import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp, USERS, SUBBAG_MASTER, Ticket, TicketStatus, JenisLaporan } from "../context";
import { StatusBadge } from "../components/Layout";
import TicketComments from "../components/TicketComments";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Search,
  Layers,
  Inbox,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User as UserIcon,
  Clock,
  Building,
  HelpCircle,
  Users,
  Percent,
  Calendar,
  RefreshCw,
  Info
} from "lucide-react";

export default function OperatorDashboard() {
  const { tickets, currentUser, operatorReassign } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Search, Filter and Detail page in "Semua Tiket"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [jenisFilter, setJenisFilter] = useState("All");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newSubbagId, setNewSubbagId] = useState("");

  React.useEffect(() => {
    if (selectedTicketId) {
      const t = tickets.find((tk) => tk.id === selectedTicketId);
      if (t) {
        setNewSubbagId(t.kasubbagId);
      }
    }
  }, [selectedTicketId, tickets]);

  // --- STATS CALCULATION ---
  const total = tickets.length;
  const openCount = tickets.filter(
    (t) => t.status !== "Selesai" && (t.status !== "Kembalikan tiket ke operator" || t.isRejectedBySubbag)
  ).length;
  const completedCount = tickets.filter((t) => t.status === "Selesai").length;
  const rejectedCount = tickets.filter((t) => t.status === "Kembalikan tiket ke operator" && !t.isRejectedBySubbag).length;
  const escalatedCount = tickets.filter((t) => t.status === "Dieskalasi").length;

  // KPIs
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejectedCount / total) * 100) : 0;
  const totalUsersCount = USERS.length; // 21 users in seed list

  // Donut Chart data (Distribution of Jenis)
  const insidenCount = tickets.filter((t) => t.jenis === "Insiden").length;
  const permintaanCount = tickets.filter((t) => t.jenis === "Permintaan").length;
  const masalahCount = tickets.filter((t) => t.jenis === "Masalah").length;

  const donutData = [
    { name: "Insiden", value: insidenCount, color: "#b26d27" },
    { name: "Permintaan", value: permintaanCount, color: "#3b82f6" },
    { name: "Masalah", value: masalahCount, color: "#8b5cf6" }
  ];

  // Bar Chart data per subbag
  const subbagStats = Object.keys(SUBBAG_MASTER).map((key) => {
    const name = SUBBAG_MASTER[key];
    const subTickets = tickets.filter((t) => t.kasubbagId === key);
    const selesai = subTickets.filter((t) => t.status === "Selesai").length;
    const terbuka = subTickets.filter((t) => t.status !== "Selesai" && (t.status !== "Kembalikan tiket ke operator" || t.isRejectedBySubbag)).length;
    const ditolak = subTickets.filter((t) => t.status === "Kembalikan tiket ke operator" && !t.isRejectedBySubbag).length;
    return {
      key,
      name: name.replace("Subbagian ", "Subbag ").replace("Pengelolaan ", ""),
      selesai,
      terbuka,
      ditolak,
      total: subTickets.length
    };
  });

  // Open & Closed tickets for lists
  const openTicketsList = tickets.filter((t) => t.status !== "Selesai" && (t.status !== "Kembalikan tiket ke operator" || t.isRejectedBySubbag));
  const closedTicketsList = tickets.filter((t) => t.status === "Selesai" || (t.status === "Kembalikan tiket ke operator" && !t.isRejectedBySubbag));

  // Filter "Semua Tiket" list
  const filteredTickets = tickets.filter((t) => {
    // Status filter
    if (statusFilter !== "All") {
      if (statusFilter === "Kembalikan tiket ke operator Kasubbag") {
        if (t.status !== "Kembalikan tiket ke operator" || !t.isRejectedBySubbag) return false;
      } else if (statusFilter === "Kembalikan tiket ke operator") {
        if (t.status !== "Kembalikan tiket ke operator" || t.isRejectedBySubbag) return false;
      } else {
        if (t.status !== statusFilter) return false;
      }
    }
    // Jenis filter
    if (jenisFilter !== "All" && t.jenis !== jenisFilter) return false;

    // Search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        t.id.toLowerCase().includes(lowerSearch) ||
        t.pengirimName.toLowerCase().includes(lowerSearch) ||
        t.layanan.toLowerCase().includes(lowerSearch) ||
        t.detail.toLowerCase().includes(lowerSearch)
      );
    }
    return true;
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  // --- RENDER 1: OVERVIEW DASHBOARD ---
  if (location.pathname === "/operator") {
    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e6ea] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#fcf4ec] text-[#b26d27] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Total Tiket</p>
              <h3 className="text-lg font-bold text-gray-800">{total}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e6ea] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Terbuka / Aktif</p>
              <h3 className="text-lg font-bold text-gray-800">{openCount}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e6ea] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Selesai</p>
              <h3 className="text-lg font-bold text-gray-800">{completedCount}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e6ea] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Kembalikan tiket ke operator</p>
              <h3 className="text-lg font-bold text-gray-800">{rejectedCount}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e6ea] col-span-2 lg:col-span-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Eskalasi Solver</p>
              <h3 className="text-lg font-bold text-gray-800">{escalatedCount}</h3>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Chart Distribution */}
          <div className="bg-white border border-[#e2e6ea] p-5 rounded-2xl shadow-xs lg:col-span-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 font-display">Distribusi Jenis Laporan</h3>
              <p className="text-xs text-gray-400">Rasio Insiden vs Permintaan vs Masalah</p>
            </div>
            <div className="h-[180px] flex items-center justify-center my-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Tiket`, "Jumlah"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-3 border-t border-gray-100 text-[11px] font-medium text-center">
              {donutData.map((d) => (
                <div key={d.name} className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: d.color }}></span>
                    <span className="text-gray-500 font-semibold">{d.name}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-800">{d.value} tkt</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart Subbags progress */}
          <div className="bg-white border border-[#e2e6ea] p-5 rounded-2xl shadow-xs lg:col-span-8 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-sm font-bold text-gray-800 font-display">Status per Subbagian Biro TI</h3>
              <p className="text-xs text-gray-400">Total volume laporan aktif dan terselesaikan per subbag</p>
            </div>
            <div className="h-[220px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subbagStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="selesai" name="Selesai" fill="#10b981" stackId="a" />
                  <Bar dataKey="terbuka" name="Terbuka" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="ditolak" name="Kembalikan tiket ke operator" fill="#ef4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Overview Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table Open/Active Tickets */}
          <div className="bg-white border border-[#e2e6ea] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Daftar Tiket Terbuka / Aktif ({openTicketsList.length})</span>
              </h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto scroll-thin">
              {openTicketsList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium">
                  Tidak ada tiket terbuka saat ini. Semua terselesaikan!
                </div>
              ) : (
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="p-3 pl-4">ID</th>
                      <th className="p-3">Pelapor</th>
                      <th className="p-3">Layanan</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {openTicketsList.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-4 font-mono font-bold text-gray-800">{t.id}</td>
                        <td className="p-3 font-semibold text-gray-700">{t.pengirimName}</td>
                        <td className="p-3 truncate max-w-[150px]" title={t.layanan}>{t.layanan}</td>
                        <td className="p-3"><StatusBadge status={t.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Table Completed/Rejected Tickets */}
          <div className="bg-white border border-[#e2e6ea] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Riwayat Tiket Selesai / Kembalikan tiket ke operator ({closedTicketsList.length})</span>
              </h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto scroll-thin">
              {closedTicketsList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium">
                  Belum ada tiket yang selesai atau dikembalikan ke operator.
                </div>
              ) : (
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                      <th className="p-3 pl-4">ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Catatan Penyelesaian / Kembalikan tiket ke operator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {closedTicketsList.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-4 font-mono font-bold text-gray-800">{t.id}</td>
                        <td className="p-3"><StatusBadge status={t.status} /></td>
                        <td className="p-3 text-gray-600 leading-relaxed truncate max-w-[200px]" title={t.catatanKasubbag || t.alasanTolak}>
                          {t.catatanKasubbag || t.alasanTolak}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 2: SEMUA TIKET VIEW (WITH READ-ONLY MESSAGES) ---
  if (location.pathname === "/operator/tiket") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Query List */}
        <div className="lg:col-span-8 bg-white border border-[#e2e6ea] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[650px]">
          {/* Header & filters */}
          <div className="p-4 border-b border-gray-100 space-y-3 bg-white shrink-0">
            <div>
              <h3 className="text-sm font-bold text-gray-800 font-display">Semua Tiket Biro TI</h3>
              <p className="text-xs text-gray-400">Pusat pencarian, monitoring, dan audit seluruh subbagian</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* Search */}
              <div className="relative sm:col-span-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari ID, pelapor, sub-kategori, detail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#b26d27] text-gray-700 placeholder-gray-400 font-medium"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b26d27] text-gray-700 font-semibold sm:col-span-7"
              >
                <option value="All">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Diterima">Diterima</option>
                <option value="Ditugaskan">Ditugaskan</option>
                <option value="Dikerjakan">Dikerjakan</option>
                <option value="Dieskalasi">Dieskalasi</option>
                <option value="Selesai">Selesai</option>
                <option value="Kembalikan tiket ke operator">Kembalikan tiket ke operator (Final)</option>
                <option value="Kembalikan tiket ke operator Kasubbag">Kembalikan tiket ke operator Kasubbag (Reassign)</option>
              </select>
            </div>
          </div>

          {/* List Table */}
          <div className="flex-1 overflow-y-auto scroll-thin">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs">
                Tidak ada tiket yang ditemukan dengan filter pencarian tersebut.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] font-mono border-b border-gray-100">
                    <th className="p-3.5 pl-5">ID</th>
                    <th className="p-3.5">Pelapor</th>
                    <th className="p-3.5">Subbag Tujuan</th>
                    <th className="p-3.5">Layanan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.map((t) => {
                    const isSelected = t.id === selectedTicketId;
                    return (
                      <tr
                        key={t.id}
                        className={`transition-colors hover:bg-slate-50/50 ${isSelected ? "bg-[#fcf4ec]/20" : ""}`}
                      >
                        <td className="p-3.5 pl-5 font-mono font-bold text-gray-800">{t.id}</td>
                        <td className="p-3.5 font-semibold text-gray-700">{t.pengirimName}</td>
                        <td className="p-3.5 font-medium text-gray-500">
                          {SUBBAG_MASTER[t.kasubbagId]?.replace("Subbagian ", "Subbag ")}
                        </td>
                        <td className="p-3.5 truncate max-w-[160px]" title={t.layanan}>{t.layanan}</td>
                        <td className="p-3.5">
                          <StatusBadge status={t.status === "Kembalikan tiket ke operator" && t.isRejectedBySubbag ? "Kembalikan tiket ke operator Kasubbag" : t.status} />
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => setSelectedTicketId(t.id)}
                            className="bg-slate-100 text-gray-700 hover:bg-[#fcf4ec] hover:text-[#b26d27] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Panel: Read-Only Detail */}
        <div className="lg:col-span-4 bg-white border border-[#e2e6ea] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[650px]">
          {selectedTicket ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-[#e2e6ea] bg-slate-50 shrink-0 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-gray-900">{selectedTicket.id}</span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5">Pengirim: {selectedTicket.pengirimName}</p>
                </div>
                <StatusBadge status={selectedTicket.status === "Kembalikan tiket ke operator" && selectedTicket.isRejectedBySubbag ? "Kembalikan tiket ke operator Kasubbag" : selectedTicket.status} />
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-thin">
                {/* Resolution alert block */}
                {selectedTicket.catatanKasubbag && (
                  <div className="bg-sky-50 border border-sky-150 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider block font-mono">Catatan Solusi</span>
                    <p className="text-xs text-sky-950 font-medium leading-relaxed">{selectedTicket.catatanKasubbag}</p>
                  </div>
                )}

                {/* Rejection alert block */}
                {selectedTicket.alasanTolak && (
                  <div className="bg-rose-50 border border-rose-150 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wider block font-mono">Alasan Kembalikan tiket ke operator</span>
                    <p className="text-xs text-rose-950 font-medium leading-relaxed">{selectedTicket.alasanTolak}</p>
                  </div>
                )}

                {/* Standard Detail card */}
                <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-xs border border-slate-100">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Kategori</span>
                    <span className="text-gray-800 font-bold block mt-0.5">{selectedTicket.layananKategori}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Layanan</span>
                    <span className="text-gray-800 font-bold block mt-0.5">{selectedTicket.layanan}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Subbagian</span>
                    <span className="text-gray-800 font-medium block mt-0.5 leading-tight">{SUBBAG_MASTER[selectedTicket.kasubbagId]}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Solver Penanganan</span>
                    <span className="text-gray-800 font-bold block mt-0.5">{selectedTicket.solverId ? selectedTicket.solverName : "Belum ada"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Detail Laporan Masalah</span>
                  <p className="text-xs text-gray-800 leading-relaxed bg-slate-50 p-3 border border-slate-100 rounded-lg whitespace-pre-wrap mt-1">
                    {selectedTicket.detail}
                  </p>
                </div>

                {/* Reassignment Section */}
                {selectedTicket.status === "Kembalikan tiket ke operator" && selectedTicket.isRejectedBySubbag && (
                  <div className="bg-[#fcf4ec] border border-[#f7e3ce] p-4 rounded-xl space-y-3 animate-in slide-in-from-bottom duration-300">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4 text-[#b26d27] animate-spin-slow" />
                        <span>Penugasan Ulang Subbagian (Reassign)</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                        Tiket ini dikembalikan ke operator oleh subbag sebelumnya. Silakan alihkan secara manual ke subbagian lain yang sesuai agar dapat diproses kembali.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <select
                        value={newSubbagId || selectedTicket.kasubbagId}
                        onChange={(e) => setNewSubbagId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-[#b26d27] text-gray-700 font-semibold"
                      >
                        {Object.entries(SUBBAG_MASTER).map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (!currentUser) return;
                          operatorReassign(selectedTicket.id, newSubbagId || selectedTicket.kasubbagId, currentUser);
                          alert(`Sukses mengalihkan Tiket ${selectedTicket.id} ke subbagian baru.`);
                        }}
                        className="w-full bg-[#b26d27] hover:bg-[#9b5a1b] text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Tugaskan Ulang
                      </button>
                    </div>
                  </div>
                )}

                {/* Comment history thread (Read only) */}
                <div className="border-t border-gray-100 pt-4">
                  <TicketComments ticketId={selectedTicket.id} comments={selectedTicket.comments} />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs p-6 flex-col space-y-2">
              <Layers className="w-10 h-10 text-gray-200" />
              <span>Silakan pilih tiket di panel kiri untuk melihat ringkasan detail & log audit aktivitas.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER 3: ANALITIK VIEW ---
  if (location.pathname === "/operator/analitik") {
    return (
      <div className="space-y-6">
        {/* KPI Cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e2e6ea] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Rerata Penyelesaian</p>
              <h3 className="text-xl font-black text-gray-800">4.5 Jam</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Sesuai Service Level Agreement</p>
            </div>
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e2e6ea] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Tingkat Penyelesaian</p>
              <h3 className="text-xl font-black text-gray-800">{completionRate}%</h3>
              <p className="text-[10px] text-gray-400 font-semibold">{completedCount} dari {total} tiket sukses</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e2e6ea] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Tingkat Kembalikan tiket ke operator</p>
              <h3 className="text-xl font-black text-gray-800">{rejectionRate}%</h3>
              <p className="text-[10px] text-gray-400 font-semibold">{rejectedCount} laporan dikembalikan ke operator</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e2e6ea] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Pegawai Terdaftar</p>
              <h3 className="text-xl font-black text-gray-800">{totalUsersCount} Pengguna</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Multi-role login system BPK RI</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Breakdown details panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subbag table metrics */}
          <div className="bg-white border border-[#e2e6ea] p-5 rounded-2xl shadow-xs">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h4 className="text-sm font-bold text-gray-800 font-display">Tabel Rincian Kinerja Subbagian</h4>
              <p className="text-xs text-gray-400">Statistik absolut selesai, terbuka, dan total volume tiket</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] font-mono border-b border-gray-100">
                    <th className="p-3">Nama Subbagian TI</th>
                    <th className="p-3 text-center">Selesai</th>
                    <th className="p-3 text-center">Terbuka</th>
                    <th className="p-3 text-center">Kembalikan tiket ke operator</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subbagStats.map((s) => (
                    <tr key={s.key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-gray-800 leading-tight">
                        {s.name}
                      </td>
                      <td className="p-3 text-center text-emerald-600 font-bold">{s.selesai}</td>
                      <td className="p-3 text-center text-blue-600 font-bold">{s.terbuka}</td>
                      <td className="p-3 text-center text-rose-600 font-bold">{s.ditolak}</td>
                      <td className="p-3 text-right font-bold text-gray-900">{s.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Type ratios and custom graphs */}
          <div className="bg-white border border-[#e2e6ea] p-5 rounded-2xl shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-800 font-display">Rasio Jenis Laporan Masuk</h4>
              <p className="text-xs text-gray-400">Analisis persentase kontribusi per kategori utama laporan</p>
            </div>

            <div className="space-y-5 my-6">
              {/* Insiden bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#b26d27] block"></span>
                    Insiden TI (Kendala Teknis)
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {insidenCount} Tiket ({total > 0 ? Math.round((insidenCount / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#b26d27] h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (insidenCount / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Permintaan bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span>
                    Permintaan Layanan (Layanan / Akun)
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {permintaanCount} Tiket ({total > 0 ? Math.round((permintaanCount / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (permintaanCount / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Masalah bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block"></span>
                    Masalah Sistem (Error Database/Sistemik)
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {masalahCount} Tiket ({total > 0 ? Math.round((masalahCount / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-50 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (masalahCount / total) * 100 : 0}%`, backgroundColor: "#8b5cf6" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-[#fcf4ec] border border-[#f7e3ce] p-3.5 rounded-xl text-xs text-amber-950 flex items-start gap-2 leading-relaxed">
              <Info className="w-4.5 h-4.5 text-[#b26d27] shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Analisis:</strong> Distribusi data di atas adalah performa operasional gabungan 8 Subbagian Biro TI BPK RI. Seluruh volume laporan ter-routing secara otomatis menggunakan engine pemetaan kategori.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
