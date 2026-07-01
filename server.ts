import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import mysql from "mysql2/promise";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Setup MySQL Connection Pool (graceful warning if XAMPP is offline)
let pool: mysql.Pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "db_layanan_ti",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000
  });
  console.log("MySQL connection pool created successfully on http://localhost:3306");
} catch (err) {
  console.error("CRITICAL: Failed to initialize MySQL Connection Pool:", err);
}

// Middleware to verify database connectivity before routing DB API requests
const checkDbConnection = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (!pool) {
      throw new Error("Database pool is not initialized.");
    }
    // Ping DB to test connection
    const conn = await pool.getConnection();
    conn.release();
    next();
  } catch (error: any) {
    console.error("Database connection failure:", error.message);
    res.status(503).json({
      error: "Koneksi database ke phpMyAdmin gagal.",
      details: "Pastikan XAMPP Apache & MySQL sudah aktif dan database 'db_layanan_ti' sudah diimport menggunakan file database.sql."
    });
  }
};

// Initialize Google Gen AI SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Parse JSON bodies
app.use(express.json());

// Service Catalog definition for AI model guidance
const SERVICE_CATALOG_GUIDE = `
1. Kategori: "Layanan Identitas"
   - Sub-Layanan: "Layanan Akun"
     * Items: "Pembuatan Akun Baru Portal BPK", "Reset Password / Masalah Login", "Perubahan Hak Akses Aplikasi", "Penghapusan / Penonaktifan Akun Pegawai"
   - Sub-Layanan: "Layanan TTE"
     * Items: "Registrasi Sertifikat TTE Baru", "Perpanjangan Masa Aktif TTE", "Pencabutan Sertifikat TTE", "Troubleshooting Tanda Tangan Elektronik Gagal"
   - Sub-Layanan: "Layanan Segel Elektronik"
     * Items: "Penerbitan Segel Baru Instansi", "Perpanjangan Masa Aktif Segel", "Masalah Verifikasi Segel Elektronik"
   - Sub-Layanan: "Layanan Email"
     * Items: "Pembuatan Email Baru @bpk.go.id", "Reset Password Email Dinas", "Masalah Kuota Email Penuh", "Konfigurasi Mail Client (Outlook/Thunderbird/HP)"
   - Sub-Layanan: "Layanan MFA"
     * Items: "Registrasi Multi-Factor Authentication Baru", "Reset Token MFA / Google Authenticator", "Masalah Sinkronisasi Waktu MFA"

2. Kategori: "Layanan Data"
   - Sub-Layanan: "Pengelolaan Data"
     * Items: "Perencanaan Data", "Pengumpulan Data", "Pengolahan Data", "Penyimpanan Data", "Penyebarluasan Data", "Analisis Data", "Pengamanan Data", "Pemusnahan Data"
   - Sub-Layanan: "Layanan Sistem Layanan Data"
     * Items: "BIDICS Dashboard", "BIDICS-SSA"

3. Kategori: "Layanan Aplikasi"
   - Sub-Layanan: "Pengembangan Aplikasi"
     * Items: "Permintaan Fitur Baru Aplikasi", "Pelaporan Bug / Error Aplikasi", "Uji Coba / Testing Aplikasi Baru", "Integrasi API Antar Aplikasi BPK"
   - Sub-Layanan: "Aplikasi Pemeriksaan"
     * Items: "SiAP-BPK (Sistem Informasi Pemeriksaan)", "Aplikasi E-Audit Pemeriksaan Pusat", "Aplikasi Kertas Kerja Pemeriksaan (KKP)", "Masalah Sinkronisasi Offline SiAP-BPK"
   - Sub-Layanan: "Aplikasi Kelembagaan"
     * Items: "Aplikasi Kepegawaian (SISDM BPK)", "Aplikasi Keuangan (SIKAD BPK)", "Aplikasi Persuratan Dinas (E-Office)", "Aplikasi Perjalanan Dinas Pegawai"
   - Sub-Layanan: "Aplikasi Pendukung"
     * Items: "Aplikasi Manajemen Risiko Biro TI", "Aplikasi Helpdesk Biro TI", "Aplikasi Presensi Pegawai BPK"
   - Sub-Layanan: "Aplikasi Kolaborasi"
     * Items: "Microsoft Teams BPK", "BPK Cloud Storage (Nextcloud)", "Aplikasi Survei Internal BPK"
   - Sub-Layanan: "Layanan Survei"
     * Items: "Pembuatan Kuesioner Baru", "Analisis Hasil Survei Internal", "Export Data Survei Pegawai"

4. Kategori: "Layanan Teknologi"
   - Sub-Layanan: "Layanan Intranet"
     * Items: "Pembuatan Local Area Network (LAN)", "Pengaturan konfigurasi LAN", "Penonaktifan LAN", "Penyediaan kabel LAN", "Pemasangan perangkat Wireless Fidelity (Wifi)", "Pengaturan konfigurasi Wifi", "Penonaktifan Wifi"
   - Sub-Layanan: "Layanan Internet"
     * Items: "Pemasangan perangkat koneksi internet", "Pengaturan konfigurasi perangkat koneksi internet", "Penonaktifan perangkat koneksi internet"
   - Sub-Layanan: "Layanan Virtual Private Network"
     * Items: "Pemasangan VPN", "Pengaturan konfigurasi VPN", "Penonaktifan VPN"
   - Sub-Layanan: "Layanan Hosting"
     * Items: "Pendaftaran hosting subdomain", "Pengaturan konfigurasi hosting subdomain", "Penonaktifan hosting subdomain"

5. Kategori: "Layanan Perangkat"
   - Sub-Layanan: "Standarisasi Perangkat Komputer"
     * Items: "Konsultasi Spesifikasi PC/Laptop", "Verifikasi Kelayakan Perangkat Lama", "Instalasi OS Standar BPK RI"
   - Sub-Layanan: "Pemeliharaan Perangkat"
     * Items: "Pembersihan Hardware PC/Laptop", "Perbaikan Kerusakan Fisik Laptop Dinas", "Instalasi Antivirus / Scan Malware Perangkat"
   - Sub-Layanan: "Peminjaman Perangkat"
     * Items: "Peminjaman Laptop Rapat Paripurna", "Peminjaman Projector / Proyektor", "Peminjaman Sound System", "Pengembalian Perangkat Pinjaman"
   - Sub-Layanan: "Penyediaan Barang Persediaan"
     * Items: "Penyediaan Toner / Tinta Printer Biro", "Penyediaan Mouse / Keyboard Baru", "Penyediaan Kabel Konektor Display / HDMI"

6. Kategori: "Layanan Dukungan TI Untuk Kegiatan Khusus"
   - Sub-Layanan: "Pendampingan Personel TI"
     * Items: "Pendampingan Sidang / Rapat Pleno", "Pendampingan Pemeriksaan Lapangan (On-Site Audit)", "Pendampingan Diklat / Pelatihan TIK", "Dukungan TI Acara Nasional BPK"

7. Kategori: "Layanan Informasi"
   - Sub-Layanan: "Knowledge Base Produk TI"
     * Items: "Permintaan User Manual SiAP", "Permintaan Video Panduan Aplikasi", "FAQ Portal Layanan TI BPK"
   - Sub-Layanan: "Informasi Produk TI"
     * Items: "Katalog Layanan Biro TI Terbaru", "Spesifikasi Hardware Terbaru Standard BPK", "Status Rilis Aplikasi Baru Biro TI"
   - Sub-Layanan: "Tugas dan Fungsi Biro TI"
     * Items: "Struktur Organisasi Biro TI Pusat", "SOP Pelayanan Layanan TI BPK", "Uraian Tugas Subbagian TI"
`;

