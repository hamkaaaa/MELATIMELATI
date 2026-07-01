import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Bot, User as UserIcon, CornerDownLeft, Sparkles, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface ServiceChatbotProps {
  onSelectRecommendation: (category: string, sub: string, service: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  recommendation?: {
    category: string;
    sub: string;
    service: string;
    confidence: "Tinggi" | "Sedang" | "Rendah";
    score: number;
  };
}

interface KeywordRule {
  keywords: string[];
  category: string;
  sub: string;
  service: string;
}

// 40+ Keyword Rules for BPK RI Service Catalog Routing
const CHATBOT_RULES: KeywordRule[] = [
  { keywords: ["lan", "kabel lan", "kabel", "colokan lan", "port lan"], category: "Layanan Teknologi", sub: "Layanan Intranet", service: "Penyediaan kabel LAN ruang kerja" },
  { keywords: ["wifi", "wi-fi", "wireless", "internet kantor", "sinyal wifi"], category: "Layanan Teknologi", sub: "Layanan Intranet", service: "Pengaturan konfigurasi Wifi Biro" },
  { keywords: ["pasang lan", "jaringan baru", "tarik kabel"], category: "Layanan Teknologi", sub: "Layanan Intranet", service: "Pembuatan Local Area Network (LAN)" },
  { keywords: ["matikan lan", "nonaktif lan", "putus lan"], category: "Layanan Teknologi", sub: "Layanan Intranet", service: "Penonaktifan LAN area tertentu" },
  { keywords: ["mfa", "multi factor", "google authenticator", "otp", "token mfa"], category: "Layanan Identitas", sub: "Layanan MFA", service: "Registrasi Multi-Factor Authentication Baru" },
  { keywords: ["mfa reset", "reset mfa", "authenticator hilang", "mfa ganti", "token hilang"], category: "Layanan Identitas", sub: "Layanan MFA", service: "Reset Token MFA / Google Authenticator" },
  { keywords: ["mfa waktu", "sinkron mfa", "waktu mfa", "otp salah"], category: "Layanan Identitas", sub: "Layanan MFA", service: "Masalah Sinkronisasi Waktu MFA" },
  { keywords: ["vpn", "vpn bpk", "tls handshake", "akses intranet", "vpn error", "connect vpn"], category: "Layanan Teknologi", sub: "Layanan Virtual Private Network", service: "Pemasangan VPN BPK di Laptop" },
  { keywords: ["buat akun", "akun baru", "daftar portal", "registrasi akun", "user baru"], category: "Layanan Identitas", sub: "Layanan Akun", service: "Pembuatan Akun Baru Portal BPK" },
  { keywords: ["lupa password", "reset password", "password locked", "salah password", "ganti sandi"], category: "Layanan Identitas", sub: "Layanan Akun", service: "Reset Password / Masalah Login" },
  { keywords: ["hak akses", "akses menu", "izin aplikasi", "role baru", "wewenang"], category: "Layanan Identitas", sub: "Layanan Akun", service: "Perubahan Hak Akses Aplikasi" },
  { keywords: ["hapus akun", "nonaktif akun", "pegawai keluar", "pensiun akun"], category: "Layanan Identitas", sub: "Layanan Akun", service: "Penghapusan / Penonaktifan Akun Pegawai" },
  { keywords: ["tte", "tanda tangan", "tanda tangan elektronik", "sertifikat tte", "digital signature"], category: "Layanan Identitas", sub: "Layanan TTE", service: "Registrasi Sertifikat TTE Baru" },
  { keywords: ["tte kadaluarsa", "perpanjang tte", "tte habis", "aktifkan tte"], category: "Layanan Identitas", sub: "Layanan TTE", service: "Perpanjangan Masa Aktif TTE" },
  { keywords: ["tte bermasalah", "tte gagal", "error tte", "gagal tanda tangan"], category: "Layanan Identitas", sub: "Layanan TTE", service: "Troubleshooting Tanda Tangan Elektronik Gagal" },
  { keywords: ["segel", "segel elektronik", "e-segel", "penerbitan segel"], category: "Layanan Identitas", sub: "Layanan Segel Elektronik", service: "Penerbitan Segel Baru Instansi" },
  { keywords: ["email", "email dinas", "email bpk", "buat email"], category: "Layanan Identitas", sub: "Layanan Email", service: "Pembuatan Email Baru @bpk.go.id" },
  { keywords: ["email penuh", "kuota email", "storage email", "inbox penuh"], category: "Layanan Identitas", sub: "Layanan Email", service: "Masalah Kuota Email Penuh" },
  { keywords: ["outlook", "thunderbird", "mail client", "konfigurasi email"], category: "Layanan Identitas", sub: "Layanan Email", service: "Konfigurasi Mail Client (Outlook/Thunderbird/HP)" },
  { keywords: ["rencana data", "perencanaan data", "kebijakan data", "arsitektur data"], category: "Layanan Data", sub: "Pengelolaan Data", service: "Perencanaan Data Pemeriksaan" },
  { keywords: ["tarik data", "kumpul data", "minta data", "entitas data", "ingest data"], category: "Layanan Data", sub: "Pengelolaan Data", service: "Pengumpulan Data dari Entitas" },
  { keywords: ["olah data", "proses data", "cleaning data", "etl data"], category: "Layanan Data", sub: "Pengelolaan Data", service: "Pengolahan Data Audit BPK" },
  { keywords: ["simpan data", "database", "gudang data", "data warehouse", "storage data"], category: "Layanan Data", sub: "Pengelolaan Data", service: "Penyimpanan Data di Gudang Data Pusat" },
  { keywords: ["bagi data", "sharing data", "data sharing", "akses data", "distribusi data"], category: "Layanan Data", sub: "Pengelolaan Data", service: "Penyebarluasan Data / Data Sharing" },
  { keywords: ["analisis data", "visualisasi", "dashboard", "bikin grafik", "tableau", "power bi"], category: "Layanan Data", sub: "Pengelolaan Data", service: "Analisis Data & Visualisasi" },
  { keywords: ["enkripsi data", "aman data", "masking data", "data sensitif", "keamanan data"], category: "Layanan Data", sub: "Pengelolaan Data", service: "Pengamanan Data & Enkripsi Data Sensitif" },
  { keywords: ["musnah data", "retensi data", "hapus data permanen"], category: "Layanan Data", sub: "Pengelolaan Data", service: "Pemusnahan Data Sesuai Retensi" },
  { keywords: ["bidics", "tindak lanjut", "rekomendasi audit", "dashboard bidics"], category: "Layanan Data", sub: "Layanan Sistem Layanan Data", service: "BIDICS Dashboard (Pemantauan Tindak Lanjut)" },
  { keywords: ["bidics-ssa", "ssa", "self service analytics", "analisis mandiri"], category: "Layanan Data", sub: "Layanan Sistem Layanan Data", service: "BIDICS-SSA (Self Service Analytics)" },
  { keywords: ["bikin aplikasi", "kembang aplikasi", "fitur baru", "request aplikasi"], category: "Layanan Aplikasi", sub: "Pengembangan Aplikasi", service: "Permintaan Fitur Baru Aplikasi" },
  { keywords: ["bug", "error aplikasi", "aplikasi hang", "crash", "bug report"], category: "Layanan Aplikasi", sub: "Pengembangan Aplikasi", service: "Pelaporan Bug / Error Aplikasi" },
  { keywords: ["uji aplikasi", "testing aplikasi", "user acceptance", "uat"], category: "Layanan Aplikasi", sub: "Pengembangan Aplikasi", service: "Uji Coba / Testing Aplikasi Baru" },
  { keywords: ["api", "integrasi", "web service", "interkoneksi"], category: "Layanan Aplikasi", sub: "Pengembangan Aplikasi", service: "Integrasi API Antar Aplikasi BPK" },
  { keywords: ["siap", "siap-bpk", "audit siap", "unggah kkp", "siap bpk"], category: "Layanan Aplikasi", sub: "Aplikasi Pemeriksaan", service: "SiAP-BPK (Sistem Informasi Pemeriksaan)" },
  { keywords: ["e-audit", "eaudit", "pemeriksaan pusat", "portal eaudit"], category: "Layanan Aplikasi", sub: "Aplikasi Pemeriksaan", service: "Aplikasi E-Audit Pemeriksaan Pusat" },
  { keywords: ["kkp", "kertas kerja", "kertas kerja pemeriksaan"], category: "Layanan Aplikasi", sub: "Aplikasi Pemeriksaan", service: "Aplikasi Kertas Kerja Pemeriksaan (KKP)" },
  { keywords: ["siap offline", "siap sinkron", "offline siap", "sinkronisasi siap"], category: "Layanan Aplikasi", sub: "Aplikasi Pemeriksaan", service: "Masalah Sinkronisasi Offline SiAP-BPK" },
  { keywords: ["sisdm", "kepegawaian", "absen sisdm", "cuti sisdm", "data pegawai"], category: "Layanan Aplikasi", sub: "Aplikasi Kelembagaan", service: "Aplikasi Kepegawaian (SISDM BPK)" },
  { keywords: ["sikad", "keuangan bpk", "gaji sikad", "anggaran", "aplikasi keuangan"], category: "Layanan Aplikasi", sub: "Aplikasi Kelembagaan", service: "Aplikasi Keuangan (SIKAD BPK)" },
  { keywords: ["e-office", "eoffice", "persuratan", "naskah dinas", "surat masuk", "surat keluar"], category: "Layanan Aplikasi", sub: "Aplikasi Kelembagaan", service: "Aplikasi Persuratan Dinas (E-Office)" },
  { keywords: ["perjalanan dinas", "spd", "sppd", "dinas luar", "visum"], category: "Layanan Aplikasi", sub: "Aplikasi Kelembagaan", service: "Aplikasi Perjalanan Dinas Pegawai" },
  { keywords: ["laptop", "pc", "komputer", "beli laptop", "spek laptop"], category: "Layanan Perangkat", sub: "Standarisasi Perangkat Komputer", service: "Konsultasi Spesifikasi PC/Laptop" },
  { keywords: ["laptop lambat", "laptop lemot", "upgrade ram", "hardware rusak", "perbaikan", "layar kedip"], category: "Layanan Perangkat", sub: "Pemeliharaan Perangkat", service: "Perbaikan Kerusakan Fisik Laptop Dinas" },
  { keywords: ["virus", "antivirus", "malware", "ransomware", "scan laptop"], category: "Layanan Perangkat", sub: "Pemeliharaan Perangkat", service: "Instalasi Antivirus / Scan Malware Perangkat" },
  { keywords: ["pinjam laptop", "sewa laptop", "pinjam proyektor", "projector", "infocus"], category: "Layanan Perangkat", sub: "Peminjaman Perangkat", service: "Peminjaman Laptop Rapat Paripurna" },
  { keywords: ["tinta", "toner", "printer", "tinta habis", "toner printer"], category: "Layanan Perangkat", sub: "Penyediaan Barang Persediaan", service: "Penyediaan Toner / Tinta Printer Biro" },
  { keywords: ["pendampingan", "kegiatan khusus", "sidang", "pleno", "kawalan ti", "on-site"], category: "Layanan Dukungan TI Untuk Kegiatan Khusus", sub: "Pendampingan Personel TI", service: "Pendampingan Sidang / Rapat Pleno" },
  { keywords: ["faq", "user manual", "panduan", "video panduan", "cara pakai"], category: "Layanan Informasi", sub: "Knowledge Base Produk TI", service: "FAQ Portal Layanan TI BPK" }
];

export default function ServiceChatbot({ onSelectRecommendation }: ServiceChatbotProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRealAIActive, setIsRealAIActive] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Halo! Saya adalah Asisten Virtual Layanan TI BPK berbasis Google Gemini AI. Deskripsikan kendala atau permintaan layanan Anda dalam bahasa sehari-hari (contoh: 'kabel LAN saya rusak' atau 'lupa password email dinas'), dan saya akan merekomendasikan kategori layanan yang tepat secara cerdas."
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Clarification alternate questions when not matches
  const clarificationMessages = [
    "Maaf, saya belum menemukan kategori layanan yang cocok. Bisakah Anda menjelaskannya dengan kata kunci lain? Seperti menggunakan kata 'email', 'wifi', 'laptop', 'siap-bpk', atau 'password'.",
    "Kata kunci tersebut tidak terdaftar di Katalog Layanan TI BPK RI. Mohon deskripsikan kembali masalah hardware, software, atau akun yang Anda alami.",
    "Mohon maaf, deskripsi Anda kurang spesifik. Coba masukkan kalimat yang mengandung nama aplikasi (misal: SISDM, SiAP) atau nama perangkat (misal: LAN, VPN)."
  ];
  const [clarifyIndex, setClarifyIndex] = useState(0);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const newUserMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputVal("");
    setIsTyping(true);

    try {
      // Call the server-side API
      const response = await fetch("/api/chat-recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error: " + response.status);
      }

      const data = await response.json();
      setIsTyping(false);
      setIsRealAIActive(true);

      if (data.reply) {
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.reply,
          recommendation: data.recommendation ? {
            category: data.recommendation.category,
            sub: data.recommendation.sub,
            service: data.recommendation.service,
            confidence: data.recommendation.confidence,
            score: data.recommendation.score
          } : undefined
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error("Invalid format from server");
      }
    } catch (error) {
      console.warn("Real AI Chatbot failed, using local keyword matching fallback:", error);
      setIsRealAIActive(false);

      // Local Fallback Keyword matching
      setTimeout(() => {
        setIsTyping(false);
        const cleanedInput = userText.toLowerCase();

        let bestRule: KeywordRule | null = null;
        let maxScore = 0;

        for (const rule of CHATBOT_RULES) {
          let score = 0;
          for (const kw of rule.keywords) {
            if (cleanedInput.includes(kw)) {
              const wordsInKw = kw.split(" ").length;
              score += wordsInKw;
            }
          }

          if (score > maxScore) {
            maxScore = score;
            bestRule = rule;
          }
        }

        if (maxScore > 0 && bestRule) {
          let confidence: "Tinggi" | "Sedang" | "Rendah" = "Rendah";
          if (maxScore >= 3) {
            confidence = "Tinggi";
          } else if (maxScore === 2) {
            confidence = "Sedang";
          }

          const botReply: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: `[Offline Fallback] Berdasarkan kata kunci Anda, berikut adalah rekomendasi katalog yang sesuai:`,
            recommendation: {
              category: bestRule.category,
              sub: bestRule.sub,
              service: bestRule.service,
              confidence,
              score: maxScore
            }
          };
          setMessages((prev) => [...prev, botReply]);
        } else {
          const fallbackText = clarificationMessages[clarifyIndex];
          setClarifyIndex((prev) => (prev + 1) % clarificationMessages.length);

          const botReply: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: fallbackText
          };
          setMessages((prev) => [...prev, botReply]);
        }
      }, 800);
    }
  };

  const getConfidenceBadgeColor = (conf: "Tinggi" | "Sedang" | "Rendah") => {
    switch (conf) {
      case "Tinggi": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Sedang": return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Rendah": return "bg-rose-100 text-rose-800 border border-rose-200";
    }
  };

  return (
    <div className="bg-white border border-[#e2e6ea] rounded-2xl shadow-sm flex flex-col overflow-hidden h-[540px]">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#F0DCC0] text-[#78430e] px-4 py-4 flex items-center justify-between transition-colors hover:bg-[#e4cbab] cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#b26d27] flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold font-display leading-tight flex items-center gap-1.5">
              <span>Asisten Virtual Layanan TI</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                isRealAIActive ? "bg-emerald-600 text-white animate-pulse" : "bg-[#b26d27] text-white"
              }`}>
                {isRealAIActive ? "REAL GEMINI AI" : "LOCAL FALLBACK"}
              </span>
            </h3>
            <p className="text-[10px] text-gray-400">
              {isRealAIActive ? "Didukung Google Gemini 3.5 AI" : "Pencocokan Kata Kunci (Offline)"}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {isOpen && (
        <React.Fragment>
          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-thin">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7.5 h-7.5 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                      isBot ? "bg-[#fcf4ec] text-[#b26d27] border border-[#f7e3ce]" : "bg-[#F0DCC0] text-[#78430e]"
                    }`}
                  >
                    {isBot ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className="space-y-2">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isBot
                          ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                          : "bg-[#b26d27] text-white rounded-tr-none"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Recommendation Card */}
                    {isBot && msg.recommendation && (
                      <div className="bg-white border border-[#f7e3ce] rounded-xl p-3.5 shadow-sm space-y-3 max-w-full animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <span className="text-[10px] font-bold text-[#b26d27] uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Rekomendasi Layanan
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getConfidenceBadgeColor(msg.recommendation.confidence)}`}>
                            Confidence: {msg.recommendation.confidence}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[10px] text-gray-400 font-medium">Kategori Level 1</div>
                          <div className="text-xs font-bold text-gray-800">{msg.recommendation.category}</div>

                          <div className="text-[10px] text-gray-400 font-medium pt-1">Sub-Layanan Level 2</div>
                          <div className="text-xs font-semibold text-gray-700">{msg.recommendation.sub}</div>

                          {msg.recommendation.service && (
                            <>
                              <div className="text-[10px] text-gray-400 font-medium pt-1">Detail Layanan Level 3</div>
                              <div className="text-xs font-semibold text-gray-800 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md font-mono">
                                {msg.recommendation.service}
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (msg.recommendation) {
                              onSelectRecommendation(
                                msg.recommendation.category,
                                msg.recommendation.sub,
                                msg.recommendation.service
                              );
                            }
                          }}
                          className="w-full bg-[#fcf4ec] hover:bg-[#b26d27] text-[#b26d27] hover:text-white border border-[#f7e3ce] font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CornerDownLeft className="w-3.5 h-3.5" />
                          <span>Gunakan Rekomendasi Ini</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 max-w-[80%] mr-auto">
                <div className="w-7.5 h-7.5 rounded-full shrink-0 flex items-center justify-center bg-[#fcf4ec] text-[#b26d27] border border-[#f7e3ce]">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-xs flex items-center space-x-1 py-4">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#e2e6ea] bg-white flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ketik kendala di sini (contoh: wifi lemot)..."
              className="flex-1 border border-[#e2e6ea] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#b26d27] text-gray-800 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="bg-[#F0DCC0] hover:bg-[#b26d27] text-[#78430e] hover:text-white disabled:bg-gray-300 disabled:text-gray-500 px-3 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <SendIcon className="w-3.5 h-3.5" />
            </button>
          </form>
        </React.Fragment>
      )}
    </div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}
