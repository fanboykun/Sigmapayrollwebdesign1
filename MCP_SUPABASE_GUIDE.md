# 🔌 MCP Supabase Integration Guide

**Last Updated:** 2025-11-19
**Status:** ✅ Configured & Ready to Test
**Package:** `supabase-mcp` (v1.5.0)

---

## 📋 Overview

Model Context Protocol (MCP) memungkinkan Claude Code untuk mengakses database Supabase secara langsung dengan tools khusus untuk CRUD operations.

### ✅ Configuration Status

- **MCP Config**: `.claude/settings.local.json` ✓ Configured
- **Environment Variables**: `.env` ✓ Service role key added
- **Package**: `supabase-mcp` ✓ Selected
- **Database**: 435 employees, 12 divisions, 169 positions

---

## 🚀 Quick Start

### Step 1: Reload VSCode Window
```
1. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)
2. Type: Developer: Reload Window
3. Press Enter
```

### Step 2: Check MCP Server Status
```
1. Press Ctrl+Shift+P again
2. Type: MCP
3. Select: "Manage MCP Servers"
4. Verify "supabase" shows as enabled (not disabled)
```

### Step 3: Test MCP Connection
After reload, ask Claude to query database:
```
"Show me the first 5 employees from the database"
```

Claude should use MCP tools to query directly from Supabase.

---

## 🔧 Configuration Details

