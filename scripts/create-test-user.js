const { db } = require('../src/db/index.ts');
const { users, accounts } = require('../src/db/schema.ts');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create user ID
    const userId = uuidv4();
    
    // Insert user
    await db.insert(users).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Create account entry for email/password authentication
    await db.insert(accounts).values({
      id: uuidv4(),
      userId: userId,
      accountId: 'test@example.com',
      providerId: 'credential',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();