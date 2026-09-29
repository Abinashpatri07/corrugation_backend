const pool       = require('../../config/database');
const repository = require('./inventory.repository');

const {
    generateItemCode,
} = require('./inventory-code');


// =====================================================
// CREATE INVENTORY ITEM
// =====================================================
//
// Creates the master inventory_item record and the
// matching category-specific spec row in a single
// database transaction.
//
// If any insert fails the whole creation is rolled back
// so that partial data never remains in the database.
// =====================================================

async function createInventoryItem(data) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');


        // -------------------------------------------------
        // Duplicate item-name check
        // -------------------------------------------------

        const existing =
            await repository.findItemByName(
                client,
                data.itemName
            );

        if (existing) {

            const error = new Error(
                `Inventory item already exists with name "${data.itemName}"`
            );

            error.statusCode = 409;

            throw error;
        }


        // -------------------------------------------------
        // Generate item code  (ITEM-000001)
        // -------------------------------------------------

        const itemCode =
            await generateItemCode(client);


        // -------------------------------------------------
        // Insert master record
        // -------------------------------------------------

        const item =
            await repository.createInventoryItem(
                client,
                { ...data, itemCode }
            );

        const invItemId = item.invItemId;


        // -------------------------------------------------
        // Insert category-specific specification
        // -------------------------------------------------

        switch (data.category) {

            case 'Reel':
                if (data.reelSpec) {
                    await repository.createReelSpec(
                        client,
                        invItemId,
                        data.reelSpec
                    );
                }
                break;

            case 'Glue':
                if (data.glueSpec) {
                    await repository.createGlueSpec(
                        client,
                        invItemId,
                        data.glueSpec
                    );
                }
                break;

            case 'Paper':
                if (data.paperSpec) {
                    await repository.createPaperSpec(
                        client,
                        invItemId,
                        data.paperSpec
                    );
                }
                break;

            case '2 Ply':
                if (data.twoPlySpc) {
                    await repository.createTwoPlySpec(
                        client,
                        invItemId,
                        data.twoPlySpc
                    );
                }
                break;

            case 'Board':
                if (data.boardSpec) {
                    await repository.createBoardSpec(
                        client,
                        invItemId,
                        data.boardSpec
                    );
                }
                break;

            case 'Box':
                if (data.boxSpec) {
                    await repository.createBoxSpec(
                        client,
                        invItemId,
                        data.boxSpec
                    );
                }
                break;

            default:
                break;
        }


        // -------------------------------------------------
        // Commit
        // -------------------------------------------------

        await client.query('COMMIT');

        return {
            invItemId: item.invItemId,
            itemCode:  item.itemCode,
        };

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
}


// =====================================================
// GET INVENTORY ITEMS LIST
// =====================================================

async function getInventoryItems(params = {}) {

    const page  = Number(params.page)  || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    const search    = params.search    || '';
    const category  = params.category  || '';
    const sortBy    = params.sortBy    || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const result =
        await repository.getInventoryItems({
            page,
            limit,
            offset,
            search,
            category,
            sortBy,
            sortOrder,
        });

    return {
        data: result.rows,

        pagination: {
            page,
            limit,
            totalRecords: result.totalRecords,
            totalPages:   Math.ceil(result.totalRecords / limit),
        },
    };
}


// =====================================================
// GET INVENTORY ITEM DETAILS
// =====================================================

async function getInventoryItemDetails(invItemId) {

    const item =
        await repository.getInventoryItemById(invItemId);

    if (!item) {

        const error = new Error('Inventory item not found');

        error.statusCode = 404;

        throw error;
    }


    // -------------------------------------------------
    // Fetch category-specific specification
    // -------------------------------------------------

    let spec = null;

    switch (item.category) {

        case 'Reel':
            spec = await repository.getReelSpec(invItemId);
            break;

        case 'Glue':
            spec = await repository.getGlueSpec(invItemId);
            break;

        case 'Paper':
            spec = await repository.getPaperSpec(invItemId);
            break;

        case '2 Ply':
            spec = await repository.getTwoPlySpec(invItemId);
            break;

        case 'Board':
            spec = await repository.getBoardSpec(invItemId);
            break;

        case 'Box':
            spec = await repository.getBoxSpec(invItemId);
            break;

        default:
            break;
    }


    return {
        item,
        spec,
    };
}


// =====================================================
// CREATE INVENTORY CONTROL (ADJUSTMENT)
// =====================================================

async function createInventoryControl(data) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert Master Record
        const adjustment = await repository.createInventoryAdjustment(client, data);
        const adjId = adjustment.adjId;

        // 2. Insert Items and Update Stock
        if (data.items && Array.isArray(data.items)) {
            for (const item of data.items) {
                // Insert child record
                await repository.createInventoryAdjustmentItem(client, adjId, item);
                
                // Update master inventory item stock
                if (item.newQuantity != null) {
                    await repository.updateInventoryItemStock(client, item.invItemId, item.newQuantity);
                }
            }
        }

        await client.query('COMMIT');

        return {
            adjId,
            message: 'Inventory control adjustment processed successfully',
        };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}


module.exports = {
    createInventoryItem,
    getInventoryItems,
    getInventoryItemDetails,
    createInventoryControl,
};
