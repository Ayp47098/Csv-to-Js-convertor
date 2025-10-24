# Vercel + Supabase Deployment Guide

## Issue: IPv6 Connection Error on Vercel

If you're seeing this error on Vercel:
```
Error: connect ENETUNREACH 2406:da1a:6b0:f613:8870:3509:72aa:29af:5432
```

This is because Supabase DNS is resolving to IPv6, but Vercel doesn't support IPv6 connections by default.

## Solution

### Step 1: Get Supabase Connection String

1. Go to https://app.supabase.com/
2. Select your project
3. Go to **Settings → Database**
4. Under **Connection string**, copy the **URI** (should look like):
   ```
   postgresql://postgres:PASSWORD@db.PROJECTID.supabase.co:5432/postgres
   ```

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings → Environment Variables**
3. Add the following variables:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.PROJECTID.supabase.co:5432/postgres?sslmode=require
NODE_ENV=production
PORT=3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

**Important:** Include `?sslmode=require` at the end of DATABASE_URL for Supabase.

### Step 3: Deploy

```bash
git push origin main
# or if already connected:
vercel deploy --prod
```

### Why This Works

- **`family: 4`** in database.js forces IPv4 connections
- **`?sslmode=require`** ensures SSL is used
- **DATABASE_URL** format is recognized by many Node.js frameworks

## Alternative: Use Supabase Connection Pooler

If you still have issues, use Supabase's built-in connection pooler (PgBouncer):

1. In Supabase, go to **Settings → Database → Connection pooling**
2. Choose **PgBouncer** mode
3. Copy the **Connection pooling URL** (different from the standard URL)
4. Use this URL as your `DATABASE_URL`

Example:
```
postgresql://postgres.PROJECTID:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
```

## Environment Variables

Your `.env` should have:

```properties
# Cloud Deployment (Vercel, Heroku, Railway, etc.)
DATABASE_URL=postgresql://postgres:password@db.projectid.supabase.co:5432/postgres?sslmode=require

# Or use individual settings for local development
DB_HOST=db.projectid.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres

# App settings
NODE_ENV=production
PORT=3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

## Testing Locally

Before deploying, test with:

```bash
npm start
```

If it works locally, it will work on Vercel.

## Troubleshooting

### Error: "password authentication failed"
- Check that password doesn't have special characters that need URL encoding
- If password has `@`, `#`, `%`, encode it:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`

### Error: "connect ECONNREFUSED"
- Supabase project might be paused
- Check project status at https://app.supabase.com/
- Wake up the project if needed

### Error: "connect ETIMEDOUT"
- Increase timeout in database.js (already set to 30s)
- Check if Supabase has firewall restrictions

## Vercel + Supabase Checklist

- [ ] Supabase project created
- [ ] Database password stored securely
- [ ] DATABASE_URL set in Vercel environment variables
- [ ] Code pushed to GitHub
- [ ] Vercel connected to GitHub repo
- [ ] Deployment successful
- [ ] API endpoints working: `POST /api/csv/upload`, `GET /api/csv/report`

## Deploy Command

```bash
# Install dependencies
npm install

# Start the application
npm start
```

Vercel will automatically detect `package.json` and run these commands.

## Useful Links

- Supabase: https://app.supabase.com/
- Vercel: https://vercel.com/
- Supabase + Vercel: https://vercel.com/guides/how-to-enable-cors-with-supabase
