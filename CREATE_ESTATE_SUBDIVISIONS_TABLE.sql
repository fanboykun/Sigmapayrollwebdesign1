-- Create estate_subdivisions table
-- This table stores subdivisions/divisions for each estate
-- Each estate can have multiple subdivisions (typically 2-8, but can be more)

CREATE TABLE IF NOT EXISTS public.estate_subdivisions (
    id TEXT PRIMARY KEY DEFAULT concat('subdiv-', gen_random_uuid()::text),
    estate_id TEXT NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    kode_subdivisi TEXT NOT NULL,
    nama_subdivisi TEXT NOT NULL,
    kepala_subdivisi TEXT,
    jumlah_karyawan INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique subdivision code per estate
    UNIQUE(estate_id, kode_subdivisi)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_estate_subdivisions_estate_id ON public.estate_subdivisions(estate_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.estate_subdivisions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read subdivisions
CREATE POLICY "Allow authenticated users to read estate_subdivisions"
    ON public.estate_subdivisions
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow all authenticated users to insert subdivisions
CREATE POLICY "Allow authenticated users to insert estate_subdivisions"
    ON public.estate_subdivisions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow all authenticated users to update subdivisions
CREATE POLICY "Allow authenticated users to update estate_subdivisions"
    ON public.estate_subdivisions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow all authenticated users to delete subdivisions
CREATE POLICY "Allow authenticated users to delete estate_subdivisions"
    ON public.estate_subdivisions
    FOR DELETE
    TO authenticated
    USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_estate_subdivisions_updated_at
    BEFORE UPDATE ON public.estate_subdivisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for Aek Loba estate (div-001)
-- You can uncomment these lines to add sample data
/*
INSERT INTO public.estate_subdivisions (estate_id, kode_subdivisi, nama_subdivisi, kepala_subdivisi) VALUES
    ('div-001', 'I', 'Divisi I', ''),
    ('div-001', 'II', 'Divisi II', ''),
    ('div-001', 'III', 'Divisi III', ''),
    ('div-001', 'IV', 'Divisi IV', ''),
    ('div-001', 'V', 'Divisi V', ''),
    ('div-001', 'VI', 'Divisi VI', ''),
    ('div-001', 'KK', 'Kantor Kebun', ''),
    ('div-001', 'KP', 'Kantor Pabrik', '');
*/
