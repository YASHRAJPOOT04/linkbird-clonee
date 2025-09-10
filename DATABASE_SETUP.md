# Database Setup Instructions

## Quick Setup with Neon (Recommended)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string
4. Update `.env.local` with your actual `DATABASE_URL`

## Alternative: Local PostgreSQL

If you prefer local development:

1. Install PostgreSQL locally
2. Create a database named `linkbird`
3. Update `.env.local` with your local connection string

## Initialize Database Schema

After setting up the database, run:

```bash
npm run db:push
```

This will create all the necessary tables for authentication and the application.

## Verify Setup

Run the database check script:

```bash
node scripts/check-db.js
```

This will verify your database connection and show existing tables.