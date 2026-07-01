import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, USERS } from "../context";
import { Eye, EyeOff, ShieldAlert, KeyRound, User as UserIcon, Building, X, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [demoTab, setDemoTab] = useState<"all" | "pengguna" | "kasubbag" | "solver" | "operator">("all");
  const [isDemoOpen, setIsDemoOpen] = useState(false);

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }

    const success = login(username.trim(), password.trim());
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
        <div className="text-center text-[10px] text-gray-400 font-mono tracking-widest mt-8">
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
          <g transform="translate(240, 260)">
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
          <g transform="translate(370, 230) scale(0.85)">
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
    </div>
  );
}
