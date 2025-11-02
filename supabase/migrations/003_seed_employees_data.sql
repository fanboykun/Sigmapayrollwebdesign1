-- ============================================================================
-- SEED EMPLOYEE DATA
-- ============================================================================
-- Version: 1.0.0
-- Description: Seed dummy employee data untuk testing dan development
-- Author: Sigma Payroll Team
-- Date: 2025-01-11
-- ============================================================================

-- Insert sample employees dengan field lengkap
-- Note: Division dan Position harus sudah ada di database

INSERT INTO public.employees (
  employee_id,
  full_name,
  email,
  phone,
  birth_date,
  gender,
  address,
  department,
  employment_type,
  join_date,
  status,
  base_salary,
  bank_name,
  bank_account,
  emergency_contact_name,
  emergency_contact_phone,
  ptkp_status,
  national_id,
  height,
  weight,
  nationality,
  blood_group,
  religion
) VALUES
-- ========== BANGUN BANDAR (BB) ==========
('1782829', 'Ahmad Hidayat', 'ahmad.hidayat@perkebunan.com', '081234567890', '1990-05-15', 'male', 'Jl. Raya Sawit No. 123, Pekanbaru, Riau', 'Produksi', 'permanent', '2018-03-10', 'active', 5500000, 'BCA', '1234567890', 'Siti Aminah', '081987654321', 'K/1', '02.1504.101085.0001', 170, 68, 'Indonesian', 'O+', 'islam'),
('1745623', 'Budi Santoso', 'budi.santoso@perkebunan.com', '083456789012', '1988-12-10', 'male', 'Jl. Sawit Indah No. 78, Pekanbaru, Riau', 'Produksi', 'permanent', '2017-09-20', 'active', 4200000, 'BNI', '5551234567', 'Dewi Santoso', '083987654321', 'K/2', '02.1745.101288.0001', 165, 62, 'Indonesian', 'A+', 'islam'),
('1756789', 'Sukarman', 'sukarman@perkebunan.com', '087890123456', '1985-09-12', 'male', 'Jl. Pelajar No. 34, Pekanbaru, Riau', 'Produksi', 'permanent', '2015-08-20', 'active', 4500000, 'BRI', '9990001112', 'Suminah', '087987654321', 'K/2', '02.1756.120985.0001', 168, 65, 'Indonesian', 'B+', 'islam'),
('1789234', 'Joko Susilo', 'joko.susilo@perkebunan.com', '081345678912', '1992-03-18', 'male', 'Jl. Merdeka No. 56, Pekanbaru, Riau', 'Produksi', 'permanent', '2019-05-15', 'active', 4100000, 'Mandiri', '3334445556', 'Siti Susilo', '081987654322', 'K/0', '02.1789.180392.0001', 172, 70, 'Indonesian', 'O+', 'islam'),
('1790456', 'Rina Wati', 'rina.wati@perkebunan.com', '082456789123', '1994-07-22', 'female', 'Jl. Pahlawan No. 12, Pekanbaru, Riau', 'Produksi', 'contract', '2021-02-10', 'active', 3900000, 'BCA', '7778889990', 'Bambang Wati', '082987654323', 'TK', '02.1790.220794.0001', 160, 52, 'Indonesian', 'A+', 'islam'),
('1791678', 'Hariyanto', 'hariyanto@perkebunan.com', '083567891234', '1987-11-30', 'male', 'Jl. Sejahtera No. 89, Pekanbaru, Riau', 'Produksi', 'permanent', '2016-08-20', 'active', 4400000, 'BRI', '1112223334', 'Sunarti', '083987654324', 'K/3', '02.1791.301187.0001', 169, 67, 'Indonesian', 'B+', 'islam'),
('1792890', 'Dedi Kurniawan', 'dedi.kurniawan@perkebunan.com', '084678912345', '1991-06-14', 'male', 'Jl. Kenanga No. 45, Pekanbaru, Riau', 'Produksi', 'permanent', '2018-11-05', 'active', 4700000, 'BNI', '5556667778', 'Nita Kurniawan', '084987654325', 'K/1', '02.1792.140691.0001', 171, 69, 'Indonesian', 'O+', 'islam'),

