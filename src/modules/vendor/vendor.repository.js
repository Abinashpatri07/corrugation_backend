async function createVendor(client, data) {
  const { rows } = await client.query(
    `INSERT INTO vendor
      (vendor_code, vendor_type, primary_salutation, primary_first_name,
       primary_last_name, display_name, company_name, vendor_language,
       email, primary_number, secondary_number, pan, gstin, msme, currency,
       opening_balance, accounts_payable, payment_terms, advance_required, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     RETURNING *`,
    [
      data.vendor_code, data.vendor_type, data.primary_salutation,
      data.primary_first_name, data.primary_last_name, data.display_name,
      data.company_name, data.vendor_language, data.email, data.primary_number,
      data.secondary_number, data.pan, data.gstin || null, data.msme,
      data.currency, data.opening_balance, data.accounts_payable,
      data.payment_terms, data.advance_required, data.status
    ]
  );
  return rows[0];
}

async function updateVendor(client, id, data) {
  const { rows } = await client.query(
    `UPDATE vendor SET
      vendor_type=COALESCE($2,vendor_type),
      primary_salutation=COALESCE($3,primary_salutation),
      primary_first_name=COALESCE($4,primary_first_name),
      primary_last_name=COALESCE($5,primary_last_name),
      display_name=COALESCE($6,display_name),
      company_name=COALESCE($7,company_name),
      vendor_language=COALESCE($8,vendor_language),
      email=COALESCE($9,email),
      primary_number=COALESCE($10,primary_number),
      secondary_number=COALESCE($11,secondary_number),
      pan=COALESCE($12,pan),
      gstin=COALESCE($13,gstin),
      msme=COALESCE($14,msme),
      currency=COALESCE($15,currency),
      opening_balance=COALESCE($16,opening_balance),
      accounts_payable=COALESCE($17,accounts_payable),
      payment_terms=COALESCE($18,payment_terms),
      advance_required=COALESCE($19,advance_required),
      status=COALESCE($20,status),
      updated_at=NOW()
     WHERE vendor_id=$1
     RETURNING *`,
    [id, data.vendor_type, data.primary_salutation, data.primary_first_name,
     data.primary_last_name, data.display_name, data.company_name,
     data.vendor_language, data.email, data.primary_number, data.secondary_number,
     data.pan, data.gstin, data.msme, data.currency, data.opening_balance,
     data.accounts_payable, data.payment_terms, data.advance_required, data.status]
  );
  return rows[0];
}

async function findVendorById(client, id) {
  const { rows } = await client.query(
    `SELECT * FROM vendor WHERE vendor_id=$1`,
    [id]
  );
  return rows[0];
}

async function findVendorByPan(client, pan, excludeId = null) {
  const { rows } = await client.query(
    `SELECT vendor_id FROM vendor WHERE UPPER(pan)=UPPER($1)
     AND ($2::bigint IS NULL OR vendor_id <> $2) LIMIT 1`,
    [pan, excludeId]
  );
  return rows[0];
}

async function findVendorByGstin(client, gstin, excludeId = null) {
  if (!gstin) return null;
  const { rows } = await client.query(
    `SELECT vendor_id FROM vendor WHERE UPPER(gstin)=UPPER($1)
     AND ($2::bigint IS NULL OR vendor_id <> $2) LIMIT 1`,
    [gstin, excludeId]
  );
  return rows[0];
}

