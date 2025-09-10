# LinkBird Deployment Guide

## Vercel Deployment Configuration

To ensure proper authentication functionality in the deployed application, follow these steps:

### 1. Environment Variables

Set the following environment variables in your Vercel project settings:

```
# Database (Required)
DATABASE_URL=your_neon_postgresql_connection_string_here

# Better Auth (Required)
BETTER_AUTH_SECRET=your_strong_random_secret_key_here
BETTER_AUTH_URL=https://your-vercel-deployment-url.vercel.app
NEXT_PUBLIC_APP_URL=https://your-vercel-deployment-url.vercel.app

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

**Important Notes:**
- Replace `your-vercel-deployment-url.vercel.app` with your actual Vercel deployment URL
- The `BETTER_AUTH_SECRET` should be a strong, random string (at least 32 characters)
- The `DATABASE_URL` must be a PostgreSQL connection string (Neon, Supabase, etc.)

### 2. Step-by-Step Vercel Deployment

1. **Push your code to GitHub** (if not already done)

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Node.js Version**: 18.x or higher

4. **Set Environment Variables** (in Vercel dashboard):
   - Go to Project Settings → Environment Variables
   - Add all the environment variables listed in section 1 above

5. **Deploy**: Click "Deploy" and wait for the build to complete

### 3. Database Setup (Neon - Recommended)

**Step-by-step Neon Database Setup:**

1. **Create a free Neon account**: Go to [neon.tech](https://neon.tech) and sign up
2. **Create a new project**: Click "Create Project" and choose a name like "linkbird"
3. **Get your connection string**: 
   - Go to your project dashboard
   - Click "Connection Details"
   - Copy the connection string (it looks like: `postgresql://username:password@host/database?sslmode=require`)
4. **Set the DATABASE_URL**: Use this connection string as your `DATABASE_URL` environment variable in Vercel
5. **Push the database schema**: After deployment, run:
   ```bash
   npm run db:push
   ```

**Alternative Database Providers:**
- **Supabase**: Similar setup, get PostgreSQL connection string from project settings
- **Railway**: Create PostgreSQL service and get connection string
- **Planetscale**: MySQL alternative (requires schema changes)

### 4. Authentication Configuration

The authentication system is configured to work with the Vercel deployment. Make sure:

1. The `BETTER_AUTH_SECRET` is a strong, random string
2. The `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` match your Vercel deployment URL
3. If using Google OAuth, ensure the redirect URIs in your Google Cloud Console project include your Vercel deployment URL

### 5. Post-Deployment Setup

After successful deployment:

1. **Initialize Database Schema**:
   ```bash
   # Install dependencies locally if not done
   npm install
   
   # Set your production DATABASE_URL temporarily in .env.local
   DATABASE_URL=your_neon_connection_string_here
   
   # Push schema to production database
   npm run db:push
   ```

2. **Test the deployment**:
   - Visit your Vercel URL
   - Try to sign up with a new account
   - Test login functionality
   - Check that you can access the dashboard

### 6. Common Deployment Issues & Solutions

**Build Errors:**
- ❌ `DATABASE_URL is not defined` → Add DATABASE_URL to Vercel environment variables
- ❌ `Module not found: better-sqlite3` → This is expected, the app now uses PostgreSQL
- ❌ `Auth configuration error` → Check BETTER_AUTH_SECRET and BETTER_AUTH_URL are set

**Runtime Errors:**
- ❌ `Database connection failed` → Verify your DATABASE_URL is correct and database is accessible
- ❌ `Auth endpoints returning 500` → Check all auth environment variables are set correctly
- ❌ `CORS errors` → Ensure BETTER_AUTH_URL matches your exact Vercel URL

**Authentication Issues:**
- ❌ `Login not working` → Check database schema is pushed with `npm run db:push`
- ❌ `Sessions not persisting` → Verify cookie settings in auth configuration
- ❌ `Redirects not working` → Check middleware configuration

### 7. Legacy Troubleshooting

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