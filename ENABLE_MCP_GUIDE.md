# 🔌 Cara Mengaktifkan MCP Supabase

**Status Saat Ini:** ❌ Disabled
**Target:** ✅ Enabled & Active

---

## 🎯 Langkah-Langkah Aktivasi

### Opsi A: Aktifkan via Claude Code UI (Recommended)

1. **Buka MCP Servers Manager**
   - Di Claude Code, ketik command: `/mcp`
   - Atau buka via menu Settings → MCP Servers

2. **Enable Supabase Server**
   - Klik pada baris **"supabase"** yang tertulis "disabled"
   - Akan muncul detail atau toggle switch
   - **Toggle ON** atau klik tombol **"Enable"**
   - Status akan berubah dari "disabled" → "enabled"

3. **Restart Claude Code**
   - Close semua jendela Claude Code
   - Buka kembali Claude Code
   - MCP server akan dimuat saat startup

4. **Verifikasi Aktif**
   - Ketik `/mcp` lagi
   - Status "supabase" seharusnya **"enabled"** atau **"running"**
   - Anda akan melihat tools baru: `mcp__supabase_*`

---

### Opsi B: Aktifkan via Command Line

Jika UI tidak berfungsi, gunakan command line:

#### Windows (PowerShell)
```powershell
# Navigate to project directory
cd "d:\1. Iweka\Sigmapayrollwebdesign\Sigmapayrollwebdesign"

# Enable MCP server menggunakan Claude CLI
claude mcp enable supabase

# Atau tambahkan secara manual
claude mcp add supabase --config .mcp.json
```

#### Alternatif: Edit Konfigurasi Manual

Jika command tidak tersedia, edit file konfigurasi:

**Windows:** `%APPDATA%\Claude\config.json`
**Mac/Linux:** `~/.config/claude/config.json`

Tambahkan:
```json
{
  "mcpServers": {
    "supabase": {
      "enabled": true,
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-postgrest",
        "--apiUrl",
        "https://gketmjcxsnzrrzwfrxfw.supabase.co/rest/v1",
        "--apiKey",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZXRtamN4c256cnJ6d2ZyeGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzgwNTEsImV4cCI6MjA3NzYxNDA1MX0.kjHxmLRjVyt8cSq9HXuz12TOVk32FdRY0ylbRju_gjw",
        "--schema",
        "public"
      ]
    }
  }
}
```

---

### Opsi C: Menggunakan Project-Level Config

Pastikan `.mcp.json` di root project sudah benar:

```bash
# Check file exists
dir .mcp.json

# Verify content
type .mcp.json
```

**File `.mcp.json` yang benar:**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-postgrest",
        "--apiUrl",
        "https://gketmjcxsnzrrzwfrxfw.supabase.co/rest/v1",
        "--apiKey",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZXRtamN4c256cnJ6d2ZyeGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzgwNTEsImV4cCI6MjA3NzYxNDA1MX0.kjHxmLRjVyt8cSq9HXuz12TOVk32FdRY0ylbRju_gjw",
        "--schema",
        "public"
      ]
    }
  }
}
```

Kemudian **reload workspace** atau **restart Claude Code**.

---

## ✅ Cara Verifikasi MCP Sudah Aktif

### 1. Check via Command
```bash
# In Claude Code CLI
/mcp
```

**Expected Output:**
```
MCP Servers:
  ✅ supabase (enabled) - @supabase/mcp-server-postgrest
