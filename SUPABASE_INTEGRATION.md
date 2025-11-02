# Panduan Integrasi Supabase - Sigma Payroll

## 📋 Ringkasan

Panduan ini menjelaskan langkah-langkah untuk mengintegrasikan data karyawan dengan Supabase database.

## ✅ Yang Sudah Dibuat

### 1. Supabase Client
**File**: `src/lib/supabaseClient.ts`

Client untuk koneksi ke Supabase dengan error handling.

### 2. Database Migration
**File**: `supabase/migrations/002_add_employee_additional_fields.sql`

Menambahkan field baru ke tabel employees:
- national_id (National ID/KTP)
- height (Tinggi badan)
- weight (Berat badan)
- driving_license_number (Nomor SIM)
- driving_license_expiry (Tanggal berlaku SIM)
- nationality (Kewarganegaraan)
- blood_group (Golongan darah)
- religion (Agama)

### 3. Seed Data
**File**: `supabase/migrations/003_seed_employees_data.sql`

Data dummy 38 karyawan siap untuk di-insert ke database.

## 🚀 Langkah Instalasi

### 1. Setup Environment Variables

Buat file `.env` di root project:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Cara mendapatkan credentials:**
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka Settings → API
4. Copy `URL` dan `anon public key`

### 2. Run Migrations

```bash
# Jika menggunakan Supabase CLI
supabase db push

# Atau apply migrations secara manual di Supabase Dashboard
# SQL Editor → New Query → Paste migration file → Run
```

**Urutan migration:**
1. `001_initial_schema.sql` (sudah ada)
2. `002_add_employee_additional_fields.sql` (field baru)
3. `003_seed_employees_data.sql` (data dummy)

### 3. Buat Custom Hook untuk Employees

Buat file `src/hooks/useEmployees.ts`:

```typescript
import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabaseClient';

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: 'male' | 'female';
  address: string;
  department: string;
  employment_type: 'permanent' | 'contract' | 'internship';
  join_date: string;
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  base_salary: number;
  bank_name: string;
  bank_account: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  ptkp_status: string;
  national_id?: string;
  height?: number;
  weight?: number;
  driving_license_number?: string;
  driving_license_expiry?: string;
  nationality?: string;
  blood_group?: string;
  religion?: string;
  created_at?: string;
  updated_at?: string;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setEmployees(data || []);
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err, 'fetchEmployees');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: any) => {
    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('employees')
        .insert([{ ...employeeData, status: 'active' }])
        .select()
        .single();

      if (createError) throw createError;

      setEmployees(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err, 'createEmployee');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateEmployee = async (id: string, employeeData: any) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setEmployees(prev => prev.map(emp => emp.id === id ? data : emp));
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err, 'updateEmployee');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('employees')
        .update({ status: 'terminated' })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setEmployees(prev => prev.filter(emp => emp.id !== id));
      return { success: true };
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err, 'deleteEmployee');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchEmployees();

    // Realtime subscription
    const subscription = supabase
      .channel('employees_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'employees'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEmployees(prev => [payload.new as Employee, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setEmployees(prev =>
            prev.map(emp => emp.id === payload.new.id ? payload.new as Employee : emp)
          );
        } else if (payload.eventType === 'DELETE') {
          setEmployees(prev => prev.filter(emp => emp.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
```

### 4. Update EmployeeManagement Component

Ubah baris import dan state management di `src/components/EmployeeManagement.tsx`:

