const { Pool } = require('pg');
require('dotenv').config();

/**
 * Retry logic for database connections
 */
async function retryConnection(fn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Retrying in ${delay}ms... (${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * PostgreSQL connection pool configuration
 * Uses PgBouncer connection pooler for better reliability on cloud platforms
 */
let poolConfig;

// Use individual DB_* environment variables (better for internal connections)
if (process.env.DB_HOST) {
  // Force PgBouncer port 6543 on cloud platforms to avoid IPv6 issues
  // On local development (NODE_ENV=development), allow port 5432
  let port = process.env.DB_PORT || 6543;
  
  // If on cloud platform (Render, Vercel, etc.), force port 6543
  if ((process.env.RENDER || process.env.VERCEL) && port === '5432') {
    console.log('ℹ Detected cloud platform - forcing PgBouncer port 6543');
    port = 6543;
  }
  
  port = parseInt(port);
  const isUsingPooler = port === 6543;
  
  poolConfig = {
    host: process.env.DB_HOST,
    port: port,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    ssl: {
      rejectUnauthorized: false, // Required for Supabase
    },
    connectionTimeoutMillis: 15000, // 15 seconds
    idleTimeoutMillis: 30000, // 30 seconds
    max: 20, // Max connections
    statement_timeout: 30000, // 30 seconds per query
  };
  
  if (isUsingPooler) {
    console.log(`✓ Using PgBouncer connection pooler: host=${poolConfig.host}, port=${poolConfig.port}, db=${poolConfig.database}`);
  } else {
    console.log(`✓ Using direct database connection: host=${poolConfig.host}, port=${poolConfig.port}, db=${poolConfig.database}`);
  }
} else if (process.env.DATABASE_URL) {
  // Fallback: Parse DATABASE_URL to individual parameters
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  poolConfig = {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || 6543), // Default to pgbouncer port
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    max: 20,
    statement_timeout: 30000,
  };
  console.log(`✓ Using DATABASE_URL with PgBouncer: host=${poolConfig.host}, port=${poolConfig.port}`);
} else {
  throw new Error('DATABASE_URL or DB_HOST not configured');
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message);
  // Don't exit in production/cloud - just log the error
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && !process.env.RENDER) {
    process.exit(-1);
  }
});

pool.on('connect', () => {
  console.log('✓ Database connection established');
});

/**
 * Initialize database schema with retry logic
 */
async function initializeDatabase() {
  try {
    await retryConnection(async () => {
      const client = await pool.connect();
      try {
        // Create table if it doesn't exist
        await client.query(`
          CREATE TABLE IF NOT EXISTS public.csv_records (
            id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            age INTEGER NOT NULL,
            address JSONB,
            additional_info JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✓ Database schema initialized successfully');
      } finally {
        client.release();
      }
    }, 3, 2000);
  } catch (error) {
    console.error('Error initializing database schema:', error.message);
    // Don't throw in production - just log
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && !process.env.RENDER) {
      throw error;
    }
  }
}

/**
 * Insert CSV records into database
 */
async function insertRecords(records) {
  try {
    for (const record of records) {
      await pool.query(
        `INSERT INTO public.csv_records (name, age, address, additional_info) 
         VALUES ($1, $2, $3, $4)`,
        [
          record.name,
          record.age,
          record.address ? JSON.stringify(record.address) : null,
          record.additional_info ? JSON.stringify(record.additional_info) : null,
        ]
      );
    }
    console.log(`✓ Inserted ${records.length} records into database`);
    return true;
  } catch (error) {
    console.error('Error inserting records:', error);
    throw error;
  }
}

/**
 * Get all records from database
 */
async function getAllRecords() {
  try {
    const result = await pool.query('SELECT * FROM public.csv_records ORDER BY id DESC');
    return result.rows.map(row => {
      let addressData = null;
      
      // Handle address parsing - it comes as JSONB from database
      if (row.address) {
        if (typeof row.address === 'string') {
          try {
            addressData = JSON.parse(row.address);
          } catch (e) {
            addressData = row.address;
          }
        } else {
          // PostgreSQL returns JSONB as objects directly
          addressData = row.address;
        }
      }
      
      let additionalData = null;
      if (row.additional_info) {
        if (typeof row.additional_info === 'string') {
          try {
            additionalData = JSON.parse(row.additional_info);
          } catch (e) {
            additionalData = row.additional_info;
          }
        } else {
          additionalData = row.additional_info;
        }
      }
      
      return {
        id: row.id,
        name: row.name,
        age: row.age,
        address: addressData,
        additional_info: additionalData,
        created_at: row.created_at,
      };
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error;
  }
}

/**
 * Get records count
 */
async function getRecordsCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM public.csv_records');
    return result.rows[0].count;
  } catch (error) {
    console.error('Error fetching records count:', error);
    throw error;
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
  insertRecords,
  getAllRecords,
  getRecordsCount,
};
