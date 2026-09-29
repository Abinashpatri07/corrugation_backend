// =====================================================
// INVENTORY CONSTANTS
// =====================================================

const ITEM_CATEGORY = Object.freeze([
    'Reel',
    'Glue',
    'Paper',
    '2 Ply',
    'Board',
    'Box',
]);


const VALUATION_METHOD = Object.freeze([
    'FIFO',
    'LIFO',
    'Weighted Average',
]);


const ITEM_STATUS = Object.freeze({
    ACTIVE:   'Active',
    INACTIVE: 'Inactive',
});


module.exports = {
    ITEM_CATEGORY,
    VALUATION_METHOD,
    ITEM_STATUS,
};
