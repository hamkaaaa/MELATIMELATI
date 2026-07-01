import React, { useState } from "react";
import { useApp, USERS, Ticket, TicketStatus } from "../context";
import { StatusBadge } from "../components/Layout";
import TicketComments from "../components/TicketComments";
import {
  Inbox,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User as UserIcon,
  MessageSquare,
  Building,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";

export default function KasubbagDashboard() {
  const { currentUser, tickets, kasubbagAccept, kasubbagAssign, kasubbagComplete, kasubbagReject } = useApp();

  // Active view tabs: "aktif" (Pending, Diterima, Ditugaskan, Dikerjakan, Dieskalasi) vs "selesai" (Selesai, Kembalikan tiket ke operator)
  const [activeTab, setActiveTab] = useState<"aktif" | "selesai">("aktif");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Modals / Action form states
  const [assigningSolver, setAssigningSolver] = useState(false);
  const [rejectionModal, setRejectionModal] = useState(false);
  const [completionModal, setCompletionModal] = useState(false);

  const [selectedSolverId, setSelectedSolverId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [completeNotes, setCompleteNotes] = useState("");

  if (!currentUser) return null;

  // Filter tickets for this specific Subbag
  const subbagTickets = tickets.filter((t) => t.kasubbagId === currentUser.subbagId);

  // Split tickets into tabs
  const activeTickets = subbagTickets.filter(
    (t) => t.status !== "Selesai" && t.status !== "Kembalikan tiket ke operator"
  );
  const closedTickets = subbagTickets.filter(
    (t) => t.status === "Selesai" || t.status === "Kembalikan tiket ke operator"
  );

  const displayedTickets = activeTab === "aktif" ? activeTickets : closedTickets;

  // Auto select first ticket if none selected
  React.useEffect(() => {
    if (displayedTickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(displayedTickets[0].id);
    } else if (displayedTickets.length === 0) {
      setSelectedTicketId(null);
    }
  }, [displayedTickets, selectedTicketId, activeTab]);

  const selectedTicket = subbagTickets.find((t) => t.id === selectedTicketId);

  // Find 3 Solvers belonging to this Subbag
  const subbagSolvers = USERS.filter(
    (u) => u.role === "solver" && u.subbagId === currentUser.subbagId
  );

  const handleAccept = () => {
    if (!selectedTicket) return;
    kasubbagAccept(selectedTicket.id, currentUser);
  };

  const handleOpenAssignModal = () => {
    if (subbagSolvers.length > 0) {
      setSelectedSolverId(subbagSolvers[0].id);
    }
    setAssigningSolver(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedTicket || !selectedSolverId) return;
    kasubbagAssign(selectedTicket.id, selectedSolverId, currentUser);
    setAssigningSolver(false);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !rejectReason.trim()) {
      alert("Alasan kembalikan tiket ke operator wajib diisi.");
      return;
    }
    kasubbagReject(selectedTicket.id, rejectReason.trim(), currentUser);
    setRejectReason("");
    setRejectionModal(false);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !completeNotes.trim()) {
      alert("Catatan penyelesaian wajib diisi.");
      return;
    }
    kasubbagComplete(selectedTicket.id, completeNotes.trim(), currentUser);
    setCompleteNotes("");
    setCompletionModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT PANEL: Ticket List with Tab filters */}
      <div className="lg:col-span-4 bg-white border border-[#e2e6ea] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[650px]">
        {/* Header with Subbag Name */}
        <div className="p-4 border-b border-gray-100 bg-white shrink-0">
          <span className="text-[9px] bg-[#fcf4ec] text-[#b26d27] font-bold px-2 py-0.5 rounded-md uppercase font-mono tracking-wider">
            Kasubbag Dispatcher
          </span>
          <h3 className="text-xs font-bold text-gray-800 font-display mt-1.5 truncate" title={currentUser.subbagId}>
            Inbox Subbagian TI
          </h3>

          {/* Tab Control */}
          <div className="flex gap-2 mt-3 bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("aktif");
                setSelectedTicketId(null);
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === "aktif"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Aktif ({activeTickets.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("selesai");
                setSelectedTicketId(null);
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === "selesai"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Selesai / Kembalikan tiket ke operator ({closedTickets.length})
            </button>
          </div>
        </div>

        {/* Scrolling tickets */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 scroll-thin bg-slate-50/30">
          {displayedTickets.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs flex flex-col justify-center items-center space-y-2">
              <Inbox className="w-8 h-8 text-gray-200" />
              <span>Tidak ada tiket dalam kategori ini.</span>
            </div>
          ) : (
            displayedTickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              const isEscalated = ticket.status === "Dieskalasi";

              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full p-4 text-left transition-all block relative cursor-pointer ${isSelected
                    ? "bg-white border-l-4 border-[#b26d27] shadow-xs"
                    : "bg-transparent hover:bg-slate-50"
                    } ${isEscalated ? "bg-amber-50/40 hover:bg-amber-50/60" : ""}`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-gray-800">{ticket.id}</span>
                      {isEscalated && (
                        <span className="bg-orange-100 text-orange-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono animate-pulse">
                          Eskalasi
                        </span>
                      )}
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <h4 className="text-xs font-semibold text-gray-900 truncate">{ticket.layanan}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 truncate leading-relaxed">
                    Pelapor: {ticket.pengirimName}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 font-mono">
                    <span>
                      {ticket.solverId ? `Solver: ${ticket.solverName?.split(" (")[0]}` : "Solver: Belum Ditunjuk"}
                    </span>
                    <span>{ticket.tanggalUpdate}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Ticket Detail View + Action controls */}
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
                <p className="text-[10px] text-gray-400 mt-0.5">Pengirim: {selectedTicket.pengirimName} | Tanggal: {selectedTicket.tanggal}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTicket.status} />
              </div>
            </div>

            {/* Scrolling detail contents */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scroll-thin">
              {/* SPECIAL ORANGE ALERT BANNER IF STATUS IS DIESKALASI */}
              {selectedTicket.status === "Dieskalasi" && (
                <div className="bg-orange-50 border border-orange-200 text-orange-900 rounded-xl p-4 flex items-start gap-3 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                  <div className="text-xs leading-tight">
                    <span className="font-black uppercase tracking-wider block text-orange-800 text-[10px] font-mono">
                      Peringatan Eskalasi Solver
                    </span>
                    <span className="font-semibold block mt-0.5">
                      Solver sebelumnya tidak dapat menyelesaikan tiket ini karena kendala kewenangan/teknis eksternal.
                    </span>
                    <span className="block mt-1 font-medium text-orange-700">
                      Mohon segera menugaskan ulang kepada solver lain di subbagian Anda, atau selesaikan kendala ini secara langsung.
                    </span>
                  </div>
                </div>
              )}

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

              {/* Box Rejection if Rejected */}
              {selectedTicket.alasanTolak && (
                <div className="bg-rose-50 border border-rose-200 text-rose-950 rounded-xl p-4 space-y-1.5">
                  <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Alasan Kembalikan tiket ke operator</span>
                  </h4>
                  <p className="text-xs leading-relaxed font-medium">
                    {selectedTicket.alasanTolak}
                  </p>
                </div>
              )}

              {/* Ticket details description */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs border-b border-gray-200/50 pb-3">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Sub-Layanan (Level 2)</span>
                    <span className="text-gray-900 font-bold block mt-0.5">{selectedTicket.layananSub}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Detail Layanan (Level 3)</span>
                    <span className="text-gray-900 font-bold block mt-0.5 truncate" title={selectedTicket.layanan}>
                      {selectedTicket.layanan}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">Deskripsi Kendala</span>
                  <p className="text-xs text-gray-800 leading-relaxed bg-white p-3.5 border border-slate-150 rounded-lg whitespace-pre-wrap mt-1">
                    {selectedTicket.detail}
                  </p>
                </div>

                <div className="pt-1.5 flex items-center gap-2 text-xs">
                  <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500 font-medium">
                    {selectedTicket.solverId ? (
                      <span>Ditugaskan kepada: <strong className="text-gray-700">{selectedTicket.solverName}</strong></span>
                    ) : (
                      <span className="italic text-gray-400">Petugas belum ditunjuk</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Toolbar buttons */}
              {activeTab === "aktif" && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-2.5 justify-end">
                  {/* TERIMA (Pending/Dieskalasi -> Diterima) */}
                  {(selectedTicket.status === "Pending" || selectedTicket.status === "Dieskalasi") && (
                    <button
                      onClick={handleAccept}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Terima Tiket</span>
                    </button>
                  )}

                  {/* TUGASKAN (Diterima/Dieskalasi -> Ditugaskan) */}
                  {(selectedTicket.status === "Diterima" || selectedTicket.status === "Dieskalasi" || selectedTicket.status === "Ditugaskan") && (
                    <button
                      onClick={handleOpenAssignModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{selectedTicket.solverId ? "Tugaskan Ulang" : "Tugaskan Solver"}</span>
                    </button>
                  )}

                  {/* SELESAI (Diterima, Ditugaskan, Dikerjakan, Dieskalasi -> Selesai) */}
                  {selectedTicket.status !== "Selesai" && selectedTicket.status !== "Kembalikan tiket ke operator" && (
                    <button
                      onClick={() => setCompletionModal(true)}
                      className="bg-[#b26d27] hover:bg-[#9b5a1b] text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Selesaikan Langsung</span>
                    </button>
                  )}

                  {/* KEMBALIKAN KE OPERATOR */}
                  {selectedTicket.status !== "Selesai" && selectedTicket.status !== "Kembalikan tiket ke operator" && (
                    <button
                      onClick={() => setRejectionModal(true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Kembalikan tiket ke operator</span>
                    </button>
                  )}
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
            <Inbox className="w-10 h-10 text-gray-200" />
            <span>Pilih tiket dari inbox Anda di panel kiri untuk melakukan peninjauan.</span>
          </div>
        )}
      </div>

      {/* MODAL 1: ASSIGN SOLVER MODAL */}
      {assigningSolver && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div>
              <h4 className="font-bold text-gray-800 font-display text-sm">Penugasan Solver (Teknisi)</h4>
              <p className="text-xs text-gray-400 mt-1">Pilih solver yang berwenang dari subbagian Anda.</p>
            </div>

            <div className="space-y-3">
              {subbagSolvers.length === 0 ? (
                <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg font-medium">
                  Maaf, tidak ada solver yang terdaftar di subbagian Anda.
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                    Pilih Solver
                  </label>
                  <select
                    value={selectedSolverId}
                    onChange={(e) => setSelectedSolverId(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b26d27]"
                  >
                    {subbagSolvers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setAssigningSolver(false)}
                className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={subbagSolvers.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                Tugaskan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECTION MODAL */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReject}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div>
              <h4 className="font-bold text-gray-800 font-display text-sm">Kembalikan Tiket ke Operator</h4>
              <p className="text-xs text-gray-400 mt-1">Harap isi alasan kembalikan tiket ke operator secara resmi.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                Alasan Kembalikan Tiket ke Operator (Wajib)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Tulis alasan mengapa laporan ini dikembalikan ke operator oleh subbagian Anda..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-rose-500 text-gray-800"
                required
              ></textarea>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRejectionModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                Kembalikan tiket ke operator
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: COMPLETION MODAL */}
      {completionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmComplete}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div>
              <h4 className="font-bold text-gray-800 font-display text-sm">Penyelesaian Tiket Langsung</h4>
              <p className="text-xs text-gray-400 mt-1">Tulis catatan penyelesaian atau tindakan perbaikan.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                Catatan Penyelesaian (Wajib)
              </label>
              <textarea
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                rows={4}
                placeholder="Tuliskan detail perbaikan atau solusi yang telah dilakukan..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#b26d27] text-gray-800"
                required
              ></textarea>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setCompletionModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                Selesaikan Tiket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
