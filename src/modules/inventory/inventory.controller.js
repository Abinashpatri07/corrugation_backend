const inventoryService = require('./inventory.service');


// =====================================================
// CREATE INVENTORY ITEM
// =====================================================

async function createInventoryItem(req, res, next) {

    try {

        const result =
            await inventoryService.createInventoryItem(req.body);

        return res.status(201).json({
            success: true,
            message: 'Inventory item created successfully',
            data:    result,
        });

    } catch (error) {

        next(error);
    }
}


// =====================================================
// GET INVENTORY ITEMS LIST
// =====================================================

async function getInventoryItems(req, res, next) {

    try {

        const result =
            await inventoryService.getInventoryItems(req.query);

        return res.status(200).json({
            success:    true,
            message:    'Inventory items fetched successfully',
            data:       result.data,
            pagination: result.pagination,
        });

    } catch (error) {

        next(error);
    }
}


// =====================================================
// GET INVENTORY ITEM DETAILS
// =====================================================

async function getInventoryItemDetails(req, res, next) {

    try {

        const invItemId = Number(req.params.itemId);

        const result =
            await inventoryService.getInventoryItemDetails(invItemId);

        return res.status(200).json({
            success: true,
            message: 'Inventory item details fetched successfully',
            data:    result,
        });

    } catch (error) {

        next(error);
    }
}


// =====================================================
// CREATE INVENTORY CONTROL (ADJUSTMENT)
// =====================================================

async function createInventoryControl(req, res, next) {
    try {
        const result = await inventoryService.createInventoryControl(req.body);

        return res.status(201).json({
            success: true,
            message: 'Inventory control/adjustment created successfully',
            data: result,
        });

    } catch (error) {
        next(error);
    }
}


async function getInventoryControls(req, res, next) {
    try {
        const result = await inventoryService.getInventoryControls(req.query);
        return res.status(200).json({
            success: true,
            message: 'Inventory controls fetched successfully',
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}

async function getInventoryControlDetails(req, res, next) {
    try {
        const adjId = Number(req.params.adjId);
        const result = await inventoryService.getInventoryControlDetails(adjId);
        return res.status(200).json({
            success: true,
            message: 'Inventory control details fetched successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    createInventoryItem,
    getInventoryItems,
    getInventoryItemDetails,
    createInventoryControl,
    getInventoryControls,
    getInventoryControlDetails,
};
