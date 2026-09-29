const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'erp-cor-db-a.cz0iiqugc8nl.ap-south-2.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'erp_db',
  user: process.env.DB_USER || 'postcor',
  password: process.env.DB_PASSWORD || 'ERPCOR5161',
  ssl: { rejectUnauthorized: false },
});

const dropTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS public.inventory_adjustment_item CASCADE;');
    await client.query('DROP TABLE IF EXISTS public.inventory_adjustment CASCADE;');
    await client.query('COMMIT');
    console.log("Tables dropped successfully!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error dropping tables:", err);
  } finally {
    client.release();
    pool.end();
  }
};

dropTables();
