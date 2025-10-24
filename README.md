# CSV to JSON Converter API

A Node.js/Express REST API that converts CSV files to JSON format with PostgreSQL database storage and age distribution analysis.

## Features

- 📤 **CSV Upload & Conversion**: Upload CSV files and convert to JSON format
- 💾 **PostgreSQL Storage**: Store converted data in a PostgreSQL database
- 📊 **Age Distribution**: Generate age distribution reports
- 🔍 **Data Validation**: Validate uploaded files using Joi schema
- 📝 **Request Logging**: Track all incoming requests
- ❌ **Error Handling**: Comprehensive error handling middleware
- ✅ **Unit Tests**: Full test coverage with Jest

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Testing**: Jest & Supertest
- **File Upload**: Multer
- **Validation**: Joi
- **Development**: Nodemon

## Project Structure

```
src/
├── index.js                      # Entry point
├── config/
│   └── database.js               # PostgreSQL configuration
├── controllers/
│   └── csvController.js          # Request handlers
├── services/
│   └── csvProcessingService.js   # Business logic
├── routes/
│   └── apiRoutes.js              # API endpoints
├── middleware/
│   ├── errorHandler.js           # Error handling
│   └── requestLogger.js          # Request logging
└── utils/
    ├── csvParser.js              # CSV parsing logic
    ├── dataTransformer.js        # Data transformation
    └── ageDistribution.js        # Age analysis
tests/                            # Test files
public/                           # Static files
uploads/                          # User uploaded files
```

## Prerequisites

- **Node.js** 14+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/windows/))

## Installation & Setup

### Option 1: Automated Setup (Recommended)

```bash
# Run the automated setup script
node setup.js
```

This script will:
1. ✓ Check PostgreSQL installation
2. ✓ Create the `csv_converter` database
3. ✓ Initialize git and push to GitHub (optional)
4. ✓ Start the server

### Option 2: Manual Setup

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Install & Configure PostgreSQL

1. **Download PostgreSQL** from https://www.postgresql.org/download/windows/
2. **Run the installer** (as Administrator):
   - Set superuser password to: `postgres`
   - Keep port as: `5432`
3. **Create the database**:
   ```bash
   createdb -U postgres -h localhost csv_converter
   ```

#### Step 3: Verify Database Connection

```bash
psql -U postgres -h localhost -d csv_converter -c "SELECT NOW();"
```

Should return the current timestamp.

#### Step 4: Start the Server

```bash
npm start
```

Expected output:
```
✓ Database schema initialized successfully
✓ Server running on http://localhost:3000
✓ Ready to accept CSV files
```

## API Endpoints

### Upload CSV File
```bash
POST /api/csv/upload
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/csv/upload \
  -F "file=@tests/sample.csv"
```

**Response:**
```json
{
  "success": true,
  "message": "CSV file processed successfully",
  "data": {
    "records": [
      {
        "name": "John Doe",
        "age": 28,
        "address": { "city": "New York" }
      }
    ],
    "count": 1
  }
}
```

### Get Age Distribution Report
```bash
GET /api/csv/report
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distribution": {
      "18-25": 5,
      "26-35": 10,
      "36-45": 8,
      "46-55": 3,
      "56+": 2
    },
    "statistics": {
      "total": 28,
      "average_age": 35.2,
      "min_age": 18,
      "max_age": 65
    }
  }
}
```

### Health Check
```bash
GET /
```

Returns the web interface HTML.

## Database Schema

```sql
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  age INTEGER NOT NULL,
  address JSONB,
  additional_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

Create or modify `.env` file:

```properties
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=csv_converter

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800  # 50MB
```

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run specific test file
npm test -- tests/csvParser.test.js

# Watch mode (continuous testing)
npm test -- --watch
```

## Development Mode

With automatic restart on file changes:

```bash
npm run dev
```

Requires `nodemon` (already installed as dev dependency).

## Sample CSV Format

The API expects CSV files with the following structure:

```csv
name,age,address
John Doe,28,"New York, NY"
Jane Smith,34,"Los Angeles, CA"
Bob Johnson,45,"Chicago, IL"
```

With optional additional fields:
```csv
name,age,address,city,state
John Doe,28,"123 Main St","New York","NY"
```

## GitHub Repository Setup

### Initialize Git

```bash
git init
git add .
git commit -m "Initial commit: CSV to JSON converter API with PostgreSQL"
```

### Add Remote Repository

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Troubleshooting

### PostgreSQL Connection Error

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions**:
1. Verify PostgreSQL is running: Check Windows Services for PostgreSQL service
2. Verify port 5432 is available: `netstat -ano | findstr :5432`
3. Check `.env` database credentials
4. Create database if it doesn't exist: `createdb -U postgres -h localhost csv_converter`

### Authentication Failed

**Error**: `error: FATAL: password authentication failed`

**Solutions**:
1. Verify PostgreSQL password in `.env` matches your installation
2. Reset PostgreSQL password if needed
3. Verify you're using the correct username (default: `postgres`)

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
1. Change PORT in `.env` to a different value (e.g., 3001)
2. Kill the process using port 3000:
   ```bash
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### File Upload Issues

**Error**: `413 Payload Too Large`

**Solution**: Increase `MAX_FILE_SIZE` in `.env` (currently 50MB)

## Project Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| pg | ^8.11.3 | PostgreSQL client |
| dotenv | ^16.4.1 | Environment variables |
| multer | ^1.4.5-lts.1 | File upload handling |
| joi | ^17.11.0 | Data validation |
| nodemon | ^3.0.2 | Development auto-reload |
| jest | ^29.7.0 | Testing framework |
| supertest | ^6.3.3 | HTTP testing |

## Performance Considerations

- **Connection Pooling**: PostgreSQL connection pool configured in `database.js`
- **File Limits**: Maximum 50MB file upload (configurable)
- **Memory**: JSONB fields support large nested data structures
- **Timestamps**: All records include creation timestamp

## Security Features

- ✓ Input validation with Joi
- ✓ Error handling without exposing sensitive info
- ✓ Environment variables for credentials
- ✓ File type validation for uploads
- ✓ Request size limits

## Future Enhancements

- [ ] User authentication (JWT)
- [ ] Multiple file format support (XML, JSON, Excel)
- [ ] Batch processing
- [ ] Data export formats (CSV, Excel, PDF)
- [ ] Advanced filtering and querying
- [ ] API rate limiting
- [ ] Webhooks for processing events

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Author

**Ayush Pandey**
- Email: pandeyayush956@gmail.com
- GitHub: [@AyushPandey](https://github.com)

## Support & Documentation

- 📖 [Full API Documentation](./API_DOCUMENTATION.md)
- 🚀 [Quick Start Guide](./QUICK_START.md)
- 🛠️ [PostgreSQL Setup Guide](./POSTGRESQL_INSTALL_GUIDE.md)
- 📋 [Setup Instructions](./SETUP_INSTRUCTIONS.md)

---

**Last Updated**: October 24, 2025
**Status**: ✓ Project Ready for Deployment
