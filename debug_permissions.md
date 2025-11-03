# Debug Checklist - Clinic Permissions

## Issue: Submenu Clinic tidak muncul (kosong)

### Kemungkinan Penyebab:
1. ❓ Session belum refresh setelah update AuthContext
2. ❓ Filter canAccessMenu() return false
3. ❓ Module mapping tidak match

### Solusi Step-by-Step:

## STEP 1: Force Logout & Login Ulang
**SANGAT PENTING!** AuthContext di-cache oleh React:

1. Buka aplikasi
2. Klik profile/avatar → **LOGOUT**
3. **TUTUP TAB BROWSER** sepenuhnya
4. **BUKA TAB BARU** → Login lagi
5. Test menu Clinic

## STEP 2: Jika masih belum bisa, cek console browser
1. Tekan F12 (Developer Tools)
2. Tab "Console"
3. Paste dan jalankan code ini:

```javascript
// Check if user has clinic permissions
console.log('User:', window.localStorage.getItem('sb-wivxqbjovdnzpqzatjfu-auth-token'));
```

## STEP 3: Cek Network Request
1. F12 → Tab "Network"
2. Filter: "users"
3. Refresh halaman
4. Klik request terakhir → Tab "Response"
5. Cari field "permissions" → pastikan ada "clinic_dashboard", dll

## STEP 4: Test dengan Console
Paste ini di Console (F12):

```javascript
// Force check permissions
const { canAccessMenu } = window.authContext || {};
if (canAccessMenu) {
  console.log('clinic-dashboard:', canAccessMenu('clinic-dashboard'));
  console.log('clinic-medicines:', canAccessMenu('clinic-medicines'));
} else {
  console.log('authContext not available');
}
```
