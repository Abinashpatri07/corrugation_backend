const vendorService = require('./vendor.service');


// =====================================================
// CREATE VENDOR
// =====================================================

async function createVendor(req, res, next) {

    try {

        const result =
            await vendorService.createVendor(req.body);

        return res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            data: result
        });

    } catch (error) {

        next(error);
    }
}


// =====================================================
// GET VENDOR LIST
// =====================================================

async function getVendors(req, res, next) {

    try {

        const result =
            await vendorService.getVendors(req.query);

        return res.status(200).json({
            success: true,
            message: 'Vendors fetched successfully',
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {

        next(error);
    }
}


// =====================================================
// GET VENDOR DETAILS
// =====================================================

async function getVendorDetails(req, res, next) {

    try {

        const vendorId =
            Number(req.params.vendorId);

        const result =
            await vendorService.getVendorDetails(
                vendorId
            );

        return res.status(200).json({
            success: true,
            message: 'Vendor details fetched successfully',
            data: result
        });

    } catch (error) {

        next(error);
    }
}


// =====================================================
// GET VENDOR REEL SPECIFICATIONS
// =====================================================

async function getVendorReelSpecifications(
    req,
    res,
    next
) {

    try {

        const vendorId =
            Number(req.params.vendorId);

        const result =
            await vendorService
                .getVendorReelSpecifications(
                    vendorId,
                    req.query
                );

        return res.status(200).json({
            success: true,
            message: 'Vendor reel specifications fetched successfully',
            data: result
        });

    } catch (error) {

        next(error);
    }
}


// =====================================================
// GET VENDOR PURCHASE ORDER HISTORY
// =====================================================

async function getVendorPurchaseOrderHistory(
    req,
    res,
    next
) {

    try {

        const vendorId =
            Number(req.params.vendorId);

        const result =
            await vendorService
                .getVendorPurchaseOrderHistory(
                    vendorId,
                    req.query
                );

        return res.status(200).json({
            success: true,
            message: 'Vendor purchase order history fetched successfully',
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {

        next(error);
    }
}


// =====================================================
// GET VENDOR COMMERCIAL TERMS
// =====================================================

async function getVendorCommercialTerms(
    req,
    res,
    next
) {

    try {

        const vendorId =
            Number(req.params.vendorId);

        const result =
            await vendorService
                .getVendorCommercialTerms(
                    vendorId
                );

        return res.status(200).json({
            success: true,
            message: 'Vendor commercial terms fetched successfully',
            data: result
        });

    } catch (error) {

        next(error);
    }
}


module.exports = {
    createVendor,
    getVendors,
    getVendorDetails,
    getVendorReelSpecifications,
    getVendorPurchaseOrderHistory,
    getVendorCommercialTerms
};