async function listVendors(client, { search = '', page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const term = `%${search}%`;

  const data = await client.query(
    `SELECT
       v.vendor_id, v.vendor_code, v.display_name, v.company_name,
       v.gstin, v.primary_first_name, v.primary_last_name,
       v.email, v.primary_number, v.accounts_payable, v.status, v.created_at
     FROM vendor v
     WHERE ($1='' OR v.display_name ILIKE $2 OR v.company_name ILIKE $2
            OR v.vendor_code ILIKE $2 OR v.gstin ILIKE $2)
     ORDER BY v.created_at DESC
     LIMIT $3 OFFSET $4`,
    [search, term, limit, offset]
  );

  const count = await client.query(
    `SELECT COUNT(*)::int AS total FROM vendor v
     WHERE ($1='' OR v.display_name ILIKE $2 OR v.company_name ILIKE $2
            OR v.vendor_code ILIKE $2 OR v.gstin ILIKE $2)`,
    [search, term]
  );

  return { rows: data.rows, total: count.rows[0].total };
}

async function createAddress(client, vendorId, a) {
  const { rows } = await client.query(
    `INSERT INTO vendor_address
      (vendor_id,address_type,address_line1,address_line2,city,state,country,pincode,contact_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [vendorId,a.address_type,a.address_line1,a.address_line2 || null,a.city,
     a.state,a.country || 'India',a.pincode,a.contact_name || null]
  );
  return rows[0];
}

async function createContact(client, vendorId, c) {
  const { rows } = await client.query(
    `INSERT INTO vendor_contact
      (vendor_id,salutation,first_name,last_name,designation,department,phone,email,is_primary)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [vendorId,c.salutation || null,c.first_name,c.last_name || null,
     c.designation || null,c.department || null,c.phone,c.email || null,c.is_primary]
  );
  return rows[0];
}

async function createBank(client, vendorId, b) {
  const { rows } = await client.query(
    `INSERT INTO vendor_bank
      (vendor_id,bank_name,account_holder_name,account_number,ifsc_code,open_date,is_primary)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [vendorId,b.bank_name,b.account_holder_name,b.account_number,b.ifsc_code,
     b.open_date || null,b.is_primary]
  );
  return rows[0];
}

async function createDocument(client, vendorId, d) {
  const { rows } = await client.query(
    `INSERT INTO vendor_document
      (vendor_id,document_type,document_number,document_url)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [vendorId,d.document_type,d.document_number || null,d.document_url || null]
  );
  return rows[0];
}

async function createReelSpecification(client, vendorId, r) {
  const { rows } = await client.query(
    `INSERT INTO reel_specification
      (vendor_id,material_code,material_name,gsm_min,gsm_max,
       reel_width_min,reel_width_max,quality_score,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [vendorId,r.material_code,r.material_name,r.gsm_min,r.gsm_max,
     r.reel_width_min,r.reel_width_max,r.quality_score,r.status]
  );
  return rows[0];
}

async function getVendorAddresses(client, vendorId) {
  const { rows } = await client.query(
    `SELECT * FROM vendor_address WHERE vendor_id=$1 ORDER BY address_type`, [vendorId]
  );
  return rows;
}

async function getVendorContacts(client, vendorId) {
  const { rows } = await client.query(
    `SELECT * FROM vendor_contact WHERE vendor_id=$1 ORDER BY is_primary DESC, contact_id`, [vendorId]
  );
  return rows;
}

async function getVendorBanks(client, vendorId) {
  const { rows } = await client.query(
    `SELECT * FROM vendor_bank WHERE vendor_id=$1 ORDER BY is_primary DESC, bank_id`, [vendorId]
  );
  return rows;
}

async function getVendorDocuments(client, vendorId) {
  const { rows } = await client.query(
    `SELECT * FROM vendor_document WHERE vendor_id=$1 ORDER BY document_id DESC`, [vendorId]
  );
  return rows;
}

async function getReelSpecifications(client, vendorId, search = '') {
  const term = `%${search}%`;
  const { rows } = await client.query(
    `SELECT * FROM reel_specification
     WHERE vendor_id=$1
       AND ($2='' OR material_code ILIKE $3 OR material_name ILIKE $3)
     ORDER BY reel_specification_id DESC`,
    [vendorId, search, term]
  );
  return rows;
}

async function getOrderHistory(client, vendorId, { search = '', from = null, to = null } = {}) {
  const term = `%${search}%`;
  const { rows } = await client.query(
    `SELECT
       po.purchase_order_id,
       po.po_number,
       po.po_date,
       poi.material_description,
       poi.quantity,
       poi.unit,
       poi.value,
       po.delivery_status,
       po.qc_status
     FROM purchase_order po
     JOIN purchase_order_item poi ON poi.purchase_order_id=po.purchase_order_id
     WHERE po.vendor_id=$1
       AND ($2='' OR po.po_number ILIKE $3 OR poi.material_description ILIKE $3)
       AND ($4::date IS NULL OR po.po_date >= $4)
       AND ($5::date IS NULL OR po.po_date <= $5)
     ORDER BY po.po_date DESC, po.purchase_order_id DESC`,
    [vendorId, search, term, from, to]
  );
  return rows;
}

async function getVendorSummary(client, vendorId) {
  // Use independent aggregates so joining PO items and bill items does not
  // multiply amounts when a PO contains multiple items/bills.
  const { rows } = await client.query(
    `SELECT
       (SELECT COUNT(*) FROM purchase_order WHERE vendor_id=$1)::int AS total_orders,
       COALESCE((
         SELECT SUM(poi.value)
         FROM purchase_order_item poi
         JOIN purchase_order po ON po.purchase_order_id=poi.purchase_order_id
         WHERE po.vendor_id=$1
       ),0)::numeric AS total_purchase_value,
       COALESCE((
         SELECT SUM(bi.amount)
         FROM bill_item bi
         JOIN bill b ON b.bill_id=bi.bill_id
         WHERE b.vendor_id=$1 AND b.status='Pending'
       ),0)::numeric AS outstanding_value,
       COALESCE((
         SELECT AVG(po.on_time_percent)
         FROM purchase_order po
         WHERE po.vendor_id=$1 AND po.on_time_percent IS NOT NULL
       ),0)::numeric AS on_time_delivery,
       COALESCE((
         SELECT COUNT(*) FILTER (WHERE po.qc_status LIKE 'Rejected%') * 100.0
                / NULLIF(COUNT(*),0)
         FROM purchase_order po
         WHERE po.vendor_id=$1
       ),0)::numeric AS qc_rejection_rate`,
    [vendorId]
  );
  return rows[0];
}

async function deleteVendor(client, id) {
  const result = await client.query(`DELETE FROM vendor WHERE vendor_id=$1`, [id]);
  return result.rowCount > 0;
}

module.exports = {
  createVendor, updateVendor, findVendorById, findVendorByPan, findVendorByGstin,
  listVendors, createAddress, createContact, createBank, createDocument,
  createReelSpecification, getVendorAddresses, getVendorContacts, getVendorBanks,
  getVendorDocuments, getReelSpecifications, getOrderHistory, getVendorSummary,
  deleteVendor,
};
