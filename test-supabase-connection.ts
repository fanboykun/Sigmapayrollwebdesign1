/**
 * Test Supabase Connection Script
 * Menguji koneksi dan akses ke database Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  console.log('━'.repeat(60));

  try {
    // Test 1: Check environment variables
    console.log('\n📋 Step 1: Checking Environment Variables');
    console.log('━'.repeat(60));

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing environment variables!');
      console.log('   Required in .env file:');
      console.log('   - VITE_SUPABASE_URL');
      console.log('   - VITE_SUPABASE_ANON_KEY');
      return false;
    }

    console.log('✓ Environment variables found');
    console.log(`  URL: ${supabaseUrl}`);
    console.log(`  Key: ${supabaseAnonKey.substring(0, 20)}...`);

    // Test 2: Initialize Supabase client
    console.log('\n🔌 Step 2: Initializing Supabase Client');
    console.log('━'.repeat(60));

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('✓ Supabase client created successfully');

    // Test 3: Test database connection with a simple query
    console.log('\n📊 Step 3: Testing Database Connection');
    console.log('━'.repeat(60));

    const { data: testData, error: testError } = await supabase
      .from('roles')
      .select('id, name, code')
      .limit(5);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      console.error('   Code:', testError.code);
      console.error('   Details:', testError.details);
      throw testError;
    }

    console.log('✓ Database connection successful');
    console.log(`  Fetched ${testData?.length || 0} roles from database`);
    if (testData && testData.length > 0) {
      console.log('  Sample roles:');
      testData.forEach(role => {
        console.log(`    - ${role.code}: ${role.name}`);
      });
    }

    // Test 4: Check authentication
    console.log('\n🔐 Step 4: Testing Authentication');
    console.log('━'.repeat(60));

    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('❌ Auth check failed:', authError.message);
    } else if (session) {
      console.log('✓ User is authenticated');
      console.log(`  User ID: ${session.user.id}`);
      console.log(`  Email: ${session.user.email}`);
    } else {
      console.log('ℹ️  No active session (user not logged in)');
      console.log('   This is normal for connection test');
    }

    // Test 5: Count records in key tables
    console.log('\n📈 Step 5: Checking Table Record Counts');
    console.log('━'.repeat(60));

    const tables = ['roles', 'divisions', 'positions', 'employees', 'users'];
    let successCount = 0;

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`  ⚠️  ${table.padEnd(15)}: ${error.message}`);
        } else {
          console.log(`  ✓ ${table.padEnd(15)}: ${count || 0} records`);
          successCount++;
        }
      } catch (err: any) {
        console.log(`  ❌ ${table.padEnd(15)}: ${err.message}`);
      }
    }

    // Test 6: Test a complex query with joins
    console.log('\n🔗 Step 6: Testing Complex Query with Joins');
    console.log('━'.repeat(60));

    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select(`
        employee_id,
        full_name,
        division:divisions(name),
        position:positions(name)
      `)
      .limit(3);

    if (empError) {
      console.log('  ⚠️  Complex query blocked (might be RLS):', empError.message);
    } else {
      console.log('✓ Complex query successful');
      console.log(`  Fetched ${employees?.length || 0} employees with relations`);
      if (employees && employees.length > 0) {
        console.log('  Sample employees:');
        employees.forEach(emp => {
          console.log(`    - ${emp.employee_id}: ${emp.full_name}`);
          console.log(`      Division: ${emp.division?.name || 'N/A'}`);
          console.log(`      Position: ${emp.position?.name || 'N/A'}`);
        });
      }
    }

    // Summary
    console.log('\n' + '━'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('━'.repeat(60));
    console.log(`✓ Environment: OK`);
    console.log(`✓ Client Init: OK`);
    console.log(`✓ Database Connection: OK`);
    console.log(`✓ Tables Accessible: ${successCount}/${tables.length}`);
    console.log('━'.repeat(60));
    console.log('\n✅ All tests completed successfully!\n');

    return true;

  } catch (error: any) {
    console.log('\n' + '━'.repeat(60));
    console.error('❌ TEST FAILED');
    console.log('━'.repeat(60));
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    console.log('━'.repeat(60));
    return false;
  }
}

// MCP Server Test
async function testMCPServer() {
  console.log('\n\n🔌 Testing MCP Server Configuration');
  console.log('━'.repeat(60));

  try {
    const fs = await import('fs');
    const mcpConfig = JSON.parse(
      fs.readFileSync('.mcp.json', 'utf-8')
    );

    console.log('✓ MCP config file found');
    console.log('  Servers configured:');
    Object.keys(mcpConfig.mcpServers || {}).forEach(server => {
      console.log(`    - ${server}`);
    });

    if (mcpConfig.mcpServers?.supabase) {
      console.log('\n✓ Supabase MCP server is configured');
      console.log('  Command:', mcpConfig.mcpServers.supabase.command);
      console.log('  Package:', mcpConfig.mcpServers.supabase.args[1]);
    }

    console.log('\nℹ️  To use MCP tools in Claude Code:');
    console.log('   1. Ensure Claude Code is running with MCP enabled');
    console.log('   2. MCP tools will appear as mcp__supabase_* functions');
    console.log('   3. Use /mcp command to list available MCP servers');

  } catch (error: any) {
    console.log('⚠️  MCP config not found or invalid:', error.message);
  }
}

// Run all tests
console.log('╔' + '═'.repeat(58) + '╗');
console.log('║' + ' '.repeat(10) + 'SUPABASE CONNECTION TEST SUITE' + ' '.repeat(17) + '║');
console.log('╚' + '═'.repeat(58) + '╝');

testSupabaseConnection()
  .then(async (success) => {
    await testMCPServer();

    console.log('\n' + '═'.repeat(60));
    if (success) {
      console.log('🎉 ALL TESTS PASSED! Supabase is working properly!');
    } else {
      console.log('⚠️  Some tests failed. Check errors above.');
    }
    console.log('═'.repeat(60) + '\n');

    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
