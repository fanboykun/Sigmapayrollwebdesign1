-- ============================================================================
-- TEST QUERIES FOR STOCK OPNAME MODULE
-- ============================================================================

-- 1. Get all stock opname records with performer info
SELECT 
  so.id,
  so.opname_number,
  so.opname_date,
  so.period_month,
  so.period_year,
  so.status,
  so.total_items_checked,
  so.total_variance,
  so.notes,
  u1.full_name as performed_by_name,
  u2.full_name as verified_by_name,
  u3.full_name as approved_by_name
FROM clinic_stock_opname so
LEFT JOIN users u1 ON so.performed_by = u1.id
LEFT JOIN users u2 ON so.verified_by = u2.id
LEFT JOIN users u3 ON so.approved_by = u3.id
ORDER BY so.opname_date DESC, so.opname_number DESC;

-- 2. Get opname details with medicine info
SELECT 
  sod.id,
  sod.opname_id,
  m.medicine_code,
  m.name as medicine_name,
  m.unit,
  sod.batch_number,
  sod.system_quantity,
  sod.physical_quantity,
  sod.variance,
  sod.variance_reason,
  sod.adjustment_type,
  sod.expiry_date
FROM clinic_stock_opname_details sod
INNER JOIN clinic_medicines m ON sod.medicine_id = m.id
WHERE sod.opname_id = 'OPNAME_ID_HERE'
ORDER BY m.name, sod.batch_number;

-- 3. Get current stock to prepare for opname
SELECT 
  s.id,
  s.medicine_id,
  m.medicine_code,
  m.name as medicine_name,
  m.unit,
  s.batch_number,
  s.quantity as system_quantity,
  s.expiry_date,
  s.location,
  s.status
FROM clinic_medicine_stock s
INNER JOIN clinic_medicines m ON s.medicine_id = m.id
WHERE s.status = 'available' AND s.quantity > 0
ORDER BY m.name, s.expiry_date ASC;

-- 4. Get variance summary by medicine
SELECT 
  m.medicine_code,
  m.name as medicine_name,
  COUNT(sod.id) as batch_count,
  SUM(sod.system_quantity) as total_system,
  SUM(sod.physical_quantity) as total_physical,
  SUM(sod.variance) as total_variance,
  SUM(CASE WHEN sod.adjustment_type = 'plus' THEN sod.variance ELSE 0 END) as plus_adjustment,
  SUM(CASE WHEN sod.adjustment_type = 'minus' THEN ABS(sod.variance) ELSE 0 END) as minus_adjustment
FROM clinic_stock_opname_details sod
INNER JOIN clinic_medicines m ON sod.medicine_id = m.id
WHERE sod.opname_id = 'OPNAME_ID_HERE'
GROUP BY m.id, m.medicine_code, m.name
ORDER BY ABS(SUM(sod.variance)) DESC;

-- 5. Generate opname number (format: OPN-YYYYMMDD-XXXX)
SELECT 
  'OPN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
  LPAD(CAST(COALESCE(MAX(CAST(SUBSTRING(opname_number FROM 16) AS INTEGER)), 0) + 1 AS TEXT), 4, '0') as next_opname_number
FROM clinic_stock_opname
WHERE opname_number LIKE 'OPN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '%';
