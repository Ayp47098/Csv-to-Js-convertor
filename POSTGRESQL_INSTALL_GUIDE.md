# PostgreSQL Installation Guide for Windows

## Quick Summary

To complete the project setup, you need to:
1. Install PostgreSQL (requires admin access)
2. Create the database
3. Start the Node.js server
4. Initialize and push to GitHub

## Method 1: Download and Install PostgreSQL (Recommended)

### Step 1: Download PostgreSQL Installer

1. Visit: https://www.postgresql.org/download/windows/
2. Click "Download the installer" 
3. Choose PostgreSQL 15 or 16 (latest stable)
4. Download the Windows installer (.exe)

### Step 2: Run the Installer

1. **Right-click** the downloaded `.exe` file
2. Select **"Run as Administrator"**
3. Follow the installation wizard:
   - Accept the license
   - Keep default installation directory
   - Components: Keep all selected (Server, pgAdmin, Stack Builder, CLI tools)
   - **Password**: Set to `postgres` (important - matches your `.env` file)
   - **Port**: Keep as `5432` (default)
   - **Locale**: Select your locale
   - Click "Next" and complete installation

### Step 3: Verify Installation

After installation completes, open a **new** terminal and run:

```cmd
psql --version
```

You should see: `psql (PostgreSQL) 15.x` or similar

## Method 2: Use Chocolatey (If you have admin access)

```cmd
choco install postgresql15 -y
```

## Method 3: Use PostgreSQL Portable (No installation needed)

If you don't want to install globally, use PostgreSQL Portable:
- Download from: https://www.postgresql.org/download/windows/
- Or use EnterpriseDB's portable version

---

## After PostgreSQL is Installed

Once you see `psql --version` working, run these commands:

### 1. Create the Database

```cmd
createdb -U postgres -h localhost csv_converter
```

**Verify it worked:**
```cmd
psql -U postgres -h localhost -d csv_converter -c "SELECT NOW();"
```

### 2. Start the Node.js Application

```cmd
npm start
```

You should see:
```
✓ Database schema initialized successfully
✓ Server running on http://localhost:3000
✓ Ready to accept CSV files
```

### 3. Initialize Git and Push to GitHub

In a **new terminal** (keep the server running in the first one):

```cmd
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: CSV to JSON converter API with PostgreSQL"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Troubleshooting

### Problem: "psql: command not found"
- PostgreSQL is not installed
- Solution: Download and run the installer from https://www.postgresql.org/download/windows/

### Problem: "password authentication failed"
- Wrong password
- Solution: Reinstall PostgreSQL and set password to `postgres`

### Problem: "could not connect to server"
- PostgreSQL service not running
- Solution: Start PostgreSQL service from Services (Windows Services panel)

### Problem: "database csv_converter does not exist"
- Database not created yet
- Solution: Run `createdb -U postgres -h localhost csv_converter`

---

## Complete Setup Commands (After PostgreSQL Installation)

Run these commands in sequence:

```cmd
# 1. Create database
createdb -U postgres -h localhost csv_converter

# 2. Start the server
npm start
```

In another terminal:

```cmd
# 3. Initialize git
git init

# 4. Add all files
git add .

# 5. Commit
git commit -m "Initial commit: CSV to JSON converter API with PostgreSQL"

# 6. Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 7. Push to GitHub
git branch -M main
git push -u origin main
```

---

## Support

If you encounter issues:
1. Check the PostgreSQL troubleshooting guide above
2. Verify port 5432 is available: `netstat -ano | findstr :5432`
3. Check PostgreSQL service status in Windows Services
4. Review application logs in `server.log`

