// Test script to verify the authentication fix
// This script tests the registration and immediate login flow

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testAuthFix() {
  console.log('Testing authentication fix...');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testName = 'Test User';
  
  try {
    // Test 1: Register a new user
    console.log('\n1. Testing user registration...');
    const registerResponse = await fetch(`${baseUrl}/api/auth/betterauth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
      }),
    });
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful');
      const registerData = await registerResponse.json();
      console.log('Registration response:', registerData);
      
      // Wait a moment for database transaction to complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Test 2: Immediately try to login
      console.log('\n2. Testing immediate login...');
      const loginResponse = await fetch(`${baseUrl}/api/auth/betterauth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });
      
      if (loginResponse.ok) {
        console.log('✅ Login successful - Fix is working!');
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
      } else {
        console.log('❌ Login failed - Issue still exists');
        const errorData = await loginResponse.text();
        console.log('Login error:', errorData);
      }
    } else {
      console.log('❌ Registration failed');
      const errorData = await registerResponse.text();
      console.log('Registration error:', errorData);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuthFix();