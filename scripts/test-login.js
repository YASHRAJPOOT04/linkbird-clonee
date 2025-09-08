// Test script for login functionality
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAuth() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing authentication system...\n');
  
  try {
    // Test 1: Check if auth endpoints are accessible
    console.log('Test 1: Checking auth endpoints...');
    
    const sessionResponse = await fetch(`${baseUrl}/api/auth/betterauth/session`);
    if (sessionResponse.ok) {
      console.log('✅ Session endpoint is accessible');
    } else {
      console.log('❌ Session endpoint failed:', sessionResponse.status);
      return;
    }
    
    // Test 2: Test sign up
    console.log('\nTest 2: Testing user registration...');
    
    const testUser = {
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User'
    };
    
    const signUpResponse = await fetch(`${baseUrl}/api/auth/betterauth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    if (signUpResponse.ok) {
      const signUpData = await signUpResponse.json();
      console.log('✅ User registration successful');
      console.log('📧 User email:', signUpData.user?.email);
    } else {
      const errorData = await signUpResponse.text();
      console.log('⚠️ Registration response:', signUpResponse.status, errorData);
    }
    
    // Test 3: Test sign in
    console.log('\nTest 3: Testing user login...');
    
    const signInResponse = await fetch(`${baseUrl}/api/auth/betterauth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    
    if (signInResponse.ok) {
      const signInData = await signInResponse.json();
      console.log('✅ User login successful!');
      console.log('👤 Logged in user:', signInData.user?.email);
      console.log('🎯 Login issue has been FIXED!');
    } else {
      const errorData = await signInResponse.text();
      console.log('❌ Login failed:', signInResponse.status, errorData);
    }
    
  } catch (error) {
    console.error('❌ Error during authentication tests:', error.message);
  }
}

// Check if server is running first
fetch('http://localhost:3000/login')
  .then(() => {
    console.log('🚀 Server is running, starting tests...\n');
    testAuth();
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start with: npm run dev');
  });