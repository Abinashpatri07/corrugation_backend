/*
 * Bill Repository
 *
 * Database operations for Bill module.
 */

const pool = require("../../../config/database");

const queries = require("./bill-code");


/*
 * Get vendor.
 */
const getVendorById = async (vendorId, client = pool) => {

  const result = await client.query(
    queries.GET_VENDOR_BY_ID,
    [vendorId]
  );

  return result.rows[0] || null;
};


/*
 * Get purchase order.
 */
const getPurchaseOrderById = async (
  purchaseOrderId,
  client = pool
) => {

  const result = await client.query(
    queries.GET_PURCHASE_ORDER_BY_ID,
    [purchaseOrderId]
  );

  return result.rows[0] || null;
};


/*
 * Create bill.
 */
const createBill = async (billData, client) => {

  const values = [
    billData.billNumber,
    billData.purchaseOrderId,
    billData.vendorId,
    billData.vendorCode || null,
    billData.billingAddress || null,
    billData.shippingAddress || null,
    billData.billDate,
    billData.dueDate || null,
    billData.deliveryStatus || "PENDING",
    billData.grnStatus || "PENDING",
    billData.itemCount || 0,
    billData.itemTotal || 0,
    billData.gstRate || 0,
    billData.gstAmount || 0,
    billData.discountRate || 0,
    billData.discountAmount || 0,
    billData.totalAmount || 0,
    billData.remarks || null,
    billData.createdBy || null
  ];

  const result = await client.query(
    queries.CREATE_BILL,
    values
  );

  return result.rows[0];
};


/*
 * Create bill item.
 */
const createBillItem = async (itemData, client) => {

  const values = [
    itemData.billId,
    itemData.reelId || null,
    itemData.reelSpec || null,
    itemData.reelDescription || null,
    itemData.quantity || 0,
    itemData.unitRate || 0,
    itemData.totalAmount || 0,
    itemData.remarks || null,
    itemData.createdBy || null
  ];

  const result = await client.query(
    queries.CREATE_BILL_ITEM,
    values
  );

  return result.rows[0];
};


/*
 * Get all bills.
 */
const getAllBills = async () => {

  const result = await pool.query(
    queries.GET_ALL_BILLS
  );

  return result.rows;
};


/*
 * Get bill by ID.
 */
const getBillById = async (billId) => {

  const result = await pool.query(
    queries.GET_BILL_BY_ID,
    [billId]
  );

  return result.rows[0] || null;
};


/*
 * Get bill items.
 */
const getBillItems = async (billId) => {

  const result = await pool.query(
    queries.GET_BILL_ITEMS,
    [billId]
  );

  return result.rows;
};


/*
 * Update bill.
 */
const updateBill = async (billId, billData) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const values = [
      billData.purchaseOrderId,
      billData.vendorId,
      billData.vendorCode || null,
      billData.billingAddress || null,
      billData.shippingAddress || null,
      billData.billDate,
      billData.dueDate || null,
      billData.deliveryStatus || "PENDING",
      billData.grnStatus || "PENDING",
      billData.itemCount || 0,
      billData.itemTotal || 0,
      billData.gstRate || 0,
      billData.gstAmount || 0,
      billData.discountRate || 0,
      billData.discountAmount || 0,
      billData.totalAmount || 0,
      billData.remarks || null,
      billData.modifiedBy || null,
      billId
    ];

    const billResult = await client.query(
      queries.UPDATE_BILL,
      values
    );

    if (billResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      queries.DELETE_BILL_ITEMS,
      [billId]
    );

    for (const item of billData.items || []) {

      await createBillItem(
        {
          ...item,
          billId,
          createdBy: billData.modifiedBy
        },
        client
      );
    }

    await client.query("COMMIT");

    return billResult.rows[0];

  } catch (error) {

    await client.query("ROLLBACK");
    throw error;

  } finally {

    client.release();
  }
};


/*
 * Delete bill.
 */
const deleteBill = async (billId) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    await client.query(
      queries.DELETE_BILL_ITEMS,
      [billId]
    );

    const result = await client.query(
      queries.DELETE_BILL,
      [billId]
    );

    await client.query("COMMIT");

    return result.rows[0] || null;

  } catch (error) {

    await client.query("ROLLBACK");
    throw error;

  } finally {

    client.release();
  }
};


module.exports = {
  getVendorById,
  getPurchaseOrderById,
  createBill,
  createBillItem,
  getAllBills,
  getBillById,
  getBillItems,
  updateBill,
  deleteBill
};