-- ========== PT SOCFINDO KEBUN TG ==========
('1793012', 'Susanto Wijaya', 'susanto.wijaya@perkebunan.com', '085789123456', '1989-04-25', 'male', 'Jl. Bambu No. 23, Medan, Sumut', 'Produksi', 'permanent', '2017-07-10', 'active', 5600000, 'BCA', '2223334445', 'Minarti Wijaya', '085987654326', 'K/2', '02.1793.250489.0001', 173, 71, 'Indonesian', 'A+', 'islam'),
('1794234', 'Agung Prasetyo', 'agung.prasetyo@perkebunan.com', '086891234567', '1993-01-08', 'male', 'Jl. Melati No. 67, Medan, Sumut', 'Produksi', 'permanent', '2019-03-15', 'active', 4300000, 'Mandiri', '9991112223', 'Yuni Prasetyo', '086987654327', 'K/0', '02.1794.080193.0001', 168, 64, 'Indonesian', 'B+', 'islam'),
('1795456', 'Hendra Saputra', 'hendra.saputra@perkebunan.com', '087912345678', '1990-09-12', 'male', 'Jl. Anggrek No. 34, Medan, Sumut', 'Produksi', 'permanent', '2018-05-20', 'active', 4250000, 'BRI', '4445556667', 'Retno Saputra', '087987654328', 'K/1', '02.1795.120990.0001', 166, 63, 'Indonesian', 'O+', 'islam'),
('1796678', 'Siti Maryam', 'siti.maryam@perkebunan.com', '088123456789', '1995-12-05', 'female', 'Jl. Dahlia No. 78, Medan, Sumut', 'Produksi', 'contract', '2022-01-10', 'active', 3950000, 'BNI', '7778889991', 'Ahmad Maryam', '088987654329', 'TK', '02.1796.051295.0001', 162, 54, 'Indonesian', 'A+', 'islam'),
('1797890', 'Bambang Supriadi', 'bambang.supriadi@perkebunan.com', '089234567891', '1986-08-18', 'male', 'Jl. Cendana No. 90, Medan, Sumut', 'Produksi', 'permanent', '2015-10-12', 'active', 4600000, 'BCA', '3334445557', 'Endang Supriadi', '089987654330', 'K/3', '02.1797.180886.0001', 170, 68, 'Indonesian', 'B+', 'islam'),
('1798012', 'Yanto Hermawan', 'yanto.hermawan@perkebunan.com', '081345678923', '1992-05-27', 'male', 'Jl. Kenari No. 56, Medan, Sumut', 'Produksi', 'permanent', '2019-09-05', 'active', 4800000, 'Mandiri', '6667778889', 'Tuti Hermawan', '081987654331', 'K/1', '02.1798.270592.0001', 174, 72, 'Indonesian', 'O+', 'islam'),

-- ========== PT SOCFINDO KEBUN AP ==========
('1799234', 'Indra Gunawan', 'indra.gunawan@perkebunan.com', '082456789134', '1988-02-14', 'male', 'Jl. Flamboyan No. 12, Medan, Sumut', 'Produksi', 'permanent', '2016-04-20', 'active', 5700000, 'BRI', '1112223335', 'Lestari Gunawan', '082987654332', 'K/2', '02.1799.140288.0001', 169, 66, 'Indonesian', 'A+', 'islam'),
('1800456', 'Dwi Rahayu', 'dwi.rahayu@perkebunan.com', '083567891245', '1994-11-09', 'female', 'Jl. Mawar No. 45, Medan, Sumut', 'Produksi', 'permanent', '2020-02-15', 'active', 4150000, 'BCA', '5556667779', 'Hadi Rahayu', '083987654333', 'K/0', '02.1800.091194.0001', 163, 55, 'Indonesian', 'B+', 'islam'),
('1801678', 'Rudi Setiawan', 'rudi.setiawan@perkebunan.com', '084678912356', '1991-07-23', 'male', 'Jl. Teratai No. 67, Medan, Sumut', 'Produksi', 'permanent', '2018-08-10', 'active', 4350000, 'Mandiri', '2223334446', 'Ani Setiawan', '084987654334', 'K/1', '02.1801.230791.0001', 167, 64, 'Indonesian', 'O+', 'islam'),
('1802890', 'Slamet Riyadi', 'slamet.riyadi@perkebunan.com', '085789123467', '1987-10-16', 'male', 'Jl. Sakura No. 89, Medan, Sumut', 'Produksi', 'permanent', '2016-11-25', 'active', 4500000, 'BNI', '9990001113', 'Sriyani Riyadi', '085987654335', 'K/3', '02.1802.161087.0001', 171, 69, 'Indonesian', 'A+', 'islam'),
('1803012', 'Novi Andayani', 'novi.andayani@perkebunan.com', '086891234578', '1996-03-30', 'female', 'Jl. Tulip No. 23, Medan, Sumut', 'Produksi', 'contract', '2022-03-01', 'active', 3850000, 'BRI', '4445556668', 'Budi Andayani', '086987654336', 'TK', '02.1803.300396.0001', 161, 53, 'Indonesian', 'B+', 'islam'),
('1804234', 'Wahyu Nugroho', 'wahyu.nugroho@perkebunan.com', '087912345689', '1990-12-11', 'male', 'Jl. Orchid No. 34, Medan, Sumut', 'Produksi', 'permanent', '2019-06-15', 'active', 4900000, 'BCA', '7778889992', 'Lia Nugroho', '087987654337', 'K/1', '02.1804.111290.0001', 172, 70, 'Indonesian', 'O+', 'islam'),

