const { body, query, param } = require('express-validator');

const { ITEM_CATEGORY } = require('./inventory.constant');


// =====================================================
// CREATE INVENTORY ITEM VALIDATOR
// =====================================================
//
// Validates the payload sent by CreateInventoryItemPage.
// camelCase fields from frontend → mapped to snake_case
// DB columns in the service/repository layer.
// =====================================================

const createInventoryItemValidator = [

    // -------------------------------------------------
    // Basic Information
    // -------------------------------------------------

    body('itemName')
        .trim()
        .notEmpty()
        .withMessage('Item name is required')
        .isLength({ max: 150 })
        .withMessage('Item name cannot exceed 150 characters'),

    body('itemDesc')
        .optional({ nullable: true })
        .isString()
        .withMessage('Item description must be a string'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isIn(ITEM_CATEGORY)
        .withMessage(`Category must be one of: ${ITEM_CATEGORY.join(', ')}`),

    body('unit')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 30 })
        .withMessage('Unit cannot exceed 30 characters'),

    body('brand')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 })
        .withMessage('Brand cannot exceed 100 characters'),

    body('frontView')
        .optional({ nullable: true })
        .isString(),

    body('rearView')
        .optional({ nullable: true })
        .isString(),


    // -------------------------------------------------
    // Purchase Information
    // -------------------------------------------------

    body('purPrice')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Purchase price must be a non-negative number'),

    body('purAccount')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 }),

    body('purDesc')
        .optional({ nullable: true })
        .isString(),

    body('purVendor')
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage('Preferred vendor must be a valid ID'),


    // -------------------------------------------------
    // Sales Information
    // -------------------------------------------------

    body('sellingPrice')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Selling price must be a non-negative number'),

    body('sellingAccount')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 }),

    body('sellingDescription')
        .optional({ nullable: true })
        .isString(),


    // -------------------------------------------------
    // Inventory Accounting
    // -------------------------------------------------

    body('inventoryAccount')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 }),

    body('openingStock')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Opening stock must be a non-negative number'),

    body('openingStockRate')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Opening stock rate must be a non-negative number'),


    // -------------------------------------------------
    // Reel Specification (only when category = 'Reel')
    // -------------------------------------------------

    body('reelSpec.reelType')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 50 }),

    body('reelSpec.reelSize')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('reelSpec.reelGsm')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('reelSpec.reelBf')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),


    // -------------------------------------------------
    // Glue Specification (only when category = 'Glue')
    // -------------------------------------------------

    body('glueSpec.glueTensile')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('glueSpec.gluePeel')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('glueSpec.glueShear')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),


    // -------------------------------------------------
    // Paper Specification (only when category = 'Paper')
    // -------------------------------------------------

    body('paperSpec.paperGsm')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('paperSpec.paperBf')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('paperSpec.paperLength')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('paperSpec.paperWidth')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),


    // -------------------------------------------------
    // 2-Ply Specification (only when category = '2 Ply')
    // -------------------------------------------------

    body('twoPlySpc.plyPly')
        .optional({ nullable: true })
        .isInt({ min: 0 }),

    body('twoPlySpc.plyBf')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('twoPlySpc.plyLength')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('twoPlySpc.plyWidth')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),


    // -------------------------------------------------
    // Board Specification (only when category = 'Board')
    // -------------------------------------------------

    body('boardSpec.boardPly')
        .optional({ nullable: true })
        .isInt({ min: 0 }),

    body('boardSpec.boardBf')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('boardSpec.boardLength')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('boardSpec.boardWidth')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),


    // -------------------------------------------------
    // Box Specification (only when category = 'Box')
    // -------------------------------------------------

    body('boxSpec.boxType')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 50 }),

    body('boxSpec.boxPaper')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 }),

    body('boxSpec.boxPly')
        .optional({ nullable: true })
        .isInt({ min: 0 }),

    body('boxSpec.boxBf')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('boxSpec.boxLength')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('boxSpec.boxWidth')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),

    body('boxSpec.boxHeight')
        .optional({ nullable: true })
        .isFloat({ min: 0 }),
];


// =====================================================
// INVENTORY ITEM LIST VALIDATOR
// =====================================================

const inventoryItemListValidator = [

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('search')
        .optional()
        .isString(),

    query('category')
        .optional()
        .isString(),

    query('sortBy')
        .optional()
        .isString(),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),
];


// =====================================================
// INVENTORY ITEM DETAILS VALIDATOR
// =====================================================

const inventoryItemDetailsValidator = [

    param('itemId')
        .isInt({ min: 1 })
        .withMessage('Item ID must be a positive integer'),
];


module.exports = {
    createInventoryItemValidator,
    inventoryItemListValidator,
    inventoryItemDetailsValidator,
};
