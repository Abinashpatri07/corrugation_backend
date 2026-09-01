const express = require('express');

const router = express.Router();

const controller =
    require('./customer.controller');

const {
    createCustomerValidator
} = require('./customer.validation');

const validateRequest =
    require('../../middleware/validation.middleware');

router.post(
    '/',
    createCustomerValidator,
    validateRequest,
    controller.createCustomer
);

module.exports = router;