// API routes FIRST

// DB API: Get all tickets + comments
app.get("/api/tickets", checkDbConnection, async (req, res) => {
  try {
    const [tickets]: any = await pool.query("SELECT * FROM tickets ORDER BY tanggalUpdate DESC");
    const [comments]: any = await pool.query("SELECT * FROM comments ORDER BY timestamp ASC");
    
    const ticketsWithComments = tickets.map((t: any) => {
      return {
        ...t,
        tanggalSelesai: t.tanggalSelesai || undefined,
        kasubbagId: t.kasubbagId || undefined,
        kasubbagName: t.kasubbagName || undefined,
        solverId: t.solverId || undefined,
        solverName: t.solverName || undefined,
        alasanTolak: t.alasanTolak || undefined,
        catatanKasubbag: t.catatanKasubbag || undefined,
        comments: comments
          .filter((c: any) => c.ticketId === t.id)
          .map((c: any) => ({
            id: c.id,
            authorId: c.authorId,
            authorName: c.authorName,
            authorRole: c.authorRole,
            text: c.text,
            timestamp: c.timestamp,
            type: c.type
          }))
      };
    });
    
    return res.json(ticketsWithComments);
  } catch (err: any) {
    console.error("Database fetch tickets error:", err);
    return res.status(500).json({ error: "Gagal mengambil data tiket dari database." });
  }
});