```

### 2. Check Tools Available

Setelah aktif, Anda akan punya akses ke tools:
- ✅ `mcp__supabase_query` - Query database
- ✅ `mcp__supabase_insert` - Insert records
- ✅ `mcp__supabase_update` - Update records
- ✅ `mcp__supabase_delete` - Delete records
- ✅ `mcp__supabase_rpc` - Call stored procedures

### 3. Test dengan Query

Coba tanya Claude:
```
"Berapa jumlah karyawan di database?"
```

Jika MCP aktif, Claude akan:
- ✅ Menggunakan `mcp__supabase_query`
- ✅ Query langsung ke database
- ✅ Memberikan hasil real-time

Jika MCP belum aktif, Claude akan:
- ❌ Menjawab berdasarkan kode/dokumentasi
- ❌ Tidak bisa query real-time

---

## 🐛 Troubleshooting

### Problem: Server Tetap "Disabled"

**Solution 1: Restart Complete**
```bash
# 1. Close all Claude Code windows
# 2. Terminate any claude processes
taskkill /F /IM claude.exe /T

# 3. Reopen Claude Code
```

**Solution 2: Check Logs**
```bash
# Open Claude Code logs
# Look for MCP-related errors
# Common locations:
# - %APPDATA%\Claude\logs\
# - C:\Users\YourName\.claude\logs\
```

**Solution 3: Reinstall MCP Package**
```bash
# Clear npm cache
npm cache clean --force

# Test MCP package directly
npx -y @supabase/mcp-server-postgrest --help
```

### Problem: "Command Not Found" Error

MCP server memerlukan Node.js dan npx:
```bash
# Check Node.js
node --version   # Should be v18+

# Check npm
npm --version

# Check npx
npx --version
```

### Problem: Permission Denied

```bash
# Run as Administrator (Windows)
# Or check file permissions

# Check .mcp.json is readable
type .mcp.json
```

---

## 🚀 Setelah MCP Aktif

### Test Queries

1. **Count Records:**
   ```
   "Berapa total karyawan di database?"
   ```

2. **List Data:**
   ```
   "Tampilkan 10 karyawan pertama"
   ```

3. **Complex Query:**
   ```
   "Berapa karyawan per divisi?"
   ```

4. **Joins:**
   ```
   "List karyawan dengan nama divisi dan posisi mereka"
   ```

### Expected Behavior

Ketika MCP aktif:
- ⚡ **Lebih cepat** - Claude langsung query database
- 🎯 **Lebih akurat** - Data real-time, bukan dari kode
- 💾 **Hemat token** - Tidak perlu paste schema/data
- 🔍 **Auto-discovery** - Claude tahu struktur database Anda

---

## 📊 Status Checklist

Setelah mengikuti guide ini, check:

- [ ] MCP Server "supabase" terlihat di `/mcp` command
- [ ] Status berubah dari "disabled" → "enabled"
- [ ] Claude Code sudah di-restart
- [ ] Tools `mcp__supabase_*` tersedia
- [ ] Test query berhasil (misal: count karyawan)
- [ ] Claude memberikan data real-time dari database

---

## 🆘 Masih Belum Aktif?

### Quick Diagnosis

```bash
# 1. Check .mcp.json exists
dir .mcp.json

# 2. Validate JSON syntax
npx prettier --check .mcp.json

# 3. Test MCP package
npx -y @supabase/mcp-server-postgrest --apiUrl https://gketmjcxsnzrrzwfrxfw.supabase.co/rest/v1 --apiKey your-key --schema public

# 4. Check Claude Code version
# Make sure you're using latest version that supports MCP
```

### Get Help

1. **Claude Code Docs:** https://docs.anthropic.com/claude-code
2. **MCP Docs:** https://modelcontextprotocol.io/
3. **Supabase MCP:** https://github.com/supabase/mcp-server-postgrest

---

## 📝 Summary

**Cara Tercepat:**
1. Buka `/mcp` di Claude Code
2. Klik "supabase" → Enable
3. Restart Claude Code
4. Test dengan query sederhana

**Jika tidak berhasil:**
- Periksa `.mcp.json` valid
- Pastikan Node.js terinstal
- Restart complete (kill all processes)
- Check logs untuk error messages

---

**Updated:** 2025-11-19
**Status:** Ready to enable
**Next Step:** Enable via UI atau command line, lalu restart

