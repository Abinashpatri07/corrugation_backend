const express = require('express');

const router = express.Router();

const controller = require('./vendor.controller');

const {
    createVendorValidator,
    vendorListValidator,
    vendorDetailsValidator
} = require('./vendor.validation');

const validateRequest =
    require('../../middleware/validation.middleware');


// =====================================================
// CREATE VENDOR
// =====================================================

router.post(
    '/',
    createVendorValidator,
    validateRequest,
    controller.createVendor
);


// =====================================================
// VENDOR LIST
// =====================================================

router.get(
    '/',
    vendorListValidator,
    validateRequest,
    controller.getVendors
);


// =====================================================
// VENDOR DETAILS / OVERVIEW
// =====================================================

router.get(
    '/:vendorId',
    vendorDetailsValidator,
    validateRequest,
    controller.getVendorDetails
);


// =====================================================
// VENDOR REEL SPECIFICATIONS
// =====================================================

router.get(
    '/:vendorId/reel-specifications',
    vendorDetailsValidator,
    validateRequest,
    controller.getVendorReelSpecifications
);


// =====================================================
// VENDOR PURCHASE ORDER HISTORY
// =====================================================

router.get(
    '/:vendorId/order-history',
    vendorDetailsValidator,
    validateRequest,
    controller.getVendorPurchaseOrderHistory
);


// =====================================================
// VENDOR COMMERCIAL TERMS
// =====================================================

router.get(
    '/:vendorId/commercial-terms',
    vendorDetailsValidator,
    validateRequest,
    controller.getVendorCommercialTerms
);


module.exports = router;
