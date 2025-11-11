-- ============================================================================
-- CLINIC MASTER DATA - RLS POLICIES
-- ============================================================================
-- Migration: 024_clinic_master_data_rls_policies.sql
-- Description: Add RLS policies for clinic master data tables
-- Author: Sigma Development Team
-- Created: 2025-11-12
-- ============================================================================

-- ============================================================================
-- CLINIC MEDICINE CATEGORIES
-- ============================================================================

ALTER TABLE clinic_medicine_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select categories for clinic users" ON clinic_medicine_categories;
DROP POLICY IF EXISTS "Allow insert categories for clinic users" ON clinic_medicine_categories;
DROP POLICY IF EXISTS "Allow update categories for clinic users" ON clinic_medicine_categories;
DROP POLICY IF EXISTS "Allow delete categories for clinic users" ON clinic_medicine_categories;

CREATE POLICY "Allow select categories for clinic users"
ON clinic_medicine_categories
FOR SELECT
TO authenticated
USING (has_permission('clinic_master_medicines', 'view'));

CREATE POLICY "Allow insert categories for clinic users"
ON clinic_medicine_categories
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_master_medicines', 'create'));

CREATE POLICY "Allow update categories for clinic users"
ON clinic_medicine_categories
FOR UPDATE
TO authenticated
USING (has_permission('clinic_master_medicines', 'edit'))
WITH CHECK (has_permission('clinic_master_medicines', 'edit'));

CREATE POLICY "Allow delete categories for clinic users"
ON clinic_medicine_categories
FOR DELETE
TO authenticated
USING (has_permission('clinic_master_medicines', 'delete'));

-- ============================================================================
-- CLINIC MEDICINES
-- ============================================================================

ALTER TABLE clinic_medicines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select medicines for clinic users" ON clinic_medicines;
DROP POLICY IF EXISTS "Allow insert medicines for clinic users" ON clinic_medicines;
DROP POLICY IF EXISTS "Allow update medicines for clinic users" ON clinic_medicines;
DROP POLICY IF EXISTS "Allow delete medicines for clinic users" ON clinic_medicines;

CREATE POLICY "Allow select medicines for clinic users"
ON clinic_medicines
FOR SELECT
TO authenticated
USING (has_permission('clinic_master_medicines', 'view'));

CREATE POLICY "Allow insert medicines for clinic users"
ON clinic_medicines
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_master_medicines', 'create'));

CREATE POLICY "Allow update medicines for clinic users"
ON clinic_medicines
FOR UPDATE
TO authenticated
USING (has_permission('clinic_master_medicines', 'edit'))
WITH CHECK (has_permission('clinic_master_medicines', 'edit'));

CREATE POLICY "Allow delete medicines for clinic users"
ON clinic_medicines
FOR DELETE
TO authenticated
USING (has_permission('clinic_master_medicines', 'delete'));

-- ============================================================================
-- CLINIC SUPPLIERS
-- ============================================================================

ALTER TABLE clinic_suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select suppliers for clinic users" ON clinic_suppliers;
DROP POLICY IF EXISTS "Allow insert suppliers for clinic users" ON clinic_suppliers;
DROP POLICY IF EXISTS "Allow update suppliers for clinic users" ON clinic_suppliers;
DROP POLICY IF EXISTS "Allow delete suppliers for clinic users" ON clinic_suppliers;

CREATE POLICY "Allow select suppliers for clinic users"
ON clinic_suppliers
FOR SELECT
TO authenticated
USING (has_permission('clinic_master_suppliers', 'view'));

CREATE POLICY "Allow insert suppliers for clinic users"
ON clinic_suppliers
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_master_suppliers', 'create'));

CREATE POLICY "Allow update suppliers for clinic users"
ON clinic_suppliers
FOR UPDATE
TO authenticated
USING (has_permission('clinic_master_suppliers', 'edit'))
WITH CHECK (has_permission('clinic_master_suppliers', 'edit'));

CREATE POLICY "Allow delete suppliers for clinic users"
ON clinic_suppliers
FOR DELETE
TO authenticated
USING (has_permission('clinic_master_suppliers', 'delete'));

-- ============================================================================
-- CLINIC DISEASES
-- ============================================================================

ALTER TABLE clinic_diseases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select diseases for clinic users" ON clinic_diseases;
DROP POLICY IF EXISTS "Allow insert diseases for clinic users" ON clinic_diseases;
DROP POLICY IF EXISTS "Allow update diseases for clinic users" ON clinic_diseases;
DROP POLICY IF EXISTS "Allow delete diseases for clinic users" ON clinic_diseases;

CREATE POLICY "Allow select diseases for clinic users"
ON clinic_diseases
FOR SELECT
TO authenticated
USING (has_permission('clinic_master_diseases', 'view'));

CREATE POLICY "Allow insert diseases for clinic users"
ON clinic_diseases
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_master_diseases', 'create'));

CREATE POLICY "Allow update diseases for clinic users"
ON clinic_diseases
FOR UPDATE
TO authenticated
USING (has_permission('clinic_master_diseases', 'edit'))
WITH CHECK (has_permission('clinic_master_diseases', 'edit'));

CREATE POLICY "Allow delete diseases for clinic users"
ON clinic_diseases
FOR DELETE
TO authenticated
USING (has_permission('clinic_master_diseases', 'delete'));

-- ============================================================================
-- END OF MIGRATION: 024_clinic_master_data_rls_policies.sql
-- ============================================================================
