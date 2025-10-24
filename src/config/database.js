const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL connection pool configuration
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'csv_converter',
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('supabase') ? { rejectUnauthorized: false } : false,
});

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
      CREATE TABLE IF NOT EXISTS public.users (
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

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
};
