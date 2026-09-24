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

async function getBillById(billId) {
    const query = `
        SELECT
            b.*,
            v.vendor_code AS vendor_code_from_vendor,
            v.display_name AS vendor_name,
            v.company_name,
            v.gstin,
            v.primary_number AS primary_contact_number,
            b.billing_address AS vendor_address,
            v.primary_first_name AS primary_contact_name
        FROM bill b
        LEFT JOIN vendor v ON b.vendor_id = v.vendor_id
        WHERE b.bill_id = $1
    `;
    const { rows } = await pool.query(query, [billId]);
    if (rows.length === 0) return null;
    const bill = rows[0];

    const itemsQuery = `
        SELECT
            *
        FROM bill_item
        WHERE bill_id = $1
        ORDER BY bill_item_id ASC
    `;
    const items = await pool.query(itemsQuery, [billId]);
    bill.items = items.rows;
    return bill;
}

module.exports = {
    getAllBills,
    getBillById
};