-- ========== PT SOCFINDO KEBUN HL ==========
('1805456', 'Suryadi', 'suryadi@perkebunan.com', '088123456790', '1989-08-05', 'male', 'Jl. Palem No. 56, Medan, Sumut', 'Produksi', 'permanent', '2017-03-20', 'active', 5550000, 'Mandiri', '3334445558', 'Sumiati', '088987654338', 'K/2', '02.1805.050889.0001', 170, 68, 'Indonesian', 'A+', 'islam'),
('1806678', 'Eko Prasetyo', 'eko.prasetyo@perkebunan.com', '089234567892', '1993-04-17', 'male', 'Jl. Kamboja No. 78, Medan, Sumut', 'Produksi', 'permanent', '2019-07-10', 'active', 4200000, 'BNI', '6667778890', 'Rina Prasetyo', '089987654339', 'K/0', '02.1806.170493.0001', 168, 65, 'Indonesian', 'B+', 'islam'),
('1807890', 'Tono Suryanto', 'tono.suryanto@perkebunan.com', '081345678934', '1990-06-22', 'male', 'Jl. Bougenville No. 90, Medan, Sumut', 'Produksi', 'permanent', '2018-09-15', 'active', 4280000, 'BRI', '1112223336', 'Wati Suryanto', '081987654340', 'K/1', '02.1807.220690.0001', 169, 67, 'Indonesian', 'O+', 'islam'),
('1808012', 'Putri Ayu', 'putri.ayu@perkebunan.com', '082456789145', '1995-09-28', 'female', 'Jl. Lavender No. 12, Medan, Sumut', 'Produksi', 'contract', '2021-11-01', 'active', 3920000, 'BCA', '5556667780', 'Hasan Ayu', '082987654341', 'TK', '02.1808.280995.0001', 162, 54, 'Indonesian', 'A+', 'islam'),
('1809234', 'Saiful Anwar', 'saiful.anwar@perkebunan.com', '083567891256', '1986-11-14', 'male', 'Jl. Gardenia No. 45, Medan, Sumut', 'Produksi', 'permanent', '2015-12-20', 'active', 4550000, 'Mandiri', '2223334447', 'Halimah Anwar', '083987654342', 'K/3', '02.1809.141186.0001', 171, 69, 'Indonesian', 'B+', 'islam'),
('1810456', 'Fajar Nugraha', 'fajar.nugraha@perkebunan.com', '084678912367', '1992-01-19', 'male', 'Jl. Azalea No. 67, Medan, Sumut', 'Produksi', 'permanent', '2019-10-05', 'active', 4750000, 'BNI', '9990001114', 'Sari Nugraha', '084987654343', 'K/1', '02.1810.190192.0001', 173, 71, 'Indonesian', 'O+', 'islam'),

-- ========== PT SOCFINDO KEBUN NL ==========
('1811678', 'Wawan Kurniawan', 'wawan.kurniawan@perkebunan.com', '085789123478', '1988-05-12', 'male', 'Jl. Magnolia No. 23, Medan, Sumut', 'Produksi', 'permanent', '2016-06-15', 'active', 5650000, 'BCA', '4445556669', 'Dewi Kurniawan', '085987654344', 'K/2', '02.1811.120588.0001', 170, 68, 'Indonesian', 'A+', 'islam'),
('1812890', 'Dian Purnama', 'dian.purnama@perkebunan.com', '086891234589', '1994-08-26', 'female', 'Jl. Jasmine No. 34, Medan, Sumut', 'Produksi', 'permanent', '2020-04-10', 'active', 4100000, 'BRI', '7778889993', 'Arif Purnama', '086987654345', 'K/0', '02.1812.260894.0001', 163, 55, 'Indonesian', 'B+', 'islam'),
('1813012', 'Yudi Hartono', 'yudi.hartono@perkebunan.com', '087912345690', '1991-02-07', 'male', 'Jl. Lily No. 56, Medan, Sumut', 'Produksi', 'permanent', '2018-07-20', 'active', 4320000, 'Mandiri', '3334445559', 'Erni Hartono', '087987654346', 'K/1', '02.1813.070291.0001', 168, 66, 'Indonesian', 'O+', 'islam'),
('1814234', 'Sri Mulyani', 'sri.mulyani@perkebunan.com', '088123456791', '1996-10-03', 'female', 'Jl. Peony No. 78, Medan, Sumut', 'Produksi', 'contract', '2022-05-01', 'active', 3880000, 'BNI', '6667778891', 'Surya Mulyani', '088987654347', 'TK', '02.1814.031096.0001', 161, 53, 'Indonesian', 'A+', 'islam'),
('1815456', 'Andi Permana', 'andi.permana@perkebunan.com', '089234567893', '1987-12-18', 'male', 'Jl. Sunflower No. 90, Medan, Sumut', 'Produksi', 'permanent', '2016-09-10', 'active', 4520000, 'BCA', '1112223337', 'Rini Permana', '089987654348', 'K/3', '02.1815.181287.0001', 169, 67, 'Indonesian', 'B+', 'islam'),
('1816678', 'Rizki Firmansyah', 'rizki.firmansyah@perkebunan.com', '081345678945', '1993-03-21', 'male', 'Jl. Lotus No. 12, Medan, Sumut', 'Produksi', 'permanent', '2020-01-15', 'active', 4850000, 'Mandiri', '5556667781', 'Maya Firmansyah', '081987654349', 'K/1', '02.1816.210393.0001', 172, 70, 'Indonesian', 'O+', 'islam'),

