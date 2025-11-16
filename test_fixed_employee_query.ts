/**
 * Test Fixed Employee Query
 * Verify that the corrected query returns employee data for dropdown
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read .env file manually
let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

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

console.log('🔍 Testing FIXED Employee Query for Dropdown...\n');

async function testFixedEmployeeQuery() {
  try {
    // Test the FIXED query (using employee_id instead of nik)
    console.log('📋 Test: Fetching employees with CORRECT columns (id, employee_id, full_name)...');
    const { data, error } = await supabase
      .from('employees')
      .select('id, employee_id, full_name')
      .order('full_name')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching employees:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`✅ SUCCESS! Query returned ${data.length} employees (showing first 10):\n`);
      data.forEach((emp, idx) => {
        console.log(`   ${idx + 1}. ${emp.employee_id} - ${emp.full_name}`);
      });

      console.log('\n✅ Dropdown will display employees like: "EMP-AL-0004 - Irfan Kusuma"');
      console.log('✅ This matches the format: {emp.employee_id} - {emp.full_name}');

      return true;
    } else {
      console.log('⚠️  Query succeeded but returned no data');
      return false;
    }

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

testFixedEmployeeQuery()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Employee dropdown query test PASSED!');
      console.log('✅ The dropdown should now display employees correctly in the UI.');
      process.exit(0);
    } else {
      console.log('\n❌ Employee dropdown query test FAILED.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
