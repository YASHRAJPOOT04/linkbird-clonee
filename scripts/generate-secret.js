#!/usr/bin/env node

// Generate a secure random secret for BETTER_AUTH_SECRET
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');

console.log('🔐 Generated BETTER_AUTH_SECRET:');
console.log(secret);
console.log('');
console.log('Copy this value and use it as your BETTER_AUTH_SECRET environment variable in Vercel.');
console.log('');
console.log('⚠️  Keep this secret secure and never commit it to version control!');