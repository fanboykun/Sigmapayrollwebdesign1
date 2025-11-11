-- ============================================================================
-- SEED DATA - CLINIC MEDICINES
-- ============================================================================
-- Migration: 021_seed_clinic_medicines.sql
-- Description: Seed sample medicines for testing receiving module
-- Author: Sigma Development Team
-- Created: 2025-11-11
-- ============================================================================

-- Insert sample medicines for each category
INSERT INTO clinic_medicines (
  medicine_code,
  name,
  generic_name,
  category_id,
  dosage_form,
  strength,
  unit,
  manufacturer,
  min_stock,
  price_per_unit,
  require_prescription,
  description,
  is_active
) VALUES

-- ========================================================================
-- ANTIBIOTIK (ANTIBI)
-- ========================================================================
(
  'MED-001',
  'Amoxicillin 500mg',
  'Amoxicillin',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIBI'),
  'Kapsul',
  '500mg',
  'kapsul',
  'Kimia Farma',
  100,
  1500,
  true,
  'Antibiotik spektrum luas untuk infeksi bakteri',
  true
),
(
  'MED-002',
  'Amoxicillin Sirup 125mg/5ml',
  'Amoxicillin',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIBI'),
  'Sirup',
  '125mg/5ml',
  'botol',
  'Kimia Farma',
  50,
  25000,
  true,
  'Antibiotik untuk anak-anak',
  true
),
(
  'MED-003',
  'Ciprofloxacin 500mg',
  'Ciprofloxacin',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIBI'),
  'Tablet',
  '500mg',
  'tablet',
  'Dexa Medica',
  80,
  3000,
  true,
  'Antibiotik fluoroquinolone',
  true
),
(
  'MED-004',
  'Cefadroxil 500mg',
  'Cefadroxil',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIBI'),
  'Kapsul',
  '500mg',
  'kapsul',
  'Kalbe Farma',
  100,
  2500,
  true,
  'Antibiotik golongan sefalosporin',
  true
),

-- ========================================================================
-- ANALGESIK (ANALGE)
-- ========================================================================
(
  'MED-005',
  'Paracetamol 500mg',
  'Paracetamol',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANALGE'),
  'Tablet',
  '500mg',
  'tablet',
  'Indofarma',
  200,
  500,
  false,
  'Pereda nyeri dan penurun panas',
  true
),
(
  'MED-006',
  'Paracetamol Sirup 120mg/5ml',
  'Paracetamol',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANALGE'),
  'Sirup',
  '120mg/5ml',
  'botol',
  'Kimia Farma',
  60,
  15000,
  false,
  'Pereda nyeri untuk anak',
  true
),
(
  'MED-007',
  'Ibuprofen 400mg',
  'Ibuprofen',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANALGE'),
  'Tablet',
  '400mg',
  'tablet',
  'Kalbe Farma',
  150,
  1500,
  false,
  'Anti inflamasi dan pereda nyeri',
  true
),
(
  'MED-008',
  'Asam Mefenamat 500mg',
  'Mefenamic Acid',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANALGE'),
  'Tablet',
  '500mg',
  'tablet',
  'Dexa Medica',
  120,
  800,
  false,
  'Pereda nyeri haid dan sakit gigi',
  true
),

-- ========================================================================
-- ANTIPIRETIK (ANTIPIR)
-- ========================================================================
(
  'MED-009',
  'Sanmol 500mg',
  'Paracetamol',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIPIR'),
  'Tablet',
  '500mg',
  'tablet',
  'Sanbe Farma',
  200,
  600,
  false,
  'Penurun panas',
  true
),

-- ========================================================================
-- VITAMIN (VITAMI)
-- ========================================================================
(
  'MED-010',
  'Vitamin C 500mg',
  'Ascorbic Acid',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'VITAMI'),
  'Tablet',
  '500mg',
  'tablet',
  'Kalbe Farma',
  150,
  1000,
  false,
  'Suplemen vitamin C',
  true
),
(
  'MED-011',
  'Vitamin B Complex',
  'Vitamin B Complex',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'VITAMI'),
  'Tablet',
  '-',
  'tablet',
  'Kimia Farma',
  100,
  1500,
  false,
  'Suplemen vitamin B kompleks',
  true
),
(
  'MED-012',
  'Multivitamin',
  'Multivitamin',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'VITAMI'),
  'Kapsul',
  '-',
  'kapsul',
  'Kalbe Farma',
  120,
  2500,
  false,
  'Suplemen multivitamin dan mineral',
  true
),

-- ========================================================================
-- ANTASIDA (ANTACI)
-- ========================================================================
(
  'MED-013',
  'Antasida DOEN',
  'Aluminium Hydroxide + Magnesium Hydroxide',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTACI'),
  'Tablet',
  '-',
  'tablet',
  'Kimia Farma',
  100,
  500,
  false,
  'Obat maag dan lambung',
  true
),
(
  'MED-014',
  'Omeprazole 20mg',
  'Omeprazole',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTACI'),
  'Kapsul',
  '20mg',
  'kapsul',
  'Dexa Medica',
  80,
  3500,
  true,
  'Penghambat pompa proton untuk GERD',
  true
),
(
  'MED-015',
  'Ranitidine 150mg',
  'Ranitidine',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTACI'),
  'Tablet',
  '150mg',
  'tablet',
  'Indofarma',
  100,
  1000,
  false,
  'Pengurang asam lambung',
  true
),

