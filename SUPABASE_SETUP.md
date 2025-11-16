# Supabase Setup Guide

Complete guide untuk mengintegrasikan Sigma Payroll dengan Supabase.

## Prerequisites

- Node.js 18+ installed
- Supabase account (sign up at https://supabase.com)
- Git installed

---

## Step 1: Create Supabase Project

1. **Login to Supabase Dashboard**
   - Go to https://app.supabase.com
   - Login or create account

2. **Create New Project**
   - Click "New Project"
   - Fill in:
     - **Name:** Sigma Payroll
     - **Database Password:** (choose a strong password - SAVE THIS!)
     - **Region:** Southeast Asia (Singapore) - closest to Indonesia
     - **Pricing:** Free tier (untuk development)
   - Click "Create new project"
   - Wait ~2 minutes for project to be ready

3. **Get Project Credentials**
   - Navigate to **Settings** → **API**
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)
     - **service_role key** (DO NOT expose this on client!)

---

## Step 2: Setup Environment Variables

1. **Create `.env` file in project root:**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations only (NEVER expose on client!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

2. **Update `.gitignore`:**

Pastikan `.env` sudah ada di `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

3. **Create `.env.example` template:**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Step 3: Install Dependencies

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Or if using exact version from package.json
npm install
```

---

## Step 4: Create Supabase Client

1. **Create Supabase client utility:**

Create file: `src/utils/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

2. **Update existing info file:**

Update `src/utils/supabase/info.ts`:

```typescript
export const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || ''
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
```

---

## Step 5: Run Database Migrations

### Option A: Using Supabase SQL Editor (Recommended for beginners)

1. **Go to SQL Editor** in Supabase Dashboard
2. **Create new query**
3. **Copy and paste** content from:
   - `supabase/migrations/001_initial_schema.sql`
4. **Click "Run"**
5. **Repeat** for:
   - `002_rls_policies.sql`
   - `003_seed_data.sql`

### Option B: Using Supabase CLI (Advanced)

1. **Install Supabase CLI:**

```bash
npm install -g supabase
```

2. **Login to Supabase:**

```bash
supabase login
```

3. **Link your project:**

```bash
supabase link --project-ref your-project-ref
```

4. **Push migrations:**

```bash
supabase db push
```

### Option C: Using psql (Database experts)

```bash
# Get connection string from Supabase Dashboard → Settings → Database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Then run migrations
\i supabase/migrations/001_initial_schema.sql
\i supabase/migrations/002_rls_policies.sql
\i supabase/migrations/003_seed_data.sql
```

---

## Step 6: Setup Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Email** provider
3. Configure:
   - ✅ Enable Email Signups
   - ✅ Enable Email Confirmations (optional for development)
   - ⬜ Disable Email Confirmations (for easier testing)

### Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL:** `http://localhost:3000` (for development)
   - **Redirect URLs:** `http://localhost:3000/**`

### Create Demo Users

Run this in SQL Editor to create demo users:

```sql
-- Note: In production, use Supabase Auth signup instead!
-- This is for demo purposes only

-- First, we need to create auth.users (this requires service_role)
-- For development, create users through the application signup page
-- Or use Supabase Dashboard → Authentication → Add User
```

For development, create users manually:
1. Go to **Authentication** → **Users**
2. Click "Add User"
3. Enter:
   - Email: `superadmin@sawit.com`
   - Password: `super123`
   - Auto Confirm: Yes

4. Then insert into public.users table:

```sql
INSERT INTO public.users (id, email, full_name, role_id, status)
VALUES (
  'auth-user-id-from-auth-table',
  'superadmin@sawit.com',
  'Super Admin',
  '00000000-0000-0000-0000-000000000001', -- Super Admin role
  'active'
);
```

---

## Step 7: Update AuthContext

Replace mock authentication in `src/contexts/AuthContext.tsx`:

```typescript
import { supabase } from '../utils/supabase/client'

// Update login function
const login = async (email: string, password: string): Promise<boolean> => {
  setIsLoading(true);

  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Get user data with role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('id', authData.user.id)
      .single();

    if (userError) throw userError;

    const user: User = {
      id: userData.id,
      name: userData.full_name,
      email: userData.email,
      role: userData.role.code,
      employeeId: userData.employee_id,
      avatar: userData.avatar_url,
      status: userData.status,
      createdAt: userData.created_at,
      lastLogin: new Date().toISOString(),
    };

    setUser(user);
    localStorage.setItem('auth_user', JSON.stringify(user));

    setIsLoading(false);
    return true;
  } catch (error) {
    console.error('Login error:', error);
    setIsLoading(false);
    return false;
  }
};

// Update logout function
const logout = async () => {
  await supabase.auth.signOut();
  setUser(null);
  localStorage.removeItem('auth_user');
};

// Add session restoration
useEffect(() => {
  // Check active session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      // Restore user from session
      // ... fetch user data and set user state
    }
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      // User signed in
    } else {
      // User signed out
      setUser(null);
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

---

## Step 8: Update API Calls

### Example: Get Employees

Replace mock data calls with Supabase:

```typescript
// src/utils/api.ts
import { supabase } from './supabase/client'

export async function getAllEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      id,
      employee_id,
      full_name,
      division:divisions(*),
      position:positions(*)
    `)
    .eq('status', 'active')
    .order('full_name');

  if (error) {
    console.error('Error fetching employees:', error);
    return { success: false, error: error.message };
  }

  // NOTE: Column 'employee_id' contains Employee ID (e.g., EMP-AL-0001)
  // NOT NIK/National ID! For National ID, use 'national_id' column.

  return { success: true, data };
}

export async function createEmployee(employee: any) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateEmployee(id: string, employee: any) {
  const { data, error } = await supabase
    .from('employees')
    .update(employee)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
```

---

## Step 9: Test the Integration

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Login

- Navigate to `http://localhost:3000`
- Try logging in with demo credentials:
  - Email: `superadmin@sawit.com`
  - Password: `super123`

### 3. Test CRUD Operations

- Create a new employee
- Update employee data
- Delete an employee
- Check if RLS policies work correctly

### 4. Test Role-Based Access

- Create users with different roles (admin, manager, karyawan)
- Verify each role only sees/edits what they're allowed to

---

## Step 10: Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Enable email confirmation for signups
- [ ] Setup custom SMTP for emails
- [ ] Enable 2FA for admin accounts
- [ ] Review and test all RLS policies
- [ ] Setup database backups
- [ ] Configure proper CORS settings
- [ ] Use environment-specific .env files
- [ ] Enable rate limiting
- [ ] Setup monitoring and logging
- [ ] Test all user flows
- [ ] Perform security audit

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:** Make sure `.env` file exists and contains correct values:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Issue: "Row Level Security prevents access"

**Solution:**
1. Check if user is authenticated
2. Verify RLS policies in Supabase Dashboard → Database → Policies
3. Test policies in SQL Editor:
```sql
SELECT * FROM employees; -- Should respect RLS
```

### Issue: "Foreign key constraint violation"

**Solution:** Make sure related records exist:
- Division exists before creating employee
- Position exists before creating employee
- Role exists before creating user

### Issue: Migration fails

**Solution:**
1. Drop all tables and start fresh (development only!):
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```
2. Re-run migrations in order

---

## Useful Supabase Commands

```bash
# Check database status
supabase db status

# Reset database (CAUTION: deletes all data!)
supabase db reset

# Generate TypeScript types from database
supabase gen types typescript --local > src/types/database.ts

# View logs
supabase logs --db postgres

# Backup database
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Support

Jika mengalami masalah:
1. Check Supabase logs di Dashboard
2. Check browser console untuk errors
3. Review dokumentasi schema di `DATABASE_SCHEMA.md`
4. Contact development team

---

**Last Updated:** 2024-10-30
