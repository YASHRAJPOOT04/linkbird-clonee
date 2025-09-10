const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(process.cwd(), 'dev.db');
const db = new Database(dbPath);

console.log('Setting up database...');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    email_verified INTEGER DEFAULT 0,
    image TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`;

const createAccountsTable = `
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    expires_at INTEGER,
    password TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

const createSessionsTable = `
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

const createVerificationsTable = `
  CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`;

const createCampaignsTable = `
  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Draft' NOT NULL,
    created_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

const createLeadsTable = `
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    status TEXT DEFAULT 'Pending' NOT NULL,
    last_contact_date INTEGER,
    created_at INTEGER NOT NULL,
    campaign_id TEXT NOT NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
  )
`;

try {
  db.exec(createUsersTable);
  db.exec(createAccountsTable);
  db.exec(createSessionsTable);
  db.exec(createVerificationsTable);
  db.exec(createCampaignsTable);
  db.exec(createLeadsTable);
  
  console.log('✅ Database tables created successfully!');
  
  // Check if we have any users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`📊 Current users in database: ${userCount.count}`);
  
  if (userCount.count === 0) {
    console.log('🔧 Creating test user...');
    
    // Create test user
    const userId = 'test-user-' + Date.now();
    const now = Date.now();
    
    // Insert user
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, name, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertUser.run(userId, 'test@example.com', 'Test User', 1, now, now);
    
    // Insert account for email/password auth
    const insertAccount = db.prepare(`
      INSERT INTO accounts (id, user_id, account_id, provider_id, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Simple password hash for testing (in production, use proper hashing)
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('password123', 10);
    
    insertAccount.run(
      'account-' + Date.now(),
      userId,
      'test@example.com',
      'credential',
      hashedPassword,
      now,
      now
    );
    
    console.log('✅ Test user created!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
  }
  
} catch (error) {
  console.error('❌ Error setting up database:', error);
} finally {
  db.close();
}