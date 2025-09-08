// Check SQLite database structure
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

console.log('📊 Checking database structure...\n');

try {
  // Check tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables found:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  
  // Check users table structure
  if (tables.find(t => t.name === 'users')) {
    console.log('\n📋 Users table structure:');
    const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
    userTableInfo.forEach(col => {
      console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Check if there are any users
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    console.log(`\n👥 Users in database: ${userCount.count}`);
    
    if (userCount.count > 0) {
      const users = db.prepare("SELECT id, email, name, email_verified FROM users").all();
      console.log('\nExisting users:');
      users.forEach(user => {
        console.log(`  - ${user.email} (verified: ${user.email_verified ? 'Yes' : 'No'})`);
      });
    }
  } else {
    console.log('❌ Users table not found!');
  }
  
} catch (error) {
  console.error('❌ Database error:', error.message);
} finally {
  db.close();
}