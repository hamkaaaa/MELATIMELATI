import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, USERS } from "../context";
import { Eye, EyeOff, ShieldAlert, KeyRound, User as UserIcon, Building, X, Sparkles, Trophy, Target, RotateCcw } from "lucide-react";

export default function LoginPage() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [demoTab, setDemoTab] = useState<"all" | "pengguna" | "kasubbag" | "solver" | "operator">("all");
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Easter Egg Penalty Shootout Minigame
  const [flowerClicks, setFlowerClicks] = useState(0);
  const [isMinigameOpen, setIsMinigameOpen] = useState(false);
  const [isRickrolled, setIsRickrolled] = useState(false);

  const handleFlowerClick = () => {
    setFlowerClicks((prev) => {
      const next = prev + 1;
      if (next >= 10) {
        setIsMinigameOpen(true);
        return 0;
      }
      return next;
    });
  };

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      redirectUser(currentUser.role);
    }
  }, [currentUser]);

  const redirectUser = (role: string) => {
    switch (role) {
      case "pengguna":
        navigate("/dashboard");
        break;
      case "kasubbag":
        navigate("/kasubbag");
        break;
      case "solver":
        navigate("/solver");
        break;
      case "operator":
        navigate("/operator");
        break;
      default:
        navigate("/");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }

    const success = await login(username.trim(), password.trim());
    if (success) {
      const user = USERS.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
      if (user) {
        redirectUser(user.role);
      }
    } else {
      setError("Username atau password salah.");
    }
  };

  const handleAutofill = (user: typeof USERS[0]) => {
    setUsername(user.username);
    setPassword(user.password);
    setError("");
  };

  const filteredDemoUsers = USERS.filter((u) => {
    if (demoTab === "all") return true;
    return u.role === demoTab;
  });

  return (
    <div id="login-root" className="min-h-screen bg-white flex w-full font-sans relative overflow-hidden selection:bg-[#fcf4ec] selection:text-[#b26d27]">

      {/* LEFT PANEL: Form Section */}
      <div id="form-panel" className="w-full lg:w-[45%] xl:w-[40%] bg-white p-8 md:p-16 flex flex-col justify-between relative z-10 min-h-screen shrink-0 shadow-xl lg:shadow-none">

        <div className="my-auto max-w-sm w-full mx-auto space-y-8">

          {/* Logo Header */}
          <div id="logo-header" className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-top duration-500">
            {/* Elegant stylized flower icon matching the mockup */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#b26d27]" fill="currentColor">
              <path d="M12 2C11.5 4 9 7.5 9 10C9 11.7 10.3 13 12 13C13.7 13 15 11.7 15 10C15 7.5 12.5 4 12 2Z" />
              <path d="M12 13C10.3 13 7.5 14 6 15.5C4.5 17 4 19 4 20C5 20 7 19.5 8.5 18C10 16.5 11 13.7 12 13Z" opacity="0.85" />
              <path d="M12 13C13.7 13 16.5 14 18 15.5C19.5 17 20 19 20 20C19 20 17 19.5 15.5 18C14 16.5 13 13.7 12 13Z" opacity="0.85" />
              <path d="M12 13C10.8 13 8.5 11 7 10C5.5 9 4 9 4 9C4 9 5 10.5 6.5 12C8 13.5 10.8 13 12 13Z" opacity="0.6" />
              <path d="M12 13C13.2 13 15.5 11 17 10C18.5 9 20 9 20 9C20 9 19 10.5 17.5 12C16 13.5 13.2 13 12 13Z" opacity="0.6" />
            </svg>
            <span className="text-xl font-extrabold text-[#b26d27] tracking-tight font-display">
              Melati V2
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-3 animate-in fade-in slide-in-from-top duration-700">
            <h1 className="text-3xl md:text-[34px] font-black text-[#b26d27] tracking-tight leading-[1.15] font-sans">
              Portal Pelayanan <br />
              Teknologi Informasi
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">
              Silahkan masuk dengan akun email Anda
            </p>
          </div>

          {/* Form Card */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
            {error && (
              <div id="error-banner" className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4.5">

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Admin123@bpk.go.id"
                    className="w-full bg-white border border-slate-200 focus:border-[#b26d27] focus:ring-1 focus:ring-[#b26d27]/30 text-gray-800 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-300 font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 focus:border-[#b26d27] focus:ring-1 focus:ring-[#b26d27]/30 text-gray-800 rounded-xl pl-4 pr-11 py-3 text-sm outline-none transition-all placeholder:text-gray-300 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-[#b26d27] focus:ring-[#b26d27] w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Silakan hubungi Administrator Biro TI untuk mereset kata sandi Anda.");
                  }}
                  className="hover:underline hover:text-[#b26d27] transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                id="login-btn"
                type="submit"
                className="w-full bg-[#b26d27] hover:bg-[#9b5a1b] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-5"
              >
                <span>Login</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div 
          onClick={() => setIsRickrolled(true)}
          className="text-center text-[10px] text-gray-400 font-mono tracking-widest mt-8 cursor-pointer hover:text-[#b26d27] transition-all hover:scale-105 select-none"
        >
          © Biro TI 2026
        </div>
      </div>

      {/* RIGHT PANEL: Beautiful Jasmine Backdrop */}
      <div id="backdrop-panel" className="hidden lg:flex flex-1 bg-gradient-to-br from-[#fffbeb] via-[#fef3c7]/20 to-[#fdf6e2]/40 items-center justify-center relative overflow-hidden border-l border-[#fde68a]/30">

        {/* Soft radial background glowing orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-150/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>

        {/* Math Jasmine SVG Illustration matching the mockup */}
        <svg viewBox="0 0 600 600" className="w-[520px] h-[520px] relative z-10 select-none drop-shadow-2xl animate-in fade-in duration-1000">
          <defs>
            {/* Glow radial gradient behind the flower bodies */}
            <radialGradient id="flowerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
              <stop offset="45%" stopColor="#fef3c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
            </radialGradient>

            {/* Single Petal Path */}
            <g id="petal">
              <path
                d="M 0,0 C -25,-45 -45,-85 0,-125 C 45,-85 25,-45 0,0"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              {/* Delicate inner petal vein */}
              <path
                d="M 0,0 C -5,-35 -10,-70 0,-105"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="1.2"
              />
            </g>

            {/* Sparkle shape */}
            <g id="sparkle">
              <path
                d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 -8,0 Q 0,0 0,-8"
                fill="#ffffff"
              />
            </g>
          </defs>

          {/* Background Glow Ring */}
          <circle cx="300" cy="300" r="280" fill="url(#flowerGlow)" />

          {/* Stems */}
          {/* Stem for left flower */}
          <path
            d="M 240,260 Q 255,420 280,560"
            fill="none"
            stroke="#86efac"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 240,260 Q 255,420 280,560"
            fill="none"
            stroke="#5bb974"
            strokeWidth="9.5"
            strokeLinecap="round"
          />

          {/* Stem for right flower */}
          <path
            d="M 370,230 Q 375,420 372,560"
            fill="none"
            stroke="#86efac"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 370,230 Q 375,420 372,560"
            fill="none"
            stroke="#5bb974"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Left Flower (Larger) */}
          <g transform="translate(240, 260)" onClick={handleFlowerClick} className="cursor-pointer">
            <g className="animate-left-flower">
              <use href="#petal" transform="rotate(0)" />
              <use href="#petal" transform="rotate(60)" />
              <use href="#petal" transform="rotate(120)" />
              <use href="#petal" transform="rotate(180)" />
              <use href="#petal" transform="rotate(240)" />
              <use href="#petal" transform="rotate(300)" />
              <circle cx="0" cy="0" r="16" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="6" fill="#ca8a04" />
            </g>
          </g>
          {/* Right Flower (Smaller, slightly offset) */}
          <g transform="translate(370, 230) scale(0.85)" onClick={handleFlowerClick} className="cursor-pointer">
            <g className="animate-right-flower">
              <use href="#petal" transform="rotate(30)" />
              <use href="#petal" transform="rotate(90)" />
              <use href="#petal" transform="rotate(150)" />
              <use href="#petal" transform="rotate(210)" />
              <use href="#petal" transform="rotate(270)" />
              <use href="#petal" transform="rotate(330)" />
              <circle cx="0" cy="0" r="16" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="6" fill="#ca8a04" />
            </g>
          </g>

          {/* Sparkles */}
          <use href="#sparkle" x="120" y="200" transform="scale(1.5)" className="animate-bounce" style={{ animationDelay: '0.2s', transformOrigin: '120px 200px' }} />
          <use href="#sparkle" x="480" y="160" transform="scale(1.2)" className="animate-pulse" style={{ animationDelay: '1s', transformOrigin: '480px 160px' }} />
          <use href="#sparkle" x="300" y="100" transform="scale(0.9)" />
        </svg>
      </div>

      {/* FLOATING TRIGGER BUTTON FOR COLLAPSIBLE DEMO PANEL */}
      <button
        id="demo-trigger-btn"
        onClick={() => setIsDemoOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#fcf4ec] border border-[#f7e3ce] text-[#b26d27] py-5 px-3 rounded-l-2xl shadow-xl flex flex-col items-center gap-2 cursor-pointer hover:bg-white transition-all duration-200 border-r-0 z-40 group hover:pl-4 animate-in slide-in-from-right duration-500"
      >
        <KeyRound className="w-5 h-5 text-[#b26d27] group-hover:scale-110 transition-transform animate-pulse" />
        <span className="writing-mode-vertical uppercase text-[9px] font-black tracking-widest text-[#b26d27]">
          UJI COBA
        </span>
      </button>

      {/* COLLAPSIBLE SIDEBAR DRAWER: Demo Accounts */}
      <div
        id="demo-drawer"
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col transition-all duration-300 transform ${isDemoOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-[#b26d27]" />
            <div>
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider font-display">
                Akun Uji Coba (Demo)
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">
                Klik profil untuk login otomatis
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="p-3 bg-slate-50/30 border-b border-slate-100 flex flex-wrap gap-1.5">
          {["all", "pengguna", "kasubbag", "solver", "operator"].map((tab) => (
            <button
              key={tab}
              onClick={() => setDemoTab(tab as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${demoTab === tab
                ? "bg-[#b26d27] text-white"
                : "bg-white border border-slate-200 text-gray-500 hover:bg-slate-50"
                }`}
            >
              {tab === "all" ? "Semua" : tab === "pengguna" ? "Pelapor" : tab}
            </button>
          ))}
        </div>

        {/* Accounts List Grid */}
        <div className="flex-1 overflow-y-auto p-4.5 space-y-3.5 scroll-thin">
          {filteredDemoUsers.map((user) => {
            const isUserActive = username === user.username && password === user.password;
            let roleColor = "bg-[#fcf4ec] text-[#b26d27] border-[#f7e3ce]";
            if (user.role === "kasubbag") roleColor = "bg-blue-50 text-blue-700 border-blue-100";
            if (user.role === "solver") roleColor = "bg-purple-50 text-purple-700 border-purple-100";
            if (user.role === "operator") roleColor = "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <button
                key={user.id}
                onClick={() => {
                  handleAutofill(user);
                  setIsDemoOpen(false); // Fluid experience: auto closes on select
                }}
                className={`w-full p-4 text-left rounded-xl transition-all border flex flex-col justify-between cursor-pointer ${isUserActive
                  ? "border-[#b26d27] bg-[#fcf4ec] ring-1 ring-[#b26d27]/50 shadow-sm"
                  : "border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-200 hover:shadow-xs"
                  }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="text-xs font-bold text-gray-900 truncate" title={user.name}>
                    {user.name}
                  </span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-tight ${roleColor}`}>
                    {user.role === "pengguna" ? "Pelapor" : user.role}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 font-mono w-full bg-white/60 p-2 rounded-lg border border-slate-100">
                  <span className="truncate">id: <strong className="text-gray-700">{user.username}</strong></span>
                  <span className="shrink-0 bg-slate-100 px-1 py-0.5 rounded text-gray-600 font-semibold">
                    pwd: {user.password}
                  </span>
                </div>

                {user.subbagId && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[9px] text-gray-400 truncate">
                    <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{user.subbagId}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isMinigameOpen && (
        <PenaltyMinigame onClose={() => setIsMinigameOpen(false)} />
      )}

      {isRickrolled && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[100] p-4 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider font-display text-slate-100">
                  😎 YOU GOT RICKROLLED! 🎵
                </span>
              </div>
              <button 
                onClick={() => setIsRickrolled(false)}
                className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Video Iframe Container */}
            <div className="relative w-full aspect-video bg-black">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0" 
                title="Rick Astley - Never Gonna Give You Up" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="p-4 bg-slate-950 text-center text-xs text-slate-400 font-medium">
              Never gonna give you up, never gonna let you down... 😉
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- PENALTY SHOOTOUT EASTER EGG MINIGAME ---
interface MinigameProps {
  onClose: () => void;
}

const INDO_PLAYERS = [
  { id: "arhan", name: "Pratama Arhan", specialty: "Curve Shot", desc: "Spesialis pojok kanan. Mengurangi peluang penyelamatan kiper di arah Kanan.", flag: "🇮🇩" },
  { id: "marselino", name: "Marselino Ferdinan", specialty: "Power Shot", desc: "Tembakan super keras. Tingkat akurasi dasar yang stabil di segala arah.", flag: "🇮🇩" },
  { id: "ragnar", name: "Ragnar Oratmangoen", specialty: "Precision Placement", desc: "Penempatan bola presisi. Mengurangi peluang penyelamatan kiper di arah Kiri & Kanan.", flag: "🇮🇩" },
  { id: "struick", name: "Rafael Struick", specialty: "Speed Shot", desc: "Tembakan cepat mendatar. Mengurangi peluang penyelamatan kiper di arah Tengah.", flag: "🇮🇩" }
];

const WORLD_KEEPERS = [
  { id: "martinez", name: "Emiliano Martínez", team: "Argentina", flag: "🇦🇷", saveRate: 0.35, desc: "Pakar psywar. Sangat baik menghalau tembakan arah Kanan." },
  { id: "neuer", name: "Manuel Neuer", team: "Jerman", flag: "🇩🇪", saveRate: 0.40, desc: "Kiper legendaris. Sangat tangguh menghalau tembakan arah Tengah." },
  { id: "alisson", name: "Alisson Becker", team: "Brasil", flag: "🇧🇷", saveRate: 0.38, desc: "Refleks elite. Menutup celah arah Kiri dengan sangat rapat." },
  { id: "courtois", name: "Thibaut Courtois", team: "Belgia", flag: "🇧🇪", saveRate: 0.37, desc: "Jangkauan raksasa. Unggul menghalau bola-bola di sudut gawang." },
  { id: "bounou", name: "Yassine Bounou", team: "Maroko", flag: "🇲🇦", saveRate: 0.35, desc: "Fokus tinggi di laga krusial." }
];

function PenaltyMinigame({ onClose }: MinigameProps) {
  const [gameState, setGameState] = useState<"select" | "playing" | "over">("select");
  const [selectedPlayer, setSelectedPlayer] = useState<typeof INDO_PLAYERS[0] | null>(null);
  const [selectedKeeper, setSelectedKeeper] = useState<typeof WORLD_KEEPERS[0] | null>(null);
  
  const [playerScore, setPlayerScore] = useState(0);
  const [keeperScore, setKeeperScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const [chosenDir, setChosenDir] = useState<"left" | "center" | "right" | null>(null);
  const [power, setPower] = useState(50);
  const [isPowerActive, setIsPowerActive] = useState(false);

  const [shotDir, setShotDir] = useState<"left" | "center" | "right" | null>(null);
  const [keeperDir, setKeeperDir] = useState<"left" | "center" | "right" | null>(null);
  const [outcome, setOutcome] = useState<"GOAL" | "SAVED" | "MISSED" | null>(null);
  const [isOutcomeFading, setIsOutcomeFading] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [gameMessage, setGameMessage] = useState("");
  const [specialtyActive, setSpecialtyActive] = useState<string | null>(null);

  // Power Bar animation loop
  React.useEffect(() => {
    let interval: any;
    if (isPowerActive) {
      let dir = 1;
      interval = setInterval(() => {
        setPower((prev) => {
          let next = prev + dir * 6;
          if (next >= 100) {
            dir = -1;
            return 100;
          }
          if (next <= 0) {
            dir = 1;
            return 0;
          }
          return next;
        });
      }, 25);
    }
    return () => clearInterval(interval);
  }, [isPowerActive]);

  const startGame = (player: typeof INDO_PLAYERS[0]) => {
    setSelectedPlayer(player);
    const keeper = WORLD_KEEPERS[Math.floor(Math.random() * WORLD_KEEPERS.length)];
    setSelectedKeeper(keeper);
    
    setPlayerScore(0);
    setKeeperScore(0);
    setAttempts(0);
    setChosenDir(null);
    setShotDir(null);
    setKeeperDir(null);
    setOutcome(null);
    setIsShooting(false);
    setSpecialtyActive(null);
    setGameMessage(`Anda memilih ${player.name}. Lawan Anda adalah ${keeper.name} (${keeper.team})!`);
    setGameState("playing");
  };

  const handleShootInit = (direction: "left" | "center" | "right") => {
    setChosenDir(direction);
    setPower(30);
    setIsPowerActive(true);
    setGameMessage("Tekan TENDANG! pada area hijau PERFECT untuk gol terbaik.");
  };

  const handleKickClick = () => {
    if (!chosenDir) return;
    setIsPowerActive(false);
    handleShoot(chosenDir, power);
    setChosenDir(null);
  };

  const handleShoot = (direction: "left" | "center" | "right", shotPower: number) => {
    if (isShooting || attempts >= 5 || !selectedPlayer || !selectedKeeper) return;
    
    setIsShooting(true);
    setShotDir(direction);
    setOutcome(null);
    setSpecialtyActive(null);
    
    // Keeper chooses a direction randomly
    const directions: ("left" | "center" | "right")[] = ["left", "center", "right"];
    const randomKeeperDir = directions[Math.floor(Math.random() * directions.length)];
    setKeeperDir(randomKeeperDir);
    
    setTimeout(() => {
      // 1. Overpower Miss Check
      if (shotPower > 95) {
        setKeeperScore((k) => k + 1);
        setOutcome("MISSED");
        setGameMessage(`TIANG GAWANG!!! Tembakan (${shotPower}%) terlalu keras, membentur mistar gawang!`);
        setAttempts((a) => a + 1);
        setIsShooting(false);
        
        // Start fade out sequence
        setTimeout(() => {
          setIsOutcomeFading(true);
          setTimeout(() => {
            setOutcome(null);
            setIsOutcomeFading(false);
            if (attempts + 1 >= 5) {
              setGameState("over");
            }
          }, 800);
        }, 1500);
        return;
      }
      
      // Calculate outcome based on probability rules
      let saveChance = 0.15; // default catch chance if keeper chooses wrong direction
      
      if (shotPower < 40) {
        saveChance = 0.45; // keeper easily saves weak shots even in wrong direction
        setSpecialtyActive(`Tembakan lemah (${shotPower}%) memudahkan kiper menjangkau bola!`);
      }
      
      if (direction === randomKeeperDir) {
        saveChance = 0.75;
        
        if (shotPower < 40) {
          saveChance = 0.95; // certain save
        } else if (shotPower >= 70 && shotPower <= 90) {
          saveChance -= 0.15; // Perfect power reduces save chance
        }
        
        // Modifiers based on Player specialty
        if (selectedPlayer.id === "arhan" && direction === "right") {
          saveChance -= 0.25;
          setSpecialtyActive(`Tembakan Melengkung Arhan memperkecil peluang tepisan kiper!`);
        } else if (selectedPlayer.id === "ragnar" && (direction === "left" || direction === "right")) {
          saveChance -= 0.20;
          setSpecialtyActive(`Precision Placement Ragnar menargetkan pojok gawang secara akurat!`);
        } else if (selectedPlayer.id === "struick" && direction === "center") {
          saveChance -= 0.20;
          setSpecialtyActive(`Speed Shot Struick meluncur sangat cepat di bawah kiper!`);
        }
        
        // Modifiers based on Keeper strengths
        if (selectedKeeper.id === "martinez" && direction === "right") {
          saveChance += 0.15;
          setSpecialtyActive(`Dibu Martinez melakukan psywar & sangat tangguh di sisi kanan!`);
        } else if (selectedKeeper.id === "neuer" && direction === "center") {
          saveChance += 0.15;
          setSpecialtyActive(`Manuel Neuer berdiri kokoh menghalau tembakan tengah!`);
        } else if (selectedKeeper.id === "alisson" && direction === "left") {
          saveChance += 0.15;
          setSpecialtyActive(`Alisson menutup celah kiri dengan sempurna!`);
        } else if (selectedKeeper.id === "courtois" && (direction === "left" || direction === "right")) {
          saveChance += 0.10;
          setSpecialtyActive(`Jangkauan raksasa Courtois berhasil menutup sudut sempit!`);
        }
      } else {
        // Goalkeeper guessed wrong direction
        if (shotPower >= 70 && shotPower <= 90) {
          saveChance = 0.05; // Perfect power is almost certainly a goal
        }
        if (selectedKeeper.id === "courtois") {
          saveChance += 0.08;
        }
      }
      
      const rng = Math.random();
      const isSaved = rng < saveChance;
      
      if (isSaved) {
        setKeeperScore((k) => k + 1);
        setOutcome("SAVED");
        setGameMessage(`DISELAMATKAN!!! Tendangan (${shotPower}%) ${selectedPlayer.name} berhasil dibaca oleh ${selectedKeeper.name}!`);
      } else {
        setPlayerScore((p) => p + 1);
        setOutcome("GOAL");
        const powerText = shotPower >= 70 && shotPower <= 90 ? "SEMPURNA" : "keras";
        setGameMessage(`GOOOL!!! Tembakan ${powerText} (${shotPower}%) ${selectedPlayer.name} bersarang di sudut gawang!`);
      }
      
      setAttempts((a) => a + 1);
      setIsShooting(false);

      // Start fade out sequence
      setTimeout(() => {
        setIsOutcomeFading(true);
        setTimeout(() => {
          setOutcome(null);
          setIsOutcomeFading(false);
          if (attempts + 1 >= 5) {
            setGameState("over");
          }
        }, 800);
      }, 1500);
    }, 1000);
  };

  const handleReset = () => {
    setGameState("select");
    setSelectedPlayer(null);
    setSelectedKeeper(null);
  };

  const isGameOver = attempts >= 5;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-white">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
            <span className="font-bold text-xs uppercase tracking-wider font-display text-slate-100">
              Easter Egg: Adu Penalti BPK 🇮🇩
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {gameState === "select" ? (
          /* Selection Screen */
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-extrabold text-[#b26d27] uppercase tracking-wider">Pilih Eksekutor Penalti Anda</h2>
              <p className="text-[11px] text-slate-400">Pilih salah satu pemain bintang Timnas Indonesia untuk mengeksekusi penalti!</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {INDO_PLAYERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => startGame(p)}
                  className="bg-slate-800 hover:bg-[#b26d27]/20 border border-slate-700 hover:border-[#b26d27] text-left p-3.5 rounded-2xl transition-all cursor-pointer flex gap-3.5 items-start group hover:scale-[1.01]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#fcf4ec] border border-[#f7e3ce] text-xl flex items-center justify-center shrink-0 shadow-sm">
                    {p.flag}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-[#b26d27] flex items-center gap-1.5">
                      {p.name}
                      <span className="text-[9px] bg-[#b26d27]/30 text-amber-200 px-2 py-0.5 rounded-full font-semibold">{p.specialty}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Shootout Game Screen */
          <>
            {/* Scoreboard */}
            <div className="bg-slate-950/80 px-4 py-3 flex justify-between items-center border-b border-slate-800/60 font-mono text-center">
              <div className="flex-1 min-w-0">
                <span className="text-[9px] text-[#b26d27] font-bold block truncate">{selectedPlayer?.name}</span>
                <span className="text-2xl font-black text-emerald-400">{playerScore}</span>
              </div>
              
              <div className="px-3 py-1 bg-slate-800 rounded-lg text-[9px] font-bold text-slate-300 shrink-0">
                Tendangan: {attempts}/5
              </div>
              
              <div className="flex-1 min-w-0">
                <span className="text-[9px] text-rose-400 font-bold block truncate">{selectedKeeper?.name} ({selectedKeeper?.flag})</span>
                <span className="text-2xl font-black text-rose-400">{keeperScore}</span>
              </div>
            </div>

            {/* Game Arena (Visual Goal Post) */}
            <div className="flex-1 p-5 flex flex-col items-center justify-center min-h-[280px] bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-950 relative overflow-hidden">
              
              {/* Opponent Keeper Badge */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full text-[9px] text-slate-400 flex items-center gap-1.5 shadow-md z-10">
                <span>Kiper Lawan: <strong>{selectedKeeper?.name}</strong> {selectedKeeper?.flag}</span>
              </div>

              {/* Goal Post Outline */}
              <div className="w-full h-36 border-4 border-t-4 border-white/80 rounded-t-lg relative bg-emerald-900/30 flex items-center justify-center shadow-inner mt-6 overflow-visible">
                
                {/* Goalkeeper stance */}
                <div 
                  className="absolute bottom-0 transition-all duration-500 ease-out"
                  style={{
                    transform: keeperDir === "left" ? "translate(-70px, -20px) rotate(-45deg)" :
                               keeperDir === "right" ? "translate(70px, -20px) rotate(45deg)" :
                               keeperDir === "center" ? "translate(0px, -35px)" : "translate(0px, 0px)"
                  }}
                >
                  <svg width="90" height="110" viewBox="-45 -55 90 110" className="overflow-visible">
                    {/* Head */}
                    <circle cx="0" cy="-40" r="10" fill="#fbcfe8" stroke="#1e293b" strokeWidth="1.5" />
                    <path d="M -10,-42 Q 0,-50 10,-42" fill="#475569" stroke="#1e293b" strokeWidth="1.2" />
                    <circle cx="-3.5" cy="-40" r="1.2" fill="#1e293b" />
                    <circle cx="3.5" cy="-40" r="1.2" fill="#1e293b" />
                    <path d="M -2.5,-34 Q 0,-31 2.5,-34" fill="none" stroke="#1e293b" strokeWidth="1.2" />

                    {/* Left Arm & Glove (neon orange glove) */}
                    <line x1="-10" y1="-20" x2="-28" y2="-30" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="-30" cy="-31" r="5" fill="#f97316" stroke="#1e293b" strokeWidth="1.2" />
                    
                    {/* Right Arm & Glove (neon orange glove) */}
                    <line x1="10" y1="-20" x2="28" y2="-30" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="28" cy="-31" r="5" fill="#f97316" stroke="#1e293b" strokeWidth="1.2" />
                    
                    {/* Torso / Jersey (Neon Green) */}
                    <rect x="-10" y="-30" width="20" height="30" rx="3" fill="#22c55e" stroke="#1e293b" strokeWidth="1.5" />
                    <text x="0" y="-12" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">1</text>
                    
                    {/* Shorts (Black) */}
                    <rect x="-10" y="0" width="20" height="8" fill="#1e293b" rx="1.5" />
                    
                    {/* Legs */}
                    <line x1="-5" y1="8" x2="-5" y2="28" stroke="#fbcfe8" strokeWidth="4.5" strokeLinecap="round" />
                    <rect x="-8.5" y="25" width="7" height="5" fill="#ffffff" rx="1.2" stroke="#1e293b" strokeWidth="0.8" />
                    
                    <line x1="5" y1="8" x2="5" y2="28" stroke="#fbcfe8" strokeWidth="4.5" strokeLinecap="round" />
                    <rect x="1.5" y="25" width="7" height="5" fill="#ffffff" rx="1.2" stroke="#1e293b" strokeWidth="0.8" />
                  </svg>
                </div>

                {/* Player kicker standing behind the ball (only visible when not shooting) */}
                {!isShooting && !outcome && (
                  <div className="absolute -bottom-1 transition-all duration-300">
                    <svg width="80" height="90" viewBox="-40 -50 80 90" className="overflow-visible opacity-90 animate-pulse">
                      {/* Head */}
                      <circle cx="0" cy="-35" r="9" fill="#fbcfe8" stroke="#1e293b" strokeWidth="1.5" />
                      <path d="M -9,-37 Q 0,-45 9,-37" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                      
                      {/* Torso - Red Indonesia Jersey */}
                      <rect x="-10" y="-26" width="20" height="26" rx="3" fill="#dc2626" stroke="#1e293b" strokeWidth="1.5" />
                      <text x="0" y="-10" fill="#ffffff" fontSize="9" fontWeight="black" textAnchor="middle">INDO</text>
                      
                      {/* White Shorts */}
                      <rect x="-10" y="0" width="20" height="8" fill="#ffffff" rx="1" stroke="#1e293b" strokeWidth="1" />
                      
                      {/* Arms */}
                      <line x1="-10" y1="-18" x2="-16" y2="-5" stroke="#dc2626" strokeWidth="4.5" strokeLinecap="round" />
                      <line x1="10" y1="-18" x2="16" y2="-5" stroke="#dc2626" strokeWidth="4.5" strokeLinecap="round" />
                      
                      {/* Legs & Cleats */}
                      <line x1="-5" y1="8" x2="-5" y2="24" stroke="#fbcfe8" strokeWidth="4.5" strokeLinecap="round" />
                      <rect x="-8.5" y="21" width="7" height="5" fill="#e2e8f0" rx="1.2" stroke="#1e293b" strokeWidth="0.8" />
                      
                      <line x1="5" y1="8" x2="5" y2="24" stroke="#fbcfe8" strokeWidth="4.5" strokeLinecap="round" />
                      <rect x="1.5" y="21" width="7" height="5" fill="#e2e8f0" rx="1.2" stroke="#1e293b" strokeWidth="0.8" />
                    </svg>
                  </div>
                )}

                {/* Ball Action */}
                <div 
                  className={`absolute bottom-2 w-7 h-7 rounded-full bg-white border border-slate-700 shadow-lg transition-all duration-700 ease-out flex items-center justify-center ${
                    shotDir === "left" ? "bottom-24 -translate-x-24 scale-50" :
                    shotDir === "right" ? "bottom-24 translate-x-24 scale-50" :
                    shotDir === "center" ? "bottom-28 scale-50" : ""
                  }`}
                >
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-100 to-slate-400 rounded-full relative flex items-center justify-center overflow-hidden">
                    <span className="text-[6px] font-bold text-slate-800 rotate-45 font-mono">⚽</span>
                  </div>
                </div>
                
                {/* Outcome overlay text */}
                {outcome && (
                  <div 
                    className={`absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs z-10 transition-all duration-700 ${
                      isOutcomeFading ? "opacity-0 backdrop-blur-none" : "opacity-100"
                    }`}
                  >
                    <span className={`text-3xl font-extrabold tracking-widest transition-all duration-700 ${
                      isOutcomeFading ? "scale-75 opacity-0" : "scale-100 opacity-100"
                    } ${
                      outcome === "GOAL" ? "text-yellow-400 drop-shadow-[0_4px_10px_rgba(250,204,21,0.5)] animate-bounce" :
                      outcome === "MISSED" ? "text-amber-500 drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)] animate-pulse" :
                      "text-rose-500 drop-shadow-[0_4px_10px_rgba(239,68,68,0.5)] animate-pulse"
                    }`}>
                      {outcome === "GOAL" ? "GOOOL!!!" : outcome === "MISSED" ? "MELAMBUNG!!!" : "TERTEPIS!!!"}
                    </span>
                  </div>
                )}
              </div>

              {/* Specialty & Help Alert */}
              {specialtyActive && (
                <div className="mt-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg text-[9px] text-center w-full max-w-[280px] font-medium leading-relaxed animate-in slide-in-from-bottom-1 duration-200 z-10">
                  ⚡ {specialtyActive}
                </div>
              )}

              {/* Message Prompt */}
              <div className="mt-3.5 text-center px-4">
                <p className="text-[11px] font-semibold text-slate-300 leading-relaxed min-h-[32px]">
                  {gameMessage || `Gunakan tombol di bawah untuk mengarahkan tendangan penalti ${selectedPlayer?.name}.`}
                </p>
              </div>
            </div>

            {/* Action Panel */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-4">
              
              {!isGameOver ? (
                <>
                  {!chosenDir && !isPowerActive ? (
                    <div className="space-y-2.5">
                      <div className="text-center text-[9px] uppercase font-bold tracking-wider text-slate-500">
                        Arahkan Tembakan Anda:
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={isShooting}
                          onClick={() => handleShootInit("left")}
                          className="flex-1 bg-slate-800 hover:bg-[#b26d27] disabled:bg-slate-900 border border-slate-700 hover:border-amber-400 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Target className="w-4 h-4 text-emerald-400" />
                          Kiri
                        </button>
                        <button
                          disabled={isShooting}
                          onClick={() => handleShootInit("center")}
                          className="flex-1 bg-slate-800 hover:bg-[#b26d27] disabled:bg-slate-900 border border-slate-700 hover:border-amber-400 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Target className="w-4 h-4 text-emerald-400" />
                          Tengah
                        </button>
                        <button
                          disabled={isShooting}
                          onClick={() => handleShootInit("right")}
                          className="flex-1 bg-slate-800 hover:bg-[#b26d27] disabled:bg-slate-900 border border-slate-700 hover:border-amber-400 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Target className="w-4 h-4 text-emerald-400" />
                          Kanan
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Power Bar Select Panel */
                    <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
                      <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Arah: <strong>{chosenDir?.toUpperCase()}</strong></span>
                        <span>Bidik Area <strong>PERFECT (70%-90%)</strong></span>
                      </div>
                      
                      {/* Power Bar */}
                      <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative p-0.5">
                        <div 
                          className="h-full rounded-full transition-all duration-75 flex items-center justify-end pr-2"
                          style={{
                            width: `${power}%`,
                            backgroundColor: power > 95 ? "#ef4444" : 
                                             power >= 70 && power <= 90 ? "#10b981" : 
                                             power < 40 ? "#f97316" : 
                                             "#eab308"
                          }}
                        >
                          <span className="text-[9px] font-black text-slate-950">{power}%</span>
                        </div>
                        
                        {/* Perfect Zone Markers */}
                        <div className="absolute left-[70%] top-0 bottom-0 w-0.5 bg-white/40"></div>
                        <div className="absolute left-[90%] top-0 bottom-0 w-0.5 bg-white/40"></div>
                        <div className="absolute left-[70%] right-[10%] top-0 bottom-0 bg-emerald-500/10 pointer-events-none flex items-center justify-center">
                          <span className="text-[8px] text-emerald-300 font-black tracking-widest">PERFECT ZONE</span>
                        </div>
                      </div>

                      {/* Shoot Trigger */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleKickClick}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs py-3 rounded-xl transition-all shadow-lg cursor-pointer tracking-wider uppercase"
                        >
                          ⚽ TENDANG!
                        </button>
                        <button
                          onClick={() => {
                            setIsPowerActive(false);
                            setChosenDir(null);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 text-center py-1 animate-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <h3 className="text-base font-black tracking-wide">
                      {playerScore >= 3 ? "🏆 INDONESIA MENANG!" : "😢 INDONESIA KALAH!"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {playerScore >= 3 
                        ? `Selamat! Eksekusi penalti ${selectedPlayer?.name} membawa kemenangan ${playerScore}-${keeperScore} atas ${selectedKeeper?.name}.` 
                        : `Sayang sekali! Kiper lawan ${selectedKeeper?.name} memenangkan adu penalti ini dengan skor ${keeperScore}-${playerScore}.`
                      }
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center max-w-sm mx-auto">
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-[#b26d27] hover:bg-[#9b5a1b] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Main Lagi (Pilih Pemain)
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
