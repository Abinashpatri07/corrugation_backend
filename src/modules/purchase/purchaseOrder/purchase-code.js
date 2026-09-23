// purchase-code.js

/**
 * Purchase Order SQL queries
 *
 * Keeping SQL separately makes repository/service files
 * easier to understand and maintain.
 */

// ===============================
// PURCHASE ORDER QUERIES
// ===============================

const CREATE_PURCHASE_ORDER = `
    INSERT INTO purchase_order (
        purchase_order_number,
        pr_id,
        pr_number,
        vendor_id,
        vendor_code,
        billing_address,
        shipping_address,
        po_date,
        expected_delivery_date,
        actual_delivery_date,
        delivery_status,
        item_count,
        item_total,
        gst_rate,
        gst_amount,
        discount_rate,
        discount_amount,
        estimated_total,
        remarks,
        created_by
    )
    VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20
    )
    RETURNING *;
`;

const CREATE_PURCHASE_ORDER_ITEM = `
    INSERT INTO purchase_order_item (
        purchase_order_id,
        reel_id,
        reel_spec,
        reel_description,
        paper_type,
        paper_gsm,
        reel_width,
        reel_bf,
        quantity,
        unit_rate,
        total_amount,
        remarks,
        created_by
    )
    VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13
    )
    RETURNING *;
`;

const GET_ALL_PURCHASE_ORDERS = `
    SELECT
        po.purchase_order_id,
        po.purchase_order_number,
        po.pr_id,
        po.pr_number,
        po.vendor_id,
        po.vendor_code,

        -- Get vendor name from vendor table
        COALESCE(
            v.display_name,
            v.company_name,
            po.vendor_code
        ) AS vendor_name,

        po.billing_address,
        po.shipping_address,
        po.po_date,
        po.expected_delivery_date,
        po.actual_delivery_date,
        po.delivery_status,

        po.item_count,
        po.item_total,
        po.gst_rate,
        po.gst_amount,
        po.discount_rate,
        po.discount_amount,
        po.estimated_total,

        po.remarks,
        po.created_by,
        po.created_at,
        po.modified_by,
        po.modified_at

    FROM purchase_order po

    LEFT JOIN vendor v
        ON v.vendor_id = po.vendor_id

    ORDER BY
        po.created_at DESC,
        po.purchase_order_id DESC
`;
const GET_PURCHASE_ORDER_BY_ID = `
    SELECT
        po.*,
        v.display_name AS vendor_name,
        v.vendor_code AS master_vendor_code
    FROM purchase_order po
    LEFT JOIN vendor v
        ON v.vendor_id = po.vendor_id
    WHERE po.purchase_order_id = $1;
`;

const GET_PURCHASE_ORDER_ITEMS = `
    SELECT *
    FROM purchase_order_item
    WHERE purchase_order_id = $1
    ORDER BY po_item_id ASC;
`;

const UPDATE_PURCHASE_ORDER = `
    UPDATE purchase_order
    SET
        vendor_id = $1,
        vendor_code = $2,
        pr_id = $3,
        pr_number = $4,
        billing_address = $5,
        shipping_address = $6,
        po_date = $7,
        expected_delivery_date = $8,
        actual_delivery_date = $9,
        delivery_status = $10,
        item_count = $11,
        item_total = $12,
        gst_rate = $13,
        gst_amount = $14,
        discount_rate = $15,
        discount_amount = $16,
        estimated_total = $17,
        remarks = $18,
        modified_by = $19,
        modified_at = CURRENT_TIMESTAMP
    WHERE purchase_order_id = $20
    RETURNING *;
`;

const DELETE_PURCHASE_ORDER_ITEMS = `
    DELETE FROM purchase_order_item
    WHERE purchase_order_id = $1;
`;

const DELETE_PURCHASE_ORDER = `
    DELETE FROM purchase_order
    WHERE purchase_order_id = $1
    RETURNING *;
`;

const CHECK_PURCHASE_ORDER_NUMBER = `
    SELECT purchase_order_id
    FROM purchase_order
    WHERE purchase_order_number = $1;
`;

module.exports = {
    CREATE_PURCHASE_ORDER,
    CREATE_PURCHASE_ORDER_ITEM,
    GET_ALL_PURCHASE_ORDERS,
    GET_PURCHASE_ORDER_BY_ID,
    GET_PURCHASE_ORDER_ITEMS,
    UPDATE_PURCHASE_ORDER,
    DELETE_PURCHASE_ORDER_ITEMS,
    DELETE_PURCHASE_ORDER,
    CHECK_PURCHASE_ORDER_NUMBER
};