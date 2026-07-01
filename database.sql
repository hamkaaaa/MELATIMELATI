-- Database: db_layanan_ti
-- phpMyAdmin SQL Dump

CREATE DATABASE IF NOT EXISTS db_layanan_ti;
USE db_layanan_ti;

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('pengguna', 'kasubbag', 'solver', 'operator') NOT NULL,
    subbagId VARCHAR(50) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(50) PRIMARY KEY,
    pengirimId VARCHAR(50) NOT NULL,
    pengirimName VARCHAR(100) NOT NULL,
    jenis VARCHAR(50) NOT NULL,
    layananKategori VARCHAR(100) NOT NULL,
    layananSub VARCHAR(100) NOT NULL,
    layanan VARCHAR(100) NOT NULL,
    detail TEXT NOT NULL,
    tanggal VARCHAR(50) NOT NULL,
    tanggalUpdate VARCHAR(50) NOT NULL,
    tanggalSelesai VARCHAR(50) NULL,
    kasubbagId VARCHAR(50) NULL,
    kasubbagName VARCHAR(100) NULL,
    solverId VARCHAR(50) NULL,
    solverName VARCHAR(100) NULL,
    status VARCHAR(50) NOT NULL,
    alasanTolak TEXT NULL,
    catatanKasubbag TEXT NULL,
    FOREIGN KEY (pengirimId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY,
    ticketId VARCHAR(50) NOT NULL,
    authorId VARCHAR(50) NOT NULL,
    authorName VARCHAR(100) NOT NULL,
    authorRole VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Seed Users Table
INSERT IGNORE INTO users (id, name, username, password, role, subbagId) VALUES
('u1', 'Budi Santoso', 'budi', 'budi123', 'pengguna', NULL),
('u2', 'Siti Rahayu', 'siti', 'siti123', 'pengguna', NULL),
('u3', 'Ahmad Fauzi', 'ahmad', 'ahmad123', 'pengguna', NULL),
('u4', 'Dewi Kusuma', 'dewi', 'dewi123', 'pengguna', NULL),
('k1', 'Ir. Hartono, M.T.', 'kasubbag.infrastruktur', 'pass123', 'kasubbag', 'k1'),
('k2', 'Dra. Wulandari, M.Si.', 'kasubbag.pelayanan', 'pass123', 'kasubbag', 'k2'),
('k3', 'Rizal Pratama, S.T.', 'kasubbag.si.pemeriksaan', 'pass123', 'kasubbag', 'k3'),
('k4', 'Hendra Gunawan, S.Kom.', 'kasubbag.si.kelembagaan', 'pass123', 'kasubbag', 'k4'),
('k5', 'Dr. Nuraini, M.Sc.', 'kasubbag.sains.data', 'pass123', 'kasubbag', 'k5'),
('k6', 'Bambang Susilo, S.Kom.', 'kasubbag.tata.kelola', 'pass123', 'kasubbag', 'k6'),
('k7', 'Rina Marliani, M.M.', 'kasubbag.keamanan', 'pass123', 'kasubbag', 'k7'),
('k8', 'Teguh Prasetyo, S.T.', 'kasubbag.miot', 'pass123', 'kasubbag', 'k8'),
('s1_1', 'Supriyadi (Infra Solver 1)', 'solver.infra.1', 'solver123', 'solver', 'k1'),
('s1_2', 'Aris Nugroho (Infra Solver 2)', 'solver.infra.2', 'solver123', 'solver', 'k1'),
('s1_3', 'Dimas Saputra (Infra Solver 3)', 'solver.infra.3', 'solver123', 'solver', 'k1'),
('s2_1', 'Farah Amalia (TIK Solver 1)', 'solver.tik.1', 'solver123', 'solver', 'k2'),
('s2_2', 'Bayu Anggara (TIK Solver 2)', 'solver.tik.2', 'solver123', 'solver', 'k2'),
('s2_3', 'Sonia Fitri (TIK Solver 3)', 'solver.tik.3', 'solver123', 'solver', 'k2'),
('s3_1', 'Deni Ardiansyah (SIM-P Solver 1)', 'solver.sim.p1', 'solver123', 'solver', 'k3'),
('s3_2', 'Eko Prasetyo (SIM-P Solver 2)', 'solver.sim.p2', 'solver123', 'solver', 'k3'),
('s3_3', 'Lilis Handayani (SIM-P Solver 3)', 'solver.sim.p3', 'solver123', 'solver', 'k3'),
('s4_1', 'Wawan Hermawan (SIM-K Solver 1)', 'solver.sim.k1', 'solver123', 'solver', 'k4'),
('s4_2', 'Fitriani (SIM-K Solver 2)', 'solver.sim.k2', 'solver123', 'solver', 'k4'),
('s4_3', 'Aditya Pratama (SIM-K Solver 3)', 'solver.sim.k3', 'solver123', 'solver', 'k4'),
('s5_1', 'Rian Setiawan (Sains Solver 1)', 'solver.sains.1', 'solver123', 'solver', 'k5'),
('s5_2', 'Kartika Sari (Sains Solver 2)', 'solver.sains.2', 'solver123', 'solver', 'k5'),
('s5_3', 'Andi Wijaya (Sains Solver 3)', 'solver.sains.3', 'solver123', 'solver', 'k5'),
('s6_1', 'Heri Susanto (Tata Kelola Solver 1)', 'solver.tata.1', 'solver123', 'solver', 'k6'),
('s6_2', 'Melinda Putri (Tata Kelola Solver 2)', 'solver.tata.2', 'solver123', 'solver', 'k6'),
('s6_3', 'Yudi Darmawan (Tata Kelola Solver 3)', 'solver.tata.3', 'solver123', 'solver', 'k6'),
('s7_1', 'Angga Saputra (Sec Solver 1)', 'solver.sec.1', 'solver123', 'solver', 'k7'),
('s7_2', 'Diana Lestari (Sec Solver 2)', 'solver.sec.2', 'solver123', 'solver', 'k7'),
('s7_3', 'Rudi Hartono (Sec Solver 3)', 'solver.sec.3', 'solver123', 'solver', 'k7'),
('s8_1', 'Fajar Ramadan (MIOT Solver 1)', 'solver.miot.1', 'solver123', 'solver', 'k8'),
('s8_2', 'Indah Permata (MIOT Solver 2)', 'solver.miot.2', 'solver123', 'solver', 'k8'),
('s8_3', 'Agung Hidayat (MIOT Solver 3)', 'solver.miot.3', 'solver123', 'solver', 'k8'),
('op1', 'Operator TI Utama BPK', 'admin', 'admin123', 'operator', NULL);

-- 5. Seed Default Tickets
INSERT IGNORE INTO tickets (id, pengirimId, pengirimName, jenis, layananKategori, layananSub, layanan, detail, tanggal, tanggalUpdate, kasubbagId, kasubbagName, status) VALUES
('TKT-2026-001', 'u1', 'Budi Santoso', 'Insiden', 'Layanan Teknologi', 'Layanan Intranet', 'Penyediaan kabel LAN', 'Kabel LAN di ruang kerja lantai 3 Biro TI mengalami kerusakan (terkelupas/retak) sehingga koneksi internet sering terputus-putus secara tiba-tiba.', '2026-06-25', '2026-06-25 09:15', 'k1', 'Ir. Hartono, M.T.', 'Pending');

INSERT IGNORE INTO comments (id, ticketId, authorId, authorName, authorRole, text, timestamp, type) VALUES
('c1_1', 'TKT-2026-001', 'u1', 'Budi Santoso', 'pengguna', 'Kabel LAN ini sangat penting karena kami sedang menyusun laporan konsolidasi nasional minggu ini.', '2026-06-25 09:15', 'komentar');

INSERT IGNORE INTO tickets (id, pengirimId, pengirimName, jenis, layananKategori, layananSub, layanan, detail, tanggal, tanggalUpdate, kasubbagId, kasubbagName, solverId, solverName, status) VALUES
('TKT-2026-002', 'u2', 'Siti Rahayu', 'Permintaan', 'Layanan Perangkat', 'Pemeliharaan Perangkat', 'Pemeliharaan Perangkat', 'Laptop operasional lambat sekali saat digunakan untuk menjalankan aplikasi audit BPK yang berukuran besar. Layar laptop juga berkedip-kedip saat digerakkan. Butuh pemeriksaan hardware menyeluruh.', '2026-06-26', '2026-06-26 14:30', 'k2', 'Dra. Wulandari, M.Si.', NULL, NULL, 'Diterima');

INSERT IGNORE INTO comments (id, ticketId, authorId, authorName, authorRole, text, timestamp, type) VALUES
('c2_1', 'TKT-2026-002', 'k2', 'Dra. Wulandari, M.Si.', 'kasubbag', 'Tiket diterima.', '2026-06-26 14:30', 'terima');
