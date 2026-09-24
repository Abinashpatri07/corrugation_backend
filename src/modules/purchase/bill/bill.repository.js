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

async function createBill(billData) {
    const {
        bill_number,
        purchase_order_id = null,
        vendor_id,
        vendor_code = null,
        billing_address = null,
        shipping_address = null,
        bill_date = null,
        due_date = null,
        delivery_status = 'Pending',
        grn_status = 'Pending',
        item_count = 0,
        item_total = 0,
        gst_rate = 0,
        gst_amount = 0,
        discount_rate = 0,
        discount_amount = 0,
        total_amount = 0,
        remarks = null,
        created_by = null,
        items = []
    } = billData;

    const query = `
        INSERT INTO bill (
            bill_number, purchase_order_id, vendor_id, vendor_code,
            billing_address, shipping_address, bill_date, due_date,
            delivery_status, grn_status, item_count, item_total,
            gst_rate, gst_amount, discount_rate, discount_amount,
            total_amount, remarks, created_by
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        RETURNING *;
    `;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Look up actual purchase_order_id if user typed a PO number string (e.g., "PO-000001")
        let final_po_id = purchase_order_id;
        if (purchase_order_id) {
            const poResult = await client.query(
                `SELECT purchase_order_id FROM purchase_order WHERE purchase_order_number = $1 OR purchase_order_id::text = $1`,
                [String(purchase_order_id).trim()]
            );
            if (poResult.rows.length > 0) {
                final_po_id = poResult.rows[0].purchase_order_id;
            } else {
                throw new Error(`Purchase Order '${purchase_order_id}' not found. Please enter a valid Order Number (e.g., PO-000001).`);
            }
        }

        const { rows } = await client.query(query, [
            bill_number, final_po_id, vendor_id, vendor_code,
            billing_address, shipping_address, bill_date, due_date,
            delivery_status, grn_status, item_count, item_total,
            gst_rate, gst_amount, discount_rate, discount_amount,
            total_amount, remarks, created_by
        ]);
        const bill = rows[0];

        const itemQuery = `
            INSERT INTO bill_item (
                bill_id, reel_spec, reel_description, quantity, unit_rate, total_amount, remarks, created_by
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8
            )
            RETURNING *;
        `;
        
        for (const item of items) {
            await client.query(itemQuery, [
                bill.bill_id, 
                item.reel_spec, 
                item.reel_description, 
                item.quantity, 
                item.unit_rate, 
                item.total_amount, 
                item.remarks, 
                created_by
            ]);
        }
        await client.query('COMMIT');
        return bill;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getAllBills,
    getBillById,
    createBill
};
