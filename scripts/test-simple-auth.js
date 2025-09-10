// Simple test to check if our authentication system works
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

async function testAuth() {
  console.log('🔍 Testing authentication system...\n');
  
  try {
    // Connect to database
    const dbPath = path.join(process.cwd(), 'dev.db');
    const db = new Database(dbPath);
    
    // Check users table
    console.log('📋 Checking users table...');
    const users = db.prepare('SELECT * FROM users').all();
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name})`);
    });
    
    // Check accounts table
    console.log('\n📋 Checking accounts table...');
    const accounts = db.prepare('SELECT * FROM accounts').all();
    console.log(`Found ${accounts.length} accounts:`);
    accounts.forEach(account => {
      console.log(`  - ${account.account_id} (provider: ${account.provider_id})`);
    });
    
    // Test password verification
    if (accounts.length > 0) {
      const testAccount = accounts[0];
      console.log('\n🔐 Testing password verification...');
      const isValid = bcrypt.compareSync('password123', testAccount.password);
      console.log(`Password check for 'password123': ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    db.close();
    console.log('\n✅ Database test completed!');
    
  } catch (error) {
    console.error('❌ Error testing auth:', error);
  }
}

testAuth();