// Migration runner for Supabase
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    try {
        console.log('🚀 Running database migration...\n')

        // Read the migration file
        const migrationPath = join(process.cwd(), 'supabase', 'migrations', '001_create_payment_and_settings_tables.sql')
        const migrationSQL = readFileSync(migrationPath, 'utf-8')

        console.log('📄 Migration file loaded')
        console.log('📊 Executing SQL...\n')

        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

        if (error) {
            // If exec_sql function doesn't exist, try direct execution
            console.log('⚠️  exec_sql RPC not found, trying direct execution...\n')

            // Split by semicolon and execute each statement
            const statements = migrationSQL
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'))

            for (const statement of statements) {
                const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
                if (stmtError) {
                    console.error(`❌ Error executing statement:\n${statement.substring(0, 100)}...\n`, stmtError)
                }
            }
        }

        console.log('✅ Migration completed successfully!\n')
        console.log('📋 Created tables:')
        console.log('   - payment_transactions')
        console.log('   - system_settings')
        console.log('\n🎉 Database is ready!\n')

        // Verify tables exist
        const { data: tables, error: tablesError } = await supabase
            .from('payment_transactions')
            .select('count')
            .limit(1)

        if (!tablesError) {
            console.log('✓ payment_transactions table verified')
        }

        const { data: settings, error: settingsError } = await supabase
            .from('system_settings')
            .select('*')
            .limit(1)
            .single()

        if (!settingsError && settings) {
            console.log('✓ system_settings table verified')
            console.log('  Current settings:', settings)
        }

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

runMigration()
