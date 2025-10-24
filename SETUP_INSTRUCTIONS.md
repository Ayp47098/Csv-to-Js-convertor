# CSV to JSON Converter API - Setup Instructions

## Project Overview
This is a CSV to JSON converter API with PostgreSQL database storage and age distribution reporting capabilities.

## Prerequisites Completed ✓
- ✓ Node.js dependencies installed (`node_modules` exists)
- ✓ `.env` file configured
- ✓ Project structure ready

## Remaining Setup: PostgreSQL Database

### Step 1: Install PostgreSQL (if not already installed)

**For Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow these settings:
   - **Port**: 5432 (default)
   - **Superuser password**: `postgres` (to match your `.env` file)
   - **Locale**: Your preferred locale
3. Complete the installation

**Verify Installation:**
```cmd
psql --version
```

### Step 2: Create the Database

Once PostgreSQL is installed and running, create the database:

```cmd
createdb -U postgres -h localhost csv_converter
```

**Or use psql interactive prompt:**
```cmd
psql -U postgres -h localhost
CREATE DATABASE csv_converter;
\q
```

### Step 3: Verify Database Connection

Test the database connection:
```cmd
psql -U postgres -h localhost -d csv_converter -c "SELECT NOW();"
```

If successful, you'll see the current timestamp.

## Starting the Application

### Development Mode
```cmd
npm run dev
```
(Requires nodemon - automatically restarts on file changes)

### Production Mode
```cmd
npm start
```

The application will:
1. Connect to PostgreSQL
2. Automatically create the `users` table if it doesn't exist
3. Start the Express server on port 3000
4. Be ready to accept CSV uploads

## Environment Configuration

Your `.env` file is already configured:
```properties
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=csv_converter

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

Modify these values if your PostgreSQL setup differs.

## Database Schema

The application automatically creates this table:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  age INTEGER NOT NULL,
  address JSONB,
  additional_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Running Tests

```cmd
npm test
```

This runs Jest with coverage reports.

## API Endpoints

- `POST /api/csv/upload` - Upload and convert CSV file
- `GET /api/csv/report` - Get age distribution report
- Health check: `GET /` - Returns static HTML

## Troubleshooting

### PostgreSQL Connection Error
- Ensure PostgreSQL service is running
- Check `.env` database credentials match your PostgreSQL setup
- Verify port 5432 is accessible

### Database Already Exists
```cmd
dropdb -U postgres -h localhost csv_converter
createdb -U postgres -h localhost csv_converter
```

### Permission Denied Errors
- Run terminal as Administrator if needed
- Ensure PostgreSQL service has proper permissions

## Next Steps

1. ✓ Install PostgreSQL (if needed)
2. ✓ Create the `csv_converter` database
3. ✓ Start the application with `npm start`
4. ✓ Test upload endpoint with your CSV files
5. ✓ Check age distribution reports

## Support

For more information:
- Check the project README.md
- Review API documentation
- Check server logs in `server.log`
