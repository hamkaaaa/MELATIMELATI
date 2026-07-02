import React, { useState } from "react";
import { useApp, Ticket, TicketStatus } from "../context";
import { StatusBadge } from "../components/Layout";
import TicketComments from "../components/TicketComments";
import {
  CheckSquare,
  Play,
  CheckCircle,
  AlertOctagon,
  Inbox,
  User as UserIcon,
  MessageSquare,
  Building,
  Calendar,
  Layers,
  Info
} from "lucide-react";

export default function SolverDashboard() {
  const { currentUser, tickets, solverStart, solverComplete, solverEscalate, solverClaim } = useApp();

  // Tab: "aktif" (Ditugaskan, Dikerjakan) vs "bisa_diambil" (Open unassigned tickets in subbag) vs "selesai" (Selesai, Dieskalasi/unassigned history)
  const [activeTab, setActiveTab] = useState<"aktif" | "bisa_diambil" | "selesai">("aktif");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Modal / Form state
  const [completeModal, setCompleteModal] = useState(false);
  const [escalateModal, setEscalateModal] = useState(false);

  const [notes, setNotes] = useState("");
  const [escalateReason, setEscalateReason] = useState("");

  if (!currentUser) return null;

  // Filter tickets assigned specifically to this solver or previously completed by this solver
  // Let's filter by:
  // - Aktif: t.solverId === currentUser.id && (status === "Ditugaskan" || status === "Dikerjakan")
  // - Selesai: t.comments.some(c => c.authorId === currentUser.id && c.type === "penyelesaian") or t.solverId === currentUser.id && status === "Selesai"
  // - Bisa Diambil: open/unassigned tickets in the same subbag (Pending, Diterima, Dieskalasi)
  const myActiveTickets = tickets.filter(
    (t) => t.solverId === currentUser.id && (t.status === "Ditugaskan" || t.status === "Dikerjakan")
  );

  const mySelesaiTickets = tickets.filter(
    (t) => t.comments.some(c => c.authorId === currentUser.id && c.type === "penyelesaian") || (t.solverId === currentUser.id && t.status === "Selesai")
  );

  const subbagOpenTickets = tickets.filter(
    (t) => t.kasubbagId === currentUser.subbagId && !t.solverId && t.status !== "Selesai" && t.status !== "Kembalikan tiket ke operator"
  );

  let displayedTickets = myActiveTickets;
  if (activeTab === "selesai") {
    displayedTickets = mySelesaiTickets;
  } else if (activeTab === "bisa_diambil") {
    displayedTickets = subbagOpenTickets;
  }

  // Auto select first ticket
  React.useEffect(() => {
    if (displayedTickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(displayedTickets[0].id);
    } else if (displayedTickets.length === 0) {
      setSelectedTicketId(null);
    }
  }, [displayedTickets, selectedTicketId, activeTab]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleStart = () => {
    if (!selectedTicket) return;
    solverStart(selectedTicket.id, currentUser);
  };

  const handleClaim = () => {
    if (!selectedTicket) return;
    solverClaim(selectedTicket.id, currentUser);
    setActiveTab("aktif");
    setSelectedTicketId(selectedTicket.id);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !notes.trim()) {
      alert("Catatan penyelesaian wajib diisi.");
      return;
    }
    solverComplete(selectedTicket.id, notes.trim(), currentUser);
    setNotes("");
    setCompleteModal(false);
  };

  const handleConfirmEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !escalateReason.trim()) {
      alert("Alasan eskalasi wajib diisi.");
      return;
    }
    solverEscalate(selectedTicket.id, escalateReason.trim(), currentUser);
    setEscalateReason("");
    setEscalateModal(false);
    setSelectedTicketId(null); // Unassigned, so remove from view
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT PANEL: Tasks list */}
      <div className="lg:col-span-4 bg-white border border-[#e2e6ea] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[650px]">
        {/* Header with status toggle */}
        <div className="p-4 border-b border-gray-100 bg-white shrink-0">
          <span className="text-[9px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md uppercase font-mono tracking-wider">
            Petugas Solver TI
          </span>
          <h3 className="text-xs font-bold text-gray-800 font-display mt-1.5">Tugas Penanganan Saya</h3>

          <div className="flex gap-1.5 mt-3 bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("aktif");
                setSelectedTicketId(null);
              }}
              className={`flex-1 py-2 text-center text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === "aktif"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Tugas Aktif ({myActiveTickets.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("bisa_diambil");
                setSelectedTicketId(null);
              }}
              className={`flex-1 py-2 text-center text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === "bisa_diambil"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
                }`}
              title="Tiket di subbagian Anda yang belum ditunjuk petugasnya"
            >
              Bisa Diambil ({subbagOpenTickets.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("selesai");
                setSelectedTicketId(null);
              }}
              className={`flex-1 py-2 text-center text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === "selesai"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Selesai ({mySelesaiTickets.length})
            </button>
          </div>
        </div>

        {/* Scrolling list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 scroll-thin bg-slate-50/30">
          {displayedTickets.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs flex flex-col justify-center items-center space-y-2">
              <CheckSquare className="w-8 h-8 text-gray-200" />
              <span>Tidak ada tugas dalam kategori ini.</span>
            </div>
          ) : (
            displayedTickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full p-4 text-left transition-all block cursor-pointer ${isSelected
                      ? "bg-white border-l-4 border-[#b26d27] shadow-xs"
                      : "bg-transparent hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="font-mono font-bold text-xs text-gray-800">{ticket.id}</span>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <h4 className="text-xs font-semibold text-gray-900 truncate">{ticket.layanan}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 truncate">Pelapor: {ticket.pengirimName}</p>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 font-mono">
                    <span>{ticket.tanggalUpdate}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Tasks detail & comments */}
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
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Layanan: {selectedTicket.layananSub} | Pelapor: {selectedTicket.pengirimName}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTicket.status} />
              </div>
            </div>

            {/* Scrolling details content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scroll-thin">
              {/* Box Resolution if Finished */}
              {selectedTicket.catatanKasubbag && (
                <div className="bg-sky-50 border border-sky-200 text-sky-950 rounded-xl p-4 space-y-1.5">
                  <h4 className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-sky-600" />
                    <span>Catatan Penyelesaian</span>
                  </h4>
                  <p className="text-xs leading-relaxed font-medium">
                    {selectedTicket.catatanKasubbag}
                  </p>
                </div>
              )}

              {/* Detail fields */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                <div className="text-xs border-b border-gray-200/50 pb-3">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Layanan Katalog Level 3</span>
                  <span className="text-gray-900 font-black block mt-0.5 text-sm truncate" title={selectedTicket.layanan}>
                    {selectedTicket.layanan}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Deskripsi Laporan Pegawai</span>
                  <p className="text-xs text-gray-800 leading-relaxed bg-white p-3.5 border border-slate-150 rounded-lg whitespace-pre-wrap mt-1">
                    {selectedTicket.detail}
                  </p>
                </div>
              </div>

              {/* Action bar for Solver */}
              {activeTab === "aktif" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-2.5 justify-end">
                  {/* MULAI KERJAKAN (Ditugaskan -> Dikerjakan) */}
                  {selectedTicket.status === "Ditugaskan" && (
                    <button
                      onClick={handleStart}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>Mulai Kerjakan</span>
                    </button>
                  )}

                  {/* TANDAI SELESAI (Dikerjakan -> Selesai) */}
                  {selectedTicket.status === "Dikerjakan" && (
                    <button
                      onClick={() => setCompleteModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Tandai Selesai</span>
                    </button>
                  )}

                  {/* ESKALASI (Ditugaskan/Dikerjakan -> Dieskalasi) */}
                  {(selectedTicket.status === "Ditugaskan" || selectedTicket.status === "Dikerjakan") && (
                    <button
                      onClick={() => setEscalateModal(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <AlertOctagon className="w-4 h-4" />
                      <span>Eskalasi ke Kasubbag</span>
                    </button>
                  )}
                </div>
              )}

              {activeTab === "bisa_diambil" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-2.5 justify-between items-center">
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Tiket ini belum ditugaskan. Ambil secara mandiri untuk menanganinya.</span>
                  </div>
                  <button
                    onClick={handleClaim}
                    className="bg-[#b26d27] hover:bg-[#9b5a1b] text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Ambil Tugas Ini</span>
                  </button>
                </div>
              )}

              {/* Thread Comments */}
              <div className="border-t border-gray-100 pt-5">
                <TicketComments ticketId={selectedTicket.id} comments={selectedTicket.comments} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs p-6 flex-col space-y-2">
            <CheckSquare className="w-10 h-10 text-gray-200" />
            <span>
              {activeTab === "aktif"
                ? "Pilih tugas aktif dari panel sebelah kiri untuk mulai penanganan masalah."
                : activeTab === "bisa_diambil"
                  ? "Pilih tiket dari panel sebelah kiri yang ingin Anda ambil dan tangani secara mandiri."
                  : "Pilih tugas selesai dari panel sebelah kiri untuk melihat detail penanganan."}
            </span>
          </div>
        )}
      </div>

      {/* MODAL 1: TANDAI SELESAI */}
      {completeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmComplete}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div>
              <h4 className="font-bold text-gray-800 font-display text-sm">Penyelesaian Tugas Kendala</h4>
              <p className="text-xs text-gray-400 mt-1">Harap isi catatan tindakan perbaikan yang telah dilakukan.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                Catatan Penyelesaian (Wajib)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Tuliskan tindakan korektif atau solusi penyelesaian masalah secara detail..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#b26d27] text-gray-800"
                required
              ></textarea>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setCompleteModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                Tandai Selesai
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ESKALASI */}
      {escalateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmEscalate}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div>
              <h4 className="font-bold text-gray-800 font-display text-sm">Eskalasi Tiket ke Kasubbag</h4>
              <p className="text-xs text-gray-400 mt-1">Mengembalikan penugasan tiket dengan alasan yang jelas.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                Alasan Eskalasi (Wajib)
              </label>
              <textarea
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                rows={4}
                placeholder="Tulis alasan eskalasi (misal: membutuhkan konfigurasi core switch di luar hak akses)..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-orange-500 text-gray-800"
                required
              ></textarea>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEscalateModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                Eskalasi Sekarang
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
