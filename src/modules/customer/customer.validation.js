const {body, query, param} = require('express-validator');


// =====================================================
// CREATE CUSTOMER VALIDATION
// =====================================================

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


// =====================================================
// CUSTOMER LIST VALIDATION
// =====================================================

const customerListValidator = [

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
        .trim(),

    query('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE'])
        .withMessage('Invalid customer status'),

    query('sortBy')
        .optional()
        .isIn([
            'displayName',
            'gstin',
            'email',
            'phone',
            'status',
            'createdAt'
        ])
        .withMessage('Invalid sort field'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc')
];

// =====================================================
// CUSTOMER DETAILS VALIDATION
// =====================================================

const customerDetailsValidator = [

    param('customerId')
        .notEmpty()
        .withMessage('Customer ID is required')
        .isInt({ min: 1 })
        .withMessage('Customer ID must be a positive integer')
];


module.exports = {
    createCustomerValidator,
    customerListValidator,
    customerDetailsValidator
};