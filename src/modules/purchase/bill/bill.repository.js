const pool = require('../../../config/database');

async function getAllBills() {
    const query = `
        SELECT
            b.bill_id,
            b.bill_number,
            b.bill_number AS bill_code,
            b.bill_date,
            '' AS reference,
            b.delivery_status AS status,
            b.total_amount,
            b.total_amount AS grand_total,
            0 AS balance_amount,
            0 AS balance_due,
            b.due_date,
            v.display_name AS vendor_name,
            v.vendor_code
        FROM bill b
        LEFT JOIN vendor v ON b.vendor_id = v.vendor_id
        ORDER BY b.bill_id DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
}

module.exports = {
    getAllBills
};