// DB API: Create new ticket
app.post("/api/tickets", checkDbConnection, async (req, res) => {
  const { id, pengirimId, pengirimName, jenis, layananKategori, layananSub, layanan, detail, tanggal, tanggalUpdate, kasubbagId, kasubbagName, status, comments } = req.body;
  try {
    await pool.query(
      "INSERT INTO tickets (id, pengirimId, pengirimName, jenis, layananKategori, layananSub, layanan, detail, tanggal, tanggalUpdate, kasubbagId, kasubbagName, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, pengirimId, pengirimName, jenis, layananKategori, layananSub, layanan, detail, tanggal, tanggalUpdate, kasubbagId || null, kasubbagName || null, status]
    );

    if (comments && comments.length > 0) {
      for (const c of comments) {
        await pool.query(
          "INSERT INTO comments (id, ticketId, authorId, authorName, authorRole, text, timestamp, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [c.id, id, c.authorId, c.authorName, c.authorRole, c.text, c.timestamp, c.type]
        );
      }
    }

    return res.json({ success: true, id });
  } catch (err: any) {
    console.error("Database insert ticket error:", err);
    return res.status(500).json({ error: "Gagal menyimpan tiket ke database." });
  }
});

// DB API: Update ticket details and insert comment
app.post("/api/tickets/:id/actions", checkDbConnection, async (req, res) => {
  const { id } = req.params;
  const { status, kasubbagId, kasubbagName, solverId, solverName, alasanTolak, catatanKasubbag, tanggalSelesai, tanggalUpdate, comment } = req.body;
  try {
    await pool.query(
      "UPDATE tickets SET status = ?, kasubbagId = ?, kasubbagName = ?, solverId = ?, solverName = ?, alasanTolak = ?, catatanKasubbag = ?, tanggalSelesai = ?, tanggalUpdate = ? WHERE id = ?",
      [status, kasubbagId || null, kasubbagName || null, solverId || null, solverName || null, alasanTolak || null, catatanKasubbag || null, tanggalSelesai || null, tanggalUpdate, id]
    );

    if (comment) {
      await pool.query(
        "INSERT INTO comments (id, ticketId, authorId, authorName, authorRole, text, timestamp, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [comment.id, id, comment.authorId, comment.authorName, comment.authorRole, comment.text, comment.timestamp, comment.type]
      );
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error("Database update action error:", err);
    return res.status(500).json({ error: "Gagal memperbarui data tiket di database." });
  }
});

// DB API: Add comment to ticket
app.post("/api/tickets/:id/comments", checkDbConnection, async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  try {
    await pool.query(
      "INSERT INTO comments (id, ticketId, authorId, authorName, authorRole, text, timestamp, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [comment.id, id, comment.authorId, comment.authorName, comment.authorRole, comment.text, comment.timestamp, comment.type]
    );

    await pool.query(
      "UPDATE tickets SET tanggalUpdate = ? WHERE id = ?",
      [comment.timestamp, id]
    );

    return res.json({ success: true });
  } catch (err: any) {
    console.error("Database insert comment error:", err);
    return res.status(500).json({ error: "Gagal menyimpan komentar ke database." });
  }
});

