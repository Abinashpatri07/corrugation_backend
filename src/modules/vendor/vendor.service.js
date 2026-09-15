const pool = require('../../config/database');

const repository =
    require('./vendor.repository');

const {
    generateVendorCode
} = require('./vendor-code');


// =====================================================
// CREATE VENDOR
// =====================================================
//
// Creates the Vendor master and all child records in a
// single database transaction.
//
// If any child insert fails, the complete Vendor creation
// is rolled back so that partial Vendor data is not left in
// the database.
// =====================================================

async function createVendor(data) {

    const client =
        await pool.connect();

    try {

        await client.query('BEGIN');


        // -------------------------------------------------
        // Duplicate PAN check
        // -------------------------------------------------

        const existingPan =
            await repository.findVendorByPan(
                client,
                data.pan
            );

        if (existingPan) {

            const error =
                new Error(
                    `Vendor already exists with PAN ${data.pan}`
                );

            error.statusCode = 409;

            throw error;
        }


        // -------------------------------------------------
        // Duplicate GSTIN check
        // -------------------------------------------------

        if (data.gstin) {

            const existingGstin =
                await repository.findVendorByGstin(
                    client,
                    data.gstin
                );

            if (existingGstin) {

                const error =
                    new Error(
                        `Vendor already exists with GSTIN ${data.gstin}`
                    );

                error.statusCode = 409;

                throw error;
            }
        }


        // -------------------------------------------------
        // Generate Vendor code
        // -------------------------------------------------

        const vendorCode =
            await generateVendorCode(client);


        // -------------------------------------------------
        // Create Vendor master record
        // -------------------------------------------------

        const vendor =
            await repository.createVendor(
                client,
                {
                    ...data,
                    vendorCode
                }
            );


        // -------------------------------------------------
        // Billing address
        // -------------------------------------------------

        if (data.billingAddress) {

            await repository.createAddress(
                client,
                vendor.vendorId,
                {
                    ...data.billingAddress,
                    addressType: 'Billing'
                }
            );
        }


        // -------------------------------------------------
        // Shipping address
        // -------------------------------------------------

        if (data.shippingAddress) {

            await repository.createAddress(
                client,
                vendor.vendorId,
                {
                    ...data.shippingAddress,
                    addressType: 'Shipping'
                }
            );
        }


        // -------------------------------------------------
        // Contact directory
        // -------------------------------------------------

        if (
            data.contacts &&
            data.contacts.length > 0
        ) {

            for (const contact of data.contacts) {

                await repository.createContact(
                    client,
                    vendor.vendorId,
                    contact
                );
            }
        }


        // -------------------------------------------------
        // Bank details
        // -------------------------------------------------

        if (
            data.bankDetails &&
            data.bankDetails.length > 0
        ) {

            for (const bank of data.bankDetails) {

                await repository.createBankDetails(
                    client,
                    vendor.vendorId,
                    bank
                );
            }
        }


        // -------------------------------------------------
        // Commit transaction
        // -------------------------------------------------

        await client.query('COMMIT');


        return {
            vendorId: vendor.vendorId,
            vendorCode: vendor.vendorCode
        };

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
}


// =====================================================
// GET VENDOR LIST
// =====================================================

async function getVendors(params = {}) {

    const page =
        Number(params.page) || 1;

    const limit =
        Number(params.limit) || 10;

    const offset =
        (page - 1) * limit;

    const search =
        params.search || '';

    const status =
        params.status || '';

    const sortBy =
        params.sortBy || 'createdAt';

    const sortOrder =
        params.sortOrder || 'desc';


    const result =
        await repository.getVendors({
            page,
            limit,
            offset,
            search,
            status,
            sortBy,
            sortOrder
        });


    return {
        data: result.rows,

        pagination: {
            page,
            limit,
            totalRecords:
                result.totalRecords,
            totalPages:
                Math.ceil(
                    result.totalRecords / limit
                )
        }
    };
}


// =====================================================
// GET VENDOR DETAILS
// =====================================================

async function getVendorDetails(vendorId) {

    const vendor =
        await repository.getVendorById(
            vendorId
        );

    if (!vendor) {

        const error =
            new Error('Vendor not found');

        error.statusCode = 404;

        throw error;
    }


    const [
        addresses,
        contacts,
        banks,
        documents,
        summary
    ] = await Promise.all([

        repository.getVendorAddresses(
            vendorId
        ),

        repository.getVendorContacts(
            vendorId
        ),

        repository.getVendorBanks(
            vendorId
        ),

        repository.getVendorDocuments(
            vendorId
        ),

        repository.getVendorSummary(
            vendorId
        )
    ]);


    const billingAddress =
        addresses.find(
            address =>
                address.addressType === 'Billing'
        ) || null;


    const shippingAddress =
        addresses.find(
            address =>
                address.addressType === 'Shipping'
        ) || null;


    return {

        vendor,

        summary,

        addresses: {
            billing: billingAddress,
            shipping: shippingAddress
        },

        contacts,

        banks,

        documents
    };
}


// =====================================================
// GET VENDOR REEL SPECIFICATIONS
// =====================================================

async function getVendorReelSpecifications(
    vendorId,
    params = {}
) {

    const vendor =
        await repository.getVendorById(
            vendorId
        );

    if (!vendor) {

        const error =
            new Error('Vendor not found');

        error.statusCode = 404;

        throw error;
    }


    return repository.getVendorReelSpecifications(
        vendorId,
        params.search || ''
    );
}


// =====================================================
// GET VENDOR PURCHASE ORDER HISTORY
// =====================================================

async function getVendorPurchaseOrderHistory(
    vendorId,
    params = {}
) {

    const vendor =
        await repository.getVendorById(
            vendorId
        );

    if (!vendor) {

        const error =
            new Error('Vendor not found');

        error.statusCode = 404;

        throw error;
    }


    const page =
        Number(params.page) || 1;

    const limit =
        Number(params.limit) || 10;

    const offset =
        (page - 1) * limit;


    const result =
        await repository.getVendorPurchaseOrderHistory({
            vendorId,
            page,
            limit,
            offset,
            search: params.search || '',
            startDate: params.startDate || null,
            endDate: params.endDate || null
        });


    return {
        data: result.rows,

        pagination: {
            page,
            limit,
            totalRecords:
                result.totalRecords,
            totalPages:
                Math.ceil(
                    result.totalRecords / limit
                )
        }
    };
}


// =====================================================
// GET VENDOR COMMERCIAL TERMS
// =====================================================
//
// Unlike Customer, Vendor commercial terms are stored
// directly on the vendor table in the current schema:
//
//     currency
//     opening_balance
//     accounts_payable
//     payment_terms
//     advance_required
//
// Outstanding payable is additionally calculated from
// pending Bills.
// =====================================================

async function getVendorCommercialTerms(vendorId) {

    const vendor =
        await repository.getVendorById(
            vendorId
        );

    if (!vendor) {

        const error =
            new Error('Vendor not found');

        error.statusCode = 404;

        throw error;
    }


    return repository.getVendorCommercialTerms(
        vendorId
    );
}


module.exports = {
    createVendor,
    getVendors,
    getVendorDetails,
    getVendorReelSpecifications,
    getVendorPurchaseOrderHistory,
    getVendorCommercialTerms
};
