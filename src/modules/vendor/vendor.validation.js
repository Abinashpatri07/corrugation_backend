const { body, query, param } = require('express-validator');


// =====================================================
// CREATE VENDOR VALIDATION
// =====================================================
//
// The frontend CreateVendorPage sends camelCase fields.
// These validators therefore validate the API payload used
// by the frontend rather than the PostgreSQL column names.
//
// The service layer maps these fields to the database's
// snake_case columns.
// =====================================================

const createVendorValidator = [

    body('vendorType')
        .optional({ nullable: true })
        .isString()
        .withMessage('Vendor type must be a string')
        .isLength({ max: 50 })
        .withMessage('Vendor type cannot exceed 50 characters'),

    body('primaryContactPrefix')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 20 })
        .withMessage('Primary contact prefix cannot exceed 20 characters'),

    body('primaryContactFirstName')
        .trim()
        .notEmpty()
        .withMessage('Primary contact first name is required')
        .isLength({ max: 100 })
        .withMessage('Primary contact first name cannot exceed 100 characters'),

    body('primaryContactLastName')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 })
        .withMessage('Primary contact last name cannot exceed 100 characters'),

    body('displayName')
        .trim()
        .notEmpty()
        .withMessage('Display name is required')
        .isLength({ max: 200 })
        .withMessage('Display name cannot exceed 200 characters'),

    body('companyName')
        .trim()
        .notEmpty()
        .withMessage('Company name is required')
        .isLength({ max: 200 })
        .withMessage('Company name cannot exceed 200 characters'),

    body('vendorLanguage')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 50 })
        .withMessage('Vendor language cannot exceed 50 characters'),

    body('emailAddress')
        .trim()
        .notEmpty()
        .withMessage('Email address is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 200 })
        .withMessage('Email address cannot exceed 200 characters'),

    body('primaryNumber')
        .trim()
        .notEmpty()
        .withMessage('Primary phone number is required')
        .isLength({ max: 30 })
        .withMessage('Primary phone number cannot exceed 30 characters'),

    body('secondaryNumber')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 30 })
        .withMessage('Secondary phone number cannot exceed 30 characters'),

    body('pan')
        .trim()
        .notEmpty()
        .withMessage('PAN is required')
        .isLength({ max: 20 })
        .withMessage('PAN cannot exceed 20 characters'),

    body('gstin')
        .optional({ nullable: true })
        .isLength({ max: 20 })
        .withMessage('GSTIN cannot exceed 20 characters'),

    body('msme')
        .trim()
        .notEmpty()
        .withMessage('MSME value is required')
        .isLength({ max: 100 })
        .withMessage('MSME cannot exceed 100 characters'),

    body('currencyCode')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 10 })
        .withMessage('Currency code cannot exceed 10 characters'),

    body('openingBalance')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Opening balance must be a non-negative number'),

    body('paymentTermsId')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 50 })
        .withMessage('Payment terms cannot exceed 50 characters'),

    // -------------------------------------------------
    // Billing Address
    // -------------------------------------------------

    body('billingAddress')
        .optional({ nullable: true })
        .isObject()
        .withMessage('Billing address must be an object'),

    body('billingAddress.attention')
        .optional({ nullable: true })
        .isString(),

    body('billingAddress.street1')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 255 }),

    body('billingAddress.street2')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 255 }),

    body('billingAddress.city')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 }),

    body('billingAddress.state')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 }),

    body('billingAddress.country')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 }),

    body('billingAddress.zipCode')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 20 }),

    // -------------------------------------------------
    // Shipping Address
    // -------------------------------------------------

    body('shippingAddress')
        .optional({ nullable: true })
        .isObject()
        .withMessage('Shipping address must be an object'),

    // -------------------------------------------------
    // Contact Directory
    // -------------------------------------------------

    body('contacts')
        .optional()
        .isArray()
        .withMessage('Contacts must be an array'),

    body('contacts.*.name')
        .optional({ nullable: true })
        .isString(),

    body('contacts.*.emailAddress')
        .optional({ nullable: true })
        .isEmail()
        .withMessage('Contact email must be valid'),

    body('contacts.*.mobileNumber')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 30 }),

    body('contacts.*.designation')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 100 }),

    // -------------------------------------------------
    // Bank Details
    // -------------------------------------------------

    body('bankDetails')
        .optional()
        .isArray()
        .withMessage('Bank details must be an array'),

    body('bankDetails.*.bankName')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 150 }),

    body('bankDetails.*.accountHolder')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 150 }),

    body('bankDetails.*.accountNumber')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 50 }),

    body('bankDetails.*.ifscCode')
        .optional({ nullable: true })
        .isString()
        .isLength({ max: 20 })
];


// =====================================================
// VENDOR LIST VALIDATION
// =====================================================

const vendorListValidator = [

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

    query('status')
        .optional()
        .isString(),

    query('sortBy')
        .optional()
        .isString(),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc')
];


// =====================================================
// VENDOR DETAILS VALIDATION
// =====================================================

const vendorDetailsValidator = [

    param('vendorId')
        .isInt({ min: 1 })
        .withMessage('Vendor ID must be a positive integer')
];


module.exports = {
    createVendorValidator,
    vendorListValidator,
    vendorDetailsValidator
};
