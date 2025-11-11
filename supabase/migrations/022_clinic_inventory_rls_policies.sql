-- ============================================================================
-- CLINIC INVENTORY - RLS POLICIES
-- ============================================================================
-- Migration: 022_clinic_inventory_rls_policies.sql
-- Description: Add RLS policies for clinic inventory tables
-- Author: Sigma Development Team
-- Created: 2025-11-11
-- ============================================================================

-- ============================================================================
-- CLINIC MEDICINE STOCK
-- ============================================================================

-- Enable RLS (if not already enabled)
ALTER TABLE clinic_medicine_stock ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow select stock for clinic users" ON clinic_medicine_stock;
DROP POLICY IF EXISTS "Allow insert stock for clinic users" ON clinic_medicine_stock;
DROP POLICY IF EXISTS "Allow update stock for clinic users" ON clinic_medicine_stock;
DROP POLICY IF EXISTS "Allow delete stock for clinic users" ON clinic_medicine_stock;

-- Policy: Allow SELECT for authenticated users with clinic_stock_management permission
CREATE POLICY "Allow select stock for clinic users"
ON clinic_medicine_stock
FOR SELECT
TO authenticated
USING (has_permission('clinic_stock_management', 'view'));

-- Policy: Allow INSERT for authenticated users with clinic_stock_management permission
CREATE POLICY "Allow insert stock for clinic users"
ON clinic_medicine_stock
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_stock_management', 'create'));

-- Policy: Allow UPDATE for authenticated users with clinic_stock_management permission
CREATE POLICY "Allow update stock for clinic users"
ON clinic_medicine_stock
FOR UPDATE
TO authenticated
USING (has_permission('clinic_stock_management', 'edit'))
WITH CHECK (has_permission('clinic_stock_management', 'edit'));

-- Policy: Allow DELETE for authenticated users with clinic_stock_management permission
CREATE POLICY "Allow delete stock for clinic users"
ON clinic_medicine_stock
FOR DELETE
TO authenticated
USING (has_permission('clinic_stock_management', 'delete'));

-- ============================================================================
-- CLINIC MEDICINE RECEIVING
-- ============================================================================

ALTER TABLE clinic_medicine_receiving ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select receiving for clinic users" ON clinic_medicine_receiving;
DROP POLICY IF EXISTS "Allow insert receiving for clinic users" ON clinic_medicine_receiving;
DROP POLICY IF EXISTS "Allow update receiving for clinic users" ON clinic_medicine_receiving;

CREATE POLICY "Allow select receiving for clinic users"
ON clinic_medicine_receiving
FOR SELECT
TO authenticated
USING (has_permission('clinic_stock_management', 'view'));

CREATE POLICY "Allow insert receiving for clinic users"
ON clinic_medicine_receiving
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_stock_management', 'create'));

CREATE POLICY "Allow update receiving for clinic users"
ON clinic_medicine_receiving
FOR UPDATE
TO authenticated
USING (has_permission('clinic_stock_management', 'edit'))
WITH CHECK (has_permission('clinic_stock_management', 'edit'));

-- ============================================================================
-- CLINIC MEDICINE RECEIVING DETAILS
-- ============================================================================

ALTER TABLE clinic_medicine_receiving_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select receiving details for clinic users" ON clinic_medicine_receiving_details;
DROP POLICY IF EXISTS "Allow insert receiving details for clinic users" ON clinic_medicine_receiving_details;

CREATE POLICY "Allow select receiving details for clinic users"
ON clinic_medicine_receiving_details
FOR SELECT
TO authenticated
USING (has_permission('clinic_stock_management', 'view'));

CREATE POLICY "Allow insert receiving details for clinic users"
ON clinic_medicine_receiving_details
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_stock_management', 'create'));

-- ============================================================================
-- CLINIC MEDICINE DISPENSING
-- ============================================================================

