// /*
//  * Purchase Order Repository
//  *
//  * This file contains only PostgreSQL queries.
//  */

// const pool = require("../../../config/database");

// /*
//  * Generate a new Purchase Order number.
//  *
//  * Example:
//  * PO-00001
//  * PO-00002
//  * PO-00003
//  *
//  * We do NOT need a database sequence for this.
//  */
// const generatePurchaseOrderNumber = async (client) => {
//   const result = await client.query(`
//     SELECT
//       COALESCE(
//         MAX(
//           CAST(
//             NULLIF(
//               REGEXP_REPLACE(purchase_order_number, '[^0-9]', '', 'g'),
//               ''
//             ) AS BIGINT
//           )
//         ),
//         0
//       ) + 1 AS next_number
//     FROM purchase_order
//     WHERE purchase_order_number LIKE 'PO-%'
//   `);

//   const nextNumber = Number(result.rows[0].next_number || 1);

//   return `PO-${String(nextNumber).padStart(5, "0")}`;
// };


// /*
//  * Create Purchase Order.
//  *
//  * This function creates:
//  *
//  * 1. purchase_order
//  * 2. purchase_order_item rows
//  *
//  * inside one transaction.
//  */
// const createPurchaseOrder = async (client, data) => {
//   const {
//     purchase_order_number,
//     pr_id,
//     pr_number,
//     vendor_id,
//     vendor_code,
//     billing_address,
//     shipping_address,
//     po_date,
//     expected_delivery_date,
//     delivery_status,
//     items,
//     gst_rate,
//     gst_amount,
//     discount_rate,
//     discount_amount,
//     item_total,
//     item_count,
//     estimated_total,
//     remarks,
//     created_by,
//   } = data;


//   /*
//    * If frontend did not provide PO number,
//    * generate one automatically.
//    */
//   const poNumber =
//     purchase_order_number ||
//     (await generatePurchaseOrderNumber(client));


//   /*
//    * Insert Purchase Order master record.
//    */
//   const poResult = await client.query(
//     `
//       INSERT INTO purchase_order (
//         purchase_order_number,
//         pr_id,
//         pr_number,
//         vendor_id,
//         vendor_code,
//         billing_address,
//         shipping_address,
//         po_date,
//         expected_delivery_date,
//         delivery_status,
//         item_count,
//         item_total,
//         gst_rate,
//         gst_amount,
//         discount_rate,
//         discount_amount,
//         estimated_total,
//         remarks,
//         created_by
//       )
//       VALUES (
//         $1,
//         $2,
//         $3,
//         $4,
//         $5,
//         $6,
//         $7,
//         $8,
//         $9,
//         $10,
//         $11,
//         $12,
//         $13,
//         $14,
//         $15,
//         $16,
//         $17,
//         $18,
//         $19
//       )
//       RETURNING *
//     `,
//     [
//       poNumber,
//       pr_id || null,
//       pr_number || null,
//       Number(vendor_id),
//       vendor_code || null,
//       billing_address || null,
//       shipping_address || null,
//       po_date,
//       expected_delivery_date || null,
//       delivery_status || "PENDING",
//       Number(item_count || 0),
//       Number(item_total || 0),
//       Number(gst_rate || 0),
//       Number(gst_amount || 0),
//       Number(discount_rate || 0),
//       Number(discount_amount || 0),
//       Number(estimated_total || 0),
//       remarks || null,
//       created_by || null,
//     ]
//   );


//   const purchaseOrder = poResult.rows[0];


//   /*
//    * Insert each item.
//    */
//   for (const item of items) {
//     const quantity = Number(item.quantity || 0);
//     const unitRate = Number(item.unit_rate || 0);

//     /*
//      * Calculate amount server-side.
//      *
//      * Never trust the amount calculated by
//      * the frontend.
//      */
//     const totalAmount = quantity * unitRate;

//     await client.query(
//       `
//         INSERT INTO purchase_order_item (
//           purchase_order_id,
//           reel_id,
//           reel_spec,
//           reel_description,
//           paper_type,
//           paper_gsm,
//           reel_width,
//           reel_bf,
//           quantity,
//           unit_rate,
//           total_amount,
//           remarks,
//           created_by
//         )
//         VALUES (
//           $1,
//           $2,
//           $3,
//           $4,
//           $5,
//           $6,
//           $7,
//           $8,
//           $9,
//           $10,
//           $11,
//           $12,
//           $13
//         )
//       `,
//       [
//         purchaseOrder.purchase_order_id,

