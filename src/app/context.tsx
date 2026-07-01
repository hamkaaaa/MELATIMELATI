import React, { createContext, useContext, useState, useEffect } from "react";

// --- TYPES ---
export type Role = "pengguna" | "kasubbag" | "solver" | "operator";

export type TicketStatus =
  | "Pending"       // baru masuk
  | "Diterima"      // diterima kasubbag
  | "Ditugaskan"    // assigned ke solver
  | "Dikerjakan"    // solver mulai kerjakan
  | "Dieskalasi"    // solver eskalasi balik ke kasubbag
  | "Selesai"       // selesai
  | "Kembalikan tiket ke operator"       // Kembalikan tiket ke operator
  | "Eskalasi";     // eskalasi ke operator (opsional)

export type JenisLaporan = "Insiden" | "Permintaan" | "Masalah";

export type CommentType =
  | "komentar" | "sistem" | "terima" | "penugasan"
  | "mulai_kerjakan" | "penyelesaian" | "Kembalikan tiket ke operator" | "eskalasi";

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  text: string;
  timestamp: string; // "YYYY-MM-DD HH:mm"
  type: CommentType;
}

export interface Ticket {
  id: string;                  // "TKT-2026-001"
  pengirimId: string;
  pengirimName: string;
  jenis: JenisLaporan;
  layananKategori: string;     // level 1
  layananSub: string;          // level 2
  layanan: string;             // level 3 (paling spesifik)
  detail: string;
  tanggal: string;             // YYYY-MM-DD
  tanggalUpdate: string;
  tanggalSelesai?: string;
  kasubbagId: string;          // auto-routed
  kasubbagName: string;
  solverId?: string;
  solverName?: string;
  status: TicketStatus;
  catatanKasubbag?: string;
  alasanTolak?: string;
  isRejectedBySubbag?: boolean;
  comments: Comment[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: Role;
  subbagId?: string; // untuk kasubbag & solver
}

// --- MASTER DATA ---

export const SUBBAG_MASTER: Record<string, string> = {
  k1: "Subbagian Pengelolaan Infrastruktur dan Jaringan",
  k2: "Subbagian Pelayanan TIK",
  k3: "Subbagian Pengembangan Sistem Informasi Pemeriksaan",
  k4: "Subbagian Pengembangan Sistem Informasi Kelembagaan",
  k5: "Subbagian Sains Data",
  k6: "Subbagian Tata Kelola Data",
  k7: "Subbagian Keamanan Informasi",
  k8: "Subbagian MIOT",
};

export const SUBBAGS: Record<string, { id: string; name: string }> = {
  "Layanan Identitas":                          { id: "k2", name: SUBBAG_MASTER.k2 },
  "Layanan Data":                               { id: "k6", name: SUBBAG_MASTER.k6 },
  "Layanan Aplikasi":                           { id: "k3", name: SUBBAG_MASTER.k3 },
  "Layanan Teknologi":                          { id: "k1", name: SUBBAG_MASTER.k1 },
  "Layanan Perangkat":                          { id: "k2", name: SUBBAG_MASTER.k2 },
  "Layanan Dukungan TI Untuk Kegiatan Khusus": { id: "k2", name: SUBBAG_MASTER.k2 },
  "Layanan Informasi":                          { id: "k5", name: SUBBAG_MASTER.k5 },
};

// Users definition
export const USERS: User[] = [
  // PENGGUNA
  { id: "u1", name: "Budi Santoso", username: "budi", password: "budi123", role: "pengguna" },
  { id: "u2", name: "Siti Rahayu", username: "siti", password: "siti123", role: "pengguna" },
  { id: "u3", name: "Ahmad Fauzi", username: "ahmad", password: "ahmad123", role: "pengguna" },
  { id: "u4", name: "Dewi Kusuma", username: "dewi", password: "dewi123", role: "pengguna" },

  // KASUBBAG (pass123)
  { id: "k1", name: "Ir. Hartono, M.T.", username: "kasubbag.infrastruktur", password: "pass123", role: "kasubbag", subbagId: "k1" },
  { id: "k2", name: "Dra. Wulandari, M.Si.", username: "kasubbag.pelayanan", password: "pass123", role: "kasubbag", subbagId: "k2" },
  { id: "k3", name: "Rizal Pratama, S.T.", username: "kasubbag.si.pemeriksaan", password: "pass123", role: "kasubbag", subbagId: "k3" },
  { id: "k4", name: "Hendra Gunawan, S.Kom.", username: "kasubbag.si.kelembagaan", password: "pass123", role: "kasubbag", subbagId: "k4" },
  { id: "k5", name: "Dr. Nuraini, M.Sc.", username: "kasubbag.sains.data", password: "pass123", role: "kasubbag", subbagId: "k5" },
  { id: "k6", name: "Bambang Susilo, S.Kom.", username: "kasubbag.tata.kelola", password: "pass123", role: "kasubbag", subbagId: "k6" },
  { id: "k7", name: "Rina Marliani, M.M.", username: "kasubbag.keamanan", password: "pass123", role: "kasubbag", subbagId: "k7" },
  { id: "k8", name: "Teguh Prasetyo, S.T.", username: "kasubbag.miot", password: "pass123", role: "kasubbag", subbagId: "k8" },

  // SOLVER (solver123)
  { id: "s1_1", name: "Supriyadi (Infra Solver 1)", username: "solver.infra.1", password: "solver123", role: "solver", subbagId: "k1" },
  { id: "s1_2", name: "Aris Nugroho (Infra Solver 2)", username: "solver.infra.2", password: "solver123", role: "solver", subbagId: "k1" },
  { id: "s1_3", name: "Dimas Saputra (Infra Solver 3)", username: "solver.infra.3", password: "solver123", role: "solver", subbagId: "k1" },

  { id: "s2_1", name: "Farah Amalia (TIK Solver 1)", username: "solver.tik.1", password: "solver123", role: "solver", subbagId: "k2" },
  { id: "s2_2", name: "Bayu Anggara (TIK Solver 2)", username: "solver.tik.2", password: "solver123", role: "solver", subbagId: "k2" },
  { id: "s2_3", name: "Sonia Fitri (TIK Solver 3)", username: "solver.tik.3", password: "solver123", role: "solver", subbagId: "k2" },

  { id: "s3_1", name: "Deni Ardiansyah (SIM-P Solver 1)", username: "solver.sim.p1", password: "solver123", role: "solver", subbagId: "k3" },
  { id: "s3_2", name: "Eko Prasetyo (SIM-P Solver 2)", username: "solver.sim.p2", password: "solver123", role: "solver", subbagId: "k3" },
  { id: "s3_3", name: "Lilis Handayani (SIM-P Solver 3)", username: "solver.sim.p3", password: "solver123", role: "solver", subbagId: "k3" },

  { id: "s4_1", name: "Wawan Hermawan (SIM-K Solver 1)", username: "solver.sim.k1", password: "solver123", role: "solver", subbagId: "k4" },
  { id: "s4_2", name: "Fitriani (SIM-K Solver 2)", username: "solver.sim.k2", password: "solver123", role: "solver", subbagId: "k4" },
  { id: "s4_3", name: "Aditya Pratama (SIM-K Solver 3)", username: "solver.sim.k3", password: "solver123", role: "solver", subbagId: "k4" },

  { id: "s5_1", name: "Rian Setiawan (Sains Solver 1)", username: "solver.sains.1", password: "solver123", role: "solver", subbagId: "k5" },
  { id: "s5_2", name: "Kartika Sari (Sains Solver 2)", username: "solver.sains.2", password: "solver123", role: "solver", subbagId: "k5" },
  { id: "s5_3", name: "Andi Wijaya (Sains Solver 3)", username: "solver.sains.3", password: "solver123", role: "solver", subbagId: "k5" },

  { id: "s6_1", name: "Heri Susanto (Tata Kelola Solver 1)", username: "solver.tata.1", password: "solver123", role: "solver", subbagId: "k6" },
  { id: "s6_2", name: "Melinda Putri (Tata Kelola Solver 2)", username: "solver.tata.2", password: "solver123", role: "solver", subbagId: "k6" },
  { id: "s6_3", name: "Yudi Darmawan (Tata Kelola Solver 3)", username: "solver.tata.3", password: "solver123", role: "solver", subbagId: "k6" },

  { id: "s7_1", name: "Angga Saputra (Sec Solver 1)", username: "solver.sec.1", password: "solver123", role: "solver", subbagId: "k7" },
  { id: "s7_2", name: "Diana Lestari (Sec Solver 2)", username: "solver.sec.2", password: "solver123", role: "solver", subbagId: "k7" },
  { id: "s7_3", name: "Rudi Hartono (Sec Solver 3)", username: "solver.sec.3", password: "solver123", role: "solver", subbagId: "k7" },

  { id: "s8_1", name: "Fajar Ramadan (MIOT Solver 1)", username: "solver.miot.1", password: "solver123", role: "solver", subbagId: "k8" },
  { id: "s8_2", name: "Indah Permata (MIOT Solver 2)", username: "solver.miot.2", password: "solver123", role: "solver", subbagId: "k8" },
  { id: "s8_3", name: "Agung Hidayat (MIOT Solver 3)", username: "solver.miot.3", password: "solver123", role: "solver", subbagId: "k8" },

  // OPERATOR
  { id: "op1", name: "Operator TI Utama BPK", username: "admin", password: "admin123", role: "operator" }
];

// --- 3 LEVEL SERVICE CATALOG ---
export interface ServiceCatalogNode {
  category: string;
  subs: {
    name: string;
    items: string[];
  }[];
}

export const SERVICE_CATALOG: ServiceCatalogNode[] = [
  {
    category: "Layanan Identitas",
    subs: [
      {
        name: "Layanan Akun",
        items: [
          "Pembuatan Akun Baru Portal BPK",
          "Reset Password / Masalah Login",
          "Perubahan Hak Akses Aplikasi",
          "Penghapusan / Penonaktifan Akun Pegawai"
        ]
      },
      {
        name: "Layanan TTE",
        items: [
          "Registrasi Sertifikat TTE Baru",
          "Perpanjangan Masa Aktif TTE",
          "Pencabutan Sertifikat TTE",
          "Troubleshooting Tanda Tangan Elektronik Gagal"
        ]
      },
      {
        name: "Layanan Segel Elektronik",
        items: [
          "Penerbitan Segel Baru Instansi",
          "Perpanjangan Masa Aktif Segel",
          "Masalah Verifikasi Segel Elektronik"
        ]
      },
      {
        name: "Layanan Email",
        items: [
          "Pembuatan Email Baru @bpk.go.id",
          "Reset Password Email Dinas",
          "Masalah Kuota Email Penuh",
          "Konfigurasi Mail Client (Outlook/Thunderbird/HP)"
        ]
      },
      {
        name: "Layanan MFA",
        items: [
          "Registrasi Multi-Factor Authentication Baru",
          "Reset Token MFA / Google Authenticator",
          "Masalah Sinkronisasi Waktu MFA"
        ]
      }
    ]
  },
  {
    category: "Layanan Data",
    subs: [
      {
        name: "Pengelolaan Data",
        items: [
          "Perencanaan Data Pemeriksaan",
          "Pengumpulan Data dari Entitas",
          "Pengolahan Data Audit BPK",
          "Penyimpanan Data di Gudang Data Pusat",
          "Penyebarluasan Data / Data Sharing",
          "Analisis Data & Visualisasi",
          "Pengamanan Data & Enkripsi Data Sensitif",
          "Pemusnahan Data Sesuai Retensi"
        ]
      },
      {
        name: "Layanan Sistem Layanan Data",
        items: [
          "BIDICS Dashboard (Pemantauan Tindak Lanjut)",
          "BIDICS-SSA (Self Service Analytics)"
        ]
      }
    ]
  },
  {
    category: "Layanan Aplikasi",
    subs: [
      {
        name: "Pengembangan Aplikasi",
        items: [
          "Permintaan Fitur Baru Aplikasi",
          "Pelaporan Bug / Error Aplikasi",
          "Uji Coba / Testing Aplikasi Baru",
          "Integrasi API Antar Aplikasi BPK"
        ]
      },
      {
        name: "Aplikasi Pemeriksaan",
        items: [
          "SiAP-BPK (Sistem Informasi Pemeriksaan)",
          "Aplikasi E-Audit Pemeriksaan Pusat",
          "Aplikasi Kertas Kerja Pemeriksaan (KKP)",
          "Masalah Sinkronisasi Offline SiAP-BPK"
        ]
      },
      {
        name: "Aplikasi Kelembagaan",
        items: [
          "Aplikasi Kepegawaian (SISDM BPK)",
          "Aplikasi Keuangan (SIKAD BPK)",
          "Aplikasi Persuratan Dinas (E-Office)",
          "Aplikasi Perjalanan Dinas Pegawai"
        ]
      },
      {
        name: "Aplikasi Pendukung",
        items: [
          "Aplikasi Manajemen Risiko Biro TI",
          "Aplikasi Helpdesk Biro TI",
          "Aplikasi Presensi Pegawai BPK"
        ]
      },
      {
        name: "Aplikasi Kolaborasi",
        items: [
          "Microsoft Teams BPK",
          "BPK Cloud Storage (Nextcloud)",
          "Aplikasi Survei Internal BPK"
        ]
      },
      {
        name: "Layanan Survei",
        items: [
          "Pembuatan Kuesioner Baru",
          "Analisis Hasil Survei Internal",
          "Export Data Survei Pegawai"
        ]
      }
    ]
  },
  {
    category: "Layanan Teknologi",
    subs: [
      {
        name: "Layanan Intranet",
        items: [
          "Pembuatan Local Area Network (LAN)",
          "Pengaturan konfigurasi switch LAN",
          "Penonaktifan LAN area tertentu",
          "Penyediaan kabel LAN ruang kerja",
          "Pemasangan perangkat Wireless Fidelity (Wifi)",
          "Pengaturan konfigurasi Wifi Biro",
          "Penonaktifan Wifi BPK"
        ]
      },
      {
        name: "Layanan Internet",
        items: [
          "Pemasangan perangkat koneksi internet",
          "Pengaturan konfigurasi perangkat koneksi internet",
          "Penonaktifan perangkat koneksi internet"
        ]
      },
      {
        name: "Layanan Virtual Private Network",
        items: [
          "Pemasangan VPN BPK di Laptop",
          "Pengaturan konfigurasi akses VPN",
          "Penonaktifan VPN Pegawai"
        ]
      },
      {
        name: "Layanan Hosting",
        items: [
          "Pendaftaran hosting subdomain *.bpk.go.id",
          "Pengaturan konfigurasi hosting subdomain",
          "Penonaktifan hosting subdomain"
        ]
      }
    ]
  },
  {
    category: "Layanan Perangkat",
    subs: [
      {
        name: "Standarisasi Perangkat Komputer",
        items: [
          "Konsultasi Spesifikasi PC/Laptop",
          "Verifikasi Kelayakan Perangkat Lama",
          "Instalasi OS Standar BPK RI"
        ]
      },
      {
        name: "Pemeliharaan Perangkat",
        items: [
          "Pembersihan Hardware PC/Laptop",
          "Perbaikan Kerusakan Fisik Laptop Dinas",
          "Instalasi Antivirus / Scan Malware Perangkat"
        ]
      },
      {
        name: "Peminjaman Perangkat",
        items: [
          "Peminjaman Laptop Rapat Paripurna",
          "Peminjaman Projector / Proyektor",
          "Peminjaman Sound System",
          "Pengembalian Perangkat Pinjaman"
        ]
      },
      {
        name: "Penyediaan Barang Persediaan",
        items: [
          "Penyediaan Toner / Tinta Printer Biro",
          "Penyediaan Mouse / Keyboard Baru",
          "Penyediaan Kabel Konektor Display / HDMI"
        ]
      }
    ]
  },
  {
    category: "Layanan Dukungan TI Untuk Kegiatan Khusus",
    subs: [
      {
        name: "Pendampingan Personel TI",
        items: [
          "Pendampingan Sidang / Rapat Pleno",
          "Pendampingan Pemeriksaan Lapangan (On-Site Audit)",
          "Pendampingan Diklat / Pelatihan TIK",
          "Dukungan TI Acara Nasional BPK"
        ]
      }
    ]
  },
  {
    category: "Layanan Informasi",
    subs: [
      {
        name: "Knowledge Base Produk TI",
        items: [
          "Permintaan User Manual SiAP",
          "Permintaan Video Panduan Aplikasi",
          "FAQ Portal Layanan TI BPK"
        ]
      },
      {
        name: "Informasi Produk TI",
        items: [
          "Katalog Layanan Biro TI Terbaru",
          "Spesifikasi Hardware Terbaru Standard BPK",
          "Status Rilis Aplikasi Baru Biro TI"
        ]
      },
      {
        name: "Tugas dan Fungsi Biro TI",
        items: [
          "Struktur Organisasi Biro TI Pusat",
          "SOP Pelayanan Layanan TI BPK",
          "Uraian Tugas Subbagian TI"
        ]
      }
    ]
  }
];

// --- SEED TICKETS ---
export const SEED_TICKETS: Ticket[] = [
  {
    id: "TKT-2026-001",
    pengirimId: "u1",
    pengirimName: "Budi Santoso",
    jenis: "Insiden",
    layananKategori: "Layanan Teknologi",
    layananSub: "Layanan Intranet",
    layanan: "Penyediaan kabel LAN ruang kerja",
    detail: "Kabel LAN di ruang kerja lantai 3 Biro TI mengalami kerusakan (terkelupas/retak) sehingga koneksi internet sering terputus-putus secara tiba-tiba. Mohon bantuan penggantian kabel LAN baru yang memadai agar pekerjaan audit tidak terhambat.",
    tanggal: "2026-06-25",
    tanggalUpdate: "2026-06-25 09:15",
    kasubbagId: "k1",
    kasubbagName: "Ir. Hartono, M.T.",
    status: "Pending",
    comments: [
      {
        id: "c1_1",
        authorId: "u1",
        authorName: "Budi Santoso",
        authorRole: "pengguna",
        text: "Kabel LAN ini sangat penting karena kami sedang menyusun laporan konsolidasi nasional minggu ini.",
        timestamp: "2026-06-25 09:15",
        type: "komentar"
      }
    ]
  },
  {
    id: "TKT-2026-002",
    pengirimId: "u2",
    pengirimName: "Siti Rahayu",
    jenis: "Permintaan",
    layananKategori: "Layanan Perangkat",
    layananSub: "Pemeliharaan Perangkat",
    layanan: "Perbaikan Kerusakan Fisik Laptop Dinas",
    detail: "Laptop operasional lambat sekali saat digunakan untuk menjalankan aplikasi audit BPK yang berukuran besar. Layar laptop juga berkedip-kedip saat digerakkan. Butuh pemeriksaan hardware menyeluruh.",
    tanggal: "2026-06-26",
    tanggalUpdate: "2026-06-26 14:30",
    kasubbagId: "k2",
    kasubbagName: "Dra. Wulandari, M.Si.",
    status: "Diterima",
    comments: [
      {
        id: "c2_1",
        authorId: "k2",
        authorName: "Dra. Wulandari, M.Si.",
        authorRole: "kasubbag",
        text: "Tiket telah diterima dan disetujui. Sedang menunggu antrean penugasan teknisi.",
        timestamp: "2026-06-26 14:30",
        type: "terima"
      }
    ]
  },
  {
    id: "TKT-2026-003",
    pengirimId: "u3",
    pengirimName: "Ahmad Fauzi",
    jenis: "Insiden",
    layananKategori: "Layanan Aplikasi",
    layananSub: "Aplikasi Pemeriksaan",
    layanan: "SiAP-BPK (Sistem Informasi Pemeriksaan)",
    detail: "Mengalami error 'Access Denied (Code 403)' secara konsisten saat mencoba mengunggah berkas Kertas Kerja Pemeriksaan (KKP) pada sistem SiAP-BPK. Mohon penyesuaian hak akses.",
    tanggal: "2026-06-27",
    tanggalUpdate: "2026-06-27 10:45",
    kasubbagId: "k3",
    kasubbagName: "Rizal Pratama, S.T.",
    solverId: "s3_1",
    solverName: "Deni Ardiansyah (SIM-P Solver 1)",
    status: "Ditugaskan",
    comments: [
      {
        id: "c3_1",
        authorId: "k3",
        authorName: "Rizal Pratama, S.T.",
        authorRole: "kasubbag",
        text: "Tiket diterima.",
        timestamp: "2026-06-27 10:10",
        type: "terima"
      },
      {
        id: "c3_2",
        authorId: "k3",
        authorName: "Rizal Pratama, S.T.",
        authorRole: "kasubbag",
        text: "Menugaskan tiket ini kepada Solver Deni Ardiansyah dari subbag Pengembangan Sistem Pemeriksaan untuk ditangani.",
        timestamp: "2026-06-27 10:45",
        type: "penugasan"
      }
    ]
  },
  {
    id: "TKT-2026-004",
    pengirimId: "u4",
    pengirimName: "Dewi Kusuma",
    jenis: "Permintaan",
    layananKategori: "Layanan Identitas",
    layananSub: "Layanan Akun",
    layanan: "Reset Password / Masalah Login",
    detail: "Lupa password email dinas bpk.go.id setelah kembali dari cuti tahunan selama 2 minggu. Sudah dicoba reset mandiri namun nomor HP yang terdaftar untuk verifikasi OTP adalah nomor HP lama yang sudah tidak aktif.",
    tanggal: "2026-06-28",
    tanggalUpdate: "2026-06-28 11:20",
    kasubbagId: "k2",
    kasubbagName: "Dra. Wulandari, M.Si.",
    solverId: "s2_1",
    solverName: "Farah Amalia (TIK Solver 1)",
    status: "Dikerjakan",
    comments: [
      {
        id: "c4_1",
        authorId: "k2",
        authorName: "Dra. Wulandari, M.Si.",
        authorRole: "kasubbag",
        text: "Tiket disetujui, harap segera direset oleh tim pelayanan TIK.",
        timestamp: "2026-06-28 09:30",
        type: "terima"
      },
      {
        id: "c4_2",
        authorId: "k2",
        authorName: "Dra. Wulandari, M.Si.",
        authorRole: "kasubbag",
        text: "Ditugaskan kepada Farah Amalia.",
        timestamp: "2026-06-28 10:00",
        type: "penugasan"
      },
      {
        id: "c4_3",
        authorId: "s2_1",
        authorName: "Farah Amalia (TIK Solver 1)",
        authorRole: "solver",
        text: "Memulai proses pengecekan database email aktif dan perubahan nomor HP verifikasi di sistem SISDM BPK.",
        timestamp: "2026-06-28 11:20",
        type: "mulai_kerjakan"
      }
    ]
  },
  {
    id: "TKT-2026-005",
    pengirimId: "u1",
    pengirimName: "Budi Santoso",
    jenis: "Masalah",
    layananKategori: "Layanan Data",
    layananSub: "Layanan Sistem Layanan Data",
    layanan: "BIDICS Dashboard (Pemantauan Tindak Lanjut)",
    detail: "Dashboard Pemantauan Tindak Lanjut Rekomendasi Hasil Pemeriksaan tidak menampilkan data real-time untuk entitas Pemerintah Daerah Bali. Data terhenti di tanggal 15 Juni sedangkan sekarang sudah akhir bulan.",
    tanggal: "2026-06-24",
    tanggalUpdate: "2026-06-24 16:45",
    tanggalSelesai: "2026-06-24 16:45",
    kasubbagId: "k6",
    kasubbagName: "Bambang Susilo, S.Kom.",
    solverId: "s6_1",
    solverName: "Heri Susanto (Tata Kelola Solver 1)",
    status: "Selesai",
    catatanKasubbag: "Sinkronisasi pipa data (ETL pipeline) untuk region Bali sempat mengalami delay karena adanya update skema database lokal. Data sudah di-ingest ulang dan dashboard sekarang sudah kembali real-time.",
    comments: [
      {
        id: "c5_1",
        authorId: "k6",
        authorName: "Bambang Susilo, S.Kom.",
        authorRole: "kasubbag",
        text: "Tiket diterima.",
        timestamp: "2026-06-24 14:00",
        type: "terima"
      },
      {
        id: "c5_2",
        authorId: "k6",
        authorName: "Bambang Susilo, S.Kom.",
        authorRole: "kasubbag",
        text: "Ditugaskan ke Heri Susanto untuk re-run ETL.",
        timestamp: "2026-06-24 14:15",
        type: "penugasan"
      },
      {
        id: "c5_3",
        authorId: "s6_1",
        authorName: "Heri Susanto (Tata Kelola Solver 1)",
        authorRole: "solver",
        text: "Memulai pelacakan log scheduler ETL Bali.",
        timestamp: "2026-06-24 14:30",
        type: "mulai_kerjakan"
      },
      {
        id: "c5_4",
        authorId: "s6_1",
        authorName: "Heri Susanto (Tata Kelola Solver 1)",
        authorRole: "solver",
        text: "Selesai. Sinkronisasi pipa data (ETL pipeline) untuk region Bali sempat mengalami delay karena adanya update skema database lokal. Data sudah di-ingest ulang dan dashboard sekarang sudah kembali real-time.",
        timestamp: "2026-06-24 16:45",
        type: "penyelesaian"
      }
    ]
  },
  {
    id: "TKT-2026-006",
    pengirimId: "u2",
    pengirimName: "Siti Rahayu",
    jenis: "Permintaan",
    layananKategori: "Layanan Aplikasi",
    layananSub: "Aplikasi Kolaborasi",
    layanan: "Aplikasi Survei Internal BPK",
    detail: "Meminta bantuan pembuatan form kuesioner pribadi untuk kegiatan arisan keluarga besar di luar kedinasan BPK.",
    tanggal: "2026-06-25",
    tanggalUpdate: "2026-06-25 10:30",
    kasubbagId: "k3",
    kasubbagName: "Rizal Pratama, S.T.",
    status: "Kembalikan tiket ke operator",
    alasanTolak: "Aplikasi dan bantuan teknis Biro TI BPK hanya diperuntukkan bagi kegiatan dinas dan operasional resmi BPK RI, bukan untuk kepentingan atau urusan pribadi pegawai.",
    comments: [
      {
        id: "c6_1",
        authorId: "k3",
        authorName: "Rizal Pratama, S.T.",
        authorRole: "kasubbag",
        text: "Aplikasi dan bantuan teknis Biro TI BPK hanya diperuntukkan bagi kegiatan dinas dan operasional resmi BPK RI, bukan untuk kepentingan atau urusan pribadi pegawai.",
        timestamp: "2026-06-25 10:30",
        type: "Kembalikan tiket ke operator"
      }
    ]
  },
  {
    id: "TKT-2026-007",
    pengirimId: "u3",
    pengirimName: "Ahmad Fauzi",
    jenis: "Insiden",
    layananKategori: "Layanan Teknologi",
    layananSub: "Layanan Virtual Private Network",
    layanan: "Pemasangan VPN BPK di Laptop",
    detail: "Koneksi VPN BPK dari laptop dinas error 'TLS Handshake Timeout' secara terus menerus, tidak bisa mengakses jaringan intranet BPK semenjak tadi pagi.",
    tanggal: "2026-06-29",
    tanggalUpdate: "2026-06-29 15:10",
    kasubbagId: "k1",
    kasubbagName: "Ir. Hartono, M.T.",
    status: "Dieskalasi",
    comments: [
      {
        id: "c7_1",
        authorId: "k1",
        authorName: "Ir. Hartono, M.T.",
        authorRole: "kasubbag",
        text: "Diterima.",
        timestamp: "2026-06-29 11:00",
        type: "terima"
      },
      {
        id: "c7_2",
        authorId: "k1",
        authorName: "Ir. Hartono, M.T.",
        authorRole: "kasubbag",
        text: "Ditugaskan ke Supriyadi.",
        timestamp: "2026-06-29 11:30",
        type: "penugasan"
      },
      {
        id: "c7_3",
        authorId: "s1_1",
        authorName: "Supriyadi (Infra Solver 1)",
        authorRole: "solver",
        text: "Mulai pengecekan konfigurasi profile VPN client.",
        timestamp: "2026-06-29 12:00",
        type: "mulai_kerjakan"
      },
      {
        id: "c7_4",
        authorId: "s1_1",
        authorName: "Supriyadi (Infra Solver 1)",
        authorRole: "solver",
        text: "Setelah dicheck, ini membutuhkan konfigurasi ulang routing firewall di core switch pusat yang berada di luar hak akses Solver Infra 1. Memerlukan penanganan langsung Kasubbag atau administrator network utama.",
        timestamp: "2026-06-29 15:10",
        type: "eskalasi"
      }
    ]
  }
];

// --- APP CONTEXT INTERFACE ---
interface AppContextType {
  currentUser: User | null;
  tickets: Ticket[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createTicket: (jenis: JenisLaporan, kategori: string, sub: string, layanan: string, detail: string) => string;
  kasubbagAccept: (ticketId: string, kasubbag: User) => void;
  kasubbagAssign: (ticketId: string, solverId: string, kasubbag: User) => void;
  kasubbagComplete: (ticketId: string, notes: string, kasubbag: User) => void;
  kasubbagReject: (ticketId: string, reason: string, kasubbag: User) => void;
  solverStart: (ticketId: string, solver: User) => void;
  solverComplete: (ticketId: string, notes: string, solver: User) => void;
  solverEscalate: (ticketId: string, reason: string, solver: User) => void;
  solverClaim: (ticketId: string, solver: User) => void;
  operatorReassign: (ticketId: string, newSubbagId: string, operator: User) => void;
  addComment: (ticketId: string, text: string, type: CommentType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Load current user from session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("bpk_ti_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Load tickets from localStorage or use SEED_TICKETS
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const savedTickets = localStorage.getItem("bpk_ti_tickets_v3");
      if (savedTickets) {
        return JSON.parse(savedTickets);
      }
    } catch (e) {
      console.error("Error reading bpk_ti_tickets_v3", e);
    }
    return SEED_TICKETS;
  });

