# 🔧 Fix "Invalid Origin" Error - Deployment Guide

## ❌ Problem
Getting "invalid origin" error when trying to login or signup, preventing access to the dashboard.

## ✅ Solution

### 1. **Set Environment Variables in Vercel**

Go to your Vercel project settings → Environment Variables and add:

```bash
# Required - Your database connection string
DATABASE_URL=postgresql://your-db-connection-string

# CRITICAL - Must match your deployment URL exactly
BETTER_AUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Required - Use a secure random string
BETTER_AUTH_SECRET=your-secure-secret-key-here

# Optional - If using Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=false
```

### 2. **Get Your Exact Vercel URL**

Your BETTER_AUTH_URL must be **exactly** the same as your deployment URL:

- **Production**: `https://your-app-name.vercel.app`
- **Custom Domain**: `https://your-custom-domain.com`
- **Preview Deployments**: Use the specific preview URL

### 3. **Database Setup**

Choose one of these PostgreSQL providers:

#### Option A: Neon (Recommended - Free)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account and database
3. Copy the connection string
4. Set as `DATABASE_URL` in Vercel

#### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a project
3. Go to Settings → Database
4. Copy the connection string
5. Set as `DATABASE_URL` in Vercel

#### Option C: Railway
1. Go to [railway.app](https://railway.app)
2. Create a PostgreSQL database
3. Copy the connection string
4. Set as `DATABASE_URL` in Vercel

### 4. **Debug Your Setup**

Visit `https://your-app-name.vercel.app/debug` to check:
- Current origin and environment variables
- Test authentication endpoints
- Verify configuration

### 5. **Common Issues & Fixes**

#### Issue: Still getting "invalid origin"
**Fix**: Check that `BETTER_AUTH_URL` exactly matches your deployment URL (including https://)

#### Issue: Database connection errors
**Fix**: Verify `DATABASE_URL` is correct and database is accessible

#### Issue: Environment variables not updating
**Fix**: 
1. Update environment variables in Vercel
2. Redeploy the application
3. Wait a few minutes for changes to propagate

### 6. **Verification Steps**

1. ✅ Environment variables are set in Vercel
2. ✅ `BETTER_AUTH_URL` matches your exact deployment URL
3. ✅ Database is accessible and configured
4. ✅ Application has been redeployed after setting variables
5. ✅ Visit `/debug` page to verify configuration

### 7. **Local Development**

For local development, your `.env.local` should have:

```bash
DATABASE_URL=your_database_connection_string
BETTER_AUTH_SECRET=development-secret-key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 After Setup

1. **Deploy** your application
2. **Wait** 2-3 minutes for environment variables to propagate
3. **Test** login/signup functionality
4. **Check** `/debug` page if issues persist

## 📞 Still Having Issues?

1. Check the browser console for specific error messages
2. Visit `/debug` page to verify environment configuration
3. Ensure your database is properly set up and accessible
4. Double-check that environment variables are set correctly in Vercel

## 🔍 Environment Variable Examples

### Production (Vercel)
```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_URL=https://linkbird-clone.vercel.app
NEXT_PUBLIC_APP_URL=https://linkbird-clone.vercel.app
BETTER_AUTH_SECRET=super-secure-random-string-here
```

### Development (Local)
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/linkbird
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=development-secret
```

---

**The key is ensuring `BETTER_AUTH_URL` exactly matches your deployment URL!** 🎯