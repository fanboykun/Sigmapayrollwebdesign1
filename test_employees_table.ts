/**
 * Test Script for Employees Table
 * To check if employees data exists
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

console.log('🔍 Testing Employees Table...\n');

async function testEmployeesTable() {
  try {
    // Test 1: Check if employees table exists and has data
    console.log('📋 Test 1: Checking employees table...');
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, nik, full_name, position')
      .limit(10);

    if (empError) {
      console.error('❌ Error fetching employees:', empError.message);
      console.error('   Code:', empError.code);
      console.error('   Details:', empError.details);
      console.error('   Hint:', empError.hint);
      return false;
    }

    if (employees && employees.length > 0) {
      console.log(`✅ Employees table exists with ${employees.length} records (showing first 10):`);
      employees.forEach((emp, idx) => {
        console.log(`   ${idx + 1}. NIK: ${emp.nik} | Name: ${emp.full_name} | Position: ${emp.position || 'N/A'}`);
      });
    } else {
      console.log('⚠️  Employees table exists but has NO data');
      console.log('   Please insert employee data first!');
    }

    // Test 2: Check table structure
    console.log('\n📋 Test 2: Checking employees table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);

    if (!tableError && tableInfo && tableInfo.length > 0) {
      console.log('✅ Table columns found:');
      Object.keys(tableInfo[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
    }

    // Test 3: Check if we can query with specific columns
    console.log('\n📋 Test 3: Testing query with specific columns...');
    const { data: testQuery, error: queryError } = await supabase
      .from('employees')
      .select('id, nik, full_name, position')
      .limit(5);

    if (queryError) {
      console.error('❌ Error with query:', queryError.message);
    } else {
      console.log(`✅ Query successful, returned ${testQuery?.length || 0} records`);
    }

    // Test 4: Count total employees
    console.log('\n📋 Test 4: Counting total employees...');
    const { count, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`✅ Total employees in database: ${count || 0}`);
    }

    console.log('\n✅ All tests completed!');
    return true;

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

testEmployeesTable()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Employee table test complete.');
      process.exit(0);
    } else {
      console.log('\n❌ Employee table test failed.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
