# Migration Guide - Apply Database Schema to Supabase

## Error You're Experiencing
```
Gagal menambahkan divisi: Could not find the 'code' column of 'divisions' in the schema cache
```

This error occurs because the database migrations haven't been applied to your Supabase database yet.

## Solution: Apply Migrations Manually

### Step 1: Access Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"

### Step 2: Run Migrations in Order

You need to run each migration file in the `supabase/migrations/` folder in order. Copy and paste the contents of each file into the SQL Editor and click "Run".

#### Required Migrations (in order):

1. **001_initial_schema.sql** - Creates all tables (divisions, positions, employees, etc.)
2. **002_add_employee_additional_fields.sql** - Adds additional employee fields
3. **002_rls_policies.sql** - Sets up Row Level Security policies
4. **003_seed_data.sql** - Seeds initial master data
5. **003_seed_employees_data.sql** - Seeds employee test data
6. **004_clinic_master_data.sql** - Clinic master data tables
7. **005_clinic_operational.sql** - Clinic operational tables
8. **006_clinic_inventory.sql** - Clinic inventory tables
9. **007_clinic_triggers.sql** - Clinic triggers
10. **008_clinic_hr_integration.sql** - HR integration
11. **009_clinic_seed_data.sql** - Clinic seed data
12. **009b_fix_clinic_permissions.sql** - Fix clinic permissions
13. **009c_verify_and_fix_all_clinic_permissions.sql** - Verify clinic permissions
14. **010_partner_plantations.sql** - Partner plantations
15. **011_patients.sql** - Patients table
16. **012_clinic_registrations.sql** - Clinic registrations
17. **013_employees_family_data.sql** - Employee family data
18. **014_seed_clinic_registration_data.sql** - Clinic registration seed data
19. **015_add_doctor_fk_constraint.sql** - Doctor foreign key

### Step 3: Verify Schema

After running all migrations, verify the schema is correct by running:

```sql
-- Check divisions table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'divisions'
ORDER BY ordinal_position;

-- Check positions table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'positions'
ORDER BY ordinal_position;

-- Check employees table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;
```

### Expected Results

After running the migrations, you should see:

**divisions table:**
- id (uuid)
- code (varchar)
- shortname (varchar)
- name (varchar)
- is_factory (boolean)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)

**positions table:**
- id (uuid)
- code (varchar)
- name (varchar)
- level (varchar)
- description (text)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)

**employees table:**
- id (uuid)
- nik (varchar)
- full_name (varchar)
- division_id (uuid) - FK to divisions
- position_id (uuid) - FK to positions
- tax_ptkp_status (varchar) - NOT ptkp_status
- ... and many other fields

## Alternative: Use Supabase CLI with Link

If you prefer to use the CLI, you need to link your project first:

```bash
# Link to your remote Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations to remote database
npx supabase db push
```

To find your PROJECT_REF:
1. Go to Supabase Dashboard
2. Click on your project
3. Go to Settings > General
4. Copy the "Reference ID"

## After Applying Migrations

Once all migrations are applied:
1. Refresh your application
2. Try adding a division again - it should work
3. Try adding a position - it should work
4. Try adding/editing employees - it should work

## Troubleshooting

If you still get schema cache errors:
1. Make sure ALL migrations were applied successfully
2. Check for any SQL errors in the Supabase SQL Editor
3. Verify the tables exist: Go to "Table Editor" in Supabase Dashboard
4. Try refreshing the schema cache in your app (restart dev server)
