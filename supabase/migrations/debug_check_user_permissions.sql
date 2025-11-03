-- ============================================================================
-- DEBUG: Check Current User's Clinic Permissions
-- ============================================================================
-- Run this to see which user you're logged in as and their permissions
-- ============================================================================

-- 1. Show all users with their roles
SELECT
    u.id,
    u.email,
    u.full_name,
    r.name as role_name,
    r.code as role_code
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY r.name;

-- 2. Show Super Admin's clinic permissions specifically
SELECT
    u.email,
    r.name as role_name,
    rp.module_name,
    rp.can_view,
    rp.can_create,
    rp.can_edit,
    rp.can_delete
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.code = 'super_admin'
  AND rp.module_name LIKE 'clinic%'
ORDER BY rp.module_name;

-- 3. Check if clinic_dashboard exists for super_admin
SELECT
    r.name as role_name,
    rp.module_name,
    rp.can_view
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.code = 'super_admin'
  AND rp.module_name = 'clinic_dashboard';