### File: `.claude/settings.local.json`

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["supabase"],
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "supabase-mcp"],
      "env": {
        "SUPABASE_URL": "https://gketmjcxsnzrrzwfrxfw.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "..."
      }
    }
  }
}
```

### Environment Variables (`.env`)

```bash
# Client-side keys (for React app)
VITE_SUPABASE_URL=https://gketmjcxsnzrrzwfrxfw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Service Role Key (SECRET - DO NOT SHARE!)
# Used by MCP server for full database access
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# MCP Configuration
SUPABASE_ACCESS_TOKEN=sbp_38b4c3426f41ffb66068f79a517576b1db3613be
SUPABASE_PROJECT_REF=gketmjcxsnzrrzwfrxfw
SUPABASE_PROJECT_ID=gketmjcxsnzrrzwfrxfw
```

---

## 🎯 Available MCP Package Options

### 1. ✅ `supabase-mcp` (Currently Configured)
- **Version:** 1.5.0
- **Author:** Cappahccino
- **Description:** MCP server for Supabase CRUD operations
- **Features:**
  - Simple setup
  - CRUD operations (Create, Read, Update, Delete)
  - Works with service_role_key
  - No need for Postgres connection string

**Configuration:**
```json
{
  "command": "npx",
  "args": ["-y", "supabase-mcp"],
  "env": {
    "SUPABASE_URL": "https://...",
    "SUPABASE_SERVICE_ROLE_KEY": "..."
  }
}
```

### 2. Alternative: `mcp-supabase-db`
- **Version:** 3.2.5
- **Author:** KodyDennon
- **Description:** Full-featured MCP server with 35+ tools
- **Features:**
  - 35 direct tools
  - Code execution mode (98% token reduction)
  - Streaming support
  - Advanced caching
- **Requires:**
  - `POSTGRES_URL_NON_POOLING` or `POSTGRES_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_PROJECT_ID`

**Configuration:**
```json
{
  "command": "npx",
  "args": ["-y", "mcp-supabase-db"],
  "env": {
    "POSTGRES_URL_NON_POOLING": "postgresql://...",
    "SUPABASE_URL": "https://...",
    "SUPABASE_SERVICE_ROLE_KEY": "...",
    "SUPABASE_PROJECT_ID": "..."
  }
}
```

### 3. Alternative: `@iflow-mcp/supabase-mcp`
- **Version:** 0.1.2
- **Description:** Another MCP implementation for Supabase
- **Less documented**, use with caution

---

## 📖 Using MCP with Claude Code

### Example 1: Query Employees
**User Request:**
```
Show me all employees from division "Afdeling 1"
```

**Claude will use MCP to:**
- Query `employees` table
- Join with `divisions` table
- Filter by division name
- Return results directly

### Example 2: Count Records
**User Request:**
```
How many employees do we have in total?
```

**Claude will use MCP to:**
- Query `employees` table
- Count records
- Return accurate count (not from code comments)

### Example 3: Insert Data
**User Request:**
```
Add a new employee with name "John Doe" in division "Afdeling 1"
```

**Claude will use MCP to:**
- Validate division exists
- Insert new employee record
- Return confirmation

---

## ⚠️ Security Notes

### Service Role Key
- ✅ **Bypasses RLS** - Full database access
- ⚠️ **SECRET** - Never commit to git
- ⚠️ **Production Use** - Use with caution
- 🔒 **Secure Storage** - Keep in `.env` only

### Best Practices
1. **Never commit** `.env` to version control
2. **Add to .gitignore**: `.env`, `.env.local`
3. **Use in development only** or trusted environments
4. **Rotate keys** if accidentally exposed
5. **Monitor access** via Supabase dashboard

---

## 🛠️ Troubleshooting

### Issue 1: MCP Server Shows "Disabled"

**Symptoms:**
- Dialog shows "supabase - disabled"
- Claude can't access MCP tools

**Solutions:**

1. **Reload VSCode Window**
   - Ctrl+Shift+P → "Developer: Reload Window"

2. **Restart VSCode Completely**
   - Close VSCode entirely (File → Exit)
   - Reopen VSCode

3. **Check Configuration**
   ```bash
   # Verify settings file exists
   cat .claude/settings.local.json

   # Check for JSON syntax errors
   npx jsonlint .claude/settings.local.json
   ```

4. **Manually Enable**
   - Click on "supabase" in Manage MCP Servers dialog
   - Look for toggle or enable button

### Issue 2: Package Not Found

**Symptoms:**
```
npm error code E404
npm error 404 Not Found - GET @modelcontextprotocol/server-supabase
```

**Solutions:**
- Verify package name is correct: `supabase-mcp` (not `@modelcontextprotocol/server-supabase`)
- Check internet connection
- Try: `npm search supabase-mcp`

### Issue 3: Missing Environment Variables

**Symptoms:**
```
Error: Missing required environment variables
```

**Solutions:**
1. Check `.env` file exists in project root
2. Verify all required variables are set
3. Reload VSCode after adding variables

### Issue 4: Connection Error

**Symptoms:**
- "Permission denied" errors
- "Invalid JWT" errors

**Solutions:**
1. **Verify Service Role Key**
   - Check key is complete (starts with `eyJ...`)
   - Not expired
   - From correct project

2. **Test Connection Manually**
   ```bash
   npx tsx test-supabase-connection.ts
   ```

3. **Check Supabase Project Status**
   - Visit: https://supabase.com/dashboard/project/gketmjcxsnzrrzwfrxfw
   - Verify project is active
   - Check API settings

---

## 📊 Database Schema

### Core Tables
- `employees` (435 records) - Employee master data
- `divisions` (12 records) - Company divisions
- `positions` (169 records) - Job positions
- `users` - User accounts
- `roles` - User roles

### HR Tables
- `attendance_records` - Daily attendance
- `leave_requests` - Leave applications
- `employee_transfers` - Transfer history
- `employee_assets` - Asset assignments
- `employees_family` - Family members

### Payroll Tables
- `payroll_periods` - Monthly periods
- `payroll_records` - Payroll calculations
- `wage_scales` - Salary scales
- `tax_brackets` - PPh 21 brackets
- `bpjs_rates` - Insurance rates

### Clinic Tables (20+ tables)
- `patients`, `clinic_visits`, `medical_records`
- `prescriptions`, `medicines`, `medicine_stock`
- And more...

### Premi Tables (14+ tables)
- Premi Kebun: `premi_kebun_*` tables
- Premi Deres: `premi_deres_*` tables

---

## 🎓 Best Practices

### 1. Use MCP for Live Data Queries
✅ **Good:**
```
"How many active employees do we have?"
→ Claude queries database via MCP
→ Returns accurate, real-time count
```

❌ **Avoid:**
```
"Look at the code comments to see how many employees..."
→ Inefficient, may be outdated
```

### 2. Combine MCP with Code Generation
✅ **Good:**
```
"Create a component showing employees with salary > 5 million"
→ MCP queries filtered data
→ Claude generates React component with actual data
```

### 3. Let MCP Handle Schema Discovery
✅ **Good:**
```
"What columns does the employees table have?"
→ MCP can inspect table structure
```

---

## 📚 Resources

- **Package Repository:** https://github.com/Cappahccino/SB-MCP
- **Supabase Dashboard:** https://supabase.com/dashboard/project/gketmjcxsnzrrzwfrxfw
- **MCP Documentation:** https://modelcontextprotocol.io
- **Claude Code Docs:** https://docs.anthropic.com/claude-code

---

## ✅ Next Steps

1. ✅ **Configuration Complete** - All files updated
2. ⏳ **Reload VSCode** - Apply changes
3. ⏳ **Verify Status** - Check "Manage MCP Servers"
4. ⏳ **Test Connection** - Ask Claude to query database
5. ⏳ **Start Using** - Use MCP for database queries!

---

## 📝 Change Log

### 2025-11-19
- ✅ Added `SUPABASE_SERVICE_ROLE_KEY` to `.env`
- ✅ Configured MCP server with `supabase-mcp` package
- ✅ Updated `.claude/settings.local.json`
- ✅ Created comprehensive guide
- ⏳ Waiting for VSCode reload to activate

---

**Document Version:** 2.0.0
**Status:** ✅ Ready for Testing
**Last Updated:** 2025-11-19
**Configured By:** Claude Code Assistant
