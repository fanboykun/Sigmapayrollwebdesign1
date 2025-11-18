/**
 * Auth Cleanup Utilities
 *
 * Utility functions untuk membersihkan session data yang corrupt
 * atau bermasalah, terutama untuk mengatasi issue di Chrome.
 */

/**
 * Membersihkan semua auth-related data dari localStorage dan sessionStorage
 * Enhanced untuk mengatasi stuck session di Chrome dan browser lainnya
 *
 * IMPORTANT: Fungsi ini menghapus semua data terkait autentikasi untuk
 * memastikan tidak ada session buntu yang tersisa di browser
 */
export function clearAuthStorage(): void {
  try {
    console.log('🧹 Starting comprehensive auth storage cleanup...');

    // Clear all supabase auth keys from localStorage
    const localStorageKeysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('supabase.auth') ||
        key.startsWith('sb-') ||
        key === 'user' ||
        key === 'activeView'
      )) {
        localStorageKeysToRemove.push(key);
      }
    }

    localStorageKeysToRemove.forEach(key => {
      console.log('🗑️ Removing localStorage key:', key);
      localStorage.removeItem(key);
    });

    // Clear all supabase auth keys from sessionStorage
    const sessionStorageKeysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.startsWith('supabase.auth') ||
        key.startsWith('sb-')
      )) {
        sessionStorageKeysToRemove.push(key);
      }
    }

    sessionStorageKeysToRemove.forEach(key => {
      console.log('🗑️ Removing sessionStorage key:', key);
      sessionStorage.removeItem(key);
    });

    // Also explicitly clear any known legacy keys
    const legacyKeys = [
      'sb-access-token',
      'sb-refresh-token',
      'user',
      'activeView'
    ];

    legacyKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log(`✅ Auth storage cleared successfully`);
    console.log(`   - Removed ${localStorageKeysToRemove.length} localStorage keys`);
    console.log(`   - Removed ${sessionStorageKeysToRemove.length} sessionStorage keys`);
  } catch (error) {
    console.error('❌ Error clearing auth storage:', error);
  }
}

/**
 * Validate localStorage availability
 * Chrome sometimes blocks localStorage in certain scenarios
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error('❌ localStorage not available:', error);
    return false;
  }
}

/**
 * Get debug info about current auth state in storage
 */
export function getAuthStorageDebugInfo(): Record<string, any> {
  const debugInfo: Record<string, any> = {
    localStorageAvailable: isLocalStorageAvailable(),
    authKeys: [],
    timestamp: new Date().toISOString(),
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('supabase.auth')) {
        debugInfo.authKeys.push({
          key,
          hasValue: !!localStorage.getItem(key),
        });
      }
    }
  } catch (error) {
    debugInfo.error = String(error);
  }

  return debugInfo;
}
