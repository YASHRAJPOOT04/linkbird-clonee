// Test script to verify authentication flow
const baseUrl = 'http://localhost:3000';

async function testAuthFlow() {
  console.log('Testing authentication flow...\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testName = 'Test User';
  
  try {
    // Test 1: Sign up
    console.log('1. Testing user registration...');
    const signUpResponse = await fetch(`${baseUrl}/api/auth/betterauth/sign-up/email`, {
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
    
    console.log('Sign up response status:', signUpResponse.status);
    const signUpData = await signUpResponse.text();
    console.log('Sign up response:', signUpData);
    
    if (signUpResponse.ok) {
      console.log('✅ Registration successful');
      
      // Wait a moment for the user to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 2: Sign in immediately after registration
      console.log('\n2. Testing immediate login after registration...');
      const signInResponse = await fetch(`${baseUrl}/api/auth/betterauth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });
      
      console.log('Sign in response status:', signInResponse.status);
      const signInData = await signInResponse.text();
      console.log('Sign in response:', signInData);
      
      if (signInResponse.ok) {
        console.log('✅ Login successful immediately after registration');
      } else {
        console.log('❌ Login failed after successful registration');
        console.log('This indicates the authentication issue you described');
      }
    } else {
      console.log('❌ Registration failed');
    }
    
  } catch (error) {
    console.error('Error during authentication test:', error);
  }
}

// Run the test
testAuthFlow();