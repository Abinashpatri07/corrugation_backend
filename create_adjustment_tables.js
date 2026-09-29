const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'erp-cor-db-a.cz0iiqugc8nl.ap-south-2.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'erp_db',
  user: process.env.DB_USER || 'postcor',
  password: process.env.DB_PASSWORD || 'ERPCOR5161',
  ssl: { rejectUnauthorized: false },
});

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create the master adjustment table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.inventory_adjustment (
        adj_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        mode_of_adjustment VARCHAR(50) NOT NULL,
        reference_number VARCHAR(100),
        adjustment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        account VARCHAR(100) NOT NULL,
        reason VARCHAR(100) NOT NULL,
        description TEXT,
        front_view TEXT,
        rear_view TEXT,
        created_by BIGINT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_by BIGINT,
        modified_at TIMESTAMP
      );
    `);

    // Create the child table for items in the adjustment
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.inventory_adjustment_item (
        adj_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        adj_id BIGINT NOT NULL REFERENCES public.inventory_adjustment(adj_id) ON DELETE CASCADE,
        inv_item_id BIGINT NOT NULL REFERENCES public.inventory_item(inv_item_id),
        quantity_available NUMERIC(14,3) NOT NULL,
        new_quantity NUMERIC(14,3) NOT NULL,
        quantity_adjusted NUMERIC(14,3) NOT NULL
      );
    `);

    await client.query('COMMIT');
    console.log("Adjustment tables created successfully!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating tables:", err);
  } finally {
    client.release();
    pool.end();
  }
};

createTables();
