import React, { useState } from "react";
import { useApp, Comment, CommentType, Role } from "../context";
import { Send, User as UserIcon, Calendar, CheckCircle, AlertTriangle, Info, MessageSquare } from "lucide-react";

interface TicketCommentsProps {
  ticketId: string;
  comments: Comment[];
}

export default function TicketComments({ ticketId, comments }: TicketCommentsProps) {
  const { currentUser, addComment } = useApp();
  const [text, setText] = useState("");

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    addComment(ticketId, text.trim(), "komentar");
    setText("");
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "pengguna":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#fcf4ec] text-[#b26d27]">Pelapor</span>;
      case "kasubbag":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800">Kasubbag</span>;
      case "solver":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-800">Solver</span>;
      case "operator":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-gray-100 text-gray-800">Operator</span>;
      default:
        return null;
    }
  };

  const getCommentStyle = (type: CommentType) => {
    switch (type) {
      case "terima":
        return {
          bg: "bg-emerald-50 border-l-4 border-emerald-500",
          text: "text-emerald-900",
          icon: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        };
      case "penyelesaian":
        return {
          bg: "bg-green-50 border-l-4 border-green-600",
          text: "text-green-900",
          icon: <CheckCircle className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
        };
      case "penugasan":
        return {
          bg: "bg-blue-50 border-l-4 border-blue-500",
          text: "text-blue-900",
          icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        };
      case "mulai_kerjakan":
        return {
          bg: "bg-purple-50 border-l-4 border-purple-500",
          text: "text-purple-900",
          icon: <MessageSquare className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        };
      case "eskalasi":
        return {
          bg: "bg-amber-50 border-l-4 border-amber-500",
          text: "text-amber-900",
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        };
      case "Kembalikan tiket ke operator":
        return {
          bg: "bg-red-50 border-l-4 border-red-500",
          text: "text-red-900",
          icon: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        };
      case "sistem":
        return {
          bg: "bg-slate-50 border border-slate-200 rounded-lg",
          text: "text-slate-700",
          icon: <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        };
      case "komentar":
      default:
        return {
          bg: "bg-white border border-[#e2e6ea] rounded-xl shadow-sm",
          text: "text-gray-800",
          icon: null
        };
    }
  };

  const isOperator = currentUser.role === "operator";

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-base font-bold text-gray-800 font-display flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#b26d27]" />
        <span>Riwayat Aktivitas & Komentar</span>
      </h3>

      {/* Message list */}
      <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1 scroll-thin">
        {(() => {
          const visibleComments = comments.filter((c) => {
            if (currentUser.role === "pengguna" && c.type === "Kembalikan tiket ke operator") {
              return false;
            }
            return true;
          });

          if (visibleComments.length === 0) {
            return (
              <div className="text-center py-6 text-gray-400 text-sm">
                Belum ada komentar atau aktivitas pada tiket ini.
              </div>
            );
          }

          return visibleComments.map((comment) => {
            const style = getCommentStyle(comment.type);
            const isSystem = comment.type !== "komentar";

            return (
              <div
                key={comment.id}
                className={`p-3.5 rounded-lg transition-all ${style.bg} ${isSystem ? "text-xs" : "text-sm"}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {style.icon}
                    <span className="font-semibold text-gray-900 truncate">
                      {isSystem ? comment.authorName : comment.authorName}
                    </span>
                    {getRoleBadge(comment.authorRole)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{comment.timestamp}</span>
                  </div>
                </div>

                {/* Text body */}
                <div className={`leading-relaxed whitespace-pre-wrap font-sans ${style.text}`}>
                  {comment.text}
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* Send message form (Disabled if Operator) */}
      {isOperator ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-500 p-3 rounded-lg text-xs text-center font-medium">
          Mode hanya lihat (Read-Only) untuk Operator. Operator tidak dapat mengirim komentar pada tiket.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ketik pesan atau balasan baru..."
            className="flex-1 bg-white border border-[#e2e6ea] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#b26d27] focus:ring-1 focus:ring-[#b26d27] transition-all text-gray-800 placeholder-gray-400"
          />
          <button
            type="submit"
            className="bg-[#b26d27] hover:bg-[#9b5a1b] text-white px-4 rounded-lg flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
