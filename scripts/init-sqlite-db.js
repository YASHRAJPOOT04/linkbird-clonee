// Initialize SQLite database for local development
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    email_verified INTEGER DEFAULT 0,
    image TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Draft' NOT NULL,
    created_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    status TEXT DEFAULT 'Pending' NOT NULL,
    last_contact_date INTEGER,
    created_at INTEGER NOT NULL,
    campaign_id TEXT NOT NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
  );
`);

console.log('✅ SQLite database initialized successfully!');
console.log('📁 Database file: dev.db');
db.close();