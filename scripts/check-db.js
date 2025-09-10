// Script to check database connection and setup
const { Pool } = require('@neondatabase/serverless');

async function checkDatabase() {
  const connectionString = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/db";
  
  console.log('Checking database connection...');
  console.log('Connection string:', connectionString.replace(/\/\/.*@/, "//***:***@"));
  
  const pool = new Pool({ connectionString });
  
  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions', 'accounts', 'verifications')
      ORDER BY table_name;
    `);
    
    console.log('Available tables:', result.rows.map(row => row.table_name));
    
    // Check if users table has any data
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    console.log('Total users in database:', userCount.rows[0].count);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

checkDatabase();