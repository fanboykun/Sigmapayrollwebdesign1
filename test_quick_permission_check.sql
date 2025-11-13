-- Quick test untuk verify permission structure
-- Run this first to make sure basic setup is correct

-- 1. Check if roles exist
SELECT
    code,
    name,
    is_system_role
FROM public.roles
ORDER BY code;

-- 2. Count permissions per role
SELECT
    r.code as role_code,
    COUNT(*) as total_permissions
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
GROUP BY r.code
ORDER BY total_permissions DESC;

-- 3. Check if premi_deres modules exist
SELECT
    module_name,
    COUNT(*) as roles_with_access
FROM public.role_permissions
WHERE module_name LIKE 'premi_deres%'
GROUP BY module_name
ORDER BY module_name;

-- 4. Sample super_admin permissions
SELECT
    rp.module_name,
    rp.can_view,
    rp.can_create,
    rp.can_edit,
    rp.can_delete
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
WHERE r.code = 'super_admin'
ORDER BY rp.module_name
LIMIT 20;
