async function generateCustomerCode(client) {
    const result = await client.query(`
        SELECT nextval('customer_code_seq') AS sequence_no
    `);

    const sequenceNo = result.rows[0].sequence_no;

    return `CUS-${String(sequenceNo).padStart(6, '0')}`;
}

module.exports = {
    generateCustomerCode
};