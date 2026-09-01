const { body } = require('express-validator');

const createCustomerValidator = [
    body('customerType')
        .notEmpty()
        .withMessage('Customer type is required')
        .isIn(['Business', 'Individual'])
        .withMessage('Invalid customer type'),

    body('displayName')
        .trim()
        .notEmpty()
        .withMessage('Display name is required'),

    body('companyName')
        .optional()
        .trim(),

    body('emailAddress')
        .trim()
        .notEmpty()
        .withMessage('Email address is required')
        .isEmail()
        .withMessage('Invalid email address'),

    body('primaryNumber')
        .trim()
        .notEmpty()
        .withMessage('Primary number is required'),

    body('secondaryNumber')
        .optional()
        .trim(),

    body('pan')
        .trim()
        .notEmpty()
        .withMessage('PAN is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('PAN must be 10 characters'),

    body('gstin')
        .optional()
        .trim()
        .isLength({ min: 15, max: 15 })
        .withMessage('GSTIN must be 15 characters'),

    body('msme')
        .trim()
        .notEmpty()
        .withMessage('MSME is required'),

    body('currencyCode')
        .trim()
        .notEmpty()
        .withMessage('Currency is required'),

    body('openingBalance')
        .optional()
        .isFloat()
        .withMessage('Opening balance must be numeric'),

    body('billingAddress')
        .notEmpty()
        .withMessage('Billing address is required'),

    body('shippingAddress')
        .notEmpty()
        .withMessage('Shipping address is required')
];

module.exports = {
    createCustomerValidator
};