app.post("/api/chat-recommend", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    if (!ai) {
      return res.status(500).json({
        error: "Google Gemini API Key is not configured on the server. Please add GEMINI_API_KEY under Settings > Secrets.",
      });
    }

    // Format chat history for Gemini API
    const contents = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // System instruction defining personality and BPK RI Service Catalog
    const systemInstruction = `Anda adalah Asisten Virtual Layanan TI BPK RI (Badan Pemeriksa Keuangan Republik Indonesia).
Tugas utama Anda adalah membantu pengguna (pegawai BPK) mengidentifikasi dan mencocokkan masalah TI mereka dengan Katalog Layanan TI BPK RI secara akurat menggunakan kecerdasan buatan, sekaligus memberikan jawaban panduan yang ramah dan solutif.

Berikut adalah Katalog Layanan TI BPK RI yang valid dan resmi:
${SERVICE_CATALOG_GUIDE}

Aturan Pencocokan:
1. Jika kendala yang diceritakan pengguna dapat dipetakan secara logis ke salah satu Layanan Level 3 (items) di katalog di atas, Anda WAJIB memberikan rekomendasi tersebut.
2. Nama "category", "sub", dan "service" di dalam objek "recommendation" harus SANGAT PERSIS (exact match) dengan teks yang ada di katalog di atas. Jangan disingkat atau diubah.
3. Berikan penilaian tingkat keyakinan ("confidence"):
   - "Tinggi": Jika pengguna menyebutkan kata kunci atau konteks yang sangat jelas cocok dengan layanan spesifik.
   - "Sedang": Jika konteks merujuk secara tidak langsung namun kuat ke layanan tersebut.
   - "Rendah": Jika ada keraguan atau minim detail.
4. Jika tidak ada kecocokan yang masuk akal, atau pengguna hanya mengobrol santai (greeting/sapaan), biarkan objek "recommendation" bernilai null.

Format respons Anda harus SELALU berupa objek JSON yang valid dengan struktur berikut:
{
  "reply": "Jawaban sapaan atau penjelasan bantuan Anda dalam Bahasa Indonesia yang ramah dan profesional.",
  "recommendation": {
    "category": "Nama Kategori Level 1",
    "sub": "Nama Sub-Layanan Level 2",
    "service": "Nama Detail Layanan Level 3",
    "confidence": "Tinggi" | "Sedang" | "Rendah",
    "score": 5 // Angka keyakinan antara 1-5
  }
}

Atau jika tidak ada kecocokan:
{
  "reply": "Jawaban sapaan atau penjelasan bantuan Anda.",
  "recommendation": null
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Jawaban ramah bahasa Indonesia menjelaskan cara menyelesaikan kendala.",
            },
            recommendation: {
              type: Type.OBJECT,
              description: "Rekomendasi pemetaan katalog layanan resmi BPK RI, atau null jika tidak ada yang cocok.",
              properties: {
                category: { type: Type.STRING, description: "Kategori Level 1 dari Katalog Layanan" },
                sub: { type: Type.STRING, description: "Sub-Layanan Level 2 dari Katalog Layanan" },
                service: { type: Type.STRING, description: "Detail Layanan Level 3 dari Katalog Layanan" },
                confidence: { type: Type.STRING, description: "Tinggi, Sedang, atau Rendah" },
                score: { type: Type.NUMBER, description: "Skor keyakinan 1-5" },
              },
              required: ["category", "sub", "service", "confidence", "score"],
            },
          },
          required: ["reply"],
        },
      },
    });

    const resultText = response.text || "{}";
    const parsedResult = JSON.parse(resultText);

    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Gemini API Error in Server:", error);
    return res.status(500).json({
      error: "Gagal memproses AI Chatbot. Pastikan konfigurasi API Key sudah benar.",
      details: error?.message || String(error),
    });
  }
});

// Vite middleware for development or static file serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
