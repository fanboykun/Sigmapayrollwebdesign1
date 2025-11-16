/**
 * Check Employees Table Structure
 * To see what columns actually exist
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

console.log('🔍 Checking Employees Table Structure...\n');

async function checkEmployeesColumns() {
  try {
    // Fetch all columns by selecting *
    console.log('📋 Fetching one row to see all columns...');
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);

    if (empError) {
      console.error('❌ Error fetching employees:', empError.message);
      console.error('   Code:', empError.code);
      console.error('   Details:', empError.details);
      console.error('   Hint:', empError.hint);
      return false;
    }

    if (employees && employees.length > 0) {
      console.log('✅ Employees table found with the following columns:');
      const columns = Object.keys(employees[0]);
      columns.forEach((col, idx) => {
        const value = employees[0][col];
        const type = typeof value;
        console.log(`   ${idx + 1}. ${col} (${type}): ${value}`);
      });

      console.log('\n📊 Column names only:');
      console.log('   ' + columns.join(', '));

    } else {
      console.log('⚠️  Employees table exists but has NO data');
      console.log('   Cannot determine column structure without data');
    }

    // Try to count total rows
    console.log('\n📋 Counting total employees...');
    const { count, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`✅ Total employees in database: ${count || 0}`);
    }

    console.log('\n✅ Check completed!');
    return true;

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

checkEmployeesColumns()
  .then(() => {
    console.log('\n🎉 Column check complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
