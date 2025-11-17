# Documentation Index

📚 **Quick Reference untuk Semua Dokumentasi Sigma Payroll**

Last Updated: 2025-11-17

---

## 🚀 Getting Started

| Document | Description | Priority |
|----------|-------------|----------|
| [README.md](README.md) | Project overview & quick start | ⭐⭐⭐ |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | Database setup lengkap | ⭐⭐⭐ |
| [CLAUDE.md](CLAUDE.md) | Development guide untuk AI & Developer | ⭐⭐⭐ |

---

## ⚠️ Critical Issues & Solutions

### 🔴 High Priority (Baca Dulu!)

| Document | Issue | When to Read |
|----------|-------|--------------|
| [SUPABASE_PAGINATION_GUIDE.md](SUPABASE_PAGINATION_GUIDE.md) | **1000-row limit** - Data terpotong | ⚠️ **SEBELUM** fetch data > 1000 records |
| [DATABASE_COLUMN_REFERENCE.md](DATABASE_COLUMN_REFERENCE.md) | Column name confusion (nik vs employee_id) | Saat error "column does not exist" |

### 🟡 Medium Priority

| Document | Issue | When to Read |
|----------|-------|--------------|
| [WAGE_DATA_AUDIT.md](WAGE_DATA_AUDIT.md) | Audit missing wage scales | Saat cek data completeness |
| [EMPLOYEE_SALARY_UPDATE_READY.md](EMPLOYEE_SALARY_UPDATE_READY.md) | **Update employee salaries from master_upah** | ⚡ **READY TO EXECUTE** - Batch assign salaries |
| [EMPLOYEE_WAGE_SEED_GUIDE.md](EMPLOYEE_WAGE_SEED_GUIDE.md) | Assign wage scales to employees (old approach) | Reference only (superseded) |
| [ROLE_PERMISSION_SETUP.md](ROLE_PERMISSION_SETUP.md) | Permission configuration | Setup user roles |

---

## 📊 Module Documentation

### HR & Payroll

| Document | Module | Content |
|----------|--------|---------|
| [CLAUDE.md](CLAUDE.md) | General | Development patterns, hooks, components |
| [WAGE_DATA_AUDIT.md](WAGE_DATA_AUDIT.md) | Wage Scales | Audit & fix wage data |

### Clinic

| Document | Module | Content |
|----------|--------|---------|
| [CLINIC_MODULE_IMPLEMENTATION.md](CLINIC_MODULE_IMPLEMENTATION.md) | Clinic | Complete clinic system guide |

### Premi

| Document | Module | Content |
|----------|--------|---------|
| [PREMI_KEBUN_DOCUMENTATION.md](PREMI_KEBUN_DOCUMENTATION.md) | Premi Kebun | Plantation premium system |
| [PREMI_DERES_PENGGAJIAN_DOCUMENTATION.md](PREMI_DERES_PENGGAJIAN_DOCUMENTATION.md) | Premi Deres | Tapping premium system |

---

## 🔧 Technical References

### Database

| File | Description | Use Case |
|------|-------------|----------|
| [supabase/migrations/](supabase/migrations/) | All SQL migrations | Database schema reference |
| [check_missing_divisions.sql](check_missing_divisions.sql) | Audit queries | Data validation |
| [033_master_upah.sql](supabase/migrations/033_master_upah.sql) | Wage table schema | Table structure |
| [039_seed_wage_scales_2025.sql](supabase/migrations/039_seed_wage_scales_2025.sql) | Wage data seed | Initial data |
| [update_employee_salaries.sql](update_employee_salaries.sql) | ⚡ Employee salary assignment | Batch update from master_upah |

### Code References

| File | Description | Key Patterns |
|------|-------------|--------------|
| [src/hooks/useWageScales.ts](src/hooks/useWageScales.ts) | Wage scales hook | ✅ Batch fetching example |
| [src/components/AttendanceMaster.tsx](src/components/AttendanceMaster.tsx) | Attendance UI | ✅ Pagination example |
| [src/components/WageMaster.tsx](src/components/WageMaster.tsx) | Wage scales UI | UI pagination (50/page) |

