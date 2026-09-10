async function generateVendorCode(client) {
  const { rows } = await client.query(
    `SELECT nextval('vendor_code_seq') AS seq`
  );

  return `VEND-${String(rows[0].seq).padStart(6, '0')}`;
}

module.exports = { generateVendorCode };