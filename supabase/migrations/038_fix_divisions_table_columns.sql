-- =====================================================
-- Migration: 038_fix_divisions_table_columns.sql
-- Description: Fix divisions table column names to match application
-- Author: Sigma Payroll Team
-- Date: 2025-11-17
-- =====================================================

-- Check current table structure first
DO $$
DECLARE
    has_code_column BOOLEAN;
    has_kode_divisi_column BOOLEAN;
BEGIN
    -- Check if 'code' column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'divisions'
        AND column_name = 'code'
    ) INTO has_code_column;

    -- Check if 'kode_divisi' column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'divisions'
        AND column_name = 'kode_divisi'
    ) INTO has_kode_divisi_column;

    RAISE NOTICE 'Has code column: %', has_code_column;
    RAISE NOTICE 'Has kode_divisi column: %', has_kode_divisi_column;

    -- If table has 'code' but not 'kode_divisi', rename columns
    IF has_code_column AND NOT has_kode_divisi_column THEN
        RAISE NOTICE 'Renaming columns from English to Indonesian...';

        -- Rename code to kode_divisi
        ALTER TABLE public.divisions RENAME COLUMN code TO kode_divisi;

        -- Rename name to nama_divisi
        ALTER TABLE public.divisions RENAME COLUMN name TO nama_divisi;

        -- Drop shortname column if exists (not used in app)
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'divisions'
            AND column_name = 'shortname'
        ) THEN
            ALTER TABLE public.divisions DROP COLUMN shortname;
        END IF;

        -- Add kepala_divisi column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'divisions'
            AND column_name = 'kepala_divisi'
        ) THEN
            ALTER TABLE public.divisions ADD COLUMN kepala_divisi VARCHAR(255);
        END IF;

        RAISE NOTICE 'Column renaming completed successfully';
    ELSE
        RAISE NOTICE 'Columns already use Indonesian names, skipping migration';
    END IF;
END $$;

-- Ensure id column has proper default value
ALTER TABLE public.divisions
    ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Verify the structure
DO $$
DECLARE
    column_list TEXT;
BEGIN
    SELECT string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position)
    INTO column_list
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'divisions';

    RAISE NOTICE 'Current divisions table columns: %', column_list;
END $$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
