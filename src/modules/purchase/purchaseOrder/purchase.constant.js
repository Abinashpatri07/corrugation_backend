// purchase.constant.js

/**
 * Delivery status values.
 *
 * These should match the values your frontend/backend expects.
 */

const DELIVERY_STATUS = {
    PENDING: 'PENDING',
    PARTIAL: 'PARTIAL',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
};

const DEFAULT_DELIVERY_STATUS = DELIVERY_STATUS.PENDING;

module.exports = {
    DELIVERY_STATUS,
    DEFAULT_DELIVERY_STATUS
};