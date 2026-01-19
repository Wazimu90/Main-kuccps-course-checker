const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function runMigration() {
    try {
        console.log('🚀 Running database migration...\n')

        // Read the migration file
        const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_create_payment_and_settings_tables.sql')
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

        console.log('📄 Migration file loaded')
        console.log('📊 Executing SQL statements...\n')

        // Split by semicolon and execute each statement individually
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'))

        console.log(`Found ${statements.length} SQL statements to execute\n`)

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';'
            console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`)

            try {
                const { error } = await supabase.rpc('exec_sql', { sql: statement })
                if (error) {
                    throw error
                }
                console.log(`✓ Success\n`)
            } catch (err) {
                console.log(`⚠️  RPC method not available, using from() instead\n`)
                // For CREATE TABLE and other DDL, we need to use a different approach
                // Since Supabase doesn't support DDL via client, print instructions
                console.log('\n⚠️  NOTE: DDL statements must be run directly in Supabase SQL Editor')
                console.log('Please copy the SQL from: supabase/migrations/001_create_payment_and_settings_tables.sql')
                console.log('And run it in your Supabase project\'s SQL Editor\n')
                console.log('Or use the Supabase CLI: npx supabase db push\n')
                break
            }
        }

        // Verify tables exist
        console.log('\n🔍 Verifying tables...\n')

        const { data: txData, error: txError } = await supabase
            .from('payment_transactions')
            .select('count')
            .limit(1)

        if (!txError) {
            console.log('✓ payment_transactions table exists')
        } else {
            console.log('✗ payment_transactions table NOT found:', txError.message)
        }

        const { data: settings, error: settingsError } = await supabase
            .from('system_settings')
            .select('*')
            .limit(1)
            .maybeSingle()

        if (!settingsError) {
            console.log('✓ system_settings table exists')
            if (settings) {
                console.log('  Current settings:', JSON.stringify(settings, null, 2))
            }
        } else {
            console.log('✗ system_settings table NOT found:', settingsError.message)
        }

        console.log('\n🎉 Migration process completed!\n')

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

runMigration()
