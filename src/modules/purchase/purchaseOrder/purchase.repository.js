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

async function getPurchaseOrderById(id) {
    const poQuery = `
        SELECT 
            po.*,
            v.display_name AS vendor_name,
            v.vendor_code
        FROM purchase_order po
        LEFT JOIN vendor v ON po.vendor_id = v.vendor_id
        WHERE po.purchase_order_id = $1
    `;
    const poResult = await pool.query(poQuery, [id]);
    
    if (poResult.rows.length === 0) {
        return null;
    }
    
    const itemsQuery = `
        SELECT * 
        FROM purchase_order_item
        WHERE purchase_order_id = $1
    `;
    const itemsResult = await pool.query(itemsQuery, [id]);
    
    return {
        purchase_order: poResult.rows[0],
        items: itemsResult.rows
    };
}

module.exports = {
    getAllPurchaseOrders,
    getPurchaseOrderById
};