-- ========== HEAD OFFICE/KANTOR BESAR MEDAN ==========
('1782634', 'Siti Nurhaliza', 'siti.nurhaliza@perkebunan.com', '082345678901', '1992-08-20', 'female', 'Jl. Kelapa Sawit No. 45, Medan, Sumut', 'Administrasi', 'permanent', '2019-06-15', 'active', 8500000, 'Mandiri', '9876543210', 'Budi Nurhaliza', '082987654321', 'TK', '02.1782.200892.0001', 165, 58, 'Indonesian', 'A+', 'islam'),
('1756234', 'Dewi Lestari', 'dewi.lestari@perkebunan.com', '084567890123', '1995-03-25', 'female', 'Jl. Perkebunan No. 12, Medan, Sumut', 'SDM', 'permanent', '2020-01-15', 'active', 6500000, 'BRI', '7778889990', 'Hadi Lestari', '084987654321', 'TK', '02.1756.250395.0001', 162, 54, 'Indonesian', 'O+', 'islam'),
('1801234', 'Andi Wijaya', 'andi.wijaya@perkebunan.com', '086789012345', '1993-07-18', 'male', 'Jl. Jendral Sudirman No. 90, Medan, Sumut', 'Keuangan', 'permanent', '2021-02-01', 'active', 7000000, 'Mandiri', '6667778889', 'Ratna Wijaya', '086987654321', 'K/0', '02.1801.180793.0001', 170, 68, 'Indonesian', 'B+', 'islam'),
('1823456', 'Rina Susanti', 'rina.susanti@perkebunan.com', '088901234567', '1994-02-28', 'female', 'Jl. Diponegoro No. 67, Medan, Sumut', 'Pemasaran', 'permanent', '2020-07-15', 'active', 7500000, 'BNI', '4445556667', 'Bambang Susanti', '088987654321', 'TK', '02.1823.280294.0001', 164, 56, 'Indonesian', 'A+', 'islam'),
('1767890', 'Hendra Gunawan', 'hendra.gunawan@perkebunan.com', '082234567890', '1989-10-08', 'male', 'Jl. Veteran No. 45, Medan, Sumut', 'Teknik', 'permanent', '2018-11-05', 'active', 6800000, 'BRI', '2223334445', 'Tuti Gunawan', '082987654322', 'K/2', '02.1767.081089.0001', 171, 69, 'Indonesian', 'O+', 'islam'),
('1778901', 'Yuni Astuti', 'yuni.astuti@perkebunan.com', '083345678901', '1993-12-30', 'female', 'Jl. Imam Bonjol No. 12, Medan, Sumut', 'Keuangan', 'permanent', '2019-09-01', 'active', 10000000, 'BCA', '5556667778', 'Joko Astuti', '083987654322', 'K/1', '02.1778.301293.0001', 166, 60, 'Indonesian', 'B+', 'islam'),
('1817890', 'Michael Tanjung', 'michael.tanjung@perkebunan.com', '082456789156', '1990-04-15', 'male', 'Jl. Asia Afrika No. 100, Medan, Sumut', 'IT', 'permanent', '2018-03-01', 'active', 9500000, 'BCA', '2223334448', 'Linda Tanjung', '082987654350', 'K/2', '02.1817.150490.0001', 174, 72, 'Indonesian', 'A+', 'kristen')
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================================================
-- Verify insertion
-- ============================================================================
SELECT COUNT(*) as total_employees FROM public.employees;

-- ============================================================================
-- END OF SEED
-- ============================================================================
