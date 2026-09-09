const express = require('express');

const router = express.Router();

const controller = require('./customer.controller');

const {
    createCustomerValidator,
    customerListValidator,
    customerDetailsValidator
} = require('./customer.validation');

const validateRequest =
    require('../../middleware/validation.middleware');


// =====================================================
// CREATE CUSTOMER
// =====================================================

router.post(
    '/',
    createCustomerValidator,
    validateRequest,
    controller.createCustomer
);


// =====================================================
// CUSTOMER LIST
// =====================================================

router.get(
    '/',
    customerListValidator,
    validateRequest,
    controller.getCustomers
);


// =====================================================
// CUSTOMER DETAILS / OVERVIEW
// =====================================================

router.get(
    '/:customerId',
    customerDetailsValidator,
    validateRequest,
    controller.getCustomerDetails
);


// =====================================================
// CUSTOMER BOX SPECIFICATIONS
// =====================================================

router.get(
    '/:customerId/box-specifications',
    customerDetailsValidator,
    validateRequest,
    controller.getCustomerBoxSpecifications
);


// =====================================================
// CUSTOMER ORDER HISTORY
// =====================================================

router.get(
    '/:customerId/order-history',
    customerDetailsValidator,
    validateRequest,
    controller.getCustomerOrderHistory
);


// =====================================================
// CUSTOMER INVOICE
// =====================================================

router.get(
    '/:customerId/invoice',
    customerDetailsValidator,
    validateRequest,
    controller.getCustomerInvoice
);


module.exports = router;