  // Save tickets to localStorage on change
  useEffect(() => {
    localStorage.setItem("bpk_ti_tickets_v3", JSON.stringify(tickets));
  }, [tickets]);

  // Helper for current timestamp
  const getTimestamp = (): string => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getLocalDate = (): string => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // Auth Operations
  const login = (username: string, password: string): boolean => {
    const matched = USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem("bpk_ti_user", JSON.stringify(matched));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("bpk_ti_user");
  };

  // Add Comment helper
  const addCommentInternal = (ticketId: string, text: string, type: CommentType, author: User) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newComment: Comment = {
            id: `cmt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            authorId: author.id,
            authorName: author.name,
            authorRole: author.role,
            text,
            timestamp: getTimestamp(),
            type,
          };
          return {
            ...t,
            tanggalUpdate: getTimestamp(),
            comments: [...t.comments, newComment],
          };
        }
        return t;
      })
    );
  };

  // Public Add Comment action
  const addComment = (ticketId: string, text: string, type: CommentType) => {
    if (!currentUser) return;
    addCommentInternal(ticketId, text, type, currentUser);
  };

  // Create Ticket Action
  const createTicket = (
    jenis: JenisLaporan,
    kategori: string,
    sub: string,
    layanan: string,
    detail: string
  ): string => {
    if (!currentUser) throw new Error("User must be logged in to create ticket");

    // Route dynamically based on Kategori
    const routingInfo = SUBBAGS[kategori] || { id: "k2", name: SUBBAG_MASTER.k2 }; // Default to k2
    const kasubbagUser = USERS.find((u) => u.role === "kasubbag" && u.subbagId === routingInfo.id);

    const ticketId = `TKT-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, "0")}`;

    const newTicket: Ticket = {
      id: ticketId,
      pengirimId: currentUser.id,
      pengirimName: currentUser.name,
      jenis,
      layananKategori: kategori,
      layananSub: sub,
      layanan,
      detail,
      tanggal: getLocalDate(),
      tanggalUpdate: getTimestamp(),
      kasubbagId: routingInfo.id,
      kasubbagName: kasubbagUser ? kasubbagUser.name : `Kasubbag ${routingInfo.name}`,
      status: "Pending",
      comments: [
        {
          id: `cmt-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          text: `Tiket baru berhasil diajukan dengan kategori "${kategori}" → "${sub}" → "${layanan}". Otomatis diteruskan ke ${routingInfo.name}.`,
          timestamp: getTimestamp(),
          type: "sistem",
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    return ticketId;
  };

  // Kasubbag Actions
  const kasubbagAccept = (ticketId: string, kasubbag: User) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const systemCmt: Comment = {
            id: `cmt-${Date.now()}`,
            authorId: kasubbag.id,
            authorName: kasubbag.name,
            authorRole: "kasubbag",
            text: `Tiket diterima oleh Kasubbag: ${kasubbag.name}.`,
            timestamp: getTimestamp(),
            type: "terima",
          };
          return {
            ...t,
            status: "Diterima" as TicketStatus,
            tanggalUpdate: getTimestamp(),
            comments: [...t.comments, systemCmt],
          };
        }
        return t;
      })
    );
  };

  const kasubbagAssign = (ticketId: string, solverId: string, kasubbag: User) => {
    const solverUser = USERS.find((u) => u.id === solverId);
    if (!solverUser) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const systemCmt: Comment = {
            id: `cmt-${Date.now()}`,
            authorId: kasubbag.id,
            authorName: kasubbag.name,
            authorRole: "kasubbag",
            text: `Menugaskan tiket ini kepada Solver: ${solverUser.name}.`,
            timestamp: getTimestamp(),
            type: "penugasan",
          };
          return {
            ...t,
            status: "Ditugaskan" as TicketStatus,
            solverId: solverUser.id,
            solverName: solverUser.name,
            tanggalUpdate: getTimestamp(),
            comments: [...t.comments, systemCmt],
          };
        }
        return t;
      })
    );
  };

  const kasubbagComplete = (ticketId: string, notes: string, kasubbag: User) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const systemCmt: Comment = {
            id: `cmt-${Date.now()}`,
            authorId: kasubbag.id,
            authorName: kasubbag.name,
            authorRole: "kasubbag",
            text: `Tiket diselesaikan langsung oleh Kasubbag. Catatan: ${notes}`,
            timestamp: getTimestamp(),
            type: "penyelesaian",
          };
          return {
            ...t,
            status: "Selesai" as TicketStatus,
            catatanKasubbag: notes,
            tanggalUpdate: getTimestamp(),
            tanggalSelesai: getTimestamp(),
            comments: [...t.comments, systemCmt],
          };
        }
        return t;
      })
    );
  };

  const kasubbagReject = (ticketId: string, reason: string, kasubbag: User) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const systemCmt: Comment = {
            id: `cmt-${Date.now()}`,
            authorId: kasubbag.id,
            authorName: kasubbag.name,
            authorRole: "kasubbag",
            text: `Kembalikan tiket ke operator. Alasan: ${reason}`,
            timestamp: getTimestamp(),
            type: "Kembalikan tiket ke operator",
          };
          return {
            ...t,
            status: "Kembalikan tiket ke operator" as TicketStatus,
            isRejectedBySubbag: true,
            alasanTolak: reason,
            tanggalUpdate: getTimestamp(),
            comments: [...t.comments, systemCmt],
          };
        }
        return t;
      })
    );
  };

  // Solver Actions
  const solverStart = (ticketId: string, solver: User) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const systemCmt: Comment = {
            id: `cmt-${Date.now()}`,
            authorId: solver.id,
            authorName: solver.name,
            authorRole: "solver",
            text: `Pekerjaan tiket dimulai oleh Solver: ${solver.name}.`,
            timestamp: getTimestamp(),
            type: "mulai_kerjakan",
          };
          return {
            ...t,
            status: "Dikerjakan" as TicketStatus,
            tanggalUpdate: getTimestamp(),
            comments: [...t.comments, systemCmt],
          };
        }
        return t;
      })
    );
  };

  const solverComplete = (ticketId: string, notes: string, solver: User) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const systemCmt: Comment = {
            id: `cmt-${Date.now()}`,
            authorId: solver.id,
            authorName: solver.name,
            authorRole: "solver",
            text: `Pekerjaan tiket ditandai selesai oleh Solver. Catatan: ${notes}`,
            timestamp: getTimestamp(),
            type: "penyelesaian",
          };
          return {
            ...t,
            status: "Selesai" as TicketStatus,
            catatanKasubbag: notes, // Store solver notes here for simplicity and shared access
            tanggalUpdate: getTimestamp(),
            tanggalSelesai: getTimestamp(),
            comments: [...t.comments, systemCmt],
          };
        }
        return t;
      })
    );
  };

  const solverEscalate = (ticketId: string, reason: string, solver: User) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const systemCmt: Comment = {
            id: `cmt-${Date.now()}`,
            authorId: solver.id,
            authorName: solver.name,
            authorRole: "solver",
            text: `Tiket dieskalasi kembali ke Kasubbag oleh Solver ${solver.name}. Alasan: ${reason}`,
            timestamp: getTimestamp(),
            type: "eskalasi",
          };
          return {
            ...t,
            status: "Dieskalasi" as TicketStatus,
            solverId: undefined, // unassign
            solverName: undefined, // unassign
            tanggalUpdate: getTimestamp(),
            comments: [...t.comments, systemCmt],
          };
        }
        return t;
      })
    );
  };

  const solverClaim = (ticketId: string, solver: User) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const systemCmt: Comment = {
            id: `cmt-${Date.now()}`,
            authorId: solver.id,
            authorName: solver.name,
            authorRole: "solver",
            text: `Tiket diambil secara mandiri oleh Solver: ${solver.name}.`,
            timestamp: getTimestamp(),
            type: "penugasan",
          };
          return {
            ...t,
            status: "Ditugaskan" as TicketStatus,
            solverId: solver.id,
            solverName: solver.name,
            tanggalUpdate: getTimestamp(),
            comments: [...t.comments, systemCmt],
          };
        }
        return t;
      })
    );
  };

  const operatorReassign = (ticketId: string, newSubbagId: string, operator: User) => {
    const subbagName = SUBBAG_MASTER[newSubbagId];
    const kasubbagUser = USERS.find((u) => u.role === "kasubbag" && u.subbagId === newSubbagId);
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const systemCmt: Comment = {
            id: `cmt-${Date.now()}`,
            authorId: operator.id,
            authorName: operator.name,
            authorRole: "operator",
            text: `Operator ${operator.name} mengalihkan tiket ke ${subbagName}.`,
            timestamp: getTimestamp(),
            type: "penugasan",
          };
          return {
            ...t,
            status: "Pending" as TicketStatus,
            isRejectedBySubbag: false, // reset the rejection flag
            kasubbagId: newSubbagId,
            kasubbagName: kasubbagUser ? kasubbagUser.name : `Kasubbag ${subbagName}`,
            solverId: undefined,
            solverName: undefined,
            alasanTolak: undefined, // clear the previous rejection reason
            tanggalUpdate: getTimestamp(),
            comments: [...t.comments, systemCmt],
          };
        }
        return t;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        tickets,
        login,
        logout,
        createTicket,
        kasubbagAccept,
        kasubbagAssign,
        kasubbagComplete,
        kasubbagReject,
        solverStart,
        solverComplete,
        solverEscalate,
        solverClaim,
        operatorReassign,
        addComment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
