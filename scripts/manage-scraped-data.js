#!/usr/bin/env node

/**
 * Scraped Data Management Utility
 * 
 * This script helps manage locally stored LinkedIn scraped data.
 * 
 * Usage:
 *   node scripts/manage-scraped-data.js [command] [options]
 * 
 * Commands:
 *   list [userId]           - List all scraped data files
 *   cleanup [userId] [keep] - Keep only the N most recent files per type
 *   export [userId] [dest]  - Export all data to a zip file
 *   stats                   - Show storage statistics
 */

const fs = require('fs')
const path = require('path')

const SCRAPED_DATA_DIR = path.join(process.cwd(), 'scraped-data')

// Ensure scraped-data directory exists
function ensureDir() {
  if (!fs.existsSync(SCRAPED_DATA_DIR)) {
    fs.mkdirSync(SCRAPED_DATA_DIR, { recursive: true })
    console.log('✅ Created scraped-data directory')
  }
}

// List all files for a user
function listFiles(userId = null) {
  ensureDir()
  
  if (userId) {
    const userDir = path.join(SCRAPED_DATA_DIR, userId)
    if (!fs.existsSync(userDir)) {
      console.log(`❌ No data found for user: ${userId}`)
      return
    }
    
    const files = fs.readdirSync(userDir)
    console.log(`\n📁 Files for user ${userId}:`)
    console.log('─'.repeat(60))
    
    files.forEach(file => {
      const filePath = path.join(userDir, file)
      const stats = fs.statSync(filePath)
      const size = (stats.size / 1024).toFixed(2)
      console.log(`  ${file}`)
      console.log(`    Size: ${size} KB | Modified: ${stats.mtime.toLocaleString()}`)
    })
  } else {
    const users = fs.readdirSync(SCRAPED_DATA_DIR).filter(f => {
      const stat = fs.statSync(path.join(SCRAPED_DATA_DIR, f))
      return stat.isDirectory()
    })
    
    console.log(`\n📁 Total users with scraped data: ${users.length}`)
    console.log('─'.repeat(60))
    
    users.forEach(userId => {
      const userDir = path.join(SCRAPED_DATA_DIR, userId)
      const files = fs.readdirSync(userDir)
      const totalSize = files.reduce((sum, file) => {
        const stats = fs.statSync(path.join(userDir, file))
        return sum + stats.size
      }, 0)
      
      console.log(`  ${userId}`)
      console.log(`    Files: ${files.length} | Total Size: ${(totalSize / 1024).toFixed(2)} KB`)
    })
  }
}

// Cleanup old files, keeping only N most recent per type
function cleanupFiles(userId, keep = 5) {
  ensureDir()
  
  const userDir = path.join(SCRAPED_DATA_DIR, userId)
  if (!fs.existsSync(userDir)) {
    console.log(`❌ No data found for user: ${userId}`)
    return
  }
  
  const files = fs.readdirSync(userDir)
  const fileTypes = ['profile', 'posts', 'voice-analysis']
  let deletedCount = 0
  
  console.log(`\n🧹 Cleaning up files for ${userId} (keeping ${keep} most recent per type)`)
  console.log('─'.repeat(60))
  
  fileTypes.forEach(type => {
    const typeFiles = files
      .filter(f => f.startsWith(type))
      .sort()
      .reverse() // Most recent first
    
    if (typeFiles.length > keep) {
      const toDelete = typeFiles.slice(keep)
      toDelete.forEach(file => {
        const filePath = path.join(userDir, file)
        fs.unlinkSync(filePath)
        console.log(`  ❌ Deleted: ${file}`)
        deletedCount++
      })
    }
  })
  
  if (deletedCount === 0) {
    console.log('  ✅ No files to delete')
  } else {
    console.log(`\n✅ Deleted ${deletedCount} old files`)
  }
}

// Show storage statistics
function showStats() {
  ensureDir()
  
  const users = fs.readdirSync(SCRAPED_DATA_DIR).filter(f => {
    const stat = fs.statSync(path.join(SCRAPED_DATA_DIR, f))
    return stat.isDirectory()
  })
  
  let totalFiles = 0
  let totalSize = 0
  const fileTypeStats = {
    profile: { count: 0, size: 0 },
    posts: { count: 0, size: 0 },
    'voice-analysis': { count: 0, size: 0 }
  }
  
  users.forEach(userId => {
    const userDir = path.join(SCRAPED_DATA_DIR, userId)
    const files = fs.readdirSync(userDir)
    
    files.forEach(file => {
      const filePath = path.join(userDir, file)
      const stats = fs.statSync(filePath)
      totalFiles++
      totalSize += stats.size
      
      // Determine file type
      for (const type in fileTypeStats) {
        if (file.startsWith(type)) {
          fileTypeStats[type].count++
          fileTypeStats[type].size += stats.size
          break
        }
      }
    })
  })
  
  console.log('\n📊 Storage Statistics')
  console.log('═'.repeat(60))
  console.log(`Total Users:        ${users.length}`)
  console.log(`Total Files:        ${totalFiles}`)
  console.log(`Total Size:         ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log('\nBy File Type:')
  console.log('─'.repeat(60))
  
  for (const [type, stats] of Object.entries(fileTypeStats)) {
    console.log(`  ${type.padEnd(20)} ${stats.count} files  (${(stats.size / 1024).toFixed(2)} KB)`)
  }
}

// Main command handler
function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'list':
      listFiles(args[1])
      break
    
    case 'cleanup':
      if (!args[1]) {
        console.log('❌ Usage: node manage-scraped-data.js cleanup <userId> [keep]')
        process.exit(1)
      }
      cleanupFiles(args[1], parseInt(args[2]) || 5)
      break
    
    case 'stats':
      showStats()
      break
    
    default:
      console.log(`
📦 Scraped Data Management Utility

Usage:
  node scripts/manage-scraped-data.js [command] [options]

Commands:
  list [userId]           - List all scraped data files
  cleanup <userId> [keep] - Keep only N most recent files per type (default: 5)
  stats                   - Show storage statistics

Examples:
  node scripts/manage-scraped-data.js list
  node scripts/manage-scraped-data.js list abc-123-def
  node scripts/manage-scraped-data.js cleanup abc-123-def 3
  node scripts/manage-scraped-data.js stats
      `)
  }
}

main()