```typescript
// Di bagian atas file, ganti import
// import { MASTER_EMPLOYEES, MasterEmployee } from '../shared/employeeData';
import { useEmployees } from '../hooks/useEmployees';
import { toast } from 'sonner'; // untuk notifications

// Dalam component, ganti state
// const [employees, setEmployees] = useState<Employee[]>(MASTER_EMPLOYEES);
const {
  employees,
  loading,
  error,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = useEmployees();

// Update handleAddEmployee
const handleAddEmployee = async () => {
  if (!birthDate || !joinDate) {
    toast.error('Tanggal lahir dan tanggal bergabung harus diisi!');
    return;
  }

  const employeeData = {
    employee_id: formData.employeeId,
    full_name: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    birth_date: birthDate.toISOString().split('T')[0],
    gender: formData.gender as 'male' | 'female',
    address: formData.address,
    department: 'Produksi', // atau dari formData
    employment_type: formData.gradeLevel === 'pegawai' ? 'permanent' :
                    formData.gradeLevel === 'pkwt' ? 'contract' : 'permanent',
    join_date: joinDate.toISOString().split('T')[0],
    base_salary: 4000000, // atau dari formData
    bank_name: formData.bankName,
    bank_account: formData.bankAccount,
    emergency_contact_name: formData.emergencyContact,
    emergency_contact_phone: formData.emergencyPhone,
    ptkp_status: 'K/0', // atau dari formData
    national_id: formData.nationalId,
    height: formData.height ? parseFloat(formData.height) : undefined,
    weight: formData.weight ? parseFloat(formData.weight) : undefined,
    driving_license_number: formData.drivingLicenseNumber,
    driving_license_expiry: drivingLicenseExpiry?.toISOString().split('T')[0],
    nationality: formData.nationality,
    blood_group: formData.bloodGroup,
    religion: formData.religion,
  };

  const result = await createEmployee(employeeData);

  if (result.success) {
    toast.success('Karyawan berhasil ditambahkan!');
    setIsAddDialogOpen(false);
    resetForm();
  } else {
    toast.error(result.error || 'Gagal menambahkan karyawan');
  }
};

// Update handleUpdateEmployee
const handleUpdateEmployee = async () => {
  if (!selectedEmployee) return;

  const employeeData = {
    employee_id: formData.employeeId,
    full_name: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    birth_date: birthDate?.toISOString().split('T')[0],
    gender: formData.gender as 'male' | 'female',
    address: formData.address,
    bank_name: formData.bankName,
    bank_account: formData.bankAccount,
    emergency_contact_name: formData.emergencyContact,
    emergency_contact_phone: formData.emergencyPhone,
    national_id: formData.nationalId,
    height: formData.height ? parseFloat(formData.height) : undefined,
    weight: formData.weight ? parseFloat(formData.weight) : undefined,
    driving_license_number: formData.drivingLicenseNumber,
    driving_license_expiry: drivingLicenseExpiry?.toISOString().split('T')[0],
    nationality: formData.nationality,
    blood_group: formData.bloodGroup,
    religion: formData.religion,
  };

  const result = await updateEmployee(selectedEmployee.id, employeeData);

  if (result.success) {
    toast.success('Data karyawan berhasil diperbarui!');
    setIsEditDialogOpen(false);
    resetForm();
    setSelectedEmployee(null);
  } else {
    toast.error(result.error || 'Gagal memperbarui data karyawan');
  }
};

// Update handleDeleteEmployee
const handleDeleteEmployee = async (id: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) return;

  const result = await deleteEmployee(id);

  if (result.success) {
    toast.success('Karyawan berhasil dihapus!');
  } else {
    toast.error(result.error || 'Gagal menghapus karyawan');
  }
};

// Tambahkan loading state di render
if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Memuat data karyawan...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="p-6">
      <div className="bg-destructive/10 text-destructive p-4 rounded">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
      </div>
    </div>
  );
}
```

### 5. Install Dependencies (jika belum)

```bash
npm install @supabase/supabase-js
npm install sonner  # untuk toast notifications
```

### 6. Update Date Handling

Karena Supabase mengembalikan string untuk tanggal, update bagian yang menggunakan date:

```typescript
// Saat menampilkan data di view dialog
{selectedEmployee.birth_date && (
  <div className="p-4 bg-muted/30 rounded">
    <p className="text-sm text-muted-foreground mb-1">Tanggal Lahir</p>
    <p>{format(new Date(selectedEmployee.birth_date), 'PPP', { locale: id })}</p>
  </div>
)}
```

## 🧪 Testing

1. **Test Connection**
   ```typescript
   // Buat test file atau run di console
   import { supabase } from './src/lib/supabaseClient';

   const testConnection = async () => {
     const { data, error } = await supabase.from('employees').select('count');
     console.log('Connection test:', { data, error });
   };

   testConnection();
   ```

2. **Test CRUD Operations**
   - Tambah karyawan baru
   - Edit data karyawan
   - Hapus karyawan
   - Search karyawan

## 📝 Notes

- Semua operasi delete adalah soft delete (ubah status menjadi 'terminated')
- Realtime subscription akan auto-update data jika ada perubahan
- Error handling sudah terintegrasi di setiap operasi
- Data validation harus ditambahkan sesuai kebutuhan

## 🔐 Security

Jangan lupa setup Row Level Security (RLS) di Supabase:

```sql
-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policy untuk read (semua authenticated users bisa read)
CREATE POLICY "Enable read for authenticated users"
ON public.employees FOR SELECT
TO authenticated
USING (true);

-- Policy untuk insert/update/delete (sesuaikan dengan role)
CREATE POLICY "Enable insert for authenticated users"
ON public.employees FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON public.employees FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Enable delete for authenticated users"
ON public.employees FOR DELETE
TO authenticated
USING (true);
```

## ✨ Features Tambahan (Optional)

1. **Export to Excel**: Tambahkan button untuk export data
2. **Bulk Import**: Import data dari CSV/Excel
3. **Advanced Filters**: Filter berdasarkan departemen, status, dll
4. **Pagination**: Untuk performa yang lebih baik dengan data banyak

## 🆘 Troubleshooting

**Error: "Missing Supabase environment variables"**
- Pastikan file `.env` sudah dibuat dengan benar
- Restart development server setelah menambah env variables

**Error: "relation 'employees' does not exist"**
- Run migrations terlebih dahulu
- Cek di Supabase Dashboard apakah tabel sudah terbuat

**Data tidak muncul**
- Cek network tab di browser DevTools
- Pastikan Supabase credentials sudah benar
- Cek Supabase Dashboard → Table Editor

---

**Dibuat oleh**: Sigma Payroll Team
**Tanggal**: 2025-01-11
**Version**: 1.0.0
