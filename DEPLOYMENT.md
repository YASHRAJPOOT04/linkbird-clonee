# LinkBird Deployment Guide

## Vercel Deployment Configuration

To ensure proper authentication functionality in the deployed application, follow these steps:

### 1. Environment Variables

Set the following environment variables in your Vercel project settings:

```
# Database
DATABASE_URL=your_postgresql_connection_string_here

# Better Auth
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=https://linkbird-clone-kmqf.vercel.app
NEXT_PUBLIC_APP_URL=https://linkbird-clone-kmqf.vercel.app

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. Deployment Settings

1. **Build Command**: `npm run build`
2. **Output Directory**: `.next`
3. **Install Command**: `npm install`

### 3. Database Setup

Ensure your PostgreSQL database is properly set up and accessible from Vercel:

1. Use a cloud PostgreSQL provider (like Neon, Supabase, or Railway)
2. Make sure the database connection string is correctly set in the `DATABASE_URL` environment variable
3. Run database migrations using Drizzle:
   ```bash
   npm run db:push
   ```

### 4. Authentication Configuration

The authentication system is configured to work with the Vercel deployment. Make sure:

1. The `BETTER_AUTH_SECRET` is a strong, random string
2. The `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` match your Vercel deployment URL
3. If using Google OAuth, ensure the redirect URIs in your Google Cloud Console project include your Vercel deployment URL

### 5. Troubleshooting

If you encounter authentication issues in your deployed application:

1. **Cookie Domain Issues**:
   - Ensure the cookie domain is not set to a specific value in `auth.ts`
   - The application has been updated to use `domain: undefined` to work with any subdomain

2. **Callback URL Problems**:
   - Verify that Google OAuth callback URLs include your exact Vercel deployment URL
   - For Google sign-in, ensure the callback URL is correctly set in the Google Cloud Console

3. **Environment Variables**:
   - Double-check that all environment variables are correctly set in Vercel
   - Ensure there are no typos or trailing spaces in the values
   - After changing environment variables, redeploy the application

4. **CORS Issues**:
   - Verify that your Vercel deployment URL is included in the `trustedOrigins` array in `auth.ts`
   - Check browser console for CORS-related errors

5. **Session Not Persisting**:
   - Ensure cookies are being set correctly (check Application tab in browser DevTools)
   - Verify that the `secure` flag is set to `true` for production
   - Check that `sameSite` is set to `lax` to allow redirects

6. **Redirect Issues**:
   - Verify that the middleware.ts file is correctly handling redirects
   - Check that the cookie name being checked matches what's being set by the auth system

### 6. Required Fixes for Authentication

The following changes have been made to fix authentication issues:

1. **Cookie Domain Configuration**:
   - Updated `auth.ts` to use `domain: undefined` instead of `.vercel.app`
   - This allows cookies to work correctly with your specific Vercel subdomain

2. **Auth Client URL Handling**:
   - Modified `auth-client.ts` to use `window.location.origin` on the client side
   - Added proper handling of Vercel URL environment variables

3. **Google Sign-In Callback URL**:
   - Updated the Google sign-in callback URL in `AuthProvider.tsx` to use the full origin
   - This ensures the callback works correctly in the deployed environment

After deploying these changes, your authentication system should work correctly. If you still encounter issues, please check the troubleshooting steps above.

### 7. Testing Authentication

To verify that authentication is working correctly:

1. **Run the Auth Test Script**:
   ```bash
   npm run test:auth
   ```
   This will check if the authentication endpoints are accessible and responding correctly.

2. **Manual Testing**:
   - Try logging in with email/password
   - Try signing up with a new account
   - Try signing in with Google
   - Verify that you are redirected to the dashboard after successful authentication
   - Check that protected routes require authentication
   - Verify the database connection is working
   - Clear browser cookies and try again if needed
   - Check Vercel logs for any errors