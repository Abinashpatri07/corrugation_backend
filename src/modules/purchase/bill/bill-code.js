/*
 * Bill SQL Queries
 */

const CREATE_BILL = `
  INSERT INTO bill (
    bill_number,
    purchase_order_id,
    vendor_id,
    vendor_code,
    billing_address,
    shipping_address,
    bill_date,
    due_date,
    delivery_status,
    grn_status,
    item_count,
    item_total,
    gst_rate,
    gst_amount,
    discount_rate,
    discount_amount,
    total_amount,
    remarks,
    created_by
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8,
    $9, $10, $11, $12, $13, $14, $15, $16,
    $17, $18, $19
  )
  RETURNING *
`;


const CREATE_BILL_ITEM = `
  INSERT INTO bill_item (
    bill_id,
    reel_id,
    reel_spec,
    reel_description,
    quantity,
    unit_rate,
    total_amount,
    remarks,
    created_by
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
  )
  RETURNING *
`;


const GET_ALL_BILLS = `
  SELECT
    b.*,
    v.vendor_code AS vendor_code_from_vendor
  FROM bill b
  LEFT JOIN vendor v
    ON b.vendor_id = v.vendor_id
  ORDER BY b.created_at DESC
`;


const GET_BILL_BY_ID = `
  SELECT
    b.*,
    v.vendor_code AS vendor_code_from_vendor
  FROM bill b
  LEFT JOIN vendor v
    ON b.vendor_id = v.vendor_id
  WHERE b.bill_id = $1
`;


const GET_BILL_ITEMS = `
  SELECT
    *
  FROM bill_item
  WHERE bill_id = $1
  ORDER BY bill_item_id ASC
`;


const GET_VENDOR_BY_ID = `
  SELECT
    vendor_id,
    vendor_code,
    display_name,
    company_name,
    gstin,
    primary_first_name,
    primary_number
  FROM vendor
  WHERE vendor_id = $1
`;


const GET_PURCHASE_ORDER_BY_ID = `
  SELECT *
  FROM purchase_order
  WHERE purchase_order_id = $1
`;


const UPDATE_BILL = `
  UPDATE bill
  SET
    purchase_order_id = $1,
    vendor_id = $2,
    vendor_code = $3,
    billing_address = $4,
    shipping_address = $5,
    bill_date = $6,
    due_date = $7,
    delivery_status = $8,
    grn_status = $9,
    item_count = $10,
    item_total = $11,
    gst_rate = $12,
    gst_amount = $13,
    discount_rate = $14,
    discount_amount = $15,
    total_amount = $16,
    remarks = $17,
    modified_by = $18,
    modified_at = CURRENT_TIMESTAMP
  WHERE bill_id = $19
  RETURNING *
`;


const DELETE_BILL_ITEMS = `
  DELETE FROM bill_item
  WHERE bill_id = $1
`;


const DELETE_BILL = `
  DELETE FROM bill
  WHERE bill_id = $1
  RETURNING *
`;


module.exports = {
  CREATE_BILL,
  CREATE_BILL_ITEM,
  GET_ALL_BILLS,
  GET_BILL_BY_ID,
  GET_BILL_ITEMS,
  GET_VENDOR_BY_ID,
  GET_PURCHASE_ORDER_BY_ID,
  UPDATE_BILL,
  DELETE_BILL_ITEMS,
  DELETE_BILL
};