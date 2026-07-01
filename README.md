# Melati V2 - Portal Layanan Teknologi Informasi BPK RI

**Melati V2** (Portal Layanan TI BPK) adalah sistem manajemen tiket bantuan teknis dan permintaan layanan teknologi informasi terpadu yang dirancang khusus untuk memfasilitasi kebutuhan pegawai di lingkungan **Badan Pemeriksa Keuangan Republik Indonesia (BPK RI)**.

Aplikasi ini mengintegrasikan kecerdasan buatan (AI) menggunakan **Google Gemini** untuk memudahkan pelapor mengklasifikasikan permasalahan mereka secara otomatis ke dalam katalog layanan TI resmi.

---

## 👥 Sistem Multi-Role (Aktor Sistem)

Aplikasi ini mendukung simulasi alur kerja tiket lengkap dengan 4 peran (roles) utama:

1. **Pelapor (Pengguna / Pegawai BPK)**
   * Melaporkan insiden, masalah, atau mengajukan permintaan layanan baru.
   * Melacak status tiket secara real-time.
   * Berinteraksi dengan **Virtual Assistant (Gemini AI)** untuk mendapatkan rekomendasi kategori layanan secara cerdas.
   * Menambahkan komentar atau catatan pada tiket aktif.

2. **Operator (Helpdesk TI)**
   * Menerima tiket masuk dari seluruh pegawai.
   * Melakukan triage (penyaringan) dan klasifikasi awal tiket.
   * Mengalihkan tiket ke Subbagian TI yang relevan (reassign).
   * Memantau dasbor analitik kinerja helpdesk secara menyeluruh (SLA, volume tiket, breakdown per subbagian).

3. **Kasubbag (Kepala Subbagian TI)**
   * Meninjau tiket yang masuk ke Subbagian kepemimpinannya.
   * Menugaskan Solver (teknisi spesifik) untuk menyelesaikan tiket.
   * Menyelesaikan tiket secara langsung (Direct Completion).
   * Mengembalikan tiket ke operator (`Kembalikan tiket ke operator`) jika tiket tidak sesuai dengan wewenang subbagiannya beserta alasannya.

4. **Solver (Teknisi / Eksekutor Lapangan)**
   * Menerima penugasan tugas dari Kasubbag.
   * Mengubah status pekerjaan menjadi "Sedang Dikerjakan".
   * Melakukan eskalasi kembali ke Kasubbag jika memerlukan arahan lebih lanjut.
   * Menambahkan komentar teknis dalam forum penyelesaian tiket.

---

## ✨ Fitur Unggulan

* **Virtual Assistant AI (Google Gemini)**: Menggunakan SDK Google Gen AI (`@google/genai`) untuk memindai deskripsi masalah pengguna secara natural dan otomatis memberikan rekomendasi Kategori (Lvl 1), Sub-Layanan (Lvl 2), dan Detail Item Layanan (Lvl 3) yang presisi sesuai katalog layanan resmi BPK.
* **Dasbor Analitik Interaktif**: Dasbor Operator dilengkapi dengan grafik visualisasi data (menggunakan Recharts) untuk memantau status penyelesaian tiket, tingkat keberhasilan SLA, dan sebaran volume kerja per subbagian.
* **Audit Trail & Forum Komentar**: Setiap aksi dari aktor sistem (terima, tugaskan, kerjakan, kembalikan ke operator, selesai) dicatat secara otomatis dalam log sistem di dalam thread komentar tiket.
* **Desain UI/UX Premium**: Dibangun menggunakan kombinasi **React**, **Vite**, **Tailwind CSS**, dan **Motion** untuk animasi transisi mikro yang mulus dengan estetika warna khas BPK.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend**: React 19 (TypeScript)
* **Routing**: React Router DOM v7
* **Styling**: Tailwind CSS & Vanilla CSS
* **Animasi**: Motion (Framer Motion) & Lucide Icons
* **Grafik & Data**: Recharts
* **Backend**: Express.js (Node.js) & TSX (TypeScript Execute)
* **Kecerdasan Buatan**: SDK Google Gen AI (`@google/genai` - Gemini 2.5 Flash)

---

## 🚀  Cara Menjalankan Project Secara Lokal

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** pada sistem Anda.

### Langkah-langkah
1. **Instalasi Dependensi**
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variable**
   Salin file `.env` ke `.env.local` atau buat file baru `.env` di root direktori, lalu isi dengan API Key Gemini Anda:
   ```env
   GEMINI_API_KEY=masukkan_api_key_gemini_anda_di_sini
   ```

3. **Jalankan Aplikasi dalam Mode Development**
   ```bash
   npm run dev
   ```
   Buka browser Anda dan akses aplikasi di: `http://localhost:3000`

4. **Uji Coba Demo Akun**
   Pada halaman login, Anda dapat menggunakan tombol **"UJI COBA"** di pojok kanan untuk memilih profil simulasi instan (Pelapor, Operator, Kasubbag, Solver) tanpa harus memasukkan kredensial secara manual.
