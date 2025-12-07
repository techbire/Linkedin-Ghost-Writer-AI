#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script checks and guides the setup of the database with:
 * - Initial schema (profiles, subscriptions, payments, todos)
 * - Subscription plans
 * - Posts table for LinkedIn content generator
 * 
 * Run this after setting up your Supabase project.
 * 
 * Usage: node scripts/init-db.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '')
        if (value) {
          process.env[key.trim()] = value
        }
      }
    })
  }
}

async function initializeDatabase() {
  console.log('🚀 Initializing database...')

  // Load environment variables
  loadEnvFile()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Check database setup
    console.log('📦 Checking database setup...')
    
    console.log('\n📝 SQL Migration Files Available:')
    console.log('')
    console.log('   ⭐ RECOMMENDED (Fastest):')
    console.log('   • scripts/init.sql                    - ALL tables in one file!')
    console.log('   • scripts/002_subscription_plans.sql - Plan data')
    console.log('')
    console.log('   OR Step-by-Step:')
    console.log('   1. scripts/001_initial_schema.sql     - Core tables')
    console.log('   2. scripts/002_subscription_plans.sql - Subscription plans')
    console.log('   3. scripts/003_posts_table.sql        - LinkedIn posts')
    console.log('\n💡 Run in Supabase SQL Editor if tables are missing')

    // Check if subscription_plans table exists and has data
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id, name')
      .limit(1)

    if (plansError) {
      console.log('ℹ️  subscription_plans table not found - please run the SQL scripts first')
    } else if (plans && plans.length > 0) {
      console.log('✅ Subscription plans already exist in database')
      
      // Fetch and display existing plans
      const { data: allPlans } = await supabase
        .from('subscription_plans')
        .select('id, name, price, currency, billing_period')
        .eq('is_active', true)
        .order('price')

      if (allPlans && allPlans.length > 0) {
        console.log('\n📋 Current subscription plans:')
        allPlans.forEach(plan => {
          console.log(`   • ${plan.name}: $${plan.price}/${plan.billing_period}`)
        })
      }
    } else {
      console.log('ℹ️  No subscription plans found - please run scripts/002_subscription_plans.sql')
    }

    // Check if posts table exists
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(1)

    if (postsError) {
      console.log('ℹ️  posts table not found - run init.sql or 003_posts_table.sql')
    } else {
      console.log('✅ Posts table exists - LinkedIn generator ready')
    }

    console.log('\n🎉 Database initialization check complete!')
    console.log('\n📚 Next steps:')
    console.log('   1. If tables missing, run SQL scripts in Supabase SQL Editor')
    console.log('   2. Add GEMINI_API_KEY to .env.local for AI post generation')
    console.log('   3. Set up payment provider credentials (Stripe/Razorpay)')
    console.log('   4. Test the application: npm run dev')

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  initializeDatabase()
}

module.exports = { initializeDatabase }