---

## 🐛 Bug Fixes & Troubleshooting

### Fixed Issues

| Document | Bug | Solution | Status |
|----------|-----|----------|--------|
| [SUPABASE_PAGINATION_GUIDE.md](SUPABASE_PAGINATION_GUIDE.md) | Only 1000/6627 records shown | Batch fetching | ✅ Fixed |
| [FIX_EMPLOYEE_DROPDOWN_SUMMARY.md](FIX_EMPLOYEE_DROPDOWN_SUMMARY.md) | Employee dropdown issues | Query optimization | ✅ Fixed |
| [CHROME_LOGIN_FIX.md](CHROME_LOGIN_FIX.md) | Chrome login problems | Auth flow fix | ✅ Fixed |

### Troubleshooting Guides

| Document | When to Use |
|----------|-------------|
| [WAGE_DATA_AUDIT.md](WAGE_DATA_AUDIT.md) | Data validation & completeness check |
| [SUPABASE_PAGINATION_GUIDE.md](SUPABASE_PAGINATION_GUIDE.md) | Query returns incomplete data |

---

## 📖 Development Workflows

### Common Tasks

#### 1. Membuat Hook Baru untuk Tabel Besar (> 1000 records)

```
1. Read: SUPABASE_PAGINATION_GUIDE.md
2. Copy: Template di section "Quick Start Template"
3. Implement: Sesuaikan dengan tabel Anda
4. Test: Verify semua data ter-fetch
5. Document: Tambahkan JSDoc comment
```

#### 2. Audit Data Completeness

```
1. Read: WAGE_DATA_AUDIT.md
2. Run: check_missing_divisions.sql queries
3. Analyze: Compare expected vs actual
4. Fix: Run appropriate migration
5. Verify: Re-run audit queries
```

#### 3. Setup Database dari Nol

```
1. Read: SUPABASE_SETUP.md
2. Create: Supabase project
3. Run: Migrations 001-041 in order
4. Verify: Check table counts
5. Seed: Run seed data scripts
```

#### 4. Fix "Column Does Not Exist" Error

```
1. Read: DATABASE_COLUMN_REFERENCE.md
2. Check: Correct column name (employee_id vs national_id)
3. Update: Query dengan nama yang benar
4. Test: Verify query works
```

---

## 🎯 Quick Lookup

### By Error Message

| Error Message | Document to Read |
|---------------|------------------|
| "column employees.nik does not exist" | DATABASE_COLUMN_REFERENCE.md |
| "Only showing 1000 records" | SUPABASE_PAGINATION_GUIDE.md |
| "Permission denied" | ROLE_PERMISSION_SETUP.md |
| "Missing wage scales" | WAGE_DATA_AUDIT.md |

### By Task

| Task | Documents to Read |
|------|-------------------|
| Fetch large dataset | SUPABASE_PAGINATION_GUIDE.md |
| Create new hook | CLAUDE.md + SUPABASE_PAGINATION_GUIDE.md |
| Audit data | WAGE_DATA_AUDIT.md + check_missing_divisions.sql |
| Setup permissions | ROLE_PERMISSION_SETUP.md |
| Database schema | SUPABASE_SETUP.md + migration files |

### By Module

| Module | Key Documents |
|--------|---------------|
| Wage Scales | WAGE_DATA_AUDIT.md, 039_seed_wage_scales_2025.sql |
| Attendance | AttendanceMaster.tsx (lines 278-330) |
| Clinic | CLINIC_MODULE_IMPLEMENTATION.md |
| Premi Kebun | PREMI_KEBUN_DOCUMENTATION.md |
| Premi Deres | PREMI_DERES_PENGGAJIAN_DOCUMENTATION.md |

---

## 📝 Documentation Standards

### Naming Convention

- **UPPERCASE_WITH_UNDERSCORES.md** - Important docs & guides
- **kebab-case.md** - Technical references
- **Migration files** - `NNN_descriptive_name.sql`

### Update Guidelines

When updating documentation:

1. **Always update "Last Updated" date**
2. **Add to this index** if creating new doc
3. **Cross-reference** related documents
4. **Use emojis** untuk visual hierarchy
5. **Include examples** untuk clarity

