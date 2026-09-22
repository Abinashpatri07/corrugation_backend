const pool = require('./src/config/database');
async function test() {
    try {
        const res = await pool.query(`SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'chk_sales_order_delivery_status'`);
        console.log(res.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
test();
