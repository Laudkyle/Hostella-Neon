// config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  },
  max: 10, 
  idleTimeoutMillis: 50000,
  connectionTimeoutMillis: 5000 
});

// Test the connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();

module.exports = pool;