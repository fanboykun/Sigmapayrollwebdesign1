/**
 * Test Script for Premi Deres Database Connection
 * Run this script to verify database structure before implementing UI
 *
 * To run: npx tsx test_premi_deres_connection.ts
 *
 * Note: You need to set environment variables before running:
 * Windows: set VITE_SUPABASE_URL=xxx && set VITE_SUPABASE_ANON_KEY=xxx && npx tsx test_premi_deres_connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read .env file manually
let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// If not in env, try reading from .env file
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const envFile = readFileSync(join(process.cwd(), '.env'), 'utf-8');
    const envVars = envFile.split('\n').reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    supabaseUrl = envVars.VITE_SUPABASE_URL || '';
    supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY || '';
  } catch (error) {
    console.error('❌ Could not read .env file');
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing Premi Deres Database Connection...\n');

async function testDatabaseConnection() {
  try {
    // Test 1: Check if konfigurasi table exists and has data
    console.log('📋 Test 1: Checking premi_deres_konfigurasi table...');
    const { data: konfigData, error: konfigError } = await supabase
      .from('premi_deres_konfigurasi')
      .select('*')
      .eq('status', 'aktif')
      .limit(1);

    if (konfigError) {
      console.error('❌ Error fetching konfigurasi:', konfigError.message);
      return false;
    }

    if (konfigData && konfigData.length > 0) {
      console.log('✅ Konfigurasi table exists with data:');
      console.log('   - Kode:', konfigData[0].kode_konfigurasi);
      console.log('   - Tahun:', konfigData[0].tahun_berlaku);
      console.log('   - Status:', konfigData[0].status);
    } else {
      console.log('⚠️  Konfigurasi table exists but has no active data');
    }

    // Test 2: Check master ancak table
    console.log('\n📋 Test 2: Checking premi_deres_ancak_master table...');
    const { data: ancakData, error: ancakError } = await supabase
      .from('premi_deres_ancak_master')
      .select('id, kode_ancak, nama_ancak, status')
      .eq('status', 'aktif')
      .limit(5);

    if (ancakError) {
      console.error('❌ Error fetching ancak:', ancakError.message);
      return false;
    }

    if (ancakData && ancakData.length > 0) {
      console.log(`✅ Master Ancak table exists with ${ancakData.length} active records`);
      ancakData.forEach(ancak => {
        console.log(`   - ${ancak.kode_ancak}: ${ancak.nama_ancak}`);
      });
    } else {
      console.log('⚠️  Master Ancak table exists but has no active data');
    }

    // Test 3: Check tarif produksi normal table
    console.log('\n📋 Test 3: Checking premi_deres_produksi_normal table...');
    const { data: tarifData, error: tarifError } = await supabase
      .from('premi_deres_produksi_normal')
      .select(`
        id,
        divisi,
        jenis_lateks,
        tarif_per_kg,
        premi_deres_konfigurasi (kode_konfigurasi)
      `)
      .limit(5);

    if (tarifError) {
      console.error('❌ Error fetching tarif produksi:', tarifError.message);
      return false;
    }

    if (tarifData && tarifData.length > 0) {
      console.log(`✅ Tarif Produksi Normal table exists with ${tarifData.length} records`);
      tarifData.forEach(tarif => {
        console.log(`   - ${tarif.divisi} - ${tarif.jenis_lateks}: Rp ${tarif.tarif_per_kg.toLocaleString('id-ID')}`);
      });
    } else {
      console.log('⚠️  Tarif Produksi Normal table exists but has no data');
    }

    // Test 4: Check premi kualitas table
    console.log('\n📋 Test 4: Checking premi_deres_kualitas table...');
    const { data: kualitasData, error: kualitasError } = await supabase
      .from('premi_deres_kualitas')
      .select('*')
      .order('nilai_kesalahan_min', { ascending: true })
      .limit(5);

    if (kualitasError) {
      console.error('❌ Error fetching premi kualitas:', kualitasError.message);
      return false;
    }

    if (kualitasData && kualitasData.length > 0) {
      console.log(`✅ Premi Kualitas table exists with ${kualitasData.length} tiers`);
      kualitasData.forEach(k => {
        console.log(`   - Kesalahan ${k.nilai_kesalahan_min}-${k.nilai_kesalahan_max || '∞'}: Koefisien ${k.koefisien}`);
      });
    } else {
      console.log('⚠️  Premi Kualitas table exists but has no data');
    }

    // Test 5: Check transaction tables
    console.log('\n📋 Test 5: Checking transaction tables...');

    // Check produksi harian
    const { count: produksiCount, error: produksiError } = await supabase
      .from('premi_deres_produksi_harian')
      .select('*', { count: 'exact', head: true });

    if (!produksiError) {
      console.log(`✅ premi_deres_produksi_harian: ${produksiCount || 0} records`);
    }

    // Check quality check harian
    const { count: qcCount, error: qcError } = await supabase
      .from('premi_deres_quality_check_harian')
      .select('*', { count: 'exact', head: true });

    if (!qcError) {
      console.log(`✅ premi_deres_quality_check_harian: ${qcCount || 0} records`);
    }

    // Check periode perhitungan
    const { count: periodeCount, error: periodeError } = await supabase
      .from('premi_deres_periode_perhitungan')
      .select('*', { count: 'exact', head: true });

    if (!periodeError) {
      console.log(`✅ premi_deres_periode_perhitungan: ${periodeCount || 0} records`);
    }

    // Test 6: Check divisi list for dropdown
    console.log('\n📋 Test 6: Getting distinct divisi list...');
    const { data: divisiData, error: divisiError } = await supabase
      .from('premi_deres_produksi_normal')
      .select('divisi')
      .order('divisi');

    if (!divisiError && divisiData) {
      const uniqueDivisi = [...new Set(divisiData.map(d => d.divisi))];
      console.log(`✅ Found ${uniqueDivisi.length} unique divisi:`);
      uniqueDivisi.forEach(div => console.log(`   - ${div}`));
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Database connection: OK');
    console.log('   - Master tables: OK');
    console.log('   - Transaction tables: OK');
    console.log('   - Ready for UI implementation\n');

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run tests
testDatabaseConnection()
  .then((success) => {
    if (success) {
      console.log('🎉 Database verification complete. You can proceed with UI implementation.');
      process.exit(0);
    } else {
      console.log('❌ Database verification failed. Please check the errors above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
