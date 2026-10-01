const pool = require('./src/config/database');

async function checkTables() {
    // Check if tables exist
    const tablesRes = await pool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('inventory_adjustment', 'inventory_adjustment_item')
        ORDER BY table_name
    `);
    console.log('Tables found:', tablesRes.rows.map(r => r.table_name));

    // Check columns of inventory_adjustment
    const colsAdj = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'inventory_adjustment'
        ORDER BY ordinal_position
    `);
    console.log('\ninventory_adjustment columns:');
    colsAdj.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

    // Check columns of inventory_adjustment_item
    const colsItem = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'inventory_adjustment_item'
        ORDER BY ordinal_position
    `);
    console.log('\ninventory_adjustment_item columns:');
    colsItem.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

    // Check constraints
    const constraints = await pool.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name IN ('inventory_adjustment', 'inventory_adjustment_item')
        ORDER BY table_name, constraint_type
    `);
    console.log('\nConstraints:');
    constraints.rows.forEach(r => console.log(` - ${r.constraint_name} (${r.constraint_type})`));

    await pool.end();
}

checkTables().catch(e => { console.error(e.message); pool.end(); });
