const pool = require('../../../config/database');

async function getAllPurchaseOrders() {
    const query = `
        SELECT
            po.purchase_order_id,
            po.purchase_order_number,
            po.po_date,
            po.delivery_status,
            po.estimated_total,
            po.pr_number,
            v.display_name AS vendor_name,
            v.vendor_code
        FROM purchase_order po
        LEFT JOIN vendor v ON po.vendor_id = v.vendor_id
        ORDER BY po.purchase_order_id DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
}

module.exports = {
    getAllPurchaseOrders
};
