/**
 * Query Employee Count from Database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function getEmployeeCount() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('📊 Querying employee count from database...\n');

  // Total employees
  const { count: totalCount, error: totalError } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('❌ Error:', totalError.message);
    process.exit(1);
  }

  console.log('═'.repeat(60));
  console.log('👥 JUMLAH KARYAWAN DI DATABASE');
  console.log('═'.repeat(60));
  console.log(`\n   Total Karyawan: ${totalCount} orang\n`);
  console.log('═'.repeat(60));

  // Breakdown by status
  console.log('\n📋 Breakdown by Status:\n');

  const statuses = ['active', 'inactive', 'resigned'];
  for (const status of statuses) {
    const { count, error } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    if (!error) {
      console.log(`   ${status.padEnd(10)}: ${count || 0} orang`);
    }
  }

  // Breakdown by division
  console.log('\n📍 Breakdown by Division:\n');

  const { data: divisions, error: divError } = await supabase
    .from('employees')
    .select('division_id, divisions(name)')
    .not('division_id', 'is', null);

  if (!divError && divisions) {
    const divisionCounts = divisions.reduce((acc: any, emp: any) => {
      const divName = emp.divisions?.name || 'Unknown';
      acc[divName] = (acc[divName] || 0) + 1;
      return acc;
    }, {});

    Object.entries(divisionCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .forEach(([name, count]) => {
        console.log(`   ${String(name).padEnd(25)}: ${count} orang`);
      });
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

getEmployeeCount();
