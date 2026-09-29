const express = require('express');

const router = express.Router();

const controller = require('./inventory.controller');

const {
    createInventoryItemValidator,
    inventoryItemListValidator,
    inventoryItemDetailsValidator,
} = require('./inventory.validation');

const validateRequest =
    require('../../middleware/validation.middleware');


// =====================================================
// CREATE INVENTORY ITEM
// =====================================================
//
// POST /api/v1/inventory/items
// =====================================================

router.post(
    '/items',
    createInventoryItemValidator,
    validateRequest,
    controller.createInventoryItem
);


// =====================================================
// INVENTORY ITEMS LIST
// =====================================================
//
// GET /api/v1/inventory/items
//
// Query params:
//   page, limit, search, category, sortBy, sortOrder
// =====================================================

router.get(
    '/items',
    inventoryItemListValidator,
    validateRequest,
    controller.getInventoryItems
);


// =====================================================
// INVENTORY ITEM DETAILS
// =====================================================
//
// GET /api/v1/inventory/items/:itemId
// =====================================================

router.get(
    '/items/:itemId',
    inventoryItemDetailsValidator,
    validateRequest,
    controller.getInventoryItemDetails
);


// =====================================================
// CREATE INVENTORY CONTROL (ADJUSTMENT)
// =====================================================
//
// POST /api/v1/inventory/control
// =====================================================

router.post(
    '/control',
    // createInventoryControlValidator, // to be implemented
    // validateRequest,
    controller.createInventoryControl
);

module.exports = router;
