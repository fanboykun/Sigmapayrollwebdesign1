-- ============================================================================
-- CLINIC MODULE - SEED DATA
-- ============================================================================
-- Migration: 009_clinic_seed_data.sql
-- Description: Initial seed data for Clinic module
-- Author: Sigma Development Team
-- Created: 2025-11-03
-- ============================================================================

-- ============================================================================
-- 1. MEDICINE CATEGORIES
-- ============================================================================
INSERT INTO clinic_medicine_categories (name, code, description, is_active) VALUES
('Antibiotik', 'ANTIBI', 'Obat untuk infeksi bakteri', true),
('Analgesik', 'ANALGE', 'Obat pereda nyeri', true),
('Antipiretik', 'ANTIPIR', 'Obat penurun panas', true),
('Vitamin', 'VITAMI', 'Suplemen vitamin dan mineral', true),
('Antasida', 'ANTACI', 'Obat lambung dan maag', true),
('Antihistamin', 'ANTIHIS', 'Obat alergi', true),
('Antidiabetes', 'ANTIDI', 'Obat diabetes', true),
('Antihipertensi', 'ANTIHIP', 'Obat tekanan darah tinggi', true),
('Obat Luar', 'OBATLUAR', 'Salep, krim, cairan luar', true),
('Obat Batuk', 'BATUK', 'Obat batuk dan flu', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. COMMON DISEASES (ICD-10)
-- ============================================================================
INSERT INTO clinic_diseases (icd10_code, name, category, is_common, is_active) VALUES
-- Respiratory
('J00', 'Nasofaringitis akut (Common cold)', 'Respiratory', true, true),
('J02.9', 'Faringitis akut', 'Respiratory', true, true),
('J06.9', 'Infeksi saluran napas atas akut', 'Respiratory', true, true),
('J18.9', 'Pneumonia', 'Respiratory', false, true),
('J45.9', 'Asma', 'Respiratory', false, true),

-- Digestive
('K30', 'Dispepsia (Sakit maag)', 'Digestive', true, true),
('K52.9', 'Gastroenteritis dan kolitis non-infeksi', 'Digestive', true, true),
('K59.0', 'Konstipasi', 'Digestive', true, true),
('K21.9', 'Penyakit refluks gastroesofageal', 'Digestive', false, true),

-- Cardiovascular
('I10', 'Hipertensi esensial (primer)', 'Cardiovascular', true, true),
('I20.9', 'Angina pectoris', 'Cardiovascular', false, true),

-- Endocrine
('E11.9', 'Diabetes melitus tipe 2', 'Endocrine', true, true),
('E66.9', 'Obesitas', 'Endocrine', false, true),

-- Musculoskeletal
('M54.5', 'Nyeri punggung bawah (LBP)', 'Musculoskeletal', true, true),
('M79.3', 'Panniculitis/Myalgia', 'Musculoskeletal', true, true),
('M25.50', 'Nyeri sendi', 'Musculoskeletal', true, true),

-- Skin
('L30.9', 'Dermatitis', 'Skin', true, true),
('L50.9', 'Urtikaria', 'Skin', true, true),
('L60.0', 'Infeksi kuku', 'Skin', true, true),

-- Infections
('A09', 'Diare dan gastroenteritis infeksi', 'Infections', true, true),
('B34.9', 'Infeksi virus', 'Infections', true, true),

-- General
('R50.9', 'Demam/Febris', 'General', true, true),
('R51', 'Sakit kepala/Cephalgia', 'General', true, true),
('R10.4', 'Nyeri perut', 'General', true, true),
('R05', 'Batuk', 'General', true, true),
('R06.0', 'Dispnea (Sesak napas)', 'General', false, true),

-- Eye & ENT
('H10.9', 'Konjungtivitis', 'Eye', true, true),
('H66.9', 'Otitis media', 'ENT', true, true)
ON CONFLICT (icd10_code) DO NOTHING;

-- ============================================================================
-- 3. SAMPLE MEDICINES
-- ============================================================================
INSERT INTO clinic_medicines (
  medicine_code, name, generic_name, category_id, dosage_form, strength, unit,
  manufacturer, min_stock, price_per_unit, require_prescription, is_active
) VALUES
-- Analgesics
('MED001', 'Paracetamol 500mg', 'Paracetamol', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANALGE'), 'Tablet', '500mg', 'tablet', 'Kimia Farma', 100, 300, false, true),
('MED002', 'Ibuprofen 400mg', 'Ibuprofen', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANALGE'), 'Tablet', '400mg', 'tablet', 'Kalbe Farma', 50, 800, false, true),
('MED003', 'Asam Mefenamat 500mg', 'Asam Mefenamat', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANALGE'), 'Tablet', '500mg', 'tablet', 'Dexa Medica', 50, 1200, false, true),

-- Antibiotics
('MED004', 'Amoxicillin 500mg', 'Amoxicillin', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIBI'), 'Kapsul', '500mg', 'kapsul', 'Sanbe Farma', 100, 1500, true, true),
('MED005', 'Ciprofloxacin 500mg', 'Ciprofloxacin', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIBI'), 'Tablet', '500mg', 'tablet', 'Indofarma', 50, 3000, true, true),

-- Vitamins
('MED006', 'Vitamin C 500mg', 'Vitamin C', (SELECT id FROM clinic_medicine_categories WHERE code = 'VITAMI'), 'Tablet', '500mg', 'tablet', 'Kalbe Farma', 100, 500, false, true),
('MED007', 'Vitamin B Complex', 'Vitamin B Complex', (SELECT id FROM clinic_medicine_categories WHERE code = 'VITAMI'), 'Tablet', '1 tablet', 'tablet', 'Kimia Farma', 100, 800, false, true),

-- Antacids
('MED008', 'Antasida DOEN', 'Aluminium Hydroxide + Magnesium Hydroxide', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTACI'), 'Tablet', '1 tablet', 'tablet', 'Kalbe Farma', 100, 600, false, true),
('MED009', 'Omeprazole 20mg', 'Omeprazole', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTACI'), 'Kapsul', '20mg', 'kapsul', 'Dexa Medica', 50, 2500, true, true),

-- Cough & Flu
('MED010', 'OBH Sirup', 'OBH', (SELECT id FROM clinic_medicine_categories WHERE code = 'BATUK'), 'Sirup', '100ml', 'botol', 'Indofarma', 50, 15000, false, true),
('MED011', 'CTM 4mg', 'Chlorpheniramine Maleate', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIHIS'), 'Tablet', '4mg', 'tablet', 'Sanbe Farma', 100, 400, false, true),

-- Topical
('MED012', 'Salep 88', 'Salicylic Acid + Sulfur', (SELECT id FROM clinic_medicine_categories WHERE code = 'OBATLUAR'), 'Salep', '10g', 'tube', 'Konimex', 30, 8000, false, true),
('MED013', 'Betadine Solution 30ml', 'Povidone Iodine', (SELECT id FROM clinic_medicine_categories WHERE code = 'OBATLUAR'), 'Cairan', '30ml', 'botol', 'Mahakam Beta Farma', 50, 12000, false, true),

-- Diabetes
('MED014', 'Metformin 500mg', 'Metformin', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIDI'), 'Tablet', '500mg', 'tablet', 'Dexa Medica', 100, 2000, true, true),
('MED015', 'Glimepiride 2mg', 'Glimepiride', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIDI'), 'Tablet', '2mg', 'tablet', 'Kalbe Farma', 50, 3500, true, true),

-- Hypertension
('MED016', 'Amlodipine 5mg', 'Amlodipine', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIHIP'), 'Tablet', '5mg', 'tablet', 'Kimia Farma', 100, 2500, true, true),
('MED017', 'Captopril 25mg', 'Captopril', (SELECT id FROM clinic_medicine_categories WHERE code = 'ANTIHIP'), 'Tablet', '25mg', 'tablet', 'Indofarma', 100, 1500, true, true)
ON CONFLICT (medicine_code) DO NOTHING;

-- ============================================================================
-- 4. SAMPLE SUPPLIERS
-- ============================================================================
INSERT INTO clinic_suppliers (
  supplier_code, name, contact_person, phone, email, address, city, payment_terms, is_active
) VALUES
('SUP001', 'PT Kimia Farma Trading & Distribution', 'Budi Santoso', '021-5551234', 'bd@kimiafarma.co.id', 'Jl. Veteran No. 9 Jakarta', 'Jakarta', '30 hari', true),
('SUP002', 'PT Kalbe Farma Tbk', 'Siti Nurhaliza', '021-4600880', 'sales@kalbe.co.id', 'Jl. Let. Jend. Suprapto Kav. 4', 'Jakarta', '30 hari', true),
('SUP003', 'PT Dexa Medica', 'Ahmad Yani', '021-7810808', 'info@dexa-medica.com', 'Jl. Bambang Utoyo No. 138', 'Palembang', '30 hari', true),
('SUP004', 'PT Indofarma Tbk', 'Rina Kusuma', '021-4240808', 'marketing@indofarma.id', 'Jl. Industri II Blok P No. 1', 'Jakarta', '30 hari', true),
('SUP005', 'PT Sanbe Farma', 'Joko Widodo', '022-5224530', 'info@sanbe.co.id', 'Jl. Moh. Toha Km. 11', 'Bandung', 'COD', true)
ON CONFLICT (supplier_code) DO NOTHING;

-- ============================================================================
-- 5. ADD NEW ROLES FOR CLINIC STAFF
-- ============================================================================
-- Insert new roles if they don't exist
INSERT INTO roles (name, code, description, is_system_role)
VALUES
  ('Dokter Klinik', 'clinic_doctor', 'Dokter yang bertugas di klinik perusahaan', true),
  ('Perawat Klinik', 'clinic_nurse', 'Perawat/apoteker yang bertugas di klinik', true),
  ('Admin Klinik', 'clinic_admin', 'Admin untuk manajemen klinik perusahaan', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 6. ADD CLINIC PERMISSIONS FOR EXISTING ROLES
-- ============================================================================
-- Get role IDs
DO $$
DECLARE
  v_super_admin_id UUID;
  v_admin_id UUID;
  v_manager_id UUID;
  v_karyawan_id UUID;
  v_doctor_id UUID;
  v_nurse_id UUID;
  v_clinic_admin_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO v_super_admin_id FROM roles WHERE code = 'super_admin';
  SELECT id INTO v_admin_id FROM roles WHERE code = 'admin';
  SELECT id INTO v_manager_id FROM roles WHERE code = 'manager';
  SELECT id INTO v_karyawan_id FROM roles WHERE code = 'karyawan';
  SELECT id INTO v_doctor_id FROM roles WHERE code = 'clinic_doctor';
  SELECT id INTO v_nurse_id FROM roles WHERE code = 'clinic_nurse';
  SELECT id INTO v_clinic_admin_id FROM roles WHERE code = 'clinic_admin';

  -- SUPER ADMIN - Full access to all clinic modules
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_super_admin_id, 'clinic_dashboard', true, true, true, true),
    (v_super_admin_id, 'clinic_master_medicines', true, true, true, true),
    (v_super_admin_id, 'clinic_master_suppliers', true, true, true, true),
    (v_super_admin_id, 'clinic_master_doctors', true, true, true, true),
    (v_super_admin_id, 'clinic_master_nurses', true, true, true, true),
    (v_super_admin_id, 'clinic_master_diseases', true, true, true, true),
    (v_super_admin_id, 'clinic_registration', true, true, true, true),
    (v_super_admin_id, 'clinic_examination', true, true, true, true),
    (v_super_admin_id, 'clinic_prescription', true, true, true, true),
    (v_super_admin_id, 'clinic_dispensing', true, true, true, true),
    (v_super_admin_id, 'clinic_sick_letter', true, true, true, true),
    (v_super_admin_id, 'clinic_stock_management', true, true, true, true),
    (v_super_admin_id, 'clinic_reports', true, true, true, true)
  ON CONFLICT (role_id, module_name) DO NOTHING;

  -- ADMIN - Full operational access
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_admin_id, 'clinic_dashboard', true, false, false, false),
    (v_admin_id, 'clinic_master_medicines', true, true, true, false),
    (v_admin_id, 'clinic_master_suppliers', true, true, true, false),
    (v_admin_id, 'clinic_master_doctors', true, true, true, false),
    (v_admin_id, 'clinic_master_nurses', true, true, true, false),
    (v_admin_id, 'clinic_master_diseases', true, true, true, false),
    (v_admin_id, 'clinic_registration', true, true, true, false),
    (v_admin_id, 'clinic_examination', true, false, false, false),
    (v_admin_id, 'clinic_prescription', true, false, false, false),
    (v_admin_id, 'clinic_dispensing', true, true, true, false),
    (v_admin_id, 'clinic_sick_letter', true, false, false, false),
    (v_admin_id, 'clinic_stock_management', true, true, true, false),
    (v_admin_id, 'clinic_reports', true, false, false, false)
  ON CONFLICT (role_id, module_name) DO NOTHING;

  -- MANAGER - View only
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_manager_id, 'clinic_dashboard', true, false, false, false),
    (v_manager_id, 'clinic_reports', true, false, false, false)
  ON CONFLICT (role_id, module_name) DO NOTHING;

  -- CLINIC DOCTOR - Clinical operations
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_doctor_id, 'clinic_dashboard', true, false, false, false),
    (v_doctor_id, 'clinic_master_medicines', true, false, false, false),
    (v_doctor_id, 'clinic_master_diseases', true, false, false, false),
    (v_doctor_id, 'clinic_registration', true, false, false, false),
    (v_doctor_id, 'clinic_examination', true, true, true, false),
    (v_doctor_id, 'clinic_prescription', true, true, true, false),
    (v_doctor_id, 'clinic_sick_letter', true, true, true, false),
    (v_doctor_id, 'clinic_stock_management', true, false, false, false),
    (v_doctor_id, 'clinic_reports', true, false, false, false)
  ON CONFLICT (role_id, module_name) DO NOTHING;

  -- CLINIC NURSE - Registration and dispensing
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_nurse_id, 'clinic_dashboard', true, false, false, false),
    (v_nurse_id, 'clinic_master_medicines', true, false, false, false),
    (v_nurse_id, 'clinic_registration', true, true, true, false),
    (v_nurse_id, 'clinic_examination', true, false, false, false),
    (v_nurse_id, 'clinic_prescription', true, false, false, false),
    (v_nurse_id, 'clinic_dispensing', true, true, true, false),
    (v_nurse_id, 'clinic_stock_management', true, true, false, false),
    (v_nurse_id, 'clinic_reports', true, false, false, false)
  ON CONFLICT (role_id, module_name) DO NOTHING;

  -- CLINIC ADMIN - Administrative tasks
  INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
  VALUES
    (v_clinic_admin_id, 'clinic_dashboard', true, false, false, false),
    (v_clinic_admin_id, 'clinic_master_medicines', true, true, true, false),
    (v_clinic_admin_id, 'clinic_master_suppliers', true, true, true, false),
    (v_clinic_admin_id, 'clinic_master_doctors', true, true, true, false),
    (v_clinic_admin_id, 'clinic_master_nurses', true, true, true, false),
    (v_clinic_admin_id, 'clinic_master_diseases', true, true, true, false),
    (v_clinic_admin_id, 'clinic_registration', true, true, true, false),
    (v_clinic_admin_id, 'clinic_dispensing', true, true, true, false),
    (v_clinic_admin_id, 'clinic_stock_management', true, true, true, false),
    (v_clinic_admin_id, 'clinic_reports', true, true, false, false)
  ON CONFLICT (role_id, module_name) DO NOTHING;

END $$;

-- ============================================================================
-- END OF MIGRATION: 009_clinic_seed_data.sql
-- ============================================================================