### Documentation Checklist

New documentation should include:

- [ ] Clear title & description
- [ ] Last updated date
- [ ] Table of contents (if > 200 lines)
- [ ] Code examples
- [ ] Related documents section
- [ ] Update DOCUMENTATION_INDEX.md

---

## 🔍 Search Tips

### Find by Keyword

Use file search (Ctrl+Shift+F in VSCode) untuk keyword:

- **"1000 records"** → SUPABASE_PAGINATION_GUIDE.md
- **"employee_id vs nik"** → DATABASE_COLUMN_REFERENCE.md
- **"batch fetching"** → SUPABASE_PAGINATION_GUIDE.md
- **"141 scales"** → WAGE_DATA_AUDIT.md
- **"RLS policies"** → SUPABASE_SETUP.md, CLAUDE.md

### Find by File Pattern

```bash
# All markdown docs
*.md

# SQL migrations
supabase/migrations/*.sql

# Hooks with pagination
src/hooks/use*.ts

# Components with large data
src/components/*Master.tsx
```

---

## 🎓 Learning Path

### For New Developers

1. **Week 1 - Setup & Basics**
   - README.md
   - SUPABASE_SETUP.md
   - CLAUDE.md (sections 1-5)

2. **Week 2 - Critical Patterns**
   - SUPABASE_PAGINATION_GUIDE.md ⚠️ CRITICAL
   - DATABASE_COLUMN_REFERENCE.md
   - Review useWageScales.ts implementation

3. **Week 3 - Module Deep Dive**
   - Pick one module (Clinic/Premi/etc)
   - Read module documentation
   - Study code implementation
   - Try making changes

4. **Week 4 - Advanced**
   - ROLE_PERMISSION_SETUP.md
   - Debug & fix workflows
   - Performance optimization

### For AI Assistants

Priority reading order:

1. ⭐⭐⭐ **CRITICAL** (Read first!)
   - CLAUDE.md
   - SUPABASE_PAGINATION_GUIDE.md
   - DATABASE_COLUMN_REFERENCE.md

2. ⭐⭐ **HIGH** (Read before coding)
   - SUPABASE_SETUP.md
   - WAGE_DATA_AUDIT.md
   - Migration files structure

3. ⭐ **MEDIUM** (Context-specific)
   - Module-specific docs as needed
   - Bug fix docs when debugging
   - Troubleshooting guides

---

## 📞 Need Help?

### When Documentation Doesn't Help

1. **Check Console Logs** - Look for error messages
2. **Run Audit Queries** - Use check_missing_divisions.sql
3. **Compare with Examples** - See working implementations
4. **Review Migration Files** - Check database schema

### Documentation Feedback

If you find:
- ❌ Outdated information
- 🐛 Broken examples
- 📝 Missing documentation
- 💡 Improvement suggestions

→ Create issue atau update documentation langsung

---

## 🔄 Maintenance

### Regular Updates

| Frequency | Task | Files to Update |
|-----------|------|-----------------|
| **Every code change** | Update inline comments | Source files |
| **Major features** | Create/update module docs | Feature .md files |
| **Bug fixes** | Document in fix guide | Fix .md files |
| **Schema changes** | Update migration docs | Migration files |
| **Monthly** | Review & update index | This file |

### Version History

- **2025-11-17**: Created SUPABASE_PAGINATION_GUIDE.md (Critical!)
- **2025-11-17**: Fixed useWageScales with batch fetching
- **2025-11-17**: Created DOCUMENTATION_INDEX.md
- **Previous**: See git history for earlier changes

---

## 📚 External Resources

### Supabase Documentation
- [Supabase Pagination](https://supabase.com/docs/reference/javascript/range)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgREST API](https://postgrest.org/en/stable/)

### React & TypeScript
- [React Hooks Best Practices](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### UI Components
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)

---

**Happy Coding! 🚀**

*Remember: When in doubt, check SUPABASE_PAGINATION_GUIDE.md and CLAUDE.md first!*

---

Last Updated: 2025-11-17 | Maintainer: Sigma Payroll Team