ALTER TABLE clinic_medicine_dispensing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select dispensing for clinic users" ON clinic_medicine_dispensing;
DROP POLICY IF EXISTS "Allow insert dispensing for clinic users" ON clinic_medicine_dispensing;

CREATE POLICY "Allow select dispensing for clinic users"
ON clinic_medicine_dispensing
FOR SELECT
TO authenticated
USING (has_permission('clinic_dispensing', 'view'));

CREATE POLICY "Allow insert dispensing for clinic users"
ON clinic_medicine_dispensing
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_dispensing', 'create'));

-- ============================================================================
-- CLINIC STOCK OPNAME
-- ============================================================================

ALTER TABLE clinic_stock_opname ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select opname for clinic users" ON clinic_stock_opname;
DROP POLICY IF EXISTS "Allow insert opname for clinic users" ON clinic_stock_opname;
DROP POLICY IF EXISTS "Allow update opname for clinic users" ON clinic_stock_opname;

CREATE POLICY "Allow select opname for clinic users"
ON clinic_stock_opname
FOR SELECT
TO authenticated
USING (has_permission('clinic_stock_management', 'view'));

CREATE POLICY "Allow insert opname for clinic users"
ON clinic_stock_opname
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_stock_management', 'create'));

CREATE POLICY "Allow update opname for clinic users"
ON clinic_stock_opname
FOR UPDATE
TO authenticated
USING (has_permission('clinic_stock_management', 'edit'))
WITH CHECK (has_permission('clinic_stock_management', 'edit'));

-- ============================================================================
-- CLINIC STOCK OPNAME DETAILS
-- ============================================================================

ALTER TABLE clinic_stock_opname_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select opname details for clinic users" ON clinic_stock_opname_details;
DROP POLICY IF EXISTS "Allow insert opname details for clinic users" ON clinic_stock_opname_details;

CREATE POLICY "Allow select opname details for clinic users"
ON clinic_stock_opname_details
FOR SELECT
TO authenticated
USING (has_permission('clinic_stock_management', 'view'));

CREATE POLICY "Allow insert opname details for clinic users"
ON clinic_stock_opname_details
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_stock_management', 'create'));

-- ============================================================================
-- CLINIC STOCK REQUESTS
-- ============================================================================

ALTER TABLE clinic_stock_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select stock requests for clinic users" ON clinic_stock_requests;
DROP POLICY IF EXISTS "Allow insert stock requests for clinic users" ON clinic_stock_requests;
DROP POLICY IF EXISTS "Allow update stock requests for clinic users" ON clinic_stock_requests;

CREATE POLICY "Allow select stock requests for clinic users"
ON clinic_stock_requests
FOR SELECT
TO authenticated
USING (has_permission('clinic_stock_management', 'view'));

CREATE POLICY "Allow insert stock requests for clinic users"
ON clinic_stock_requests
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_stock_management', 'create'));

CREATE POLICY "Allow update stock requests for clinic users"
ON clinic_stock_requests
FOR UPDATE
TO authenticated
USING (has_permission('clinic_stock_management', 'edit'))
WITH CHECK (has_permission('clinic_stock_management', 'edit'));

-- ============================================================================
-- CLINIC STOCK REQUEST DETAILS
-- ============================================================================

ALTER TABLE clinic_stock_request_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select stock request details for clinic users" ON clinic_stock_request_details;
DROP POLICY IF EXISTS "Allow insert stock request details for clinic users" ON clinic_stock_request_details;

CREATE POLICY "Allow select stock request details for clinic users"
ON clinic_stock_request_details
FOR SELECT
TO authenticated
USING (has_permission('clinic_stock_management', 'view'));

CREATE POLICY "Allow insert stock request details for clinic users"
ON clinic_stock_request_details
FOR INSERT
TO authenticated
WITH CHECK (has_permission('clinic_stock_management', 'create'));

-- ============================================================================
-- END OF MIGRATION: 022_clinic_inventory_rls_policies.sql
-- ============================================================================
