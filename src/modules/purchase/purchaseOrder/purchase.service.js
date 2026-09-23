// /*
//  * Purchase Order Service
//  *
//  * Business logic lives here.
//  */

// const pool = require("../../../config/database");

// const repository = require("./purchase.repository");


// /*
//  * Create Purchase Order.
//  */
// const createPurchaseOrder = async (data) => {
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");


//     /*
//      * Make sure items is an array.
//      */
//     const items = Array.isArray(data.items)
//       ? data.items
//       : [];


//     /*
//      * Calculate item totals on the backend.
//      */
//     let itemTotal = 0;
//     let itemCount = 0;


//     for (const item of items) {
//       const quantity = Number(item.quantity || 0);
//       const unitRate = Number(item.unit_rate || 0);

//       itemTotal += quantity * unitRate;
//       itemCount += 1;
//     }


//     /*
//      * Discount calculation.
//      *
//      * discount_rate comes from the frontend.
//      */
//     const discountRate = Number(data.discount_rate || 0);

//     const discountAmount =
//       (itemTotal * discountRate) / 100;


//     /*
//      * GST calculation.
//      *
//      * GST is applied after discount.
//      */
//     const gstRate = Number(data.gst_rate || 0);

//     const taxableAmount =
//       itemTotal - discountAmount;

//     const gstAmount =
//       (taxableAmount * gstRate) / 100;


//     /*
//      * Final Purchase Order amount.
//      */
//     const estimatedTotal =
//       taxableAmount + gstAmount;


//     /*
//      * Prepare data for repository.
//      */
//     const purchaseOrderData = {
//       ...data,

//       items,

//       item_count: itemCount,

//       item_total: itemTotal,

//       discount_rate: discountRate,

//       discount_amount: discountAmount,

//       gst_rate: gstRate,

//       gst_amount: gstAmount,

//       estimated_total: estimatedTotal,
//     };


//     /*
//      * Create PO and PO items.
//      */
//     const purchaseOrder =
//       await repository.createPurchaseOrder(
//         client,
//         purchaseOrderData
//       );


//     await client.query("COMMIT");

//     return purchaseOrder;

//   } catch (error) {

//     await client.query("ROLLBACK");

//     console.error(
//       "Create Purchase Order Service Error:",
//       error
//     );

//     throw error;

//   } finally {

//     client.release();
//   }
// };


// /*
//  * Get all Purchase Orders.
//  */
// const getAllPurchaseOrders = async () => {
//   return repository.getAllPurchaseOrders();
// };


// /*
//  * Get one Purchase Order.
//  */
// const getPurchaseOrderById = async (id) => {
//   return repository.getPurchaseOrderById(id);
// };


// /*
//  * Delete Purchase Order.
//  */
// const deletePurchaseOrder = async (id) => {
//   return repository.deletePurchaseOrder(id);
// };

// /*
//  * Get vendor addresses for Purchase Order.
//  *
//  * This belongs to the Purchase Order module.
//  * The Vendor module is not modified.
//  */
// const getVendorAddressesForPurchaseOrder = async (vendorId) => {

//   if (!vendorId || Number.isNaN(Number(vendorId))) {
//     throw new Error("Invalid vendor ID.");
//   }

//   return repository.getVendorAddressesForPurchaseOrder(
//     Number(vendorId)
//   );
// };


// module.exports = {
//   createPurchaseOrder,
//   getAllPurchaseOrders,
//   getPurchaseOrderById,
//   deletePurchaseOrder,
//   getVendorAddressesForPurchaseOrder,
// };

const pool = require('../../../config/database');

const repository = require('./purchase.repository');


// =====================================================
// CREATE PURCHASE ORDER
// =====================================================

async function createPurchaseOrder(data) {

    const client = await pool.connect();

    try {

        // Start transaction
        await client.query('BEGIN');


        // =================================================
        // CREATE PURCHASE ORDER
        // =================================================

        const purchaseOrder =
            await repository.createPurchaseOrder(
                client,
                data
            );


        // =================================================
        // CREATE PURCHASE ORDER ITEMS
        // =================================================

        const items = Array.isArray(data.items)
            ? data.items
            : [];

        const createdItems = [];

        for (const item of items) {

            const itemData = {

                purchase_order_id:
                    purchaseOrder.purchase_order_id,

                reel_id:
                    item.reel_id ?? null,

                reel_spec:
                    item.reel_spec ?? null,

                reel_description:
                    item.reel_description ?? null,

                paper_type:
                    item.paper_type ?? null,

                paper_gsm:
                    item.paper_gsm ?? null,

                reel_width:
                    item.reel_width ?? null,

                reel_bf:
                    item.reel_bf ?? null,

                quantity:
                    item.quantity ?? 0,

                unit_rate:
                    item.unit_rate ?? 0,

                total_amount:
                    item.total_amount ?? 0,

                remarks:
                    item.remarks ?? null,

                created_by:
                    data.created_by ?? null
            };


            const createdItem =
                await repository.createPurchaseOrderItem(
                    client,
                    itemData
                );


            createdItems.push(createdItem);
        }


        // =================================================
        // COMMIT TRANSACTION
        // =================================================

        await client.query('COMMIT');


        return {
            purchase_order: purchaseOrder,
            items: createdItems
        };

    } catch (error) {

        // Rollback if anything fails
        await client.query('ROLLBACK');

        console.error(
            'Create Purchase Order Service Error:',
            error
        );

        throw error;

    } finally {

        // Release database connection
        client.release();
    }
}


// =====================================================
// GET ALL PURCHASE ORDERS
// =====================================================

async function getAllPurchaseOrders() {

    return await repository.getAllPurchaseOrders();

}


// =====================================================
// GET PURCHASE ORDER BY ID
// =====================================================

async function getPurchaseOrderById(id) {

    return await repository.getPurchaseOrderById(id);

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById

};