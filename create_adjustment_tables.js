const pool = require('./src/config/database');

async function recreateTables() {
    // Drop in correct order (child first due to FK)
    await pool.query(`DROP TABLE IF EXISTS public.inventory_adjustment_item CASCADE;`);
    console.log('Dropped: inventory_adjustment_item');

    await pool.query(`DROP TABLE IF EXISTS public.inventory_adjustment CASCADE;`);
    console.log('Dropped: inventory_adjustment');

    // Recreate with user's exact schema
    await pool.query(`
        CREATE TABLE IF NOT EXISTS public.inventory_adjustment
        (
            adjustment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

            adjustment_number VARCHAR(50) NOT NULL UNIQUE,

            adjustment_mode VARCHAR(20) NOT NULL,
            reference_number VARCHAR(100),

            adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,

            account_id BIGINT,
            reason VARCHAR(100) NOT NULL,

            description TEXT,

            status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

            created_by BIGINT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            modified_by BIGINT,
            modified_at TIMESTAMP,

            CONSTRAINT chk_inventory_adjustment_mode
                CHECK (adjustment_mode IN ('QUANTITY', 'VALUE')),

            CONSTRAINT chk_inventory_adjustment_status
                CHECK (status IN ('DRAFT', 'POSTED', 'CANCELLED'))
        );
    `);
    console.log('Created: inventory_adjustment (with CHECK constraints)');

    await pool.query(`
        CREATE TABLE IF NOT EXISTS public.inventory_adjustment_item
        (
            adjustment_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

            adjustment_id BIGINT NOT NULL,

            inv_item_id BIGINT NOT NULL,

            plant_id BIGINT,

            quantity_available NUMERIC(14,3) NOT NULL DEFAULT 0,
            new_quantity_on_hand NUMERIC(14,3) NOT NULL DEFAULT 0,
            quantity_adjusted NUMERIC(14,3) NOT NULL DEFAULT 0,

            previous_value NUMERIC(14,2) DEFAULT 0,
            new_value NUMERIC(14,2) DEFAULT 0,
            value_adjusted NUMERIC(14,2) DEFAULT 0,

            unit_rate NUMERIC(14,4),

            remarks TEXT,

            created_by BIGINT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            modified_by BIGINT,
            modified_at TIMESTAMP,

            CONSTRAINT fk_inventory_adjustment_item_adjustment
                FOREIGN KEY (adjustment_id)
                REFERENCES public.inventory_adjustment(adjustment_id),

            CONSTRAINT fk_inventory_adjustment_item_inventory_item
                FOREIGN KEY (inv_item_id)
                REFERENCES public.inventory_item(inv_item_id)
        );
    `);
    console.log('Created: inventory_adjustment_item (with FK constraints)');

    console.log('\nDone! Tables are now exactly as per your schema.');
    await pool.end();
}

recreateTables().catch(e => { console.error('Error:', e.message); pool.end(); });
