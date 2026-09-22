const pool = require('../../config/database');

// Generate Sales Order Number
function generateSONumber() {
    const date = new Date();
    const prefix = `SL-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
}

async function createSalesOrderFromQuote(quoteId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Fetch the quote
        const quoteRes = await client.query(`
            SELECT q.*, c.customer_code
            FROM quote q
            LEFT JOIN customer c ON q.customer_id = c.customer_id
            WHERE q.quote_id = $1
        `, [quoteId]);
        
        if (quoteRes.rows.length === 0) {
            throw new Error(`Quote with ID ${quoteId} not found`);
        }
        const quote = quoteRes.rows[0];

        // 2. Fetch the billing and shipping addresses
        const baRes = await client.query(`SELECT CONCAT_WS(', ', street_1, street_2, city, state, zip_code) as address FROM customer_addresses WHERE customer_id = $1 AND address_type = 'BILLING'`, [quote.customer_id]);
        const saRes = await client.query(`SELECT CONCAT_WS(', ', street_1, street_2, city, state, zip_code) as address FROM customer_addresses WHERE customer_id = $1 AND address_type = 'SHIPPING'`, [quote.customer_id]);
        
        const billingAddress = baRes.rows.length > 0 ? baRes.rows[0].address : null;
        const shippingAddress = saRes.rows.length > 0 ? saRes.rows[0].address : null;

        // 3. Fetch quote items
        const itemsRes = await client.query(`
            SELECT * FROM quote_item WHERE quote_id = $1
        `, [quoteId]);
        const items = itemsRes.rows;

        // 4. Calculate totals
        let itemTotal = 0;
        items.forEach(item => {
            const weight = parseFloat(item.total_weight) || 0;
            // same pricing logic as frontend: weight * 50
            const amount = weight * 50; 
            itemTotal += amount;
            // attach calculated amount back to item for later insert
            item.calculatedAmount = amount; 
        });

        const gstRate = 18;
        const gstAmount = itemTotal * (gstRate / 100);
        const estimatedTotal = itemTotal + gstAmount;

        const soNumber = generateSONumber();
        const saleDate = new Date();
        const deliveryDate = quote.expiry_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default to +7 days

        // 5. Insert Sales Order
        const insertSORes = await client.query(`
            INSERT INTO sales_order (
                quote_id, customer_id, sale_date, delivery_date, item_count, item_total, 
                gst_rate, gst_amount, estimated_total, sales_order_number, delivery_status, 
                quote_number, customer_code, billing_address, shipping_address
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING sales_order_id
        `, [
            quoteId, quote.customer_id, saleDate, deliveryDate, items.length, itemTotal,
            gstRate, gstAmount, estimatedTotal, soNumber, 'Pending',
            quote.quote_number, quote.customer_code, billingAddress, shippingAddress
        ]);

        const newSalesOrderId = insertSORes.rows[0].sales_order_id;

        // 6. Insert Sales Order Items
        for (const item of items) {
            await client.query(`
                INSERT INTO sales_order_item (
                    sales_order_id, quantity, unit_rate, item_total, 
                    box_id, ply, length, width, height, 
                    top_paper_gsm, liner_gsm, flute_gsm, box_spec, 
                    box_description, box_type, paper_type, box_size
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            `, [
                newSalesOrderId, item.quantity, 50, item.calculatedAmount, // using 50 as default unit rate per kg
                item.box_id, item.ply_type, item.box_length, item.box_width, item.box_height,
                item.top_gsm, item.liner_gsm, item.flute_gsm, item.box_spec,
                item.box_description, item.box_type, item.paper_type, item.box_size
            ]);
        }

        await client.query('COMMIT');
        return { salesOrderId: newSalesOrderId, salesOrderNumber: soNumber };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function getAllSalesOrders() {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                so.sales_order_id as id,
                TO_CHAR(so.sale_date, 'DD/MM/YYYY') as date,
                so.sales_order_number as "salesOrderNo",
                so.quote_number as "referenceNo",
                c.display_name as "customerName",
                so.delivery_status as "orderStatus",
                so.estimated_total as "payment",
                '-' as packed
            FROM sales_order so
            LEFT JOIN customer c ON so.customer_id = c.customer_id
            ORDER BY so.created_at DESC
        `;
        const res = await client.query(query);
        
        return res.rows.map(row => ({
            ...row,
            payment: new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(row.payment)
        }));
    } finally {
        client.release();
    }
}

async function getSalesOrderById(id) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                so.sales_order_id as id,
                TO_CHAR(so.sale_date, 'DD/MM/YYYY') as date,
                so.sales_order_number as "salesOrderNo",
                so.quote_number as "quoteNo",
                so.po_number as "poNo",
                c.display_name as "customerName",
                so.billing_address as "billingAddress",
                so.shipping_address as "shippingAddress",
                c.gstin as "gstin",
                CONCAT_WS(' ', c.primary_contact_first_name, c.primary_contact_last_name) as "poc",
                so.item_total as "subTotal",
                so.gst_amount as "gst",
                so.estimated_total as "amount",
                so.delivery_status as "orderStatus",
                soi.quantity as quantity,
                soi.box_type as "boxType",
                soi.paper_type as "paperType",
                soi.box_size as "boxSize",
                soi.ply as "plyType",
                soi.item_total as "itemAmount"
            FROM sales_order so
            LEFT JOIN customer c ON so.customer_id = c.customer_id
            LEFT JOIN sales_order_item soi ON so.sales_order_id = soi.sales_order_id
            WHERE so.sales_order_id = $1
        `;
        const res = await client.query(query, [id]);
        
        if (res.rows.length === 0) {
            return null;
        }

        const row = res.rows[0];
        
        return {
            ...row,
            subTotal: new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(row.subTotal),
            gst: new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(row.gst),
            amount: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.amount).replace('₹', '').trim(),
            itemAmount: new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(row.itemAmount)
        };
    } finally {
        client.release();
    }
}

module.exports = {
    createSalesOrderFromQuote,
    getAllSalesOrders,
    getSalesOrderById
};