-- ========================================================================
-- ANTIHISTAMIN (ANTIHIS)
-- ========================================================================
(
  'MED-016',
  'CTM 4mg',
  'Chlorpheniramine Maleate',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIHIS'),
  'Tablet',
  '4mg',
  'tablet',
  'Kimia Farma',
  150,
  300,
  false,
  'Antihistamin untuk alergi',
  true
),
(
  'MED-017',
  'Cetirizine 10mg',
  'Cetirizine',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIHIS'),
  'Tablet',
  '10mg',
  'tablet',
  'Kalbe Farma',
  120,
  1500,
  false,
  'Antihistamin generasi baru',
  true
),
(
  'MED-018',
  'Loratadine 10mg',
  'Loratadine',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIHIS'),
  'Tablet',
  '10mg',
  'tablet',
  'Dexa Medica',
  100,
  2000,
  false,
  'Antihistamin non-drowsy',
  true
),

-- ========================================================================
-- ANTIDIABETES (ANTIDI)
-- ========================================================================
(
  'MED-019',
  'Metformin 500mg',
  'Metformin HCl',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIDI'),
  'Tablet',
  '500mg',
  'tablet',
  'Dexa Medica',
  100,
  1000,
  true,
  'Obat diabetes tipe 2',
  true
),
(
  'MED-020',
  'Glimepiride 2mg',
  'Glimepiride',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIDI'),
  'Tablet',
  '2mg',
  'tablet',
  'Kalbe Farma',
  80,
  2500,
  true,
  'Obat diabetes golongan sulfonilurea',
  true
),

-- ========================================================================
-- ANTIHIPERTENSI (ANTIHIP)
-- ========================================================================
(
  'MED-021',
  'Amlodipine 5mg',
  'Amlodipine',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIHIP'),
  'Tablet',
  '5mg',
  'tablet',
  'Dexa Medica',
  120,
  1500,
  true,
  'Obat hipertensi calcium channel blocker',
  true
),
(
  'MED-022',
  'Captopril 25mg',
  'Captopril',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIHIP'),
  'Tablet',
  '25mg',
  'tablet',
  'Indofarma',
  150,
  800,
  true,
  'Obat hipertensi ACE inhibitor',
  true
),
(
  'MED-023',
  'Valsartan 80mg',
  'Valsartan',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIHIP'),
  'Tablet',
  '80mg',
  'tablet',
  'Kalbe Farma',
  100,
  3500,
  true,
  'Obat hipertensi ARB',
  true
),

-- ========================================================================
-- OBAT LUAR (OBATLUAR)
-- ========================================================================
(
  'MED-024',
  'Betadine Solution 60ml',
  'Povidone Iodine',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'OBATLUAR'),
  'Cairan',
  '10%',
  'botol',
  'Kalbe Farma',
  50,
  25000,
  false,
  'Antiseptik luka',
  true
),
(
  'MED-025',
  'Salep 88',
  'Sulfur + Menthol',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'OBATLUAR'),
  'Salep',
  '-',
  'tube',
  'Kimia Farma',
  60,
  15000,
  false,
  'Salep gatal dan kurap',
  true
),
(
  'MED-026',
  'Bioplacenton Gel 15gr',
  'Neomycin Sulfate',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'OBATLUAR'),
  'Gel',
  '15gr',
  'tube',
  'Kalbe Farma',
  40,
  28000,
  false,
  'Obat luka bakar dan luka',
  true
),
(
  'MED-027',
  'Hydrocortisone Cream 1%',
  'Hydrocortisone',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'OBATLUAR'),
  'Krim',
  '1%',
  'tube',
  'Dexa Medica',
  50,
  18000,
  false,
  'Krim anti inflamasi kulit',
  true
),

-- ========================================================================
-- OBAT BATUK (BATUK)
-- ========================================================================
(
  'MED-028',
  'OBH Sirup 100ml',
  'Succus Liquiritiae',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'BATUK'),
  'Sirup',
  '-',
  'botol',
  'Indofarma',
  70,
  12000,
  false,
  'Obat batuk berdahak',
  true
),
(
  'MED-029',
  'Ambroxol 30mg',
  'Ambroxol HCl',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'BATUK'),
  'Tablet',
  '30mg',
  'tablet',
  'Kalbe Farma',
  100,
  1200,
  false,
  'Pengencer dahak',
  true
),
(
  'MED-030',
  'Bisolvon Sirup 60ml',
  'Bromhexine HCl',
  (SELECT id FROM clinic_medicine_categories WHERE code = 'BATUK'),
  'Sirup',
  '4mg/5ml',
  'botol',
  'Kalbe Farma',
  50,
  35000,
  false,
  'Mukolitik pengencer dahak',
  true
);

-- ============================================================================
-- END OF MIGRATION: 021_seed_clinic_medicines.sql
-- ============================================================================
