const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    console.log('Testing connection to Supabase...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    const result = await pool.query('SELECT NOW();');
    console.log('✓ Connection successful!');
    console.log('Server time:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:');
    console.error(error.message);
    process.exit(1);
  }
})();
