const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL connection pool configuration
 */
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if provided (easier for cloud deployments)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    family: 4, // Force IPv4
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
  };
  console.log('Using DATABASE_URL connection');
} else {
  // Use individual DB_* environment variables
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'csv_converter',
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('supabase') 
      ? { rejectUnauthorized: false } 
      : false,
    family: 4, // Force IPv4
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
  };
  console.log(`Using individual DB_* config: host=${poolConfig.host}, port=${poolConfig.port}`);
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Initialize database schema
 */
async function initializeDatabase() {
  try {
    await pool.query(`
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
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
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
