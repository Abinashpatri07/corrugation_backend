const customerService = require('./customer.service');


// =====================================================
// CREATE CUSTOMER
// =====================================================

async function createCustomer(req, res, next) {

    try {

        const result =
            await customerService.createCustomer(req.body);

        return res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: result
        });

    } catch (error) {

        next(error);
    }
}


// =====================================================
// GET CUSTOMER LIST
// =====================================================

async function getCustomers(req, res, next) {

    try {

        const result =
            await customerService.getCustomers(req.query);

        return res.status(200).json({
            success: true,
            message: 'Customers fetched successfully',
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {

        next(error);
    }
}

// =====================================================
// GET CUSTOMER DETAILS
// =====================================================

async function getCustomerDetails(req, res, next) {

    try {

        const customerId =
            Number(req.params.customerId);

        const result =
            await customerService.getCustomerDetails(
                customerId
            );

        return res.status(200).json({
            success: true,
            message: 'Customer details fetched successfully',
            data: result
        });

    } catch (error) {

        next(error);
    }
}
// =====================================================
// GET CUSTOMER BOX SPECIFICATIONS
// =====================================================

async function getCustomerBoxSpecifications(
    req,
    res,
    next
) {

    try {

        const customerId =
            Number(req.params.customerId);

        const result =
            await customerService
                .getCustomerBoxSpecifications(
                    customerId
                );

        return res.status(200).json({
            success: true,
            message: 'Customer box specifications fetched successfully',
            data: result
        });

    } catch (error) {

        next(error);
    }
}
// =====================================================
// GET CUSTOMER ORDER HISTORY
// =====================================================

async function getCustomerOrderHistory(
    req,
    res,
    next
) {

    try {

        const customerId =
            Number(req.params.customerId);

        const result =
            await customerService
                .getCustomerOrderHistory(
                    customerId,
                    req.query
                );

        return res.status(200).json({
            success: true,
            message: 'Customer order history fetched successfully',
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {

        next(error);
    }
}
// =====================================================
// GET CUSTOMER INVOICE
// =====================================================

async function getCustomerInvoice(req, res, next) {

    try {

        const customerId =
            Number(req.params.customerId);

        const result =
            await customerService.getCustomerInvoice(
                customerId
            );

        return res.status(200).json({
            success: true,
            message: 'Customer commercial terms fetched successfully',
            data: result
        });

    } catch (error) {

        next(error);
    }
}
// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerDetails,
    getCustomerBoxSpecifications,
    getCustomerOrderHistory,
    getCustomerInvoice
};