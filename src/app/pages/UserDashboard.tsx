import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp, SERVICE_CATALOG, SUBBAGS, SUBBAG_MASTER, Ticket, TicketStatus, JenisLaporan } from "../context";
import { StatusBadge } from "../components/Layout";
import ServiceChatbot from "../components/ServiceChatbot";
import TicketComments from "../components/TicketComments";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  User as UserIcon,
  ShieldCheck,
  Search,
  MessageSquare,
  FileSpreadsheet,
  Building
} from "lucide-react";

export default function UserDashboard() {
  const { currentUser, tickets, createTicket } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Selected ticket for the "Tiket Saya" view
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Form State
  const [jenis, setJenis] = useState<JenisLaporan>("Insiden");
  const [kategori, setKategori] = useState("");
  const [subLayanan, setSubLayanan] = useState("");
  const [detailLayanan, setDetailLayanan] = useState("");
  const [detailMasalah, setDetailMasalah] = useState("");
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);

  // Search & Filter in "Tiket Saya"
  const [statusFilter, setStatusFilter] = useState<"All" | "Aktif" | "Selesai" | "Kembalikan tiket ke operator">("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Get user tickets
  const myTickets = tickets.filter((t) => t.pengirimId === currentUser?.id);

  // Auto-route information
  const currentSubbagRoute = SUBBAGS[kategori] || null;

  // Sync selected ticket from list or fallback to the first one
  useEffect(() => {
    if (location.pathname === "/dashboard/tiket") {
      const queryParams = new URLSearchParams(location.search);
      const paramId = queryParams.get("id");
      if (paramId) {
        setSelectedTicketId(paramId);
      } else if (myTickets.length > 0 && !selectedTicketId) {
        setSelectedTicketId(myTickets[0].id);
      }
    }
  }, [location, myTickets]);

  if (!currentUser) return null;

  // Helper to get actual status from user's perspective
  const getDisplayStatusForUser = (t: Ticket) => {
    if (t.status === "Kembalikan tiket ke operator" && t.isRejectedBySubbag) {
      return "Pending";
    }
    return t.status;
  };

  // Statistics calculation
  const totalCount = myTickets.length;
  const pendingCount = myTickets.filter((t) => getDisplayStatusForUser(t) === "Pending").length;
  const activeCount = myTickets.filter((t) => {
    const s = getDisplayStatusForUser(t);
    return s === "Diterima" || s === "Ditugaskan" || s === "Dikerjakan" || s === "Dieskalasi";
  }).length;
  const completedCount = myTickets.filter((t) => getDisplayStatusForUser(t) === "Selesai").length;
  const rejectedCount = myTickets.filter((t) => getDisplayStatusForUser(t) === "Kembalikan tiket ke operator").length;

  // Cascading lists
  const activeCategoryNode = SERVICE_CATALOG.find((c) => c.category === kategori);
  const subLayananList = activeCategoryNode ? activeCategoryNode.subs : [];
  const activeSubNode = subLayananList.find((s) => s.name === subLayanan);
  const detailLayananList = activeSubNode ? activeSubNode.items : [];

  // Reset dependent fields on category changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKategori(e.target.value);
    setSubLayanan("");
    setDetailLayanan("");
  };

  const handleSubChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubLayanan(e.target.value);
    setDetailLayanan("");
  };

  // AI Chatbot Autofill recommendation
  const handleChatbotAutofill = (recCategory: string, recSub: string, recService: string) => {
    setKategori(recCategory);
    // Give state updates sequential or direct to allow cascading selectors to update
    setSubLayanan(recSub);
    setDetailLayanan(recService);
  };

  // Submit Report Form
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kategori || !subLayanan || !detailLayanan || !detailMasalah.trim()) {
      alert("Semua kolom form wajib diisi.");
      return;
    }

    try {
      const newId = createTicket(jenis, kategori, subLayanan, detailLayanan, detailMasalah.trim());
      setSuccessTicketId(newId);
      // Reset form
      setKategori("");
      setSubLayanan("");
      setDetailLayanan("");
      setDetailMasalah("");
    } catch (err: any) {
      alert(err.message || "Gagal mengirim laporan.");
    }
  };

  // FILTERED TICKETS FOR "TIKET SAYA" LIST
  const filteredTickets = myTickets.filter((t) => {
    const displayStatus = getDisplayStatusForUser(t);
    if (statusFilter === "Aktif") {
      if (displayStatus === "Selesai" || displayStatus === "Kembalikan tiket ke operator") return false;
    } else if (statusFilter === "Selesai") {
      if (displayStatus !== "Selesai") return false;
    } else if (statusFilter === "Kembalikan tiket ke operator") {
      if (displayStatus !== "Kembalikan tiket ke operator") return false;
    }

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        t.id.toLowerCase().includes(lowerSearch) ||
        t.layananKategori.toLowerCase().includes(lowerSearch) ||
        t.layanan.toLowerCase().includes(lowerSearch) ||
        t.detail.toLowerCase().includes(lowerSearch)
      );
    }

    return true;
  });

  const selectedTicket = myTickets.find((t) => t.id === selectedTicketId);

  // --- RENDER 1: HOME VIEW ---
  if (location.pathname === "/dashboard") {
    return (
      <div className="space-y-6">
        {/* Banner Welcome */}
        <div className="bg-gradient-to-r from-[#fefaec] to-[#fffbeb] rounded-2xl p-6 text-gray-800 shadow-sm border-l-4 border-[#b26d27] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#b26d27]/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <h1 className="text-xl md:text-2xl font-bold font-display leading-tight text-gray-900">
              Selamat Datang, {currentUser.name}
            </h1>
            <p className="text-xs md:text-sm text-gray-700 mt-1">
              Portal Layanan TI mempermudah Anda melaporkan kendala teknis dan permintaan layanan langsung ke Biro TI BPK RI.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e6ea] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#fcf4ec] text-[#b26d27] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Total Tiket</p>
              <h3 className="text-lg font-bold text-gray-800">{totalCount}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e6ea] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Menunggu</p>
              <h3 className="text-lg font-bold text-gray-800">{pendingCount}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e6ea] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#fefaec] text-[#b26d27] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Diproses</p>
              <h3 className="text-lg font-bold text-gray-800">{activeCount}</h3>
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
        </div>

        {/* Recent Tickets Table */}
        <div className="bg-white rounded-2xl border border-[#e2e6ea] shadow-xs overflow-hidden">
          <div className="p-4 md:p-5 border-b border-[#e2e6ea] flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-800 font-display">
                Tiket Terbaru Anda (5 Terakhir)
              </h3>
              <p className="text-xs text-gray-400">Status riwayat pelaporan Anda saat ini</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/tiket")}
              className="text-[#b26d27] hover:text-[#9b5a1b] text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Tiket Saya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {myTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-sm font-medium">Belum ada tiket yang dilaporkan.</p>
                <button
                  onClick={() => navigate("/dashboard/lapor")}
                  className="mt-2 text-xs bg-[#b26d27] text-white font-bold px-3 py-1.5 rounded-lg hover:bg-[#9b5a1b] transition-colors cursor-pointer"
                >
                  Buat Laporan Baru
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-500 font-bold text-[10px] tracking-wider uppercase font-mono border-b border-gray-100">
                    <th className="p-4 pl-6">ID Tiket</th>
                    <th className="p-4">Jenis / Kategori</th>
                    <th className="p-4">Layanan</th>
                    <th className="p-4">Tanggal Update</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {myTickets.slice(0, 5).map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-gray-800">{ticket.id}</td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900 block">{ticket.jenis}</span>
                        <span className="text-gray-400 text-[10px] block">{ticket.layananKategori}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-700 block truncate max-w-xs" title={ticket.layanan}>
                          {ticket.layanan}
                        </span>
                        <span className="text-gray-400 text-[10px] block truncate max-w-xs">{ticket.detail}</span>
                      </td>
                      <td className="p-4 text-gray-500 font-mono">{ticket.tanggalUpdate}</td>
                      <td className="p-4">
                        <StatusBadge status={getDisplayStatusForUser(ticket)} />
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => navigate(`/dashboard/tiket?id=${ticket.id}`)}
                          className="bg-slate-100 text-gray-700 hover:bg-[#fcf4ec] hover:text-[#b26d27] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 2: LAPOR VIEW (FORM + CHATBOT) ---
  if (location.pathname === "/dashboard/lapor") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chatbot */}
        <div className="lg:col-span-5 h-full">
          <div className="sticky top-20">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider font-mono">
                AI Virtual Assistant
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Tulis kendala Anda dalam bahasa natural di sini untuk mendapatkan rekomendasi kategori layanan secara instan.
              </p>
            </div>
            <ServiceChatbot onSelectRecommendation={handleChatbotAutofill} />
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          {successTicketId ? (
            /* Success screen */
            <div className="bg-white border border-[#e2e6ea] p-6 md:p-8 rounded-2xl shadow-sm text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-gray-800 font-display">Tiket Berhasil Dikirim</h2>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Laporan Anda telah berhasil masuk ke sistem Portal Layanan TI BPK RI dengan Nomor Tiket di bawah ini.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl font-mono text-center max-w-xs mx-auto">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ID TIKET</span>
                <span className="text-lg font-extrabold text-gray-800">{successTicketId}</span>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto">
                <button
                  onClick={() => {
                    setSuccessTicketId(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                >
                  Lapor Tiket Lain
                </button>
                <button
                  onClick={() => {
                    const ticketId = successTicketId;
                    setSuccessTicketId(null);
                    navigate(`/dashboard/tiket?id=${ticketId}`);
                  }}
                  className="bg-[#b26d27] hover:bg-[#9b5a1b] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Lihat Tiket Saya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Normal Form Form */
            <div className="bg-white border border-[#e2e6ea] p-5 md:p-6 rounded-2xl shadow-xs">
              <div className="border-b border-gray-100 pb-4 mb-5">
                <h3 className="text-sm md:text-base font-bold text-gray-800 font-display flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#b26d27]" />
                  <span>Formulir Laporan Layanan TI</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Isi formulir berikut untuk mengirim laporan kendala atau permintaan Anda.
                </p>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                {/* Jenis Laporan (Radio) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Jenis Laporan
                  </label>
                  <div className="flex gap-3">
                    {["Insiden", "Permintaan", "Masalah"].map((type) => (
                      <label
                        key={type}
                        className={`flex-1 border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${jenis === type
                          ? "border-[#b26d27] bg-[#fcf4ec]/30 ring-1 ring-[#b26d27] text-[#b26d27]"
                          : "border-gray-200 bg-white hover:bg-slate-50 text-gray-600"
                          }`}
                      >
                        <input
                          type="radio"
                          name="jenisLaporan"
                          value={type}
                          checked={jenis === type}
                          onChange={() => setJenis(type as any)}
                          className="sr-only"
                        />
                        <span className="text-xs font-bold">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level 1 Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Kategori (Level 1)
                  </label>
                  <select
                    value={kategori}
                    onChange={handleCategoryChange}
                    className="w-full bg-slate-50 border border-[#e2e6ea] focus:border-[#b26d27] focus:bg-white text-gray-800 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all font-medium"
                    required
                  >
                    <option value="">-- Pilih Kategori Layanan --</option>
                    {SERVICE_CATALOG.map((item) => (
                      <option key={item.category} value={item.category}>
                        {item.category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level 2 Selector (appears conditionally) */}
                {kategori && (
                  <div className="animate-in slide-in-from-top-1.5 duration-200">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Sub-Layanan (Level 2)
                    </label>
                    <select
                      value={subLayanan}
                      onChange={handleSubChange}
                      className="w-full bg-slate-50 border border-[#e2e6ea] focus:border-[#b26d27] focus:bg-white text-gray-800 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all font-medium"
                      required
                    >
                      <option value="">-- Pilih Sub-Layanan --</option>
                      {subLayananList.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Level 3 Selector (appears conditionally) */}
                {subLayanan && (
                  <div className="animate-in slide-in-from-top-1.5 duration-200">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Detail Layanan Spesifik (Level 3)
                    </label>
                    <select
                      value={detailLayanan}
                      onChange={(e) => setDetailLayanan(e.target.value)}
                      className="w-full bg-slate-50 border border-[#e2e6ea] focus:border-[#b26d27] focus:bg-white text-gray-800 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all font-medium"
                      required
                    >
                      <option value="">-- Pilih Detail Layanan --</option>
                      {detailLayananList.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Auto Routing Banner */}
                {kategori && currentSubbagRoute && (
                  <div className="bg-[#fcf4ec]/50 border border-[#f7e3ce] rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-300">
                    <Info className="w-4.5 h-4.5 text-[#b26d27] mt-0.5 shrink-0" />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-gray-600 block uppercase tracking-wider text-[9px] font-mono">
                        Tujuan Kasubbag (Auto-Routed)
                      </span>
                      <span className="font-semibold text-gray-800 block mt-0.5">
                        {currentSubbagRoute.name}
                      </span>
                      <span className="text-gray-400 block mt-0.5 text-[10px]">
                        Tiket Anda akan diteruskan otomatis sesuai pemetaan subbagian layanan TI.
                      </span>
                    </div>
                  </div>
                )}

                {/* Textarea Detail Masalah */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Detail Masalah / Deskripsi Permintaan (Maks 2000 Karakter)
                  </label>
                  <textarea
                    value={detailMasalah}
                    onChange={(e) => setDetailMasalah(e.target.value.slice(0, 2000))}
                    rows={5}
                    placeholder="Tuliskan kendala Anda secara lengkap di sini. Contoh: nomor HP verifikasi tidak aktif sehingga tidak bisa menerima kode OTP reset password..."
                    className="w-full bg-slate-50 border border-[#e2e6ea] focus:border-[#b26d27] focus:bg-white text-gray-800 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all resize-none"
                    required
                  ></textarea>
                  <div className="text-right text-[10px] text-gray-400 font-mono mt-1">
                    {detailMasalah.length}/2000 karakter
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-[#b26d27] hover:bg-[#9b5a1b] text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Laporan Tiket</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER 3: TIKET SAYA VIEW (SPLIT LAYOUT) ---
  if (location.pathname === "/dashboard/tiket") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Ticket List & Filters */}
        <div className="lg:col-span-4 bg-white border border-[#e2e6ea] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[650px]">
          {/* Header & Search */}
          <div className="p-4 border-b border-gray-100 bg-white space-y-3 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-gray-800 font-display">Daftar Tiket Saya</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Kelola pelacakan tiket Anda di sini</p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari ID, kategori, detail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#b26d27] focus:bg-white text-gray-700"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 overflow-x-auto pb-1 scroll-thin">
              {["All", "Aktif", "Selesai"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter as any)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all cursor-pointer ${statusFilter === filter
                    ? "bg-[#b26d27] text-white"
                    : "bg-slate-50 border border-slate-200 text-gray-500 hover:bg-slate-100"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Scrolling list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 scroll-thin bg-slate-50/50">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                Tidak ada tiket yang cocok dengan filter.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = ticket.id === selectedTicketId;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full p-3.5 text-left transition-all block cursor-pointer ${isSelected
                      ? "bg-white border-l-4 border-[#b26d27] shadow-xs"
                      : "bg-transparent hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span className="font-mono font-bold text-xs text-gray-800">{ticket.id}</span>
                      <StatusBadge status={getDisplayStatusForUser(ticket)} />
                    </div>
                    <h4 className="text-xs font-semibold text-gray-900 truncate">{ticket.layanan}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 truncate leading-relaxed">{ticket.detail}</p>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 font-mono">
                      <span>{ticket.jenis}</span>
                      <span>{ticket.tanggalUpdate}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Ticket Detail View */}
        <div className="lg:col-span-8 bg-white border border-[#e2e6ea] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[650px]">
          {selectedTicket ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 md:p-5 border-b border-[#e2e6ea] bg-slate-50 shrink-0 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm md:text-base text-gray-900">
                      {selectedTicket.id}
                    </span>
                    <span className="text-[10px] bg-white border border-gray-200 font-bold px-2 py-0.5 rounded-md text-gray-500 uppercase font-mono">
                      {selectedTicket.jenis}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">Dilaporkan pada: {selectedTicket.tanggal}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">Status Tiket:</span>
                  <StatusBadge status={getDisplayStatusForUser(selectedTicket)} />
                </div>
              </div>

              {/* Scrolling Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 scroll-thin">
                {/* Resolution Alert Box (KOTAK BIRU) */}
                {selectedTicket.catatanKasubbag && (
                  <div className="bg-sky-50 border border-sky-200 text-sky-950 rounded-xl p-4 space-y-1.5 animate-in fade-in duration-300">
                    <h4 className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-sky-600" />
                      <span>Catatan Penyelesaian dari Kasubbag / Solver</span>
                    </h4>
                    <p className="text-xs leading-relaxed font-medium">
                      {selectedTicket.catatanKasubbag}
                    </p>
                    {selectedTicket.tanggalSelesai && (
                      <div className="text-[10px] text-sky-500 font-mono pt-1">
                        Diselesaikan pada: {selectedTicket.tanggalSelesai}
                      </div>
                    )}
                  </div>
                )}

                {/* Rejection Alert Box (KOTAK MERAH) */}
                {selectedTicket.alasanTolak && !selectedTicket.isRejectedBySubbag && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-950 rounded-xl p-4 space-y-1.5 animate-in fade-in duration-300">
                    <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Alasan Kembalikan tiket ke operator dari Kasubbag</span>
                    </h4>
                    <p className="text-xs leading-relaxed font-medium">
                      {selectedTicket.alasanTolak}
                    </p>
                  </div>
                )}

                {/* Ticket Details Info */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-b border-gray-200/50 pb-3.5">
                    <div>
                      <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Kategori Layanan (Level 1)</div>
                      <div className="text-gray-950 font-bold mt-0.5">{selectedTicket.layananKategori}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Sub-Layanan (Level 2)</div>
                      <div className="text-gray-950 font-bold mt-0.5">{selectedTicket.layananSub}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Detail Layanan Spesifik (Level 3)</div>
                      <div className="text-gray-950 font-extrabold mt-0.5 text-sm">{selectedTicket.layanan}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono mb-1">
                      Deskripsi Detail Masalah
                    </h4>
                    <p className="text-xs text-gray-800 leading-relaxed bg-white p-3.5 border border-slate-150 rounded-lg whitespace-pre-wrap">
                      {selectedTicket.detail}
                    </p>
                  </div>

                  {/* Routing & Solver Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1.5">
                    <div className="bg-white border border-gray-100 p-3 rounded-lg flex items-start gap-2 text-xs">
                      <Building className="w-4 h-4 text-[#b26d27] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono block">Subbagian Penanggungjawab</span>
                        <span className="font-semibold text-gray-800 block mt-0.5">{SUBBAG_MASTER[selectedTicket.kasubbagId]}</span>
                        <span className="text-[11px] text-gray-500 block">Kasubbag: {selectedTicket.kasubbagName}</span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-100 p-3 rounded-lg flex items-start gap-2 text-xs">
                      <UserIcon className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono block">Petugas Penanganan (Solver)</span>
                        {selectedTicket.solverId ? (
                          <span className="font-semibold text-gray-800 block mt-0.5">
                            {selectedTicket.solverName}
                          </span>
                        ) : (
                          <span className="text-gray-400 block mt-0.5 italic">
                            {getDisplayStatusForUser(selectedTicket) === "Pending" ? "Menunggu Verifikasi Kasubbag" : "Belum Ditugaskan ke Solver"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Thread */}
                <div className="border-t border-gray-100 pt-5">
                  <TicketComments ticketId={selectedTicket.id} comments={selectedTicket.comments} />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs p-6 flex-col space-y-2">
              <Layers className="w-10 h-10 text-gray-200" />
              <span>Silakan pilih tiket dari panel sebelah kiri untuk melihat detail.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
