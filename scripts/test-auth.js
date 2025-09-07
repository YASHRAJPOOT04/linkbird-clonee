// Test script for authentication flow
const fetch = require('node-fetch');

async function testAuth() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://linkbird-clone-kmqf.vercel.app';
  
  console.log('Testing authentication endpoints...');
  
  try {
    // Test 1: Check if auth API is accessible
    console.log('\nTest 1: Checking auth API accessibility...');
    const authResponse = await fetch(`${baseUrl}/api/auth/betterauth/providers`);
    
    if (authResponse.ok) {
      console.log('✅ Auth API is accessible');
      const providers = await authResponse.json();
      console.log('Available providers:', providers);
    } else {
      console.log('❌ Auth API is not accessible:', authResponse.status, authResponse.statusText);
    }
    
    // Test 2: Check session endpoint
    console.log('\nTest 2: Checking session endpoint...');
    const sessionResponse = await fetch(`${baseUrl}/api/auth/betterauth/session`);
    
    if (sessionResponse.ok) {
      console.log('✅ Session endpoint is accessible');
      const session = await sessionResponse.json();
      console.log('Session data:', session);
    } else {
      console.log('❌ Session endpoint is not accessible:', sessionResponse.status, sessionResponse.statusText);
    }
    
    console.log('\nAuthentication endpoint tests completed');
  } catch (error) {
    console.error('Error during authentication tests:', error);
  }
}

testAuth();