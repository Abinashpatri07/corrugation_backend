// =====================================================
// INVENTORY ITEM CODE GENERATOR
// =====================================================
// Generates a unique business code for each Inventory
// Item.
// Example: ITEM-000001
//
// The sequence must exist in PostgreSQL:
//     inventory_item_code_seq
//
// Run once in DB if not present:
//     CREATE SEQUENCE inventory_item_code_seq START 1;
// =====================================================

async function generateItemCode(client) {

    const result = await client.query(`
        SELECT nextval('inventory_item_code_seq') AS sequence_no
    `);

    const sequenceNo = result.rows[0].sequence_no;

    return `ITEM-${String(sequenceNo).padStart(6, '0')}`;
}


module.exports = {
    generateItemCode
};
