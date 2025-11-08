-- Migration: Add workflow_status and termination_reason columns to employees table
-- Date: 2025-01-08
-- Description: Add workflow status and termination reason fields to track employee workflow state

-- Add workflow_status column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'workflow_status'
  ) THEN
    ALTER TABLE employees
    ADD COLUMN workflow_status VARCHAR(20) DEFAULT 'none'
    CHECK (workflow_status IN ('none', 'recruitment', 'probation', 'termination'));
  END IF;
END $$;

-- Add termination_reason column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'termination_reason'
  ) THEN
    ALTER TABLE employees
    ADD COLUMN termination_reason VARCHAR(50)
    CHECK (termination_reason IN ('resignation', 'retirement', 'contract_end', 'layoff'));
  END IF;
END $$;

-- Add comments to columns
COMMENT ON COLUMN employees.workflow_status IS 'Workflow status of the employee: none, recruitment, probation, or termination. Links employee to corresponding workflow tabs.';
COMMENT ON COLUMN employees.termination_reason IS 'Reason for termination: resignation (Pengunduran diri), retirement (Pensiun), contract_end (Akhir Masa Kontrak), layoff (Afkir).';

-- Create indexes for better query performance (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_employees_workflow_status'
  ) THEN
    CREATE INDEX idx_employees_workflow_status ON employees(workflow_status);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_employees_termination_reason'
  ) THEN
    CREATE INDEX idx_employees_termination_reason ON employees(termination_reason);
  END IF;
END $$;

-- Update existing records to have 'none' as default for workflow_status
UPDATE employees SET workflow_status = 'none' WHERE workflow_status IS NULL;
