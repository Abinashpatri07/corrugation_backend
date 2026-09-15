// =====================================================
// VENDOR CODE GENERATOR
// =====================================================
// Generates a unique business code for each Vendor.
// Example: VEND-000001
//
// The sequence must exist in PostgreSQL:
//     vendor_code_seq
// =====================================================

async function generateVendorCode(client) {

    const result = await client.query(`
        SELECT nextval('vendor_code_seq') AS sequence_no
    `);

    const sequenceNo = result.rows[0].sequence_no;

    return `VEND-${String(sequenceNo).padStart(6, '0')}`;
}


module.exports = {
    generateVendorCode
};