//         /*
//          * reel_id is optional in your database.
//          * Therefore null is safe when the frontend
//          * has not selected a real reel.
//          */
//         item.reel_id || null,

//         item.reel_spec || null,
//         item.reel_description || null,
//         item.paper_type || null,
//         item.paper_gsm || null,
//         item.reel_width || null,
//         item.reel_bf || null,

//         quantity,
//         unitRate,
//         totalAmount,

//         /*
//          * Frontend "note" is stored in the existing
//          * remarks column of purchase_order_item.
//          */
//         item.remarks || item.note || null,

//         created_by || null,
//       ]
//     );
//   }


//   /*
//    * Return complete PO including items.
//    */
//   const completeResult = await client.query(
//     `
//       SELECT
//         po.*,
//         COALESCE(
//           json_agg(
//             json_build_object(
//               'po_item_id', poi.po_item_id,
//               'reel_id', poi.reel_id,
//               'reel_spec', poi.reel_spec,
//               'reel_description', poi.reel_description,
//               'paper_type', poi.paper_type,
//               'paper_gsm', poi.paper_gsm,
//               'reel_width', poi.reel_width,
//               'reel_bf', poi.reel_bf,
//               'quantity', poi.quantity,
//               'unit_rate', poi.unit_rate,
//               'total_amount', poi.total_amount,
//               'remarks', poi.remarks
//             )
//           ) FILTER (WHERE poi.po_item_id IS NOT NULL),
//           '[]'::json
//         ) AS items

//       FROM purchase_order po

//       LEFT JOIN purchase_order_item poi
//         ON poi.purchase_order_id = po.purchase_order_id

//       WHERE po.purchase_order_id = $1

//       GROUP BY po.purchase_order_id
//     `,
//     [purchaseOrder.purchase_order_id]
//   );


//   return completeResult.rows[0];
// };


// /*
//  * Get all Purchase Orders.
//  */
// /*
//  * Get all Purchase Orders.
//  *
//  * IMPORTANT:
//  * We also fetch the vendor name from the existing
//  * vendor table using vendor_id.
//  *
//  * No database table is changed.
//  */
// const getAllPurchaseOrders = async () => {

//   const result = await pool.query(`
//     SELECT
//       po.purchase_order_id,
//       po.purchase_order_number,
//       po.pr_number,

//       /* Vendor information */
//       po.vendor_id,
//       po.vendor_code,

//       /* Actual vendor name */
//       COALESCE(
//         v.display_name,
//         v.company_name,
//         po.vendor_code,
//         'Unknown Vendor'
//       ) AS vendor_name,

//       po.po_date,
//       po.expected_delivery_date,
//       po.actual_delivery_date,
//       po.delivery_status,
//       po.item_count,
//       po.item_total,
//       po.gst_rate,
//       po.gst_amount,
//       po.discount_rate,
//       po.discount_amount,
//       po.estimated_total,
//       po.remarks,
//       po.created_at

//     FROM purchase_order po

//     /* Connect Purchase Order with Vendor */
//     LEFT JOIN vendor v
//       ON v.vendor_id = po.vendor_id

//     ORDER BY po.purchase_order_id DESC
//   `);

//   return result.rows;
// };


// /*
//  * Get one Purchase Order with all items.
//  */
// const getPurchaseOrderById = async (id) => {
//   const result = await pool.query(
//     `
//       SELECT
//         po.*,

//         COALESCE(
//           json_agg(
//             json_build_object(
//               'po_item_id', poi.po_item_id,
//               'reel_id', poi.reel_id,
//               'reel_spec', poi.reel_spec,
//               'reel_description', poi.reel_description,
//               'paper_type', poi.paper_type,
//               'paper_gsm', poi.paper_gsm,
//               'reel_width', poi.reel_width,
//               'reel_bf', poi.reel_bf,
//               'quantity', poi.quantity,
//               'unit_rate', poi.unit_rate,
//               'total_amount', poi.total_amount,
//               'remarks', poi.remarks
//             )
//           ) FILTER (WHERE poi.po_item_id IS NOT NULL),
//           '[]'::json
//         ) AS items

//       FROM purchase_order po

//       LEFT JOIN purchase_order_item poi
//         ON poi.purchase_order_id = po.purchase_order_id

//       WHERE po.purchase_order_id = $1

//       GROUP BY po.purchase_order_id
//     `,
//     [id]
//   );

//   return result.rows[0] || null;
// };


// /*
//  * Delete Purchase Order.
//  *
//  * Items must be deleted first because
//  * purchase_order_item has a foreign key
//  * referencing purchase_order.
//  */
// const deletePurchaseOrder = async (id) => {
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     await client.query(
//       `
//         DELETE FROM purchase_order_item
//         WHERE purchase_order_id = $1
//       `,
//       [id]
//     );

//     const result = await client.query(
//       `
//         DELETE FROM purchase_order
//         WHERE purchase_order_id = $1
//         RETURNING *
//       `,
//       [id]
//     );

//     await client.query("COMMIT");

//     return result.rows[0] || null;

//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;

//   } finally {
//     client.release();
//   }
// };

// /*
//  * Get vendor addresses for Purchase Order.
//  *
//  * IMPORTANT:
//  * We are NOT changing the Vendor module.
//  *
//  * This query is used only by the Purchase Order module
//  * to get the selected vendor's billing and shipping
//  * address.
//  */
// /*
//  * Get vendor addresses for Purchase Order.
//  *
//  * IMPORTANT:
//  * We are reading the existing vendor_address table.
//  *
//  * We are NOT changing:
//  * - vendor controller
//  * - vendor service
//  * - vendor repository
//  * - vendor table
//  *
//  * This function belongs only to Purchase Order.
//  */
// const getVendorAddressesForPurchaseOrder = async (vendorId) => {

//   /*
//    * Get all addresses belonging to the selected vendor.
//    *
//    * We intentionally fetch ALL address records first.
//    * This helps us support different values such as:
//    *
//    * Billing
//    * billing
//    * BILLING
//    * Billing Address
//    * Billing_Address
//    *
//    * and the same for Shipping.
//    */
//   const result = await pool.query(
//     `
//       SELECT
//         address_type,
//         address_line1,
//         address_line2,
//         city,
//         state,
//         country,
//         pincode,
//         phone,
//         contact_name
//       FROM vendor_address
//       WHERE vendor_id = $1
//       ORDER BY address_type
//     `,
//     [vendorId]
//   );
//   /*
//  * TEMPORARY DEBUGGING
//  *
//  * This tells us exactly what the Purchase Order
//  * module is receiving from vendor_address.
//  */
//   console.log(
//     "========================================"
//   );

//   console.log(
//     "PURCHASE ORDER - VENDOR ADDRESS CHECK"
//   );

//   console.log(
//     "Vendor ID:",
//     vendorId
//   );

//   console.log(
//     "Address rows returned:",
//     result.rows
//   );

//   console.log(
//     "Number of address rows:",
//     result.rows.length
//   );

//   console.log(
//     "========================================"
//   );

//   /*
//    * Helper function to normalize address type.
//    *
//    * Example:
//    *
//    * "Billing Address"
//    * becomes:
//    * "billingaddress"
//    *
//    * "BILLING_ADDRESS"
//    * becomes:
//    * "billingaddress"
//    */
//   const normalizeAddressType = (value) => {

//     return String(value || "")
//       .trim()
//       .toLowerCase()
//       .replace(/[\s_-]+/g, "");

//   };


//   /*
//    * Find billing address.
//    */
//   const billing =
//     result.rows.find((row) => {

//       const type =
//         normalizeAddressType(
//           row.address_type
//         );

//       return (
//         type === "billing" ||
//         type === "billingaddress"
//       );

//     }) || null;


//   /*
//    * Find shipping address.
//    */
//   const shipping =
//     result.rows.find((row) => {

//       const type =
//         normalizeAddressType(
//           row.address_type
//         );

//       return (
//         type === "shipping" ||
//         type === "shippingaddress"
//       );

//     }) || null;


//   /*
//    * Convert database address structure
//    * into the structure expected by
//    * CreatePurchaseOrderPage.jsx.
//    */
//   const formatAddress = (address) => {

//     if (!address) {
//       return null;
//     }


//     return {

//       attention:
//         address.contact_name || "",

//       street1:
//         address.address_line1 || "",

//       street2:
//         address.address_line2 || "",

//       city:
//         address.city || "",

//       state:
//         address.state || "",

//       country:
//         address.country || "",

//       zipCode:
//         address.pincode || "",

//       phone:
//         address.phone || ""

//     };
//   };


//   /*
//    * Return billing and shipping addresses.
//    */
//   return {

//     billing:
//       formatAddress(billing),

//     shipping:
//       formatAddress(shipping)

//   };
// };


// module.exports = {
//   createPurchaseOrder,
//   getAllPurchaseOrders,
//   getPurchaseOrderById,
//   deletePurchaseOrder,
//   getVendorAddressesForPurchaseOrder,
// };

const pool = require('../../../config/database');


// =====================================================
// CREATE PURCHASE ORDER
// =====================================================

async function createPurchaseOrder(client, values) {

    /*
     * Create Purchase Order
     *
     * values contains:
     * {
     *   purchase_order_number,
     *   pr_id,
     *   pr_number,
     *   vendor_id,
     *   vendor_code,
     *   billing_address,
     *   shipping_address,
     *   po_date,
     *   expected_delivery_date,
     *   actual_delivery_date,
     *   delivery_status,
     *   item_count,
     *   item_total,
     *   gst_rate,
     *   gst_amount,
     *   discount_rate,
     *   discount_amount,
     *   estimated_total,
     *   remarks,
     *   created_by
     * }
     */

    const query = `
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
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            $16,
            $17,
            $18,
            $19,
            $20
        )
        RETURNING *;
    `;

    const result = await client.query(query, [
        values.purchase_order_number,
        values.pr_id,
        values.pr_number,
        values.vendor_id,
        values.vendor_code,
        values.billing_address,
        values.shipping_address,
        values.po_date,
        values.expected_delivery_date,
        values.actual_delivery_date,
        values.delivery_status,
        values.item_count,
        values.item_total,
        values.gst_rate,
        values.gst_amount,
        values.discount_rate,
        values.discount_amount,
        values.estimated_total,
        values.remarks,
        values.created_by
    ]);

    return result.rows[0];
}


// =====================================================
// CREATE PURCHASE ORDER ITEM
// =====================================================

async function createPurchaseOrderItem(client, values) {

    const query = `
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
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13
        )
        RETURNING *;
    `;

    const result = await client.query(query, [
        values.purchase_order_id,
        values.reel_id,
        values.reel_spec,
        values.reel_description,
        values.paper_type,
        values.paper_gsm,
        values.reel_width,
        values.reel_bf,
        values.quantity,
        values.unit_rate,
        values.total_amount,
        values.remarks,
        values.created_by
    ]);

    return result.rows[0];
}


// =====================================================
// GET ALL PURCHASE ORDERS
// =====================================================

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
        LEFT JOIN vendor v
            ON po.vendor_id = v.vendor_id
        ORDER BY po.purchase_order_id DESC
    `;

    const { rows } = await pool.query(query);

    return rows;
}


// =====================================================
// GET PURCHASE ORDER BY ID
// =====================================================

async function getPurchaseOrderById(id) {

    const poQuery = `
        SELECT
            po.*,
            v.display_name AS vendor_name,
            v.vendor_code
        FROM purchase_order po
        LEFT JOIN vendor v
            ON po.vendor_id = v.vendor_id
        WHERE po.purchase_order_id = $1
    `;

    const poResult = await pool.query(
        poQuery,
        [id]
    );

    if (poResult.rows.length === 0) {
        return null;
    }

    const itemsQuery = `
        SELECT *
        FROM purchase_order_item
        WHERE purchase_order_id = $1
        ORDER BY po_item_id ASC
    `;

    const itemsResult = await pool.query(
        itemsQuery,
        [id]
    );

    return {
        purchase_order: poResult.rows[0],
        items: itemsResult.rows
    };
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createPurchaseOrder,
    createPurchaseOrderItem,

    getAllPurchaseOrders,
    getPurchaseOrderById

};