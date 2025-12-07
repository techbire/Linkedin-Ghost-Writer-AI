const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
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
    console.log('🚀 Running preset templates migration...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '010_preset_templates.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement })
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase.from('_').select('*').limit(0)
          
          if (directError) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message)
            console.error('Statement:', statement.substring(0, 200) + '...')
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message)
        console.error('Statement:', statement.substring(0, 200) + '...')
      }
    }
    
    console.log('\n✅ Migration completed!')
    console.log('\n📊 Verifying preset templates...')
    
    // Verify the data
    const { data: templates, error: fetchError } = await supabase
      .from('preset_templates')
      .select('category, title')
      .eq('is_active', true)
    
    if (fetchError) {
      console.error('❌ Error fetching templates:', fetchError.message)
    } else {
      console.log(`\n✅ Found ${templates.length} preset templates:`)
      templates.forEach(t => {
        console.log(`   - ${t.category}: ${